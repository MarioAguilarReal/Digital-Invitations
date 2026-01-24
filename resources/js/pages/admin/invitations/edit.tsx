import React, { useMemo, useState } from "react";
import { router } from "@inertiajs/react";

type Template = {
  id: number;
  key: string;
  name: string;
  description?: string | null;
  preview_image_url?: string | null;
};

type Invitation = {
  id: number;
  template_id: number | string;
  event_name: string;
  host_name: string;
  host_color?: string | null;
  venue_name: string;
  venue_address?: string | null;
  event_date: string;
  event_time: string;
  capacity: number;
  rsvp_deadline_at?: string | null;
  gift_type?: string | null;
  dress_code?: string | null;
  complementary_text_1?: string | null;
  complementary_text_2?: string | null;
  complementary_text_3?: string | null;
  settings?: Record<string, any>;
};

type Props = {
  templates: Template[];
  invitation: Invitation;
};

export default function EditInvitation({ templates, invitation }: Props) {
  const [form, setForm] = useState({
    template_id: invitation.template_id ?? templates[0]?.id ?? "",
    event_name: invitation.event_name ?? "",
    host_name: invitation.host_name ?? "",
    host_color: invitation.host_color ?? "#6D28D9",
    venue_name: invitation.venue_name ?? "",
    venue_address: invitation.venue_address ?? "",
    event_date: invitation.event_date ?? "",
    event_time: invitation.event_time ?? "",
    capacity: invitation.capacity ?? 0,
    rsvp_deadline_at: invitation.rsvp_deadline_at ?? "",
    gift_type: invitation.gift_type ?? "",
    dress_code: invitation.dress_code ?? "",
    complementary_text_1: invitation.complementary_text_1 ?? "",
    complementary_text_2: invitation.complementary_text_2 ?? "",
    complementary_text_3: invitation.complementary_text_3 ?? "",
    settings: invitation.settings ?? {},
  });
  const [settingsText, setSettingsText] = useState(() =>
    JSON.stringify(form.settings, null, 2)
  );
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  function syncSettings(nextSettings: Record<string, any>) {
    setForm(f => ({ ...f, settings: nextSettings }));
    setSettingsText(JSON.stringify(nextSettings, null, 2));
  }

  function setByPath(obj: any, path: string, value: any) {
    const parts = path.split('.');
    const next = { ...(obj ?? {}) };
    let cur: any = next;
    for (let i = 0; i < parts.length - 1; i++) {
      const k = parts[i];
      cur[k] = typeof cur[k] === 'object' && cur[k] !== null && !Array.isArray(cur[k]) ? { ...cur[k] } : {};
      cur = cur[k];
    }
    cur[parts[parts.length - 1]] = value;
    return next;
  }

  function updateSetting(path: string, value: any) {
    const next = setByPath(form.settings ?? {}, path, value);
    syncSettings(next);
    setSettingsError(null);
  }

  function getSetting(path: string, fallback: any = '') {
    const parts = path.split('.');
    let cur: any = form.settings ?? {};
    for (const p of parts) {
      if (cur == null) return fallback;
      cur = cur[p];
    }
    return cur ?? fallback;
  }

  function getStringArray(path: string): string[] {
    const v = getSetting(path, []);
    return Array.isArray(v) ? v.filter(Boolean).map(String) : [];
  }

  function setStringArray(path: string, arr: string[]) {
    updateSetting(path, arr.filter(Boolean));
  }

  const selected = useMemo(
    () => templates.find(t => t.id === Number(form.template_id)),
    [templates, form.template_id]
  );

  function getCsrfToken() {
    return document
      .querySelector('meta[name="csrf-token"]')
      ?.getAttribute('content');
  }

  async function uploadImages(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError(null);

    try {
      const urls: string[] = [];
      const token = getCsrfToken() ?? '';

      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('image', file);

        const res = await fetch('/admin/uploads', {
          method: 'POST',
          body: formData,
          headers: token ? { 'X-CSRF-TOKEN': token } : undefined,
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'Upload failed');
        }

        const data = await res.json();
        if (data?.url) urls.push(String(data.url));
      }

      if (urls.length) {
        setStringArray('gallery_images', [...getStringArray('gallery_images'), ...urls]);
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'No se pudo subir la imagen.');
    } finally {
      setUploading(false);
    }
  }

  async function uploadHeroImage(file: File | null) {
    if (!file) return;
    setUploading(true);
    setUploadError(null);

    try {
      const token = getCsrfToken() ?? '';
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/admin/uploads', {
        method: 'POST',
        body: formData,
        headers: token ? { 'X-CSRF-TOKEN': token } : undefined,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Upload failed');
      }

      const data = await res.json();
      if (data?.url) updateSetting('hero_image', String(data.url));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'No se pudo subir la imagen.');
    } finally {
      setUploading(false);
    }
  }

  function handleSubmit(e: any) {
    e.preventDefault();
    const trimmed = settingsText.trim();
    if (trimmed) {
      try {
        const parsed = JSON.parse(trimmed);
        setSettingsError(null);
        router.put(`/admin/invitations/${invitation.id}`, { ...form, settings: parsed });
      } catch {
        setSettingsError("JSON inválido. Usa comillas dobles y sin comas finales.");
      }
      return;
    }

    router.put(`/admin/invitations/${invitation.id}`, { ...form, settings: null });
  }

  function saveAndReturn() {
    const trimmed = settingsText.trim();
    if (trimmed) {
      try {
        const parsed = JSON.parse(trimmed);
        setSettingsError(null);
        router.put(`/admin/invitations/${invitation.id}`, { ...form, settings: parsed }, {
          onSuccess: () => router.visit('/admin/invitations'),
        });
      } catch {
        setSettingsError("JSON inválido. Usa comillas dobles y sin comas finales.");
      }
      return;
    }

    router.put(`/admin/invitations/${invitation.id}`, { ...form, settings: null }, {
      onSuccess: () => router.visit('/admin/invitations'),
    });
  }

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <a href="/admin/invitations" style={{ fontSize: 12, textDecoration: "underline" }}>
            Volver a invitaciones
          </a>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>Editar Invitación</h1>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: "420px 1fr", gap: 24, marginTop: 16 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>Template</h2>

          <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
            {templates.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setForm(f => ({ ...f, template_id: t.id }))}
                style={{
                  textAlign: "left",
                  padding: 12,
                  borderRadius: 12,
                  border: t.id === Number(form.template_id) ? "2px solid black" : "1px solid #ddd",
                  background: "white",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontWeight: 700 }}>{t.name}</div>
                <div style={{ opacity: 0.7, fontSize: 13 }}>{t.description}</div>
              </button>
            ))}
          </div>

          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 8 }}>Preview</div>
            <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid #eee" }}>
              {selected?.preview_image_url ? (
                <img src={selected.preview_image_url} alt={selected.name} style={{ width: "100%", display: "block" }} />
              ) : (
                <div style={{ padding: 24, opacity: 0.7 }}>No preview</div>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>Detalles del Evento</h2>

          <label htmlFor="event_name" style={{ fontSize: 12, fontWeight: 600 }}>Nombre del evento</label>
          <input id="event_name" placeholder="Nombre del evento" value={form.event_name}
            onChange={e => setForm(f => ({ ...f, event_name: e.target.value }))} required />

          <label htmlFor="host_name" style={{ fontSize: 12, fontWeight: 600 }}>Nombre del anfitrión</label>
          <input id="host_name" placeholder="Nombre del anfitrión" value={form.host_name}
            onChange={e => setForm(f => ({ ...f, host_name: e.target.value }))} required />

          <label htmlFor="host_color" style={{ fontSize: 12, fontWeight: 600 }}>Color del anfitrión</label>
          <input
            id="host_color"
            type="color"
            value={form.host_color}
            onChange={e => setForm(f => ({ ...f, host_color: e.target.value }))}
            style={{ height: 42, padding: 0 }}
          />

          <label htmlFor="venue_name" style={{ fontSize: 12, fontWeight: 600 }}>Nombre del lugar</label>
          <input id="venue_name" placeholder="Nombre del lugar" value={form.venue_name}
            onChange={e => setForm(f => ({ ...f, venue_name: e.target.value }))} required />

          <label htmlFor="venue_address" style={{ fontSize: 12, fontWeight: 600 }}>Dirección del lugar</label>
          <input id="venue_address" placeholder="Dirección del lugar" value={form.venue_address}
            onChange={e => setForm(f => ({ ...f, venue_address: e.target.value }))} required />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ display: "grid", gap: 6 }}>
              <label htmlFor="event_date" style={{ fontSize: 12, fontWeight: 600 }}>Fecha del evento</label>
              <input
                id="event_date"
                type="date"
                value={form.event_date}
                onChange={(e) => setForm(f => ({ ...f, event_date: e.target.value }))}
              />
            </div>
            <div style={{ display: "grid", gap: 6 }}>
              <label htmlFor="event_time" style={{ fontSize: 12, fontWeight: 600 }}>Hora del evento</label>
              <input
                id="event_time"
                type="time"
                value={form.event_time}
                onChange={(e) => setForm(f => ({ ...f, event_time: e.target.value }))}
              />
            </div>
          </div>

          <label htmlFor="capacity" style={{ fontSize: 12, fontWeight: 600 }}>Capacidad</label>
          <input id="capacity" type="number" placeholder="Capacidad" value={form.capacity}
            onChange={e => setForm(f => ({ ...f, capacity: Number(e.target.value) }))} required />

          <label htmlFor="rsvp_deadline_at" style={{ fontSize: 12, fontWeight: 600 }}>Fecha límite para RSVP</label>
          <input id="rsvp_deadline_at" type="date" placeholder="Fecha límite para RSVP" value={form.rsvp_deadline_at}
            onChange={e => setForm(f => ({ ...f, rsvp_deadline_at: e.target.value }))} />

          <label htmlFor="gift_type" style={{ fontSize: 12, fontWeight: 600 }}>Tipo de regalo</label>
          <input id="gift_type" placeholder="Tipo de regalo" value={form.gift_type}
            onChange={e => setForm(f => ({ ...f, gift_type: e.target.value }))} />

          <label htmlFor="dress_code" style={{ fontSize: 12, fontWeight: 600 }}>Código de vestimenta</label>
          <input id="dress_code" placeholder="Código de vestimenta" value={form.dress_code}
            onChange={e => setForm(f => ({ ...f, dress_code: e.target.value }))} />

          <label htmlFor="complementary_text_1" style={{ fontSize: 12, fontWeight: 600 }}>Texto complementario 1</label>
          <textarea id="complementary_text_1" placeholder="Texto complementario 1" value={form.complementary_text_1}
            onChange={e => setForm(f => ({ ...f, complementary_text_1: e.target.value }))} />

          <label htmlFor="complementary_text_2" style={{ fontSize: 12, fontWeight: 600 }}>Texto complementario 2</label>
          <textarea id="complementary_text_2" placeholder="Texto complementario 2" value={form.complementary_text_2}
            onChange={e => setForm(f => ({ ...f, complementary_text_2: e.target.value }))} />

          <label htmlFor="complementary_text_3" style={{ fontSize: 12, fontWeight: 600 }}>Texto complementario 3</label>
          <textarea id="complementary_text_3" placeholder="Texto complementario 3" value={form.complementary_text_3}
            onChange={e => setForm(f => ({ ...f, complementary_text_3: e.target.value }))} />

          <details style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 12, background: '#fff' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 700 }}>Campos avanzados (visual)</summary>

            <div style={{ display: 'grid', gap: 14, marginTop: 12 }}>
              {/* HERO */}
              <div style={{ border: '1px solid #eee', borderRadius: 12, padding: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Hero</div>
                <div style={{ display: 'grid', gap: 10 }}>
                  <label style={{ fontSize: 12, fontWeight: 600 }}>
                    Subir imagen hero
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploading}
                      onChange={(e) => uploadHeroImage(e.target.files?.[0] ?? null)}
                      style={{ display: 'block', marginTop: 6 }}
                    />
                  </label>
                  {String(getSetting('hero_image', '') || '').trim() ? (
                    <img
                      src={String(getSetting('hero_image', ''))}
                      alt="Hero preview"
                      style={{ width: '100%', borderRadius: 12, border: '1px solid #eee' }}
                      loading="lazy"
                    />
                  ) : null}
                  <input
                    placeholder="Hero title"
                    value={String(getSetting('hero_title', ''))}
                    onChange={e => updateSetting('hero_title', e.target.value)}
                  />
                  <input
                    placeholder="Hero subtitle"
                    value={String(getSetting('hero_subtitle', ''))}
                    onChange={e => updateSetting('hero_subtitle', e.target.value)}
                  />
                  <input
                    placeholder="Hero image URL (https://...)"
                    value={String(getSetting('hero_image', ''))}
                    onChange={e => updateSetting('hero_image', e.target.value)}
                  />
                </div>
              </div>

              {/* GALLERY */}
              <div style={{ border: '1px solid #eee', borderRadius: 12, padding: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ fontWeight: 700 }}>Galería (Carrusel)</div>
                  <button
                    type="button"
                    onClick={() => setStringArray('gallery_images', [...getStringArray('gallery_images'), ''])}
                    style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}
                  >
                    + Agregar imagen
                  </button>
                </div>

                <div style={{ display: 'grid', gap: 6, marginTop: 10 }}>
                  <label style={{ fontSize: 12, fontWeight: 600 }}>
                    Subir imágenes
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={uploading}
                      onChange={(e) => uploadImages(e.target.files)}
                      style={{ display: 'block', marginTop: 6 }}
                    />
                  </label>
                  {uploading && (
                    <div style={{ fontSize: 12, opacity: 0.7 }}>Subiendo imágenes...</div>
                  )}
                  {uploadError && (
                    <div style={{ fontSize: 12, color: '#b91c1c' }}>{uploadError}</div>
                  )}
                </div>

                <div style={{ display: 'grid', gap: 10, marginTop: 10 }}>
                  {getStringArray('gallery_images').map((url, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '64px 1fr 40px', gap: 10, alignItems: 'center' }}>
                      <div style={{ width: 64, height: 40, borderRadius: 8, overflow: 'hidden', border: '1px solid #eee', background: '#f3f4f6' }}>
                        {url ? (
                          <img src={url} alt={`Preview ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                        ) : null}
                      </div>
                      <input
                        placeholder={`Imagen #${idx + 1} URL`}
                        value={url}
                        onChange={e => {
                          const arr = getStringArray('gallery_images');
                          arr[idx] = e.target.value;
                          setStringArray('gallery_images', arr);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const arr = getStringArray('gallery_images');
                          arr.splice(idx, 1);
                          setStringArray('gallery_images', arr);
                        }}
                        title="Eliminar"
                        style={{ height: 40, width: 40, borderRadius: 10, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {getStringArray('gallery_images').length === 0 ? (
                    <div style={{ fontSize: 12, opacity: 0.7 }}>
                      Agrega URLs directas de imagen (jpg/png/webp). Ej: de tu storage o de un CDN.
                    </div>
                  ) : null}
                </div>
              </div>

              {/* COUNTDOWN */}
              <div style={{ border: '1px solid #eee', borderRadius: 12, padding: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Cuenta regresiva</div>
                <input
                  placeholder="Título del countdown"
                  value={String(getSetting('countdown_title', ''))}
                  onChange={e => updateSetting('countdown_title', e.target.value)}
                />
              </div>

              {/* SCHEDULE */}
              <div style={{ border: '1px solid #eee', borderRadius: 12, padding: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ fontWeight: 700 }}>Itinerario</div>
                  <button
                    type="button"
                    onClick={() => {
                      const cur = getSetting('schedule', []);
                      const arr = Array.isArray(cur) ? [...cur] : [];
                      arr.push({ time: '18:00', title: '', desc: '' });
                      updateSetting('schedule', arr);
                    }}
                    style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}
                  >
                    + Agregar paso
                  </button>
                </div>

                <div style={{ display: 'grid', gap: 10, marginTop: 10 }}>
                  {(Array.isArray(getSetting('schedule', [])) ? (getSetting('schedule', []) as any[]) : []).map((step: any, idx: number) => (
                    <div key={idx} style={{ border: '1px solid #eee', borderRadius: 12, padding: 10, display: 'grid', gap: 10 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 40px', gap: 10, alignItems: 'center' }}>
                        <input
                          type="time"
                          value={String(step?.time ?? '')}
                          onChange={e => {
                            const arr = [...(getSetting('schedule', []) as any[])];
                            arr[idx] = { ...(arr[idx] ?? {}), time: e.target.value };
                            updateSetting('schedule', arr);
                          }}
                        />
                        <input
                          placeholder="Título"
                          value={String(step?.title ?? '')}
                          onChange={e => {
                            const arr = [...(getSetting('schedule', []) as any[])];
                            arr[idx] = { ...(arr[idx] ?? {}), title: e.target.value };
                            updateSetting('schedule', arr);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const arr = [...(getSetting('schedule', []) as any[])];
                            arr.splice(idx, 1);
                            updateSetting('schedule', arr);
                          }}
                          title="Eliminar"
                          style={{ height: 40, width: 40, borderRadius: 10, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}
                        >
                          ×
                        </button>
                      </div>

                      <input
                        placeholder="Descripción"
                        value={String(step?.desc ?? '')}
                        onChange={e => {
                          const arr = [...(getSetting('schedule', []) as any[])];
                          arr[idx] = { ...(arr[idx] ?? {}), desc: e.target.value };
                          updateSetting('schedule', arr);
                        }}
                      />
                    </div>
                  ))}

                  {(Array.isArray(getSetting('schedule', [])) ? (getSetting('schedule', []) as any[]) : []).length === 0 ? (
                    <div style={{ fontSize: 12, opacity: 0.7 }}>Agrega pasos para mostrar un timeline en el template.</div>
                  ) : null}
                </div>
              </div>

              {/* DRESS CODE TAGS */}
              <div style={{ border: '1px solid #eee', borderRadius: 12, padding: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Dress code (chips)</div>
                <input
                  placeholder="Ej: Formal, Colores claros, Evitar tenis"
                  value={getStringArray('dress_code_tags').join(', ')}
                  onChange={e => {
                    const parts = e.target.value
                      .split(',')
                      .map(s => s.trim())
                      .filter(Boolean);
                    setStringArray('dress_code_tags', parts);
                  }}
                />
                <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
                  Separa por comas para crear chips.
                </div>
              </div>

              {/* GIFT */}
              <div style={{ border: '1px solid #eee', borderRadius: 12, padding: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Regalo (sección avanzada)</div>
                <div style={{ display: 'grid', gap: 10 }}>
                  <input
                    placeholder="Título (ej: Lluvia de sobres)"
                    value={String(getSetting('gift.title', ''))}
                    onChange={e => updateSetting('gift.title', e.target.value)}
                  />
                  <input
                    placeholder="Descripción corta"
                    value={String(getSetting('gift.desc', ''))}
                    onChange={e => updateSetting('gift.desc', e.target.value)}
                  />
                  <input
                    placeholder="Texto del botón (ej: Ver detalles)"
                    value={String(getSetting('gift.ctaLabel', ''))}
                    onChange={e => updateSetting('gift.ctaLabel', e.target.value)}
                  />
                  <textarea
                    placeholder="Detalles (ej: CLABE, notas, etc.)"
                    value={String(getSetting('gift.details', ''))}
                    onChange={e => updateSetting('gift.details', e.target.value)}
                    style={{ minHeight: 90 }}
                  />
                </div>
              </div>

              {/* THEME */}
              <div style={{ border: '1px solid #eee', borderRadius: 12, padding: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Tema</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <label style={{ display: 'grid', gap: 6, fontSize: 12 }}>
                    Color principal
                    <input
                      type="color"
                      value={String(getSetting('theme.accent', '#6D28D9'))}
                      onChange={e => updateSetting('theme.accent', e.target.value)}
                      style={{ height: 42, padding: 0 }}
                    />
                  </label>
                  <label style={{ display: 'grid', gap: 6, fontSize: 12 }}>
                    Color secundario
                    <input
                      type="color"
                      value={String(getSetting('theme.accent2', '#22C55E'))}
                      onChange={e => updateSetting('theme.accent2', e.target.value)}
                      style={{ height: 42, padding: 0 }}
                    />
                  </label>
                </div>

                <div style={{ display: 'grid', gap: 10, marginTop: 10 }}>
                  <input
                    placeholder="Font display (ej: Cormorant Garamond)"
                    value={String(getSetting('theme.fontDisplay', ''))}
                    onChange={e => updateSetting('theme.fontDisplay', e.target.value)}
                  />
                  <input
                    placeholder="Font body (ej: Inter)"
                    value={String(getSetting('theme.fontBody', ''))}
                    onChange={e => updateSetting('theme.fontBody', e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
                  <label style={{ display: 'grid', gap: 6, fontSize: 12 }}>
                    Radio (px)
                    <input
                      type="number"
                      value={Number(getSetting('theme.radius', 28))}
                      onChange={e => updateSetting('theme.radius', Number(e.target.value))}
                    />
                  </label>
                  <label style={{ display: 'grid', gap: 6, fontSize: 12 }}>
                    Autoplay carrusel
                    <select
                      value={String(getSetting('carousel.autoplay', true))}
                      onChange={e => updateSetting('carousel.autoplay', e.target.value === 'true')}
                      style={{ height: 42 }}
                    >
                      <option value="true">Sí</option>
                      <option value="false">No</option>
                    </select>
                  </label>
                </div>

                <label style={{ display: 'grid', gap: 6, fontSize: 12, marginTop: 10 }}>
                  Intervalo carrusel (ms)
                  <input
                    type="number"
                    value={Number(getSetting('carousel.intervalMs', 6500))}
                    onChange={e => updateSetting('carousel.intervalMs', Number(e.target.value))}
                  />
                </label>
              </div>

              <div style={{ border: '1px solid #eee', borderRadius: 12, padding: 12, display: 'grid' }}>
                <label htmlFor="settings" style={{ fontSize: 12, fontWeight: 600 }}>Configuraciones (JSON)</label>
                <textarea
                  id="settings"
                  placeholder="Configuraciones (JSON)"
                  value={settingsText}
                  onChange={e => {
                    const next = e.target.value;
                    setSettingsText(next);
                    try {
                      const parsed = JSON.parse(next);
                      setSettingsError(null);
                      setForm(f => ({ ...f, settings: parsed }));
                    } catch {
                      setSettingsError("JSON inválido. Usa comillas dobles y sin comas finales.");
                    }
                  }}
                  style={{ fontFamily: "monospace", minHeight: 100 }}
                />
                {settingsError && (
                  <div style={{ fontSize: 12, color: "#b91c1c" }}>{settingsError}</div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => syncSettings({})}
                  style={{ padding: 10, borderRadius: 10, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}
                >
                  Limpiar settings
                </button>

                <button
                  type="button"
                  onClick={() => {
                    syncSettings({
                      hero_title: form.event_name || 'Graduación',
                      hero_subtitle: 'Acompáñanos a celebrar este logro. Tu presencia hace la diferencia.',
                      countdown_title: 'Cuenta regresiva para el gran día',
                      gallery_images: getStringArray('gallery_images'),
                      schedule: getSetting('schedule', []),
                      dress_code_tags: getStringArray('dress_code_tags'),
                      gift: getSetting('gift', {}),
                      theme: {
                        accent: '#6D28D9',
                        accent2: '#22C55E',
                        radius: 28,
                        fontDisplay: 'Cormorant Garamond',
                        fontBody: 'Inter'
                      },
                      carousel: { autoplay: true, intervalMs: 6500 }
                    });
                  }}
                  style={{ padding: 10, borderRadius: 10, border: '1px solid #111827', background: '#111827', color: '#fff', cursor: 'pointer' }}
                >
                  Aplicar preset
                </button>
              </div>
            </div>
          </details>

          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button
              type="submit"
              style={{ padding: 12, background: "black", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}
            >
              Guardar cambios
            </button>
            <button
              type="button"
              onClick={saveAndReturn}
              style={{ padding: 12, border: "1px solid #111827", borderRadius: 8, cursor: "pointer", background: "white" }}
            >
              Guardar y volver
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
