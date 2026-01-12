import React, { useMemo, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';

type Props = {
  invitation: {
    event_name: string;
    host_name: string;
    event_date: string | null;
    event_time: any;
    venue_name: string;
    venue_address?: string | null;
    rsvp_deadline_at?: string | null;
  };
  guest: {
    id: number;
    type: 'individual' | 'group';
    display_name: string;
    seats_reserved: number;
    seats_confirmed: number;
    status: 'pending' | 'confirmed' | 'declined';
  };
  isClosed: boolean;
  storeUrl: string;
};

export default function PublicRsvpShow({ invitation, guest, isClosed, storeUrl }: Props) {
  const [attending, setAttending] = useState<boolean>(guest.status === 'confirmed');
  const [seats, setSeats] = useState<number>(guest.seats_confirmed ?? 0);

  const max = guest.seats_reserved;

  function submitIndividual(val: boolean) {
    setAttending(val);
    router.post(storeUrl, { attending: val }, { preserveScroll: true });
  }

  function submitGroup(e: React.FormEvent) {
    e.preventDefault();
    router.post(storeUrl, { seats_confirmed: seats }, { preserveScroll: true });
  }

  const deadlineLabel = useMemo(() => {
    if (!invitation.rsvp_deadline_at) return null;
    return new Date(invitation.rsvp_deadline_at).toLocaleString();
  }, [invitation.rsvp_deadline_at]);

  return (
    <div className="min-h-screen bg-background">
      <Head title={`RSVP • ${invitation.event_name}`} />

      <div className="mx-auto max-w-2xl px-6 py-10">
        <div className="rounded-2xl border bg-card p-6">
          <div className="text-sm text-muted-foreground">Confirmación de asistencia</div>
          <h1 className="mt-2 text-2xl font-semibold">{invitation.event_name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Invitado: <span className="font-medium text-foreground">{guest.display_name}</span>
          </p>

          <div className="mt-4 grid gap-1 text-sm">
            <div><span className="text-muted-foreground">Fecha:</span> {invitation.event_date ?? '—'}</div>
            <div><span className="text-muted-foreground">Hora:</span> {String(invitation.event_time ?? '—')}</div>
            <div><span className="text-muted-foreground">Lugar:</span> {invitation.venue_name}</div>
            {invitation.venue_address && (
              <div className="text-muted-foreground">{invitation.venue_address}</div>
            )}
            {deadlineLabel && (
              <div className="mt-2 text-xs text-muted-foreground">
                Fecha límite para confirmar: {deadlineLabel}
              </div>
            )}
          </div>

          {isClosed && (
            <div className="mt-5 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm">
              El periodo de confirmación ya cerró. Si necesitas cambios, contacta al anfitrión.
            </div>
          )}

          <div className="mt-6 border-t pt-6">
            {guest.type === 'individual' ? (
              <div className="grid gap-3">
                <div className="text-sm font-medium">¿Asistirás?</div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    disabled={isClosed}
                    onClick={() => submitIndividual(true)}
                    className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                  >
                    Sí asistiré
                  </button>

                  <button
                    disabled={isClosed}
                    onClick={() => submitIndividual(false)}
                    className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium disabled:opacity-50"
                  >
                    No podré asistir
                  </button>
                </div>

                <div className="text-xs text-muted-foreground">
                  Estado actual: <span className="font-medium text-foreground">{guest.status}</span>
                </div>
              </div>
            ) : (
              <form onSubmit={submitGroup} className="grid gap-3">
                <div className="text-sm font-medium">¿Cuántas personas asistirán?</div>

                <div className="flex items-center gap-3">
                  <input
                    disabled={isClosed}
                    type="number"
                    min={0}
                    max={max}
                    value={seats}
                    onChange={(e) => setSeats(Math.max(0, Math.min(max, Number(e.target.value))))}
                    className="w-28 rounded-md border bg-background px-3 py-2 text-sm disabled:opacity-50"
                  />
                  <div className="text-sm text-muted-foreground">de {max} lugares reservados</div>
                </div>

                <button
                  disabled={isClosed}
                  type="submit"
                  className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                >
                  Guardar confirmación
                </button>

                <div className="text-xs text-muted-foreground">
                  Estado actual: <span className="font-medium text-foreground">{guest.status}</span>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
