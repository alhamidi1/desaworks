/**
 * Normalize an Indonesian phone number to the international digits wa.me expects.
 * "0812-3456" → "62812345 6", leading 0 becomes 62; "+62…" / "62…" are kept.
 * Returns null when there aren't enough digits to be a real number.
 */
export function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  let digits = phone.replace(/\D/g, '');
  if (!digits || digits.length < 6) return null;
  if (digits.startsWith('0')) digits = `62${digits.slice(1)}`;
  return digits;
}

/**
 * Build a wa.me link. With a valid phone it opens that resident's chat;
 * without one it opens WhatsApp's share sheet. `text` is optional prefilled content.
 */
export function waLink(phone: string | null | undefined, text?: string): string | null {
  const digits = normalizePhone(phone);
  const base = digits ? `https://wa.me/${digits}` : null;
  if (!base) return null;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
