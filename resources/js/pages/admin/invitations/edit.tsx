import React, { useEffect, useMemo, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import { useForm } from "react-hook-form";

type Template = {
  id: number;
  key: string;
  name: string;
  description?: string | null;
  preview_image_url?: string | null;
};

type Invitation = {
  id: number;
  slug: string;
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

type InvitationFormValues = {
  template_id: number;
  event_name: string;
  host_name: string;
  host_color?: string;
  venue_name: string;
  venue_address?: string | null;
  event_date: string;
  event_time: string | Date;
  capacity: number;
  rsvp_deadline_at?: string | null;
  gift_type?: string | null;
  dress_code?: string | null;
  complementary_text_1?: string | null;
  complementary_text_2?: string | null;
  complementary_text_3?: string | null;
  settingsText?: string;
};

export default function EditInvitation({ templates, invitation }: Props) {
  const { flash } = usePage().props as { flash?: { upload?: { url?: string } } };
  const {
    register,
    handleSubmit,
    setValue,
    watch,
  } = useForm<InvitationFormValues>({
    defaultValues: {
      template_id: Number(invitation.template_id ?? templates[0]?.id ?? 0),
      event_name: invitation.event_name ?? "",
      host_name: invitation.host_name ?? "",
      host_color: invitation.host_color ?? "#6D28D9",
      venue_name: invitation.venue_name ?? "",
      venue_address: invitation.venue_address ?? "",
      event_date: invitation.event_date ?? "",
      event_time: invitation.event_time.slice(-8) ?? "",
      capacity: invitation.capacity ?? 0,
      rsvp_deadline_at: invitation.rsvp_deadline_at ?? "",
      gift_type: invitation.gift_type ?? "",
      dress_code: invitation.dress_code ?? "",
      complementary_text_1: invitation.complementary_text_1 ?? "",
      complementary_text_2: invitation.complementary_text_2 ?? "",
      complementary_text_3: invitation.complementary_text_3 ?? "",
      settingsText: JSON.stringify(invitation.settings ?? {}, null, 2),
    },
  });
  const [settings, setSettings] = useState<Record<string, any>>(invitation.settings ?? {});
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);

  function slugify(value: string) {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }

  function syncSettings(nextSettings: Record<string, any>) {
    setSettings(nextSettings);
    setValue("settingsText", JSON.stringify(nextSettings, null, 2), {
      shouldValidate: true,
    });
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
    const next = setByPath(settings ?? {}, path, value);
    syncSettings(next);
  }

  function getSetting(path: string, fallback: any = '') {
    const parts = path.split('.');
    let cur: any = settings ?? {};
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

  const eventName = watch("event_name");
  const hostName = watch("host_name");
  const slugHint = useMemo(() => {
    if (invitation.slug) return invitation.slug;
    const base = `${eventName}-${hostName}`.trim();
    return slugify(base) || "draft";
  }, [invitation.slug, eventName, hostName]);

  const galleryImages = getStringArray('gallery_images');
  useEffect(() => {
    if (!galleryImages.length) {
      setGalleryIndex(0);
      return;
    }
    if (galleryIndex >= galleryImages.length) {
      setGalleryIndex(galleryImages.length - 1);
    }
  }, [galleryImages.length, galleryIndex]);

  const templateId = watch("template_id");
  const settingsText = watch("settingsText") ?? "";
  const selected = useMemo(
    () => templates.find(t => t.id === Number(templateId)),
    [templates, templateId]
  );

  async function uploadImages(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError(null);

    try {
      const urls: string[] = [];

      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('slug', slugHint);
        formData.append('category', 'gallery');
        const uploaded = await postUpload(formData);
        if (uploaded?.url) urls.push(String(uploaded.url));
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
      const formData = new FormData();
      formData.append('image', file);
      formData.append('slug', slugHint);
      formData.append('category', 'hero');
      const uploaded = await postUpload(formData);
      if (uploaded?.url) updateSetting('hero_image', String(uploaded.url));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'No se pudo subir la imagen.');
    } finally {
      setUploading(false);
    }
  }

  function postUpload(formData: FormData): Promise<{ url?: string } | undefined> {
    return new Promise((resolve, reject) => {
      router.post('/admin/uploads', formData, {
        forceFormData: true,
        preserveScroll: true,
        preserveState: true,
        onSuccess: (page) => {
          const upload = (page?.props as any)?.flash?.upload ?? flash?.upload;
          resolve(upload);
        },
        onError: (errors) => {
          reject(new Error(Object.values(errors).join(', ') || 'Upload failed'));
        },
      });
    });
  }

  function submitUpdate(values: InvitationFormValues, onSuccess?: () => void) {
    const trimmed = settingsText.trim();
    let parsedSettings: Record<string, any> = settings ?? {};
    if (trimmed) {
      try {
        parsedSettings = JSON.parse(trimmed);
      } catch {
        setSettingsError("JSON inválido en settings.");
        return;
      }
    }
    setSettingsError(null);

    router.put(
      `/admin/invitations/${invitation.id}`,
      { ...values, settings: parsedSettings },
      { onSuccess },
    );
  }

  const onSubmit = handleSubmit((values) => submitUpdate(values));

  const saveAndReturn = handleSubmit((values) =>
    submitUpdate(values, () => router.visit("/admin/invitations")),
  );

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
                onClick={() => setValue("template_id", t.id, { shouldValidate: true })}
                style={{
                  textAlign: "left",
                  padding: 12,
                  borderRadius: 12,
                  border: t.id === Number(templateId) ? "2px solid black" : "1px solid #ddd",
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

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>Detalles del Evento</h2>
          <input type="hidden" {...register("template_id")} />

          <label htmlFor="event_name" style={{ fontSize: 12, fontWeight: 600 }}>Nombre del evento</label>
          <input id="event_name" placeholder="Nombre del evento" {...register("event_name")} required />

          <label htmlFor="host_name" style={{ fontSize: 12, fontWeight: 600 }}>Nombre del anfitrión</label>
          <input id="host_name" placeholder="Nombre del anfitrión" {...register("host_name")} required />

          <label htmlFor="host_color" style={{ fontSize: 12, fontWeight: 600 }}>Color del anfitrión</label>
          <input
            id="host_color"
            type="color"
            {...register("host_color")}
            style={{ height: 42, padding: 0 }}
          />

          <label htmlFor="venue_name" style={{ fontSize: 12, fontWeight: 600 }}>Nombre del lugar</label>
          <input id="venue_name" placeholder="Nombre del lugar" {...register("venue_name")} required />

          <label htmlFor="venue_address" style={{ fontSize: 12, fontWeight: 600 }}>Dirección del lugar</label>
          <input id="venue_address" placeholder="Dirección del lugar" {...register("venue_address")} required />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ display: "grid", gap: 6 }}>
              <label htmlFor="event_date" style={{ fontSize: 12, fontWeight: 600 }}>Fecha del evento</label>
              <input id="event_date" type="date" {...register("event_date")} />
            </div>
            <div style={{ display: "grid", gap: 6 }}>
              <label htmlFor="event_time" style={{ fontSize: 12, fontWeight: 600 }}>Hora del evento</label>
              <input id="event_time" type="time" {...register("event_time")} />
            </div>
          </div>

          <label htmlFor="capacity" style={{ fontSize: 12, fontWeight: 600 }}>Capacidad</label>
          <input id="capacity" type="number" placeholder="Capacidad" {...register("capacity", { valueAsNumber: true })} required />

          <label htmlFor="rsvp_deadline_at" style={{ fontSize: 12, fontWeight: 600 }}>Fecha límite para RSVP</label>
          <input id="rsvp_deadline_at" type="date" placeholder="Fecha límite para RSVP" {...register("rsvp_deadline_at")} />

          <label htmlFor="gift_type" style={{ fontSize: 12, fontWeight: 600 }}>Tipo de regalo</label>
          <input id="gift_type" placeholder="Tipo de regalo" {...register("gift_type")} />

          <label htmlFor="dress_code" style={{ fontSize: 12, fontWeight: 600 }}>Código de vestimenta</label>
          <input id="dress_code" placeholder="Código de vestimenta" {...register("dress_code")} />

          <label htmlFor="complementary_text_1" style={{ fontSize: 12, fontWeight: 600 }}>Texto complementario 1</label>
          <textarea id="complementary_text_1" placeholder="Texto complementario 1" {...register("complementary_text_1")} />

          <label htmlFor="complementary_text_2" style={{ fontSize: 12, fontWeight: 600 }}>Texto complementario 2</label>
          <textarea id="complementary_text_2" placeholder="Texto complementario 2" {...register("complementary_text_2")} />

          <label htmlFor="complementary_text_3" style={{ fontSize: 12, fontWeight: 600 }}>Texto complementario 3</label>
          <textarea id="complementary_text_3" placeholder="Texto complementario 3" {...register("complementary_text_3")} />

          <details style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 12, background: '#fff' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 700 }}>Campos avanzados (visual)</summary>

            <div style={{ display: 'grid', gap: 14, marginTop: 12 }}>
              {/* HERO */}
              <div style={{ border: '1px solid #eee', borderRadius: 12, padding: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Hero</div>
                <div style={{ display: 'grid', gap: 10 }}>
                  {String(getSetting('hero_image', '') || '').trim() ? (
                    <img
                      src={String(getSetting('hero_image', ''))}
                      alt="Hero preview"
                      style={{ width: '100%', borderRadius: 12, border: '1px solid #eee' }}
                      loading="lazy"
                    />
                  ) : (
                    <div style={{ fontSize: 12, opacity: 0.7 }}>
                      Sube una imagen para mostrar el hero.
                    </div>
                  )}
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      border: '1px dashed #cbd5e1',
                      borderRadius: 12,
                      padding: 12,
                      display: 'grid',
                      gap: 6,
                      background: '#f8fafc',
                      cursor: 'pointer',
                    }}
                  >
                    Subir imagen hero
                    <span style={{ fontSize: 12, opacity: 0.7 }}>
                      Selecciona una imagen desde tu computadora
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploading}
                      onChange={(e) => uploadHeroImage(e.target.files?.[0] ?? null)}
                      style={{ display: 'none' }}
                    />
                  </label>
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
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      border: '1px dashed #cbd5e1',
                      borderRadius: 12,
                      padding: 12,
                      display: 'grid',
                      gap: 6,
                      background: '#f8fafc',
                      cursor: 'pointer',
                    }}
                  >
                    Subir imágenes a la galería
                    <span style={{ fontSize: 12, opacity: 0.7 }}>
                      Selecciona varias imágenes para el carrusel
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={uploading}
                      onChange={(e) => uploadImages(e.target.files)}
                      style={{ display: 'none' }}
                    />
                  </label>
                  {uploading && (
                    <div style={{ fontSize: 12, opacity: 0.7 }}>Subiendo imágenes...</div>
                  )}
                  {uploadError && (
                    <div style={{ fontSize: 12, color: '#b91c1c' }}>{uploadError}</div>
                  )}
                </div>

                <div style={{ marginTop: 12 }}>
                  {galleryImages.length ? (
                    <div style={{ border: '1px solid #eee', borderRadius: 12, overflow: 'hidden', position: 'relative' }}>
                      <div style={{ aspectRatio: '16/9', background: '#f3f4f6' }}>
                        <img
                          src={galleryImages[galleryIndex]}
                          alt={`Preview ${galleryIndex + 1}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          loading="lazy"
                        />
                      </div>
                      {galleryImages.length > 1 ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setGalleryIndex((galleryIndex - 1 + galleryImages.length) % galleryImages.length)}
                            style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', borderRadius: 999, border: '1px solid #ddd', background: '#fff', padding: '6px 10px', cursor: 'pointer' }}
                          >
                            ‹
                          </button>
                          <button
                            type="button"
                            onClick={() => setGalleryIndex((galleryIndex + 1) % galleryImages.length)}
                            style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', borderRadius: 999, border: '1px solid #ddd', background: '#fff', padding: '6px 10px', cursor: 'pointer' }}
                          >
                            ›
                          </button>
                        </>
                      ) : null}
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, opacity: 0.7 }}>
                      Sube imágenes para ver el carrusel de vista previa.
                    </div>
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
                  onChange={(e) => {
                    const next = e.target.value;
                    setValue("settingsText", next, { shouldValidate: true });
                    try {
                      const parsed = JSON.parse(next);
                      setSettings(parsed);
                    } catch {
                      // Keep last valid settings in state.
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
                      hero_title: watch("event_name") || 'Graduación',
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
