const DICEBEAR_BASE = "https://avatars.dicebear.com/v2/avataaars";

export function getDiceBearUrl(seed: string, size?: number): string {
  const s = encodeURIComponent(seed || "default");
  const base = `${DICEBEAR_BASE}/${s}.svg`;
  return size ? `${base}?size=${size}` : base;
}
