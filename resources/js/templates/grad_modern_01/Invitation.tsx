
export default function GradModern01({ invitation }: { invitation: any }) {
  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ fontSize: 42, fontWeight: 800 }}>{invitation.event_name}</h1>
      <p style={{ opacity: 0.8, marginTop: 8 }}>Host: {invitation.host_name}</p>

      <div style={{ marginTop: 24 }}>
        <div><b>Where:</b> {invitation.venue_name}</div>
        <div style={{ opacity: 0.8 }}>{invitation.venue_address}</div>
        <div style={{ marginTop: 12 }}><b>Date:</b> {invitation.event_date}</div>
        <div><b>Time:</b> {String(invitation.event_time)}</div>
      </div>
    </div>
  );
}
