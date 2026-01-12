export function toWhatsAppUrl(message: string, phoneNumber?: string | null) {
  const text = encodeURIComponent(message);

  const cleaned = (phoneNumber ?? '')
    .replace(/[^\d+]/g, '') // Remove non-digit characters
    .replace(/^\+/, ''); // Remove leading '+'

  if(cleaned.length > 0) {
    return `https://wa.me/${cleaned}?text=${text}`;
  }

  return `https://wa.me/?text=${text}`;
}
