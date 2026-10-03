export function parseDate(v: FormDataEntryValue | null): Date {
  const s = String(v ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) throw new Error("Invalid date");
  return new Date(`${s}T00:00:00.000Z`);
}

export function parseOptionalDate(v: FormDataEntryValue | null): Date | null {
  const s = String(v ?? "");
  return s ? parseDate(s) : null;
}

export function isoDay(d: Date | null | undefined): string {
  return d ? d.toISOString().slice(0, 10) : "";
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function fmtDate(d: Date | null | undefined): string {
  if (!d) return "—";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
}

export function monthStart(offset = 0): Date {
  const n = new Date();
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth() + offset, 1));
}
