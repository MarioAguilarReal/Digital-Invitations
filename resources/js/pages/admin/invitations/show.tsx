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
import { InputMask as MaskedInput } from '@react-input/mask';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { type Invitation } from './Models/Invitation.type';
import { Guest } from './Models/Guest.type';
import { copy, formatDateEsMX } from './helpers';
import { StatCard } from './Components/StatCard';
import { GuestTable } from './Components/GuestTable';
import { CreateGuest } from './Components/CreateGuest';

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



type GuestEditValues = {
  display_name: string;
  contact_phone?: string | null;
  contact_email?: string | null;
  seats_reserved?: number;
  allow_plus_one?: boolean;
  member_names: { name: string }[];
};


export default function AdminInvitationShow({ invitation, guests, stats }: Props) {
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [deleteGuest, setDeleteGuest] = useState<Guest | null>(null);
  const [deleteInvitation, setDeleteInvitation] = useState(false);

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

  const inputBaseClass = "border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive";

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
                  <CreateGuest invitation={invitation} stats={stats} />
                  <GuestTable guests={guests} invitation={invitation} setEditingGuest={setEditingGuest} setDeletingGuest={setDeleteGuest} />
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
