import React, { useMemo } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { useForm } from 'react-hook-form';

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

type RsvpValues = {
  attending: boolean;
  plus_one?: boolean;
  plus_one_name?: string;
  seats_confirmed?: number;
};

export default function PublicRsvpShow({ invitation, guest, isClosed, storeUrl }: Props) {
  const { errors } = usePage().props as { errors?: Record<string, string> };
  const canPlusOne = !!guest.allow_plus_one;
  const {
    register,
    handleSubmit,
    setValue,
    watch,
  } = useForm<RsvpValues>({
    defaultValues: {
      attending: guest.status === 'confirmed',
      plus_one: canPlusOne && Array.isArray(guest.member_names) && guest.member_names.length > 0,
      plus_one_name: canPlusOne && Array.isArray(guest.member_names)
        ? String(guest.member_names[0] ?? '')
        : '',
      seats_confirmed: guest.seats_confirmed ?? 0,
    },
  });

  const attending = watch('attending');
  const plusOne = watch('plus_one');
  const plusOneName = watch('plus_one_name');
  const seats = watch('seats_confirmed') ?? 0;
  const seatsField = register('seats_confirmed', { valueAsNumber: true });

  const max = guest.seats_reserved;

  const submitIndividual = handleSubmit((values) => {
    router.post(
      storeUrl,
      {
        attending: values.attending,
        plus_one: canPlusOne ? values.plus_one : false,
        plus_one_name: canPlusOne ? values.plus_one_name : "",
      },
      { preserveScroll: true }
    );
  });

  const submitGroup = handleSubmit((values) => {
    router.post(storeUrl, { seats_confirmed: values.seats_confirmed ?? 0 }, { preserveScroll: true });
  });

  const deadlineLabel = useMemo(() => {
    if (!invitation.rsvp_deadline_at) return null;
    return new Date(invitation.rsvp_deadline_at).toLocaleString();
  }, [invitation.rsvp_deadline_at]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <Head title={`RSVP • ${invitation.event_name}`} />

      <input type="hidden" {...register('attending')} />
      <input type="hidden" {...register('plus_one')} />

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
                    onClick={() => setValue('attending', true)}
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
                      setValue('attending', false);
                      setValue('plus_one', false);
                      setValue('plus_one_name', '');
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
                          checked={!!plusOne}
                          disabled={isClosed}
                          onChange={(e) => setValue('plus_one', e.target.checked)}
                        />
                      Voy con acompañante (+1)
                    </label>

                    {plusOne ? (
                      <div className="grid gap-1">
                        <input
                          type="text"
                          placeholder="Nombre del acompañante"
                          {...register('plus_one_name')}
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
                    {...seatsField}
                    onChange={(e) =>
                      seatsField.onChange({
                        ...e,
                        target: {
                          ...e.target,
                          value: Math.max(0, Math.min(max, Number(e.target.value))),
                        },
                      })
                    }
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
