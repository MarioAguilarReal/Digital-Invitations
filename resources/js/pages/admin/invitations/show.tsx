import React, { useMemo, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Head, router } from '@inertiajs/react';

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
  const [form, setForm] = useState({
    type: "individual" as "individual" | "group",
    display_name: "",
    contact_name: "",
    contact_phone: "",
    contact_email: "",
    seats_reserved: 1,
    note: "",
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    router.post(`/admin/invitations/${invitation.id}/guests`, form);
  }

  const publicUrl = useMemo(() => `/i/${invitation.slug}`, [invitation.slug]);

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
    alert('Copiado al portapapeles');
  }

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
            <Button variant="outline" onClick={() => copy(location.origin + publicUrl)}>
              Copy public link
            </Button>
            <Button asChild>
              <a href={publicUrl} target="_blank" rel="noreferrer">
                Open public page
              </a>
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
                onChange={(e) => setForm(f => ({ ...f, type: e.target.value as any }))}
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

              <Input
                placeholder="Contact phone (optional)"
                value={form.contact_phone}
                onChange={(e) => setForm(f => ({ ...f, contact_phone: e.target.value }))}
              />

              <Input
                placeholder="Contact email (optional)"
                value={form.contact_email}
                onChange={(e) => setForm(f => ({ ...f, contact_email: e.target.value }))}
              />

              <Input
                type="number"
                min={1}
                placeholder="Seats reserved"
                value={form.seats_reserved}
                onChange={(e) => setForm(f => ({ ...f, seats_reserved: Number(e.target.value) }))}
              />

              <textarea
                placeholder="Note (optional)"
                rows={3}
                className="min-h-[90px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                value={form.note}
                onChange={(e) => setForm(f => ({ ...f, note: e.target.value }))}
              />

              <Button type="submit">Create guest</Button>
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
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => copy(g.rsvp_url)}>
                    Copy RSVP (next step)
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
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
