import React, { useEffect, useMemo, useState } from 'react';
import './invitation.scss';

/* ── Types ── */
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

/* ── Design tokens: Elegancia Noir + Olivo Oscuro ── */
const JW_OLIVE        = '#3f4c1b';
const JW_OLIVE_DIM    = 'rgba(63,76,27,0.15)';
const JW_OLIVE_BORDER = 'rgba(63,76,27,0.45)';
const JW_CREAM        = '#f0ebe0';
const JW_MUTED        = '#7a7060';
const JW_DARK         = '#0d0d0d';

/* ── Theme CSS vars (overrides Tailwind v4 oklch vars) ── */
function themeVars(theme: any, hostColor?: string | null): React.CSSProperties {
    const t = theme ?? {};
    return {
        ['--background' as any]:         t.background ?? 'oklch(0.08 0 0)',
        ['--foreground' as any]:         t.foreground ?? 'oklch(0.93 0.012 90)',
        ['--card' as any]:               t.card ?? 'oklch(0.10 0.002 90)',
        ['--card-foreground' as any]:    'oklch(0.93 0.012 90)',
        ['--muted' as any]:              'oklch(0.14 0 0)',
        ['--muted-foreground' as any]:   'oklch(0.52 0.022 75)',
        ['--border' as any]:             'oklch(0.32 0.08 128 / 0.45)',
        ['--ring' as any]:               'oklch(0.32 0.08 128 / 0.50)',
        ['--accent' as any]:             t.accent ?? hostColor ?? JW_OLIVE,
        ['--accent2' as any]:            t.accent2 ?? '#a8c280',
        ['--surface' as any]:            t.surface ?? 'rgba(255,255,255,0.025)',
        ['--radius' as any]:             `${t.radius ?? 20}px`,
        ['--fontDisplay' as any]:        t.fontDisplay ?? "'Cormorant Garamond', Georgia, serif",
        ['--fontBody' as any]:           t.fontBody ?? "'Jost', ui-sans-serif, sans-serif",
    };
}

/* ── Default content ── */
const DEFAULT_SCHEDULE = [
    { time: '4:00 PM', title: 'Ceremonia religiosa ⛪️', desc: 'Nos encantaría que nos puedas acompañar en este hermoso momento en la casa de nuestro señor Jesucristo.' },
    { time: '6:30 PM', title: 'Recepción 🥂🍾', desc: 'Brindis y aperitivos de bienvenida.' },
    { time: '6:45 PM', title: 'Ceremonia Civil', desc: 'Nos encantaría que nos pudieran acompañar y poder compartir este hermoso momento.' },
    { time: '8:00 PM', title: 'Cena 🍽️', desc: 'Banquete de celebración.' },
    { time: '9:00 PM', title: 'Primer baile de los novios 👰🏽🤵🏽', desc: '' },
    { time: '9:30 PM', title: 'Baile!!! 💃🏽🕺🏽', desc: '' },
    { time: '11:00 PM', title: 'Trasnochador 🌽', desc: '' },
];

const DEFAULT_FAQ = [
    {
        question: 'Código de vestimenta 👗👔',
        answer: 'Será una ceremonia de vestimenta formal. Colores NO permitidos:\n- Blanco o similares\n- Rojo\n- Ivory.',
    },
    {
        question: 'Asistencia',
        answer: 'Por tratarse de una celebración íntima y de cupo limitado, hemos tomado la decisión de solo invitar a las personas más cercanas. Tu eres una de ellas. La invitación es únicamente por la cantidad mencionada. ¡Esperamos de todo corazón que nos puedas acompañar!',
    },
    {
        question: '¿Puedo llevar niños? 🚫 👶',
        answer: 'Adoramos a tus pequeños, sin embargo este evento está destinado únicamente para adultos. ¡Esperamos tu comprensión!',
    },
    {
        question: 'Regalos 🎁',
        answer: 'Tu compañía es lo más importante, pero si gustas apoyarnos en nuestro nuevo comienzo, aquí están nuestros datos:\n- Banco: Banorte\n- Nombre: Denisse De Jesus Virgen\n- CLABE: 072028013491531651',
    },
    {
        question: 'Estacionamiento 🅿️',
        answer: 'No te preocupes por dónde dejar tu carro, el salón cuenta con valet parking. Si planeas tomar, te recomendamos usar Uber o Didi para que disfrutes tranquilo y evites cualquier inconveniente.',
    },
    {
        question: 'Confirmación de asistencia',
        answer: 'Por favor, confírmanos lo antes posible. Es muy importante para organizar el banquete.',
    },
];

/* ════════════════════════════════════════════════════
   Section ornament SVG divider (olive)
════════════════════════════════════════════════════ */
function SectionOrnament() {
    return (
        <div className="jw-ornament" aria-hidden="true">
            <svg width="32" height="18" viewBox="0 0 32 18" fill="none">
                <path
                    d="M16 2C13 7 9 8.5 4 8C7.5 11.5 12 12 16 9C20 12 24.5 11.5 28 8C23 8.5 19 7 16 2Z"
                    fill={JW_OLIVE}
                    opacity="0.65"
                />
                <circle cx="16" cy="15" r="1.8" fill={JW_OLIVE} opacity="0.4" />
            </svg>
        </div>
    );
}

/* ════════════════════════════════════════════════════
   Main component
════════════════════════════════════════════════════ */
function JesusWedding({ invitation, rsvpUrl }: Props) {
    const settings = invitation.settings ?? {};

    const gallery: string[] = Array.isArray(settings.gallery_images)
        ? settings.gallery_images.filter(Boolean)
        : [];

    const heroImage: string | null =
        typeof settings.hero_image === 'string' ? settings.hero_image : null;

    const dateLabel = useMemo(
        () => formatDateEsMX(invitation.event_date),
        [invitation.event_date],
    );
    const timeLabel = useMemo(
        () => formatTimeEsMX(invitation.event_time),
        [invitation.event_time],
    );

    useEffect(() => {
        console.log('Invitation data:', invitation);
    }, [invitation]);

    const eventDateTime = useMemo(
        () => toLocalDate(invitation.event_date, invitation.event_time),
        [invitation.event_date, invitation.event_time],
    );

    const countdown = useCountdown(eventDateTime);

    const mapsQuery = useMemo(() => {
        return (
            [invitation.venue_name, invitation.venue_address]
                .filter(Boolean)
                .join(', ') || ''
        );
    }, [invitation.venue_name, invitation.venue_address]);

    const mapsUrl = useMemo(
        () =>
            `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`,
        [mapsQuery],
    );
    const mapsEmbedUrl = useMemo(
        () =>
            `https://www.google.com/maps?q=${encodeURIComponent(mapsQuery)}&output=embed`,
        [mapsQuery],
    );

    const iglesiaMapsQuery = 'Parroquia María Estrella del Mar, P.º Ensenada 950, Playas de Tijuana, 22206 Tijuana, B.C.';
    const iglesiaMapsUrl   = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(iglesiaMapsQuery)}`;
    const iglesiaEmbedUrl  = `https://www.google.com/maps?q=${encodeURIComponent(iglesiaMapsQuery)}&output=embed`;

    const primaryMessage = [
        invitation.complementary_text_1,
        invitation.complementary_text_2,
        invitation.complementary_text_3,
    ].filter(Boolean) as string[];

    const theme    = settings?.theme ?? {};
    const schedule =
        Array.isArray(settings.schedule) && settings.schedule.length
            ? settings.schedule
            : DEFAULT_SCHEDULE;
    const dressTags     = Array.isArray(settings.dress_code_tags) ? settings.dress_code_tags : [];
    const dressFallback = (invitation.dress_code ?? '').trim();
    const giftCfg       = settings.gift ?? {};
    const giftTitle     = (giftCfg.title ?? '').toString().trim();
    const giftCtaLabel  = (giftCfg.ctaLabel ?? '').toString().trim();
    const giftDetails   = (giftCfg.details ?? '').toString();

    const faqItems: { question: string; answer: string }[] =
        Array.isArray(settings.faq) && settings.faq.length
            ? settings.faq
            : DEFAULT_FAQ;

    const brideName = settings.hero_bride ?? 'Denisse';
    const groomName = settings.hero_groom ?? 'Jesús';

    return (
        <div
            style={themeVars(theme, invitation.host_color)}
            className="min-h-screen bg-background text-foreground"
            id="jesus-wedding"
        >
            {/* Google Fonts */}
            <link
                href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Jost:wght@200;300;400;500&display=swap"
                rel="stylesheet"
            />

            {/* ═══════════════════════════════════════════
                HERO — Dark
            ═══════════════════════════════════════════ */}
            <header
                className="relative overflow-hidden"
                style={{
                    minHeight: '92vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {/* Background */}
                <div className="absolute inset-0">
                    {heroImage ? (
                        <img
                            src={heroImage}
                            alt=""
                            className="h-full w-full object-cover"
                            loading="eager"
                            style={{ opacity: 0.5 }}
                        />
                    ) : (
                        <div
                            className="h-full w-full"
                            style={{
                                background:
                                    'radial-gradient(ellipse at 50% 40%, #111008 0%, #0d0d0d 70%)',
                            }}
                        />
                    )}
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                'linear-gradient(to bottom, rgba(0,0,0,0.70) 0%, rgba(0,0,0,0.40) 50%, rgba(13,13,13,1) 100%)',
                        }}
                    />
                </div>

                {/* Centered content */}
                <div
                    className="relative w-full px-6 py-20 text-center"
                    style={{ maxWidth: 680, margin: '0 auto' }}
                >
                    {/* Badge */}
                    <p className="myTest">Los invitamos a celebrar</p>

                    {/* Ornament */}
                    <SectionOrnament />

                    {/* Bride name */}
                    <h1
                        style={{
                            fontFamily: "'Cormorant Garamond', Georgia, serif",
                            fontStyle: 'italic',
                            fontWeight: 300,
                            color: '#ffffff',
                            lineHeight: 1.0,
                            fontSize: 'clamp(3.8rem, 13vw, 7rem)',
                            letterSpacing: '-0.01em',
                            margin: '16px 0 0',
                            animation: 'jw-fade-in 1.2s ease both 0.2s',
                        }}
                    >
                        {brideName}
                    </h1>

                    {/* Ampersand */}
                    <div
                        style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontStyle: 'italic',
                            fontWeight: 300,
                            color: JW_OLIVE,
                            fontSize: 'clamp(2rem, 7vw, 3.8rem)',
                            lineHeight: 1.15,
                            margin: '2px 0',
                            animation: 'jw-fade-in 1.2s ease both 0.35s',
                        }}
                    >
                        &amp;
                    </div>

                    {/* Groom name */}
                    <h1
                        style={{
                            fontFamily: "'Cormorant Garamond', Georgia, serif",
                            fontStyle: 'italic',
                            fontWeight: 300,
                            color: '#ffffff',
                            lineHeight: 1.0,
                            fontSize: 'clamp(3.8rem, 13vw, 7rem)',
                            letterSpacing: '-0.01em',
                            margin: '0 0 20px',
                            animation: 'jw-fade-in 1.2s ease both 0.5s',
                        }}
                    >
                        {groomName}
                    </h1>

                    {/* Date ornament line */}
                    <div className="jw-ornament mt-5 mb-3">
                        <span
                            style={{
                                fontFamily: "'Jost', sans-serif",
                                fontSize: 10,
                                letterSpacing: 5,
                                textTransform: 'uppercase',
                                color: JW_MUTED,
                                opacity: 0.85,
                                whiteSpace: 'nowrap',
                            }}
                        >
                            6 de Junio · 2026
                        </span>
                    </div>

                    {/* Venue */}
                    <p
                        style={{
                            fontFamily: "'Jost', sans-serif",
                            fontSize: 11,
                            letterSpacing: 3,
                            textTransform: 'uppercase',
                            color: JW_MUTED,
                            marginBottom: 32,
                        }}
                    >
                        Salón Jardín Casa Bella · Tijuana, B.C., México
                    </p>

                    {/* Stat chips */}
                    <div className="grid grid-cols-3 gap-3">
                        <OliveChip label="Fecha" value={dateLabel ?? '6 jun, 2026'} />
                        <OliveChip label="Hora"  value={timeLabel ?? '4:00 PM'} />
                        <OliveChip
                            label="Lugar"
                            value={invitation.venue_name || 'Casa Bella'}
                        />
                    </div>
                </div>
            </header>

            {/* ═══════════════════════════════════════════
                COUNTDOWN
            ═══════════════════════════════════════════ */}
            <section
                className="px-6 py-14 sm:py-20"
                style={{ background: JW_DARK }}
            >
                <div className="mx-auto" style={{ maxWidth: 720 }}>
                    <div className="text-center" style={{ marginBottom: 36 }}>
                        <SectionOrnament />
                        <h2
                            style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                fontWeight: 400,
                                color: JW_CREAM,
                                fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
                                marginTop: 14,
                                marginBottom: 8,
                            }}
                        >
                            {settings.countdown_title ?? '¡Nos casamos muy pronto!'}
                        </h2>
                        <p
                            style={{
                                fontFamily: "'Jost', sans-serif",
                                fontSize: 10,
                                letterSpacing: 4,
                                textTransform: 'uppercase',
                                color: JW_MUTED,
                            }}
                        >
                            Cuenta regresiva
                        </p>
                    </div>

                    <div className="grid grid-cols-4 gap-3 sm:gap-5">
                        <OliveTimeBox label="Días"     value={countdown.days} />
                        <OliveTimeBox label="Horas"    value={countdown.hours} />
                        <OliveTimeBox label="Minutos"  value={countdown.minutes} />
                        <OliveTimeBox label="Segundos" value={countdown.seconds} />
                    </div>

                    {eventDateTime && (
                        <p
                            style={{
                                textAlign: 'center',
                                fontFamily: "'Jost', sans-serif",
                                fontSize: 12,
                                color: JW_MUTED,
                                marginTop: 20,
                                letterSpacing: 1,
                            }}
                        >
                            {dateLabel}
                            <span style={{ color: JW_OLIVE, margin: '0 10px' }}>·</span>
                            {timeLabel}
                        </p>
                    )}

                    <div style={{ textAlign: 'center', marginTop: 28 }}>
                        <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 8,
                                border: `1px solid ${JW_OLIVE_BORDER}`,
                                borderRadius: 40,
                                padding: '10px 26px',
                                fontFamily: "'Jost', sans-serif",
                                fontSize: 11,
                                letterSpacing: 3,
                                textTransform: 'uppercase',
                                color: JW_OLIVE,
                                textDecoration: 'none',
                            }}
                        >
                            Ver ubicación
                        </a>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════
                MAIN CONTENT
            ═══════════════════════════════════════════ */}
            <main
                className="mx-auto max-w-5xl px-6 pb-28 sm:px-10"
                style={{ paddingTop: 64 }}
            >
                {/* ── Message ── */}
                <section style={{ marginBottom: 64 }}>
                    <div style={{ textAlign: 'center', marginBottom: 32 }}>
                        <SectionOrnament />
                        <h2
                            style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                fontWeight: 400,
                                color: JW_CREAM,
                                fontSize: 'clamp(1.6rem, 4vw, 2.3rem)',
                                marginTop: 14,
                                marginBottom: 8,
                            }}
                        >
                            {settings.section_message_title ?? 'Un día para recordar'}
                        </h2>
                        <p
                            style={{
                                fontFamily: "'Jost', sans-serif",
                                fontSize: 13,
                                color: JW_MUTED,
                                letterSpacing: 1,
                            }}
                        >
                            {settings.section_message_subtitle ??
                                'Con mucho amor y alegría les compartimos los detalles de nuestra boda.'}
                        </p>
                    </div>

                    <div className="jw-card">
                        {primaryMessage.length ? (
                            <div style={{ display: 'grid', gap: 16 }}>
                                {primaryMessage.map((t, idx) => (
                                    <p
                                        key={idx}
                                        style={{
                                            fontFamily: "'Jost', sans-serif",
                                            fontSize: 15,
                                            lineHeight: 1.8,
                                            color: JW_MUTED,
                                        }}
                                    >
                                        {t}
                                    </p>
                                ))}
                            </div>
                        ) : (
                            <p
                                style={{
                                    fontFamily: "'Jost', sans-serif",
                                    fontSize: 15,
                                    lineHeight: 1.8,
                                    color: JW_MUTED,
                                    textAlign: 'center',
                                }}
                            >
                                Con gran emoción e ilusión les invitamos a ser testigos de la
                                unión de nuestras vidas en el Salón Jardín Casa Bella, Tijuana,
                                Baja California, México.
                            </p>
                        )}

                        {invitation.host_name && (
                            <p
                                style={{
                                    marginTop: 24,
                                    fontFamily: "'Cormorant Garamond', serif",
                                    fontStyle: 'italic',
                                    fontSize: '1.15rem',
                                    color: JW_OLIVE,
                                    textAlign: 'center',
                                }}
                            >
                                Con amor, {invitation.host_name}
                            </p>
                        )}
                    </div>
                </section>

                {/* ── Gallery ── */}
                <section style={{ marginBottom: 64 }}>
                    <div style={{ textAlign: 'center', marginBottom: 32 }}>
                        <SectionOrnament />
                        <h2
                            style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                fontWeight: 400,
                                color: JW_CREAM,
                                fontSize: 'clamp(1.6rem, 4vw, 2.3rem)',
                                marginTop: 14,
                                marginBottom: 8,
                            }}
                        >
                            {settings.section_gallery_title ?? 'Nuestra historia'}
                        </h2>
                        <p
                            style={{
                                fontFamily: "'Jost', sans-serif",
                                fontSize: 13,
                                color: JW_MUTED,
                                letterSpacing: 1,
                            }}
                        >
                            {settings.section_gallery_subtitle ??
                                'Algunos momentos especiales que nos trajeron hasta aquí.'}
                        </p>
                    </div>

                    <div className="jw-card" style={{ padding: 16 }}>
                        <Carousel
                            images={gallery}
                            autoplay={settings.carousel?.autoplay}
                            intervalMs={settings.carousel?.intervalMs}
                        />
                    </div>
                </section>

                {/* ── Itinerary ── */}
                <section style={{ marginBottom: 64 }}>
                    <div style={{ textAlign: 'center', marginBottom: 32 }}>
                        <SectionOrnament />
                        <h2
                            style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                fontWeight: 400,
                                color: JW_CREAM,
                                fontSize: 'clamp(1.6rem, 4vw, 2.3rem)',
                                marginTop: 14,
                                marginBottom: 8,
                            }}
                        >
                            Itinerario
                        </h2>
                        <p
                            style={{
                                fontFamily: "'Jost', sans-serif",
                                fontSize: 13,
                                color: JW_MUTED,
                                letterSpacing: 1,
                            }}
                        >
                            {settings.section_schedule_subtitle ??
                                'El orden del día para que disfrutes cada momento.'}
                        </p>
                    </div>

                    <div className="jw-card">
                        <div className="jw-timeline">
                            {schedule.map((item: any, idx: number) => (
                                <div key={idx} className="jw-timeline-item">
                                    <div className="jw-dot" />
                                    <div className="jw-time">
                                        {String(item.time ?? '—')}
                                    </div>
                                    <div className="jw-event-title">
                                        {String(item.title ?? '—')}
                                    </div>
                                    {item.desc ? (
                                        <div className="jw-event-desc">
                                            {String(item.desc)}
                                        </div>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Q&A ── */}
                <section style={{ marginBottom: 64 }}>
                    <div style={{ textAlign: 'center', marginBottom: 32 }}>
                        <SectionOrnament />
                        <h2
                            style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                fontWeight: 400,
                                color: JW_CREAM,
                                fontSize: 'clamp(1.6rem, 4vw, 2.3rem)',
                                marginTop: 14,
                                marginBottom: 8,
                            }}
                        >
                            Preguntas frecuentes
                        </h2>
                        <p
                            style={{
                                fontFamily: "'Jost', sans-serif",
                                fontSize: 13,
                                color: JW_MUTED,
                                letterSpacing: 1,
                            }}
                        >
                            Todo lo que necesitas saber para prepararte para nuestra boda.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gap: 12 }}>
                        {faqItems.map((item, idx) => (
                            <FaqItem
                                key={idx}
                                question={item.question}
                                answer={item.answer}
                            />
                        ))}
                    </div>
                </section>

                {/* ── Dress code ── */}
                <section style={{ marginBottom: 64 }}>
                    <div style={{ textAlign: 'center', marginBottom: 32 }}>
                        <SectionOrnament />
                        <h2
                            style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                fontWeight: 400,
                                color: JW_CREAM,
                                fontSize: 'clamp(1.6rem, 4vw, 2.3rem)',
                                marginTop: 14,
                                marginBottom: 8,
                            }}
                        >
                            Código de vestimenta
                        </h2>
                        <p
                            style={{
                                fontFamily: "'Jost', sans-serif",
                                fontSize: 13,
                                color: JW_MUTED,
                                letterSpacing: 1,
                            }}
                        >
                            {settings.dress_code_hint ??
                                'Queremos vernos todos increíbles en las fotos de nuestra boda.'}
                        </p>
                    </div>

                    <div className="jw-card">
                        {dressTags.length > 0 ? (
                            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 10 }}>
                                {dressTags.map((tag: string, idx: number) => (
                                    <OliveTag key={idx} label={tag} />
                                ))}
                            </div>
                        ) : dressFallback ? (
                            <p
                                style={{
                                    fontFamily: "'Jost', sans-serif",
                                    fontSize: 15,
                                    color: JW_MUTED,
                                }}
                            >
                                {dressFallback}
                            </p>
                        ) : (
                            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 10 }}>
                                {['Formal', 'Etiqueta', 'No blanco', 'No rojo', 'No ivory'].map(
                                    (tag) => <OliveTag key={tag} label={tag} />,
                                )}
                            </div>
                        )}

                        {settings.dress_code_note && (
                            <div
                                style={{
                                    marginTop: 18,
                                    padding: '14px 18px',
                                    borderRadius: 12,
                                    border: `1px solid ${JW_OLIVE_BORDER}`,
                                    fontFamily: "'Jost', sans-serif",
                                    fontSize: 13,
                                    color: JW_MUTED,
                                    lineHeight: 1.65,
                                }}
                            >
                                {String(settings.dress_code_note)}
                            </div>
                        )}
                    </div>
                </section>

                {/* ── Gift ── */}
                <section style={{ marginBottom: 64 }}>
                    <div className="jw-card" style={{ textAlign: 'center' }}>
                        <SectionOrnament />
                        <p
                            style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                fontStyle: 'italic',
                                fontSize: 'clamp(1.25rem, 3.5vw, 1.7rem)',
                                color: JW_CREAM,
                                lineHeight: 1.55,
                                marginTop: 14,
                                marginBottom: 10,
                            }}
                        >
                            Tu presencia y poder celebrar este día tan especial contigo
                            es el mejor regalo que nos puedes dar.
                        </p>
                        <p
                            style={{
                                fontFamily: "'Jost', sans-serif",
                                fontSize: 13,
                                color: JW_MUTED,
                                marginBottom: 18,
                            }}
                        >
                            Pero si quisieras expresar tu cariño, agradecemos:
                        </p>

                        <div
                            style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                fontSize: '1.4rem',
                                color: JW_OLIVE,
                                marginBottom: giftDetails.trim() ? 16 : 0,
                            }}
                        >
                            {invitation.gift_type || giftTitle || 'Sobre monetario / Transferencia bancaria'}
                        </div>

                        {giftDetails.trim() && (
                            <>
                                <details style={{ textAlign: 'left', marginTop: 14 }}>
                                    <summary
                                        style={{
                                            cursor: 'pointer',
                                            fontFamily: "'Jost', sans-serif",
                                            fontSize: 11,
                                            letterSpacing: 2,
                                            textTransform: 'uppercase',
                                            color: JW_OLIVE,
                                            listStyle: 'none',
                                        }}
                                    >
                                        {giftCtaLabel || 'Ver detalles de transferencia'}
                                    </summary>
                                    <pre
                                        style={{
                                            marginTop: 12,
                                            padding: '14px 18px',
                                            borderRadius: 12,
                                            border: `1px solid ${JW_OLIVE_BORDER}`,
                                            fontFamily: "'Jost', monospace",
                                            fontSize: 12,
                                            whiteSpace: 'pre-wrap',
                                            color: JW_MUTED,
                                            background: JW_OLIVE_DIM,
                                        }}
                                    >
                                        {giftDetails}
                                    </pre>
                                </details>

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigator.clipboard?.writeText(giftDetails)
                                    }
                                    style={{
                                        marginTop: 14,
                                        border: `1px solid ${JW_OLIVE_BORDER}`,
                                        borderRadius: 40,
                                        padding: '9px 22px',
                                        fontFamily: "'Jost', sans-serif",
                                        fontSize: 11,
                                        letterSpacing: 2,
                                        textTransform: 'uppercase',
                                        color: JW_OLIVE,
                                        background: 'transparent',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Copiar detalles
                                </button>
                            </>
                        )}
                    </div>
                </section>

                {/* ── Iglesia map ── */}
                <section style={{ marginBottom: 48 }}>
                    <div style={{ textAlign: 'center', marginBottom: 28 }}>
                        <SectionOrnament />
                        <h2
                            style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                fontWeight: 400,
                                color: JW_CREAM,
                                fontSize: 'clamp(1.6rem, 4vw, 2.3rem)',
                                marginTop: 14,
                                marginBottom: 8,
                            }}
                        >
                            Parroquia María Estrella del Mar
                        </h2>
                        <p
                            style={{
                                fontFamily: "'Jost', sans-serif",
                                fontSize: 12,
                                color: JW_MUTED,
                                letterSpacing: 1,
                            }}
                        >
                            P.º Ensenada 950, Playas de Tijuana, 22206 Tijuana, B.C.
                        </p>
                    </div>
                    <MapEmbed embedUrl={iglesiaEmbedUrl} mapsUrl={iglesiaMapsUrl} />
                </section>

                {/* ── Salón map ── */}
                <section>
                    <div style={{ textAlign: 'center', marginBottom: 28 }}>
                        <SectionOrnament />
                        <h2
                            style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                fontWeight: 400,
                                color: JW_CREAM,
                                fontSize: 'clamp(1.6rem, 4vw, 2.3rem)',
                                marginTop: 14,
                                marginBottom: 8,
                            }}
                        >
                            {settings.section_map_title ?? 'Salón Jardín Casa Bella'}
                        </h2>
                        <p
                            style={{
                                fontFamily: "'Jost', sans-serif",
                                fontSize: 12,
                                color: JW_MUTED,
                                letterSpacing: 1,
                            }}
                        >
                            {invitation.venue_address ||
                                'Salón Jardín Casa Bella, Tijuana, Baja California, México'}
                        </p>
                    </div>
                    <MapEmbed
                        embedUrl={mapsQuery ? mapsEmbedUrl : ''}
                        mapsUrl={mapsUrl}
                    />
                </section>
            </main>

            {/* ═══════════════════════════════════════════
                FOOTER
            ═══════════════════════════════════════════ */}
            <footer
                style={{
                    background: JW_DARK,
                    borderTop: `1px solid ${JW_OLIVE_BORDER}`,
                    padding: '48px 24px',
                    textAlign: 'center',
                }}
            >
                <SectionOrnament />
                <p
                    style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontStyle: 'italic',
                        fontWeight: 300,
                        fontSize: 'clamp(1.8rem, 5vw, 2.5rem)',
                        color: JW_CREAM,
                        marginTop: 14,
                        marginBottom: 8,
                        lineHeight: 1.1,
                    }}
                >
                    {brideName} &amp; {groomName}
                </p>
                <p
                    style={{
                        fontFamily: "'Jost', sans-serif",
                        fontSize: 10,
                        letterSpacing: 5,
                        textTransform: 'uppercase',
                        color: JW_MUTED,
                    }}
                >
                    6 · 6 · 2026
                </p>
            </footer>
        </div>
    );
}

export default JesusWedding;

/* ════════════════════════════════════════════════════
   Sub-components
════════════════════════════════════════════════════ */

function OliveChip({ label, value }: { label: string; value: string }) {
    return (
        <div className="jw-chip">
            <span className="jw-chip-label">{label}</span>
            <span className="jw-chip-value">{value}</span>
        </div>
    );
}

function OliveTimeBox({ label, value }: { label: string; value: string }) {
    return (
        <div className="jw-time-box">
            <span className="jw-num">{value}</span>
            <span className="jw-lbl">{label}</span>
        </div>
    );
}

function OliveTag({ label }: { label: string }) {
    return (
        <span
            style={{
                border: `1px solid ${JW_OLIVE_BORDER}`,
                borderRadius: 40,
                padding: '6px 18px',
                fontFamily: "'Jost', sans-serif",
                fontSize: 11,
                letterSpacing: 2,
                textTransform: 'uppercase',
                color: JW_OLIVE,
            }}
        >
            {label}
        </span>
    );
}

function MapEmbed({ embedUrl, mapsUrl }: { embedUrl: string; mapsUrl: string }) {
    return (
        <>
            <div
                style={{
                    borderRadius: 20,
                    overflow: 'hidden',
                    border: `1px solid ${JW_OLIVE_BORDER}`,
                }}
            >
                <div style={{ aspectRatio: '16/7', width: '100%' }}>
                    {embedUrl ? (
                        <iframe
                            title="Mapa"
                            src={embedUrl}
                            style={{
                                width: '100%',
                                height: '100%',
                                border: 'none',
                                display: 'block',
                            }}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        />
                    ) : (
                        <div
                            style={{
                                display: 'flex',
                                height: '100%',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontFamily: "'Jost', sans-serif",
                                fontSize: 13,
                                color: JW_MUTED,
                            }}
                        >
                            Configura el lugar/dirección para mostrar el mapa.
                        </div>
                    )}
                </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: 16 }}>
                <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        border: `1px solid ${JW_OLIVE_BORDER}`,
                        borderRadius: 40,
                        padding: '10px 26px',
                        fontFamily: "'Jost', sans-serif",
                        fontSize: 11,
                        letterSpacing: 3,
                        textTransform: 'uppercase',
                        color: JW_OLIVE,
                        textDecoration: 'none',
                    }}
                >
                    Abrir en Google Maps
                </a>
            </div>
        </>
    );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="jw-faq-item">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="jw-faq-trigger"
                aria-expanded={open}
            >
                <span className="jw-faq-q">{question}</span>
                <span className={`jw-faq-icon${open ? ' open' : ''}`}>+</span>
            </button>
            {open && <div className="jw-faq-answer">{answer}</div>}
        </div>
    );
}

function Carousel({
    images,
    autoplay,
    intervalMs,
}: {
    images: string[];
    autoplay?: boolean;
    intervalMs?: number;
}) {
    const safe = images?.length ? images : [];
    const [index, setIndex] = useState(0);
    const [prevIndex, setPrevIndex] = useState<number | null>(null);

    const canAuto = autoplay ?? true;
    const delay   = intervalMs ?? 6500;

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
            <div
                style={{
                    display: 'flex',
                    aspectRatio: '16/9',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 16,
                    border: `1px solid ${JW_OLIVE_BORDER}`,
                    background: JW_OLIVE_DIM,
                    fontFamily: "'Jost', sans-serif",
                    fontSize: 13,
                    color: JW_MUTED,
                    textAlign: 'center',
                    padding: 24,
                }}
            >
                Sin imágenes. Agrega{' '}
                <code style={{ margin: '0 4px', color: JW_OLIVE }}>
                    settings.gallery_images
                </code>{' '}
                (4 fotos recomendadas).
            </div>
        );
    }

    return (
        <div style={{ display: 'grid', gap: 12 }}>
            <div
                style={{
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: 16,
                    border: `1px solid ${JW_OLIVE_BORDER}`,
                    background: 'rgba(0,0,0,0.3)',
                }}
            >
                <div style={{ aspectRatio: '16/9' }}>
                    {prevIndex !== null && safe[prevIndex] && (
                        <img
                            src={safe[prevIndex]}
                            alt=""
                            style={{
                                position: 'absolute', inset: 0,
                                width: '100%', height: '100%',
                                objectFit: 'cover', opacity: 0,
                                transition: 'opacity 0.5s ease',
                            }}
                        />
                    )}
                    <img
                        src={safe[index]}
                        alt={`Foto ${index + 1}`}
                        style={{
                            position: 'absolute', inset: 0,
                            width: '100%', height: '100%',
                            objectFit: 'cover', opacity: 1,
                            transition: 'opacity 0.5s ease',
                        }}
                        loading="lazy"
                    />
                    <div
                        style={{
                            position: 'absolute', inset: 0,
                            background: 'linear-gradient(to top, rgba(0,0,0,0.22) 0%, transparent 40%)',
                        }}
                    />
                    <div
                        style={{
                            position: 'absolute', bottom: 12, right: 14,
                            background: 'rgba(0,0,0,0.55)', borderRadius: 40,
                            padding: '4px 12px',
                            fontFamily: "'Jost', sans-serif", fontSize: 10,
                            letterSpacing: 2, color: JW_CREAM,
                        }}
                    >
                        {index + 1} / {safe.length}
                    </div>
                </div>

                {safe.length > 1 && (
                    <>
                        <button
                            type="button" onClick={goPrev} aria-label="Anterior"
                            style={{
                                position: 'absolute', top: '50%', left: 12,
                                transform: 'translateY(-50%)',
                                border: `1px solid ${JW_OLIVE_BORDER}`,
                                background: 'rgba(13,13,13,0.65)',
                                borderRadius: '50%', width: 38, height: 38,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: JW_OLIVE, fontSize: '1.3rem', cursor: 'pointer',
                            }}
                        >‹</button>
                        <button
                            type="button" onClick={goNext} aria-label="Siguiente"
                            style={{
                                position: 'absolute', top: '50%', right: 12,
                                transform: 'translateY(-50%)',
                                border: `1px solid ${JW_OLIVE_BORDER}`,
                                background: 'rgba(13,13,13,0.65)',
                                borderRadius: '50%', width: 38, height: 38,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: JW_OLIVE, fontSize: '1.3rem', cursor: 'pointer',
                            }}
                        >›</button>
                    </>
                )}
            </div>

            {safe.length > 1 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                    {safe.map((src, i) => (
                        <button
                            key={i} type="button" onClick={() => goTo(i)}
                            aria-label={`Ir a imagen ${i + 1}`}
                            style={{
                                width: 68, height: 44, borderRadius: 8, overflow: 'hidden',
                                border: i === index ? `2px solid ${JW_OLIVE}` : `1px solid ${JW_OLIVE_BORDER}`,
                                padding: 0, cursor: 'pointer',
                                outline: i === index ? `3px solid ${JW_OLIVE_DIM}` : 'none',
                                outlineOffset: 2,
                            }}
                        >
                            <img
                                src={src} alt={`Miniatura ${i + 1}`}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                loading="lazy"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ════════════════════════════════════════════════════
   Hooks & utilities
════════════════════════════════════════════════════ */

function useCountdown(target: Date | null) {
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const id = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(id);
    }, []);

    const diff         = Math.max(0, (target?.getTime() ?? 0) - now);
    const totalSeconds = Math.floor(diff / 1000);
    const days         = Math.floor(totalSeconds / (60 * 60 * 24));
    const hours        = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
    const minutes      = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds      = totalSeconds % 60;

    return {
        days:    pad2(days),
        hours:   pad2(hours),
        minutes: pad2(minutes),
        seconds: pad2(seconds),
    };
}

function pad2(n: number) {
    return String(n).padStart(2, '0');
}

function formatDateEsMX(dateStr?: string | null) {
    if (!dateStr) return null;
    const [y, m, d] = dateStr.split('-').map(Number);
    if (!y || !m || !d) return dateStr;
    const dt = new Date(y, m - 1, d);
    return new Intl.DateTimeFormat('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(dt);
}

function formatTimeEsMX(timeStr?: string | null) {
    if (!timeStr) return null;
    const clean = timeStr.slice(-8, -3);
    const [hh, mm] = clean.split(':').map(Number);
    if (Number.isNaN(hh) || Number.isNaN(mm)) return timeStr;
    const dt = new Date();
    dt.setHours(hh, mm, 0, 0);
    return new Intl.DateTimeFormat('es-MX', {
        hour: 'numeric',
        minute: '2-digit',
    }).format(dt);
}

function toLocalDate(dateStr?: string | null, timeStr?: string | null) {
    if (!dateStr) return null;
    const time  = (timeStr ?? '16:00').slice(-8, -3);
    const [y, m, d]   = dateStr.split('-').map(Number);
    const [hh, mm]    = time.split(':').map(Number);
    if (!y || !m || !d) return null;
    const dt = new Date(y, m - 1, d, hh ?? 16, mm ?? 0, 0);
    return Number.isNaN(dt.getTime()) ? null : dt;
}
