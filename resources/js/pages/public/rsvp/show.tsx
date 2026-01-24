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
    allow_plus_one?: boolean;
    member_names?: string[] | null;
  };
  isClosed: boolean;
  storeUrl: string;
};

export default function PublicRsvpShow({ invitation, guest, isClosed, storeUrl }: Props) {
  const { errors } = usePage().props as { errors?: Record<string, string> };
  const [attending, setAttending] = useState<boolean>(guest.status === 'confirmed');
  const [seats, setSeats] = useState<number>(guest.seats_confirmed ?? 0);
  const canPlusOne = !!guest.allow_plus_one;
  const [plusOne, setPlusOne] = useState<boolean>(
    canPlusOne && Array.isArray(guest.member_names) && guest.member_names.length > 0
  );
  const [plusOneName, setPlusOneName] = useState<string>(
    canPlusOne && Array.isArray(guest.member_names) ? String(guest.member_names[0] ?? '') : ''
  );

  const max = guest.seats_reserved;

  function submitIndividual(e: React.FormEvent) {
    e.preventDefault();
    router.post(
      storeUrl,
      {
        attending,
        plus_one: canPlusOne ? plusOne : false,
        plus_one_name: canPlusOne ? plusOneName : "",
      },
      { preserveScroll: true }
    );
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
              <form onSubmit={submitIndividual} className="grid gap-3">
                <div className="text-sm font-medium">¿Asistirás?</div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    disabled={isClosed}
                    onClick={() => setAttending(true)}
                    className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 ${
                      attending ? "bg-primary text-primary-foreground" : "border"
                    }`}
                  >
                    Sí asistiré
                  </button>

                  <button
                    type="button"
                    disabled={isClosed}
                    onClick={() => {
                      setAttending(false);
                      setPlusOne(false);
                      setPlusOneName('');
                    }}
                    className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 ${
                      !attending ? "bg-primary text-primary-foreground" : "border"
                    }`}
                  >
                    No podré asistir
                  </button>
                </div>

                {attending && canPlusOne ? (
                  <div className="grid gap-3 rounded-xl border bg-card p-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={plusOne}
                        disabled={isClosed}
                        onChange={(e) => setPlusOne(e.target.checked)}
                      />
                      Voy con acompañante (+1)
                    </label>

                    {plusOne ? (
                      <div className="grid gap-1">
                        <input
                          type="text"
                          placeholder="Nombre del acompañante"
                          value={plusOneName}
                          onChange={(e) => setPlusOneName(e.target.value)}
                          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                          disabled={isClosed}
                        />
                        {errors?.plus_one_name ? (
                          <div className="text-xs text-destructive">{errors.plus_one_name}</div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ) : null}

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
