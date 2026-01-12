import React from 'react';
import { Head, Link } from '@inertiajs/react';

export default function NotFound() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <Head title="404 - Not Found" />

      {/* fondo decorativo */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full blur-3xl bg-muted" />
        <div className="absolute -bottom-40 left-1/3 h-[520px] w-[520px] rounded-full blur-3xl bg-muted" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 text-center">
        <div className="rounded-2xl border bg-card/60 p-8 backdrop-blur">
          <div className="text-sm font-medium text-muted-foreground">Error 404</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Esta página no existe
          </h1>
          <p className="mt-3 text-muted-foreground">
            El enlace puede estar mal escrito, haber caducado, o la invitación aún no está publicada.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Ir al inicio
            </Link>

            <button
              type="button"
              onClick={() => history.back()}
              className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium"
            >
              Volver
            </button>
          </div>

          <div className="mt-6 text-xs text-muted-foreground">
            Si esto era una invitación, pídele al anfitrión que te reenvíe el link correcto.
          </div>
        </div>
      </div>
    </div>
  );
}
