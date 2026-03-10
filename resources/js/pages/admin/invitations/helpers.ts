export function formatDateEsMX(dateStr?: string | null) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return dateStr;

  const dt = new Date(y, m-1, d);
  return new Intl.DateTimeFormat('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
  }).format(dt);
}

export async function copy(text: string) {
  await navigator.clipboard.writeText(text);
  alert('Copiado al portapapeles');
}

export function formatTimeEsMX(timeStr?: string | null) {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(':').map(Number);
  if (h == null || m == null) return timeStr;

  const dt = new Date();
  dt.setHours(h, m, 0, 0);
  return new Intl.DateTimeFormat('es-MX', {
      hour: 'numeric',
      minute: 'numeric',
  }).format(dt);
}
