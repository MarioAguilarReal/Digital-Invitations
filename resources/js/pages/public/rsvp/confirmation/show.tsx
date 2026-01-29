import { Head, Link } from "@inertiajs/react";
import { useEffect } from "react";

type Props = {
  invitation_url: string;
};

export default function PublicRsvpConfirmation({ invitation_url }: Props) {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = `/i/${invitation_url}`;
    }, 5000);

    return () => clearTimeout(timer);
  }, [invitation_url]);
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <Head title="RSVP Confirmed" />

      <div className="mx-auto max-w-2xl px-6 py-10">
        <div className="rounded-2xl border bg-card p-6 text-center">
          <h1 className="text-2xl font-semibold">Muchas gracias por confirmar tu asistencia!</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Recibimos tu respuesta y espero poder verte en la celebración!
          </p>

          <div className="mt-6">
            <Link
              href={`/i/${invitation_url}`}
              className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Regresar a la invitación
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
