import { timingSafeEqual } from "node:crypto";

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"] as const;

export const URGENCIES = ["critical", "urgent", "normal"] as const;
export const AREAS = [
  "Meenarkuzhi", "Makkaraparamba", "Kuruva", "Angadipuram",
  "Perinthalmanna", "Malappuram", "Other nearby area"
] as const;

export function clean(value: unknown, max = 160): string {
  return typeof value === "string" ? value.trim().replace(/[<>]/g, "").slice(0, max) : "";
}
export function validPhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone.replace(/\s+/g, ""));
}
export function validBloodGroup(value: string): boolean {
  return (BLOOD_GROUPS as readonly string[]).includes(value);
}
export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}
export function adminAuthorized(request: Request): boolean {
  const expected = process.env.ADMIN_SECRET;
  const provided = request.headers.get("x-admin-secret");
  if (!expected || expected.length < 32 || !provided) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(provided);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
