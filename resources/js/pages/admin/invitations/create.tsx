import React, {FormEvent, useMemo, useState } from "react";
import { router } from "@inertiajs/react";

type Template = {
  id: number;
  key: string;
  name: string;
  description?: string | null;
  preview_image_url?: string | null;
};

type Props = {
  templates: Template[];
};

export default function CreateInvitation({ templates }: Props) {
  const [form, setForm] = useState({
    template_id: templates[0]?.id ?? "",
    event_name: "",
    host_name: "",
    venue_name: "",
    venue_address: "",
    event_date: "",
    event_time: "",
    capacity: 0,
    rsvp_deadline_at: "",
    gift_type: "",
    dress_code: "",
    complementary_text_1: "",
    complementary_text_2: "",
    complementary_text_3: "",
    settings: {} as Record<string, any>,
  })

  const selected = useMemo(
    () => templates.find(t => t.id === Number(form.template_id)),
    [templates, form.template_id]
  );

  function handleSubmit(e: any) {
    e.preventDefault();
    router.post("/admin/invitations", form)
  }

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Crear Invitación</h1>
      <div style={{display: 'grid', gridTemplateColumns: "420px 1fr", gap: 24, marginTop: 16}}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 600}}>Template</h2>

          <div style={{ display: "grid", gap:10, marginTop: 10}}>
            {templates.map( t => (
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
                  <div style={{ fontWeight: 700}}>{t.name}</div>
                  <div style={{ opacity: 0.7, fontSize: 13}}>{t.description}</div>
                </button>
            ))}
          </div>

          <div style={{marginTop: 16}}>
            <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 8}}>Preview</div>
            <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid #eee" }}>
              {selected?.preview_image_url ? (
                <img src={selected.preview_image_url} alt={selected.name} style={{ width: "100%", display: "block"}} />
              ): (
                <div style={{ padding: 24, opacity: 0.7}}>No preview</div>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{display: "grid", gap: 12}}>
          <h2 style={{ fontSize: 16, fontWeight: 600}}>Detalles del Evento</h2>

          <input placeholder="Nombre del evento" value={form.event_name}
            onChange={e => setForm(f => ({ ...f, event_name: e.target.value }))} required />

          <input placeholder="Nombre del anfitrión" value={form.host_name}
            onChange={e => setForm(f => ({ ...f, host_name: e.target.value }))} required />

          <input placeholder="Nombre del lugar" value={form.venue_name}
            onChange={e => setForm(f => ({ ...f, venue_name: e.target.value }))} required />

          <input placeholder="Dirección del lugar" value={form.venue_address}
            onChange={e => setForm(f => ({ ...f, venue_address: e.target.value }))} required />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <input type="date" value={form.event_date}
              onChange={(e) => setForm(f => ({ ...f, event_date: e.target.value }))} />
            <input type="time" value={form.event_time}
              onChange={(e) => setForm(f => ({ ...f, event_time: e.target.value }))} />
          </div>

          <input type="number" placeholder="Capacidad" value={form.capacity}
            onChange={e => setForm(f => ({ ...f, capacity: Number(e.target.value) }))} required />

          <input type="date" placeholder="Fecha límite para RSVP" value={form.rsvp_deadline_at}
            onChange={e => setForm(f => ({ ...f, rsvp_deadline_at: e.target.value }))} required />

          <input placeholder="Tipo de regalo" value={form.gift_type}
            onChange={e => setForm(f => ({ ...f, gift_type: e.target.value }))} />

          <input placeholder="Código de vestimenta" value={form.dress_code}
            onChange={e => setForm(f => ({ ...f, dress_code: e.target.value }))} />

          <textarea placeholder="Texto complementario 1" value={form.complementary_text_1}
            onChange={e => setForm(f => ({ ...f, complementary_text_1: e.target.value }))} />

          <textarea placeholder="Texto complementario 2" value={form.complementary_text_2}
            onChange={e => setForm(f => ({ ...f, complementary_text_2: e.target.value }))} />

          <textarea placeholder="Texto complementario 3" value={form.complementary_text_3}
            onChange={e => setForm(f => ({ ...f, complementary_text_3: e.target.value }))} />

          <button type="submit" style={{ marginTop: 12, padding: 12, background: "black", color: "white", border: "none", borderRadius: 8, cursor: "pointer"}}>
            Crear Invitación
          </button>
        </form>
      </div>
    </div>
  )
}
