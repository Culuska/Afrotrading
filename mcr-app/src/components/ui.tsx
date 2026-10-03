import Link from "next/link";

export function PageHeader({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
      </div>
      {children && <div className="no-print flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

export function Card({ title, children, className, actions }: { title?: string; children: React.ReactNode; className?: string; actions?: React.ReactNode }) {
  return (
    <section className={`rounded-lg border border-line bg-panel ${className ?? ""}`}>
      {title && (
        <header className="flex items-center justify-between border-b border-line px-4 py-3">
          <h2 className="text-sm font-semibold">{title}</h2>
          {actions}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

export function Stat({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: "ok" | "warn" | "bad" }) {
  const color = tone === "ok" ? "text-ok" : tone === "warn" ? "text-warn" : tone === "bad" ? "text-bad" : "";
  return (
    <div className="rounded-lg border border-line bg-panel p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-muted">{label}</div>
      <div className={`num mt-1 text-xl font-semibold ${color}`}>{value}</div>
      {hint && <div className="mt-1 text-xs text-muted">{hint}</div>}
    </div>
  );
}

export function Table({ head, children, empty }: { head: React.ReactNode[]; children: React.ReactNode; empty?: boolean }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
            {head.map((h, i) => (
              <th key={i} className="whitespace-nowrap px-3 py-2 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="[&>tr]:border-b [&>tr]:border-line [&>tr:last-child]:border-0 [&_td]:px-3 [&_td]:py-2">
          {children}
        </tbody>
      </table>
      {empty && <p className="px-3 py-6 text-center text-sm text-muted">Nothing here yet.</p>}
    </div>
  );
}

const TONES: Record<string, string> = {
  ok: "bg-green-50 text-ok ring-green-200",
  warn: "bg-amber-50 text-warn ring-amber-200",
  bad: "bg-red-50 text-bad ring-red-200",
  info: "bg-sky-50 text-sky-700 ring-sky-200",
  muted: "bg-slate-50 text-muted ring-slate-200",
};

export function Badge({ tone = "muted", children }: { tone?: keyof typeof TONES; children: React.ReactNode }) {
  return <span className={`inline-block whitespace-nowrap rounded px-2 py-0.5 text-xs font-medium ring-1 ${TONES[tone]}`}>{children}</span>;
}

export function statusTone(s: string): keyof typeof TONES {
  switch (s) {
    case "ACTIVE": case "PAID": case "AVAILABLE": case "COMPLETED": return "ok";
    case "PENDING": case "ON_HOLD": case "MAINTENANCE": case "TENDER": return "warn";
    case "REJECTED": case "CANCELLED": case "RETIRED": return "bad";
    case "APPROVED": case "ON_SITE": case "ISSUED": return "info";
    default: return "muted";
  }
}

export function Bar({ value, max, danger }: { value: number; max: number; danger?: boolean }) {
  const p = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const over = max > 0 && value > max;
  return (
    <div className="h-2 w-full min-w-20 rounded bg-slate-100">
      <div className={`h-2 rounded ${over || danger ? "bg-bad" : p > 85 ? "bg-warn" : "bg-ok"}`} style={{ width: `${p}%` }} />
    </div>
  );
}

export function LinkButton({ href, children, variant = "primary" }: { href: string; children: React.ReactNode; variant?: "primary" | "secondary" }) {
  const s = variant === "primary" ? "bg-brand text-brand-ink" : "bg-white border border-line text-ink";
  return (
    <Link href={href} className={`${s} rounded-md px-4 py-2 text-sm font-medium`}>
      {children}
    </Link>
  );
}

export function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label>{label}</label>
      {children}
    </div>
  );
}

export function Options({ map, empty }: { map: Record<string, string>; empty?: string }) {
  return (
    <>
      {empty !== undefined && <option value="">{empty}</option>}
      {Object.entries(map).map(([k, v]) => (
        <option key={k} value={k}>{v}</option>
      ))}
    </>
  );
}

export function Grid({ children, cols = 3 }: { children: React.ReactNode; cols?: 2 | 3 | 4 }) {
  const c = cols === 2 ? "sm:grid-cols-2" : cols === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-3";
  return <div className={`grid grid-cols-1 gap-3 ${c}`}>{children}</div>;
}
