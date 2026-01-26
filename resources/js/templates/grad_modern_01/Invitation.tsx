import React, { useEffect, useMemo, useState } from "react";

type Invitation = {
  event_name: string;
  host_name: string;
  host_color?: string | null;
  venue_name: string;
  venue_address?: string | null;
  event_date?: string | null; // YYYY-MM-DD
  event_time?: string | null; // HH:mm or HH:mm:ss
  dress_code?: string | null;
  gift_type?: string | null;
  complementary_text_1?: string | null;
  complementary_text_2?: string | null;
  complementary_text_3?: string | null;
  settings?: Record<string, any>;
};

type Props = {
  invitation: Invitation;
  rsvpUrl?: string | null;
};

function themeVars(theme: any, hostColor?: string | null): React.CSSProperties {
  const t = theme ?? {};
  const accent = t.accent ?? hostColor ?? "#1800a1";
  return {
    ["--accent" as any]: accent,
    ["--accent2" as any]: t.accent2 ?? "#22C55E",
    ["--surface" as any]:
      t.surface ?? "color-mix(in srgb, var(--background) 70%, transparent)",
    ["--heroOverlay" as any]: t.heroOverlay ?? "rgba(0,0,0,0.35)",
    ["--radius" as any]: `${t.radius ?? 28}px`,
    ["--fontDisplay" as any]: t.fontDisplay ?? "ui-serif, Arial, serif",
    ["--fontBody" as any]: t.fontBody ?? "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial",
  };
}

export default function GradStory01({ invitation, rsvpUrl }: Props) {
  const settings = invitation.settings ?? {};

  // Gallery images via settings.gallery_images: string[]
  const gallery: string[] = Array.isArray(settings.gallery_images)
    ? settings.gallery_images.filter(Boolean)
    : [];

  // Hero background image (optional): settings.hero_image
  const heroImage: string | null = typeof settings.hero_image === "string" ? settings.hero_image : null;

  // Optional: big title override
  const heroTitle = typeof settings.hero_title === "string" ? settings.hero_title : invitation.event_name;

  const dateLabel = useMemo(() => formatDateEsMX(invitation.event_date), [invitation.event_date]);
  const timeLabel = useMemo(() => formatTimeEsMX(invitation.event_time), [invitation.event_time]);

  useEffect(() => {
    console.log("Invitation data:", invitation);
  }, [invitation]);

  const eventDateTime = useMemo(() => {
    const localDate = toLocalDate(invitation.event_date, invitation.event_time);
    return localDate;
  }, [invitation.event_date, invitation.event_time]);

  const countdown = useCountdown(eventDateTime);

  const mapsQuery = useMemo(() => {
    const q = [invitation.venue_name, invitation.venue_address].filter(Boolean).join(", ");
    return q || "";
  }, [invitation.venue_name, invitation.venue_address]);

  const mapsUrl = useMemo(() => {
    // abre Google Maps normal
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`;
  }, [mapsQuery]);

  const mapsEmbedUrl = useMemo(() => {
    // embed sin API key (funciona para la mayoría de casos)
    // Nota: Google puede cambiar comportamiento; si algún día pide key, migramos a Static API o Maps Embed API.
    return `https://www.google.com/maps?q=${encodeURIComponent(mapsQuery)}&output=embed`;
  }, [mapsQuery]);

  const primaryMessage = [
    invitation.complementary_text_1,
    invitation.complementary_text_2,
    invitation.complementary_text_3,
  ].filter(Boolean) as string[];

  const theme = settings?.theme ?? {};
  const schedule = Array.isArray(settings.schedule) ? settings.schedule : [];
  const dressTags = Array.isArray(settings.dress_code_tags) ? settings.dress_code_tags : [];
  const gift = settings.gift ?? null;
  const dressFallback = (invitation.dress_code ?? "").trim();
  const giftCfg = settings.gift ?? {};
  const giftTitle = (giftCfg.title ?? "").toString().trim();
  const giftDesc = (giftCfg.desc ?? "").toString().trim();
  const giftCtaLabel = (giftCfg.ctaLabel ?? "").toString().trim();
  const giftDetails = (giftCfg.details ?? "").toString();

  return (
    <div style={themeVars(theme, invitation.host_color)} className="min-h-screen bg-background text-foreground">
      {/* HERO */}
      <header className="relative overflow-hidden">
        {/* background */}
        <div className="absolute inset-0">
          {heroImage ? (
            <img
              src={heroImage}
              alt=""
              className="h-full w-full object-cover opacity-70"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-b from-muted/70 to-background" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-background" />
        </div>

        <div className="relative mx-auto max-w-5xl px-6 pb-12 pt-14 sm:px-10 sm:pb-20 sm:pt-20">
          <div className="inline-flex items-center gap-2 rounded-full border bg-card/60 px-4 py-2 text-xs font-medium backdrop-blur">
            <span className="opacity-80">Invitación</span>
            <span className="opacity-40">•</span>
            <span className="opacity-80">Graduación</span>
          </div>

          <h1 style={{ fontFamily: "var(--fontDisplay)", color: "white" }} className="mt-5 text-4xl font-semibold tracking-tight sm:text-6xl">
            {heroTitle || "Graduación"}
          </h1>

          <p style={{ fontFamily: "var(--fontBody)", color: "white" }} className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            {settings.hero_subtitle
              ? String(settings.hero_subtitle)
              : "Acompáñanos a celebrar este logro. Tu presencia haría el momento aún más especial."}
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <StatChip label="Fecha" value={dateLabel ?? "—"} />
            <StatChip label="Hora" value={timeLabel ?? "—"} />
            <StatChip label="Lugar" value={invitation.venue_name || "—"} />
          </div>

          {/* Countdown */}
          <div className="mt-10 rounded-3xl border bg-card/60 p-6 backdrop-blur sm:p-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Cuenta regresiva</div>
                <div className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                  {settings.countdown_title ? String(settings.countdown_title) : "Nos vemos muy pronto"}
                </div>
              </div>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-xl border bg-background/60 px-4 py-3 text-sm font-medium backdrop-blur transition hover:bg-background"
              >
                Ver ubicación
              </a>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <TimeBox label="Días" value={countdown.days} />
              <TimeBox label="Horas" value={countdown.hours} />
              <TimeBox label="Minutos" value={countdown.minutes} />
              <TimeBox label="Segundos" value={countdown.seconds} />
            </div>

            <div className="mt-4 text-xs text-muted-foreground">
              {eventDateTime ? (
                <>
                  Fecha del evento: <span className="font-medium text-foreground">{dateLabel}</span>{" "}
                  <span className="opacity-60">•</span>{" "}
                  <span className="font-medium text-foreground">{timeLabel}</span>
                </>
              ) : (
                "Configura fecha y hora para activar la cuenta regresiva."
              )}
            </div>
          </div>
        </div>
      </header>

      {/* BODY */}
      <main className="mx-auto max-w-5xl px-6 pb-28 pt-10 sm:px-10">
        {/* Big message section */}
        <section className="grid gap-6 sm:grid-cols-5">
          <div className="sm:col-span-2">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {settings.section_message_title ? String(settings.section_message_title) : "Un día para recordar"}
            </h2>
            <p style={{ fontFamily: "var(--fontBody)" }} className="mt-3 text-sm text-muted-foreground sm:text-base">
              {settings.section_message_subtitle
                ? String(settings.section_message_subtitle)
                : "Te compartimos los detalles y algunos momentos que nos trajeron hasta aquí."}
            </p>
          </div>

          <div className="sm:col-span-3">
            <div className="rounded-3xl border bg-card/60 p-6 backdrop-blur sm:p-8">
              {primaryMessage.length ? (
                <div className="grid gap-4 text-base leading-relaxed sm:text-lg">
                  {primaryMessage.map((t, idx) => (
                    <p style={{ fontFamily: "var(--fontBody)" }} key={idx} className="text-muted-foreground">
                      {t}
                    </p>
                  ))}
                </div>
              ) : (
                <p style={{ fontFamily: "var(--fontBody)" }} className="text-muted-foreground">
                  Agrega textos complementarios para mostrar un mensaje largo aquí.
                </p>
              )}
              {invitation.host_name ? (
                <div className="mt-6 text-sm text-muted-foreground">
                  Con cariño,{" "}
                  <span className="font-semibold text-foreground">{invitation.host_name}</span>.
                </div>
              ) : null}
            </div>
          </div>
        </section>

        {/* Gallery / Carousel */}
        <section className="mt-10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {settings.section_gallery_title ? String(settings.section_gallery_title) : "Momentos"}
              </h2>
              <p style={{ fontFamily: "var(--fontBody)" }} className="mt-2 text-sm text-muted-foreground sm:text-base">
                {settings.section_gallery_subtitle
                  ? String(settings.section_gallery_subtitle)
                  : "Un carrusel de recuerdos antes del gran día."}
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              {gallery.length ? `${gallery.length} fotos` : "Configura gallery_images"}
            </div>
          </div>

          <div className="mt-5 rounded-3xl border bg-card/60 p-4 backdrop-blur sm:p-6">
            <Carousel
              images={gallery}
              autoplay={settings.carousel?.autoplay}
              intervalMs={settings.carousel?.intervalMs}
            />
          </div>
        </section>

        {/* Details section */}
        <section className="mt-10 grid gap-4 sm:grid-cols-2">
          <section className="mt-10">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  Código de vestimenta
                </h2>
                <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                  {settings.dress_code_hint
                    ? String(settings.dress_code_hint)
                    : "Sugerencia para que todos nos veamos increíbles en las fotos 📸"}
                </p>
              </div>
            </div>

            <div
              className="mt-5 rounded-3xl border bg-card/60 p-6 backdrop-blur sm:p-8 dark:bg-card/40"
              style={{
                borderRadius: "var(--radius, 28px)",
              }}
            >
              {/* chips */}
              {dressTags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {dressTags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="rounded-full border bg-background/70 px-3 py-1 text-xs font-medium dark:bg-background/40"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : dressFallback ? (
                <div className="text-sm text-muted-foreground">{dressFallback}</div>
              ) : (
                <div className="text-sm text-muted-foreground">—</div>
              )}

              {/* optional: extra note */}
              {settings.dress_code_note ? (
                <div className="mt-4 rounded-2xl border bg-background/60 p-4 text-sm text-muted-foreground">
                  {String(settings.dress_code_note)}
                </div>
              ) : null}
            </div>
          </section>

          <section className="mt-10">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  {giftTitle || "Regalo"}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                  {giftDesc || invitation.gift_type || "Tu presencia es lo más importante."}
                </p>
              </div>
            </div>

            <div
              className="mt-5 rounded-3xl border bg-card/60 p-6 backdrop-blur sm:p-8 dark:bg-card/40"
              style={{
                borderRadius: "var(--radius, 28px)",
              }}
            >
              {/* highlight card */}
              <div className="rounded-2xl border bg-background/60 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold">
                      {giftTitle || invitation.gift_type || "Sugerencia"}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {giftDesc ||
                        invitation.gift_type ||
                        "Si deseas obsequiar algo, aquí puedes ver opciones."}
                    </div>
                  </div>

                  <div
                    className="shrink-0 rounded-2xl border px-3 py-2 text-xs font-semibold"
                    style={{ color: "var(--accent, #6D28D9)" }}
                  >
                    💝
                  </div>
                </div>
              </div>

              {/* details */}
              {giftDetails.trim() ? (
                <details className="mt-4">
                  <summary className="cursor-pointer select-none text-sm font-semibold">
                    {giftCtaLabel || "Ver detalles"}
                  </summary>

                  <pre className="mt-3 whitespace-pre-wrap rounded-2xl border bg-background/60 p-4 text-xs text-muted-foreground">
          {giftDetails}
                  </pre>
                </details>
              ) : null}

              {/* optional: copy button */}
              {giftDetails.trim() ? (
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(giftDetails)}
                  className="mt-4 inline-flex items-center justify-center rounded-xl border bg-background/60 px-4 py-3 text-sm font-medium backdrop-blur transition hover:bg-background"
                >
                  Copiar detalles
                </button>
              ) : null}
            </div>
          </section>
        </section>

        {/* Map preview */}
        <section className="mt-10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {settings.section_map_title ? String(settings.section_map_title) : "Ubicación"}
              </h2>
              <p style={{ fontFamily: "var(--fontBody)" }} className="mt-2 text-sm text-muted-foreground sm:text-base">
                {invitation.venue_address || "Abre el mapa para ver la ruta."}
              </p>
            </div>

            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-xl border bg-background/60 px-4 py-3 text-sm font-medium backdrop-blur transition hover:bg-background"
            >
              Abrir en Google Maps
            </a>
          </div>

          <div className="mt-5 overflow-hidden rounded-3xl border bg-card/60 backdrop-blur">
            {/* Google maps preview */}
            <div className="aspect-[16/10] w-full sm:aspect-[16/7]">
              {mapsQuery ? (
                <iframe
                  title="Mapa"
                  src={mapsEmbedUrl}
                  className="h-full w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                  Configura el lugar/dirección para mostrar el mapa.
                </div>
              )}
            </div>
          </div>
        </section>
        <section className="mt-10">
          <h2 style={{ fontFamily: "var(--fontDisplay)" }} className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Itinerario
          </h2>

          <div className="mt-5 rounded-3xl border p-6 backdrop-blur" style={{ background: "var(--surface)", borderRadius: "var(--radius)" }}>
            {schedule.length ? (
              <ol className="grid gap-4">
                {schedule.map((item: any, idx: number) => (
                  <li key={idx} className="grid grid-cols-[80px_1fr] gap-4">
                    <div className="text-sm font-semibold tabular-nums">{String(item.time ?? "—")}</div>
                    <div>
                      <div className="text-sm font-semibold">{String(item.title ?? "—")}</div>
                      {item.desc ? <div className="text-sm text-muted-foreground">{String(item.desc)}</div> : null}
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="text-sm text-muted-foreground">Configura <code>settings.schedule</code> para mostrar el itinerario.</div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border bg-card/60 p-6 backdrop-blur sm:p-8">
      <h3 className="text-base font-semibold tracking-tight">{title}</h3>
      <div className="mt-3 text-sm sm:text-base">{children}</div>
    </div>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-card/60 p-4 backdrop-blur">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}

function TimeBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-background/50 p-4 text-center backdrop-blur">
      <div className="text-3xl font-semibold tabular-nums tracking-tight">{value}</div>
      <div className="mt-1 text-xs font-medium text-muted-foreground">{label}</div>
    </div>
  );
}

function Carousel({ images, autoplay, intervalMs }: { images: string[]; autoplay?: boolean; intervalMs?: number }) {
  const safe = images?.length ? images : [];
  const [index, setIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);

  const canAuto = autoplay ?? true;
  const delay = intervalMs ?? 6500;

  useEffect(() => {
    if (!canAuto || safe.length <= 1) return;
    const id = window.setInterval(() => goNext(), delay);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safe.length, canAuto, delay]);

  function goTo(i: number) {
    if (!safe.length) return;
    setPrevIndex(index);
    setIndex((i + safe.length) % safe.length);
    window.setTimeout(() => setPrevIndex(null), 420);
  }
  function goPrev() { goTo(index - 1); }
  function goNext() { goTo(index + 1); }

  if (!safe.length) {
    return (
      <div className="flex aspect-[16/10] w-full items-center justify-center rounded-2xl border bg-background/40 text-sm text-muted-foreground sm:aspect-[16/7]">
        Sin imágenes. Agrega <code className="mx-1 rounded bg-background px-1">settings.gallery_images</code>.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div
        className="relative overflow-hidden rounded-2xl border bg-black/5 dark:bg-white/5"
        style={{ borderRadius: "var(--radius)" }}
      >
        <div className="aspect-[16/10] sm:aspect-[16/7]">
          {/* Prev image (fade out) */}
          {prevIndex !== null && safe[prevIndex] ? (
            <img
              src={safe[prevIndex]}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500"
              style={{ opacity: 0 }}
              loading="lazy"
            />
          ) : null}

          {/* Current image (fade in) */}
          <img
            src={safe[index]}
            alt={`Foto ${index + 1}`}
            className="absolute inset-0 h-full w-full object-cover opacity-100 transition-opacity duration-500"
            loading="lazy"
          />

          {/* Overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />
        </div>

        {safe.length > 1 ? (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border bg-background/70 px-3 py-2 text-sm font-medium backdrop-blur hover:bg-background"
              aria-label="Anterior"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border bg-background/70 px-3 py-2 text-sm font-medium backdrop-blur hover:bg-background"
              aria-label="Siguiente"
            >
              ›
            </button>
          </>
        ) : null}
      </div>

      {safe.length > 1 ? (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {safe.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              className={`relative overflow-hidden rounded-lg border transition ${
                i === index
                  ? "border-[var(--accent)] ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-background"
                  : "border-border hover:border-foreground/40"
              }`}
              style={{
                width: 72,
                height: 48,
              }}
              aria-label={`Ir a imagen ${i + 1}`}
            >
              <img
                src={src}
                alt={`Miniatura ${i + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function useCountdown(target: Date | null) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const diff = Math.max(0, (target?.getTime() ?? 0) - now);

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  return {
    days: pad2(days),
    hours: pad2(hours),
    minutes: pad2(minutes),
    seconds: pad2(seconds),
  };
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function formatDateEsMX(dateStr?: string | null) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return dateStr;

  const dt = new Date(Date.UTC(y, m - 1, d));
  return new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(dt);
}

function formatTimeEsMX(timeStr?: string | null) {
  if (!timeStr) return null;
  const clean = timeStr.slice(-8, -3);
  const [hh, mm] = clean.split(":").map(Number);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return timeStr;

  const dt = new Date();
  dt.setHours(hh, mm, 0, 0);

  return new Intl.DateTimeFormat("es-MX", {
    hour: "numeric",
    minute: "2-digit",
  }).format(dt);
}

function toLocalDate(dateStr?: string | null, timeStr?: string | null) {
  if (!dateStr) return null;

  const time = (timeStr ?? "18:00").slice(-8, -3); // default 6pm
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  if (!y || !m || !d) return null;

  // local date time
  const dt = new Date(y, m - 1, d, hh ?? 18, mm ?? 0, 0);
  return Number.isNaN(dt.getTime()) ? null : dt;
}
