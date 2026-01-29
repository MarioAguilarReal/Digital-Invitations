import React, { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Head, router, usePage } from '@inertiajs/react';
import { toWhatsAppUrl } from '@/lib/whatsapp';
import { InputMask as MaskedInput } from '@react-input/mask';
import { Controller, useFieldArray, useForm } from 'react-hook-form';

type Invitation = {
  id: number;
  slug: string;
  event_name: string;
  host_name: string;
  venue_name: string;
  event_date: string;
  event_time: any;
  capacity: number;
  rsvp_deadline_at?: string | null;
};

type Guest = {
  id: number;
  type: "individual" | "group";
  display_name: string;
  contact_phone: string | null;
  contact_email: string | null;
  seats_reserved: number;
  seats_confirmed: number;
  status: "pending" | "confirmed" | "declined";
  rsvp_url: string;
  public_token: string;
  allow_plus_one?: boolean;
  member_names?: string[] | null;
};

type Props = {
  invitation: Invitation
  guests: Guest[];
  stats: {
    capacity: number;
    reservedSeats: number;
    confirmedSeats: number;
    remainingSeats: number;
    pendingSeats: number;
    confirmedGuests: number;
    declinedGuests: number;
  };
};

type GuestCreateValues = {
  type: "individual" | "group";
  display_name: string;
  contact_phone?: string | null;
  contact_email?: string | null;
  seats_reserved?: number;
  allow_plus_one?: boolean;
  member_names: { name: string }[];
  note?: string | null;
};

type GuestEditValues = {
  display_name: string;
  contact_phone?: string | null;
  contact_email?: string | null;
  seats_reserved?: number;
  allow_plus_one?: boolean;
  member_names: { name: string }[];
};


export default function AdminInvitationShow({ invitation, guests, stats }: Props) {
  const { errors } = usePage().props as { errors?: Record<string, string> };
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [deleteGuest, setDeleteGuest] = useState<Guest | null>(null);
  const [deleteInvitation, setDeleteInvitation] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
  } = useForm<GuestCreateValues>({
    defaultValues: {
      type: "individual",
      display_name: "",
      contact_phone: "",
      contact_email: "",
      seats_reserved: 1,
      allow_plus_one: false,
      member_names: [],
      note: "",
    },
  });

  const {
    control: editControl,
    register: editRegister,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
  } = useForm<GuestEditValues>({
    defaultValues: {
      display_name: "",
      contact_phone: "",
      contact_email: "",
      seats_reserved: 1,
      allow_plus_one: false,
      member_names: [],
    },
  });

  const createFields = useFieldArray({ control, name: "member_names" });
  const editFields = useFieldArray({ control: editControl, name: "member_names" });

  useEffect(() => {
    if (!editingGuest) return;
    resetEdit({
      display_name: editingGuest.display_name ?? "",
      contact_phone: editingGuest.contact_phone ?? "",
      contact_email: editingGuest.contact_email ?? "",
      seats_reserved: editingGuest.seats_reserved ?? 1,
      allow_plus_one: !!editingGuest.allow_plus_one,
      member_names: Array.isArray(editingGuest.member_names)
        ? editingGuest.member_names.map((name) => ({ name }))
        : [],
    });
  }, [editingGuest, resetEdit]);

  const publicUrl = useMemo(() => `/i/${invitation.slug}`, [invitation.slug]);

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
    alert('Copiado al portapapeles');
  }

  function formatDateEsMX(dateStr?: string | null) {
    if (!dateStr) return null;
    const [y, m, d] = dateStr.split('-').map(Number);
    if (!y || !m || !d) return dateStr;

    const dt = new Date(y, m-1, d);
    return new Intl.DateTimeFormat('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(dt);
  }

  function formatTimeEsMX(timeStr?: string | null) {
    if (!timeStr) return null;
    const [h, m] = timeStr.split(':').map(Number);
    if (h == null || m == null) return timeStr;

    const dt = new Date();
    dt.setHours(h, m, 0, 0);
    return new Intl.DateTimeFormat('es-MX', {
        hour: 'numeric',
        minute: 'numeric',
    }).format(dt);
  }

  function buildWhatsAppMessage(guest: Guest) {
    const date = formatDateEsMX(invitation.event_date) || '';
    const time = invitation.event_time ? `a las ${formatTimeEsMX(invitation.event_time.slice(-16))}` : '';
    const venue = invitation.venue_name ? ` en ${invitation.venue_name}` : '';

    const invitationUrl = `${location.origin}/i/${invitation.slug}?g=${guest.id}&s=${guest.public_token}`;

    if (guest.type == "group") {
      return `Hola ${guest.display_name}, están invitad@s a *${invitation.event_name}* 🎉\n` +
        `Tienen ${guest.seats_reserved} lugares reservados.\n` +
        `📍 ${venue}\n` +
        `🗓️ ${date} ⏰ ${time}\n\n` +
        `Confirmen aquí: ${invitationUrl}`;
    }

    return `Hola ${guest.display_name}, estás invitad@ a *${invitation.event_name}* 🎉\n` +
    `📍 ${venue}\n` +
    `🗓️ ${date} ⏰ ${time}\n\n` +
    `Confirma aquí: ${invitationUrl}`;
  }

  const sendMessage = (guest: Guest) => {
    const message = buildWhatsAppMessage(guest);
    const whatsURL = toWhatsAppUrl(message, guest.contact_phone);
    window.open(whatsURL, '_blank');
  }

  const type = watch("type");
  const allowPlusOne = watch("allow_plus_one");
  const seatsReserved = watch("seats_reserved");
  const typeField = register("type");

  const { replace: replaceCreateMembers } = createFields;

  useEffect(() => {
    if (type !== "group") {
      replaceCreateMembers([]);
    }
  }, [type, replaceCreateMembers]);


  const onCreateGuest = handleSubmit((values) => {
    const payload: Record<string, any> = {
      type: values.type,
      display_name: values.display_name,
      contact_phone: values.contact_phone,
      contact_email: values.contact_email,
      note: values.note,
    };

    if (values.type === "group") {
      payload.seats_reserved = values.seats_reserved ?? 1;
      payload.member_names = (values.member_names ?? [])
        .map((entry) => entry.name)
        .filter(Boolean);
    } else {
      payload.allow_plus_one = !!values.allow_plus_one;
    }

    router.post(`/admin/invitations/${invitation.id}/guests`, payload, {
      onSuccess: () => {
        reset({
          type: "individual",
          display_name: "",
          contact_phone: "",
          contact_email: "",
          seats_reserved: 1,
          allow_plus_one: false,
          member_names: [],
          note: "",
        });
        createFields.replace([]);
      },
    });
  });

  const remainingSeats = stats.remainingSeats ?? 0;
  const requestedSeats = type === 'group'
    ? Math.max(1, Number(seatsReserved) || 1)
    : (allowPlusOne ? 2 : 1);
  const canCreateGuest = remainingSeats >= requestedSeats;

  const inputBaseClass =
    "border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive";

  return (
      <AppLayout
          breadcrumbs={[
              { title: 'Invitations', href: '/admin/invitations' },
              {
                  title: invitation.event_name,
                  href: `/admin/invitations/${invitation.id}`,
              },
          ]}
      >
          <Head title={invitation.event_name} />
          <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                      <h1 className="text-2xl font-semibold">
                          {invitation.event_name}
                      </h1>
                      <div className="text-sm text-muted-foreground">
                          {invitation.venue_name} •{' '}
                          {formatDateEsMX(invitation.event_date)}
                      </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                      <Button variant="outline" asChild>
                          <a href={`/admin/invitations/${invitation.id}/edit`}>
                              Edit invitation
                          </a>
                      </Button>
                      <Button
                          variant="outline"
                          onClick={() => copy(location.origin + publicUrl)}
                      >
                          Copy public link
                      </Button>
                      <Button asChild>
                          <a href={publicUrl} target="_blank" rel="noreferrer">
                              Open public page
                          </a>
                      </Button>
                      <Button
                          variant="destructive"
                          onClick={() => setDeleteInvitation(true)}
                      >
                          Delete invitation
                      </Button>
                  </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard label="Capacity" value={stats.capacity} />
                  <StatCard
                      label="Reserved Seats"
                      value={stats.reservedSeats}
                  />
                  <StatCard
                      label="Confirmed Seats"
                      value={stats.confirmedSeats}
                  />
                  <StatCard
                      label="Remaining Seats"
                      value={stats.remainingSeats}
                  />
              </div>

              <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
                  <form
                      onSubmit={onCreateGuest}
                      className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm"
                  >
                      <h2 className="text-sm font-semibold">Add guest</h2>

                      <div className="mt-3 grid gap-3">
                          <select
                              {...typeField}
                              value={type}
                              onChange={(e) => {
                                  typeField.onChange(e);
                                  const nextType = e.target.value as
                                      | 'individual'
                                      | 'group';
                                  setValue('type', nextType, {
                                      shouldValidate: true,
                                  });
                                  if (nextType === 'group') {
                                      setValue(
                                          'seats_reserved',
                                          Math.max(
                                              1,
                                              Number(seatsReserved) || 1,
                                          ),
                                      );
                                      setValue('allow_plus_one', false);
                                  } else {
                                      setValue('seats_reserved', 1);
                                  }
                              }}
                              className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                          >
                              <option value="individual">Individual</option>
                              <option value="group">Group</option>
                          </select>

                          <Input
                              placeholder={
                                  type === 'group'
                                      ? 'Family name (e.g., Familia Perez Juarez)'
                                      : 'Guest name'
                              }
                              {...register('display_name')}
                          />

                          <Controller
                              control={control}
                              name="contact_phone"
                              render={({ field }) => (
                                  <MaskedInput
                                      mask="(___) ___-____"
                                      replacement={{ _: /\d/ }}
                                      value={field.value ?? ''}
                                      onChange={field.onChange}
                                      className={inputBaseClass}
                                      placeholder="Contact phone (optional)"
                                  />
                              )}
                          />

                          <Input
                              placeholder="Contact email (optional)"
                              type="email"
                              {...register('contact_email')}
                          />

                          {type === 'group' ? (
                              <Input
                                  type="number"
                                  min={1}
                                  placeholder="Seats reserved"
                                  {...register('seats_reserved', {
                                      valueAsNumber: true,
                                  })}
                              />
                          ) : (
                              <div className="grid gap-2">
                                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <input
                                          type="checkbox"
                                          checked={!!allowPlusOne}
                                          onChange={(e) =>
                                              setValue(
                                                  'allow_plus_one',
                                                  e.target.checked,
                                              )
                                          }
                                      />
                                      Permitir acompañante (+1)
                                  </label>
                                  <div className="rounded-md border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
                                      Reservados: {allowPlusOne ? 2 : 1}{' '}
                                      lugares.
                                  </div>
                              </div>
                          )}

                          {type === 'group' ? (
                              <div className="grid gap-2">
                                  <div className="text-xs font-medium text-muted-foreground">
                                      Nombres de asistentes (opcional)
                                  </div>
                                  <div className="grid gap-2">
                                      {createFields.fields.map((field, idx) => (
                                          <div
                                              key={field.id}
                                              className="grid grid-cols-[1fr_36px] gap-2"
                                          >
                                              <Input
                                                  placeholder={`Nombre #${idx + 1}`}
                                                  {...register(
                                                      `member_names.${idx}.name` as const,
                                                  )}
                                              />
                                              <Button
                                                  type="button"
                                                  variant="outline"
                                                  size="icon"
                                                  onClick={() =>
                                                      createFields.remove(idx)
                                                  }
                                              >
                                                  ×
                                              </Button>
                                          </div>
                                      ))}
                                      <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={() =>
                                              createFields.append({ name: '' })
                                          }
                                      >
                                          + Agregar nombre
                                      </Button>
                                  </div>
                              </div>
                          ) : null}

                          <textarea
                              placeholder="Note (optional)"
                              rows={3}
                              className="min-h-[90px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                              {...register('note')}
                          />

                          {errors?.seats_reserved && (
                              <div className="text-xs text-destructive">
                                  {errors.seats_reserved}
                              </div>
                          )}

                          {!canCreateGuest ? (
                              <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs">
                                  Capacidad alcanzada. No hay lugares
                                  suficientes para esta invitación.
                              </div>
                          ) : null}

                          <Button type="submit" disabled={!canCreateGuest}>
                              Create guest
                          </Button>
                      </div>
                  </form>

                  <div className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm">
                      <h2 className="text-sm font-semibold">Guests</h2>
                      <div className="mt-3 border-t border-border" />

                      <div className="mt-3 grid gap-3">
                          {guests.length === 0 ? (
                              <div className="text-sm text-muted-foreground">
                                  No guests yet.
                              </div>
                          ) : (
                              guests.map((g) => (
                                  <div
                                      key={g.id}
                                      className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 text-card-foreground sm:flex-row sm:items-center sm:justify-between"
                                  >
                                      <div className="flex-3">
                                          <div className="font-semibold">
                                              {g.display_name}{' '}
                                              <span className="text-xs font-medium text-muted-foreground">
                                                  ({g.type}
                                                  {g.type === 'individual' ? (
                                                      <span className="ml-1 text-xs text-muted-foreground">
                                                          {g.allow_plus_one
                                                              ? 'con +1'
                                                              : 'sin +1'}
                                                      </span>
                                                  ) : null}
                                                  )
                                              </span>
                                          </div>
                                          <div
                                              className="text-xs text-muted-foreground"
                                              style={{
                                                  color: `${g.seats_reserved == g.seats_confirmed ? 'green' : g.status === 'declined' ? 'red' : g.seats_reserved > g.seats_confirmed ? 'orange' : 'inherit'}`,
                                              }}
                                          >
                                              Reserved: {g.seats_reserved}
                                              <br />
                                              Confirmed: {g.seats_confirmed}
                                              <br />
                                              Status: {g.status}
                                              <br />
                                          </div>
                                          {Array.isArray(g.member_names) &&
                                          g.member_names.length ? (
                                              <div className="mt-1 text-xs text-muted-foreground">
                                                  Nombres:{' '}
                                                  {g.member_names
                                                      .filter(Boolean)
                                                      .join(', ')}
                                              </div>
                                          ) : null}
                                      </div>
                                      <div className="flex w-full flex-1 flex-wrap gap-2 sm:w-auto sm:justify-end">
                                          <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => copy(g.rsvp_url)}
                                              className="w-full sm:w-auto"
                                          >
                                              Copy RSVP (next step)
                                          </Button>
                                          <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => sendMessage(g)}
                                              className="w-full sm:w-auto"
                                          >
                                              Send WhatsApp
                                          </Button>
                                          <Button
                                              variant="outline"
                                              onClick={() =>
                                                  copy(buildWhatsAppMessage(g))
                                              }
                                              className="w-full sm:w-auto"
                                          >
                                              Copy Message
                                          </Button>
                                          <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => setEditingGuest(g)}
                                              className="w-full sm:w-auto"
                                          >
                                              Edit
                                          </Button>
                                          <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => setDeleteGuest(g)}
                                              className="w-full sm:w-auto"
                                          >
                                              Delete
                                          </Button>
                                      </div>
                                  </div>
                              ))
                          )}
                      </div>
                  </div>
              </div>
          </div>

          <Dialog
              open={!!editingGuest}
              onOpenChange={(open) => !open && setEditingGuest(null)}
          >
              <DialogContent>
                  <DialogHeader>
                      <DialogTitle>Editar invitado</DialogTitle>
                      <DialogDescription>
                          Actualiza la informacion del invitado.
                      </DialogDescription>
                  </DialogHeader>

                  {editingGuest ? (
                      <form
                          className="grid gap-3"
                          onSubmit={handleEditSubmit((values) => {
                              if (!editingGuest) return;
                              const payload: Record<string, any> = {
                                  display_name: values.display_name,
                                  contact_phone: values.contact_phone,
                                  contact_email: values.contact_email,
                              };

                              if (editingGuest.type === 'group') {
                                  payload.seats_reserved =
                                      values.seats_reserved ?? 1;
                                  payload.member_names = (
                                      values.member_names ?? []
                                  )
                                      .map((entry) => entry.name)
                                      .filter(Boolean);
                              } else {
                                  payload.allow_plus_one =
                                      !!values.allow_plus_one;
                              }

                              router.put(
                                  `/admin/guests/${editingGuest.id}`,
                                  payload,
                                  {
                                      onSuccess: () => setEditingGuest(null),
                                  },
                              );
                          })}
                      >
                          <Input
                              placeholder="Nombre"
                              {...editRegister('display_name')}
                          />

                          <Controller
                              control={editControl}
                              name="contact_phone"
                              render={({ field }) => (
                                  <MaskedInput
                                      mask="(___) ___-____"
                                      replacement={{ _: /\d/ }}
                                      value={field.value ?? ''}
                                      onChange={field.onChange}
                                      className={inputBaseClass}
                                      placeholder="Contact phone (optional)"
                                  />
                              )}
                          />

                          <Input
                              placeholder="Contact email (optional)"
                              type="email"
                              {...editRegister('contact_email')}
                          />

                          {editingGuest.type === 'group' ? (
                              <>
                                  <Input
                                      type="number"
                                      min={1}
                                      placeholder="Seats reserved"
                                      {...editRegister('seats_reserved', {
                                          valueAsNumber: true,
                                      })}
                                  />
                                  <div className="grid gap-2">
                                      <div className="text-xs font-medium text-muted-foreground">
                                          Nombres de asistentes
                                      </div>
                                      {editFields.fields.map((field, idx) => (
                                          <div
                                              key={field.id}
                                              className="grid grid-cols-[1fr_36px] gap-2"
                                          >
                                              <Input
                                                  placeholder={`Nombre #${idx + 1}`}
                                                  {...editRegister(
                                                      `member_names.${idx}.name` as const,
                                                  )}
                                              />
                                              <Button
                                                  type="button"
                                                  variant="outline"
                                                  size="icon"
                                                  onClick={() =>
                                                      editFields.remove(idx)
                                                  }
                                              >
                                                  ×
                                              </Button>
                                          </div>
                                      ))}
                                      <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={() =>
                                              editFields.append({ name: '' })
                                          }
                                      >
                                          + Agregar nombre
                                      </Button>
                                  </div>
                              </>
                          ) : (
                              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <input
                                      type="checkbox"
                                      {...editRegister('allow_plus_one')}
                                  />
                                  Permitir acompañante (+1)
                              </label>
                          )}

                          <DialogFooter>
                              <Button type="submit">Guardar cambios</Button>
                          </DialogFooter>
                      </form>
                  ) : null}
              </DialogContent>
          </Dialog>

          <Dialog
              open={!!deleteGuest}
              onOpenChange={(open) => !open && setDeleteGuest(null)}
          >
              <DialogContent>
                  <DialogHeader>
                      <DialogTitle>Eliminar invitado</DialogTitle>
                      <DialogDescription>
                          Esta accion no se puede deshacer. Se eliminara el
                          invitado seleccionado.
                      </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                      <Button
                          variant="outline"
                          onClick={() => setDeleteGuest(null)}
                      >
                          Cancelar
                      </Button>
                      <Button
                          variant="destructive"
                          onClick={() => {
                              if (!deleteGuest) return;
                              router.delete(`/admin/guests/${deleteGuest.id}`, {
                                  onSuccess: () => setDeleteGuest(null),
                              });
                          }}
                      >
                          Eliminar
                      </Button>
                  </DialogFooter>
              </DialogContent>
          </Dialog>

          <Dialog open={deleteInvitation} onOpenChange={setDeleteInvitation}>
              <DialogContent>
                  <DialogHeader>
                      <DialogTitle>Eliminar invitacion</DialogTitle>
                      <DialogDescription>
                          Esta accion eliminara la invitacion y todos los
                          invitados asociados. No se puede deshacer.
                      </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                      <Button
                          variant="outline"
                          onClick={() => setDeleteInvitation(false)}
                      >
                          Cancelar
                      </Button>
                      <Button
                          variant="destructive"
                          onClick={() => {
                              router.delete(
                                  `/admin/invitations/${invitation.id}`,
                              );
                          }}
                      >
                          Eliminar
                      </Button>
                  </DialogFooter>
              </DialogContent>
          </Dialog>
      </AppLayout>
  );
}

function StatCard({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}
