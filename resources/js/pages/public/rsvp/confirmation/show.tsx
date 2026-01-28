import { Head } from "@inertiajs/react";

export default function PublicRsvpConfirmation() {
  return (
    <div className="min-h-screen bg-background">
      <Head title="RSVP Confirmed" />

      <div className="mx-auto max-w-2xl px-6 py-10">
        <div className="rounded-2xl border bg-card p-6 text-center">
          <h1 className="text-2xl font-semibold">Muchas gracias por confirmar tu asistencia!</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Recibimos tu respuesta y espero poder verte en la celebración!
          </p>
        </div>
      </div>
    </div>
  );
}
