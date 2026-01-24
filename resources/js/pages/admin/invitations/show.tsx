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

export default function AdminInvitationShow({ invitation, guests, stats }: Props) {
  const { errors } = usePage().props as { errors?: Record<string, string> };
  const [form, setForm] = useState({
    type: "individual" as "individual" | "group",
    display_name: "",
    contact_name: "",
    contact_phone: "",
    contact_email: "",
    seats_reserved: 2,
    allow_plus_one: false,
    member_names: [] as string[],
    note: "",
  });
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [editForm, setEditForm] = useState({
    display_name: "",
    contact_phone: "",
    contact_email: "",
    seats_reserved: 1,
    allow_plus_one: false,
    member_names: [] as string[],
  });
  const [deleteGuest, setDeleteGuest] = useState<Guest | null>(null);
  const [deleteInvitation, setDeleteInvitation] = useState(false);

  useEffect(() => {
    if (!editingGuest) return;
    setEditForm({
      display_name: editingGuest.display_name ?? "",
      contact_phone: editingGuest.contact_phone ?? "",
      contact_email: editingGuest.contact_email ?? "",
      seats_reserved: editingGuest.seats_reserved ?? 1,
      allow_plus_one: !!editingGuest.allow_plus_one,
      member_names: Array.isArray(editingGuest.member_names) ? editingGuest.member_names : [],
    });
  }, [editingGuest]);
  function submit(e: React.FormEvent) {
    e.preventDefault();
    router.post(`/admin/invitations/${invitation.id}/guests`, form, {
          onSuccess: () => {
            setForm({
              type: "individual",
              display_name: "",
              contact_name: "",
              contact_phone: "",
              contact_email: "",
              seats_reserved: 1,
              allow_plus_one: false,
              member_names: [],
              note: "",
            });
          },
        });
  }

  const publicUrl = useMemo(() => `/i/${invitation.slug}`, [invitation.slug]);

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
    alert('Copiado al portapapeles');
  }

  function buildWhatsAppMessage(guest: Guest) {
    const date = invitation.event_date ?? '';
    const time = invitation.event_time ? ` ${invitation.event_time}` : '';
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

  const remainingSeats = stats.remainingSeats ?? 0;
  const requestedSeats = form.type === 'group'
    ? Math.max(1, form.seats_reserved)
    : (form.allow_plus_one ? 2 : 1);
  const canCreateGuest = remainingSeats >= requestedSeats;

  const inputBaseClass =
    "border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive";

  return (
    <AppLayout
      breadcrumbs={[
        { title: 'Invitations', href: '/admin/invitations' },
        { title: invitation.event_name, href: `/admin/invitations/${invitation.id}` },
      ]}
    >
      <Head title={invitation.event_name} />
      <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{invitation.event_name}</h1>
            <div className="text-sm text-muted-foreground">
              {invitation.venue_name} • {invitation.event_date}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <a href={`/admin/invitations/${invitation.id}/edit`}>Edit invitation</a>
            </Button>
            <Button variant="outline" onClick={() => copy(location.origin + publicUrl)}>
              Copy public link
            </Button>
            <Button asChild>
              <a href={publicUrl} target="_blank" rel="noreferrer">
                Open public page
              </a>
            </Button>
            <Button variant="destructive" onClick={() => setDeleteInvitation(true)}>
              Delete invitation
            </Button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Capacity" value={stats.capacity} />
          <StatCard label="Reserved Seats" value={stats.reservedSeats} />
          <StatCard label="Confirmed Seats" value={stats.confirmedSeats} />
          <StatCard label="Remaining Seats" value={stats.remainingSeats} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <form onSubmit={submit} className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm">
            <h2 className="text-sm font-semibold">Add guest</h2>

            <div className="mt-3 grid gap-3">
              <select
                value={form.type}
                onChange={(e) => {
                  const nextType = e.target.value as "individual" | "group";
                  setForm(f => ({
                    ...f,
                    type: nextType,
                    seats_reserved: nextType === 'group' ? Math.max(1, f.seats_reserved || 1) : 1,
                    allow_plus_one: nextType === 'group' ? false : f.allow_plus_one,
                    member_names: nextType === 'group' ? f.member_names : [],
                  }));
                }}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              >
                <option value="individual">Individual</option>
                <option value="group">Group</option>
              </select>

              <Input
                placeholder={form.type === "group" ? "Family name (e.g., Familia Perez Juarez)" : "Guest name"}
                value={form.display_name}
                onChange={(e) => setForm(f => ({ ...f, display_name: e.target.value }))}
              />

              <MaskedInput
                mask="(___) ___-____"
                replacement={{ _: /\d/ }}
                value={form.contact_phone ?? ''}
                onChange={(e:any ) => setForm(f => ({ ...f, contact_phone: e.target.value }))}
                className={inputBaseClass}
                placeholder="Contact phone (optional)"
              />

              <Input
                placeholder="Contact email (optional)"
                type="email"
                value={form.contact_email}
                onChange={(e) => setForm(f => ({ ...f, contact_email: e.target.value }))}
              />

              {form.type === 'group' ? (
                <Input
                  type="number"
                  min={1}
                  placeholder="Seats reserved"
                  value={form.seats_reserved}
                  onChange={(e) => setForm(f => ({ ...f, seats_reserved: Number(e.target.value) }))}
                />
              ) : (
                <div className="grid gap-2">
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={form.allow_plus_one}
                      onChange={(e) => setForm(f => ({ ...f, allow_plus_one: e.target.checked }))}
                    />
                    Permitir acompañante (+1)
                  </label>
                  <div className="rounded-md border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
                    Reservados: {form.allow_plus_one ? 2 : 1} lugares.
                  </div>
                </div>
              )}

              {form.type === 'group' ? (
                <div className="grid gap-2">
                  <div className="text-xs font-medium text-muted-foreground">Nombres de asistentes (opcional)</div>
                  <div className="grid gap-2">
                    {(form.member_names ?? []).map((name, idx) => (
                      <div key={idx} className="grid grid-cols-[1fr_36px] gap-2">
                        <Input
                          placeholder={`Nombre #${idx + 1}`}
                          value={name}
                          onChange={(e) => {
                            const next = [...form.member_names];
                            next[idx] = e.target.value;
                            setForm(f => ({ ...f, member_names: next }));
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            const next = [...form.member_names];
                            next.splice(idx, 1);
                            setForm(f => ({ ...f, member_names: next }));
                          }}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setForm(f => ({ ...f, member_names: [...(f.member_names ?? []), ''] }))}
                    >
                      + Agregar nombre
                    </Button>
                  </div>
                </div>
              ) : null}

              <textarea
                placeholder="Note (optional)"
                rows={3}
                className="min-h-[90px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                value={form.note}
                onChange={(e) => setForm(f => ({ ...f, note: e.target.value }))}
              />

              {errors?.seats_reserved && (
                <div className="text-xs text-destructive">{errors.seats_reserved}</div>
              )}

              {!canCreateGuest ? (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs">
                  Capacidad alcanzada. No hay lugares suficientes para esta invitación.
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
                <div className="text-sm text-muted-foreground">No guests yet.</div>
              ) : guests.map(g => (
                <div key={g.id} className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 text-card-foreground sm:flex-row sm:items-center">
                  <div className="flex-1">
                    <div className="font-semibold">
                      {g.display_name}{' '}
                      <span className="text-xs font-medium text-muted-foreground">({g.type})</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Reserved: {g.seats_reserved} • Confirmed: {g.seats_confirmed} • Status: {g.status}
                      {g.type === 'individual' ? (
                        <span className="ml-2 text-xs text-muted-foreground">
                          {g.allow_plus_one ? 'Con +1' : 'Sin +1'}
                        </span>
                      ) : null}
                    </div>
                    {Array.isArray(g.member_names) && g.member_names.length ? (
                      <div className="mt-1 text-xs text-muted-foreground">
                        Nombres: {g.member_names.filter(Boolean).join(', ')}
                      </div>
                    ) : null}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => copy(g.rsvp_url)}>
                    Copy RSVP (next step)
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => sendMessage(g)}>
                    Send WhatsApp
                  </Button>
                  <Button variant="outline" onClick={() => copy(buildWhatsAppMessage(g))}>
                    Copy Message
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setEditingGuest(g)}>
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setDeleteGuest(g)}>
                    Delete
                  </Button>

                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={!!editingGuest} onOpenChange={(open) => !open && setEditingGuest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar invitado</DialogTitle>
            <DialogDescription>Actualiza la informacion del invitado.</DialogDescription>
          </DialogHeader>

          {editingGuest ? (
            <form
              className="grid gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                const payload: Record<string, any> = {
                  display_name: editForm.display_name,
                  contact_phone: editForm.contact_phone,
                  contact_email: editForm.contact_email,
                };

                if (editingGuest.type === 'group') {
                  payload.seats_reserved = editForm.seats_reserved;
                  payload.member_names = (editForm.member_names ?? []).filter(Boolean);
                } else {
                  payload.allow_plus_one = editForm.allow_plus_one;
                }

                router.put(`/admin/guests/${editingGuest.id}`, payload, {
                  onSuccess: () => setEditingGuest(null),
                });
              }}
            >
              <Input
                placeholder="Nombre"
                value={editForm.display_name}
                onChange={(e) => setEditForm(f => ({ ...f, display_name: e.target.value }))}
              />

              <MaskedInput
                mask="(___) ___-____"
                replacement={{ _: /\d/ }}
                value={editForm.contact_phone ?? ''}
                onChange={(e : any) => setEditForm(f => ({ ...f, contact_phone: e.target.value }))}
                className={inputBaseClass}
                placeholder="Contact phone (optional)"
              />

              <Input
                placeholder="Contact email (optional)"
                type="email"
                value={editForm.contact_email}
                onChange={(e) => setEditForm(f => ({ ...f, contact_email: e.target.value }))}
              />

              {editingGuest.type === 'group' ? (
                <>
                  <Input
                    type="number"
                    min={1}
                    placeholder="Seats reserved"
                    value={editForm.seats_reserved}
                    onChange={(e) => setEditForm(f => ({ ...f, seats_reserved: Number(e.target.value) }))}
                  />
                  <div className="grid gap-2">
                    <div className="text-xs font-medium text-muted-foreground">Nombres de asistentes</div>
                    {(editForm.member_names ?? []).map((name, idx) => (
                      <div key={idx} className="grid grid-cols-[1fr_36px] gap-2">
                        <Input
                          placeholder={`Nombre #${idx + 1}`}
                          value={name}
                          onChange={(e) => {
                            const next = [...editForm.member_names];
                            next[idx] = e.target.value;
                            setEditForm(f => ({ ...f, member_names: next }));
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            const next = [...editForm.member_names];
                            next.splice(idx, 1);
                            setEditForm(f => ({ ...f, member_names: next }));
                          }}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setEditForm(f => ({ ...f, member_names: [...(f.member_names ?? []), ''] }))}
                    >
                      + Agregar nombre
                    </Button>
                  </div>
                </>
              ) : (
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={editForm.allow_plus_one}
                    onChange={(e) => setEditForm(f => ({ ...f, allow_plus_one: e.target.checked }))}
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

      <Dialog open={!!deleteGuest} onOpenChange={(open) => !open && setDeleteGuest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar invitado</DialogTitle>
            <DialogDescription>
              Esta accion no se puede deshacer. Se eliminara el invitado seleccionado.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteGuest(null)}>
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
              Esta accion eliminara la invitacion y todos los invitados asociados. No se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteInvitation(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                router.delete(`/admin/invitations/${invitation.id}`);
              }}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}

function StatCard({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}
