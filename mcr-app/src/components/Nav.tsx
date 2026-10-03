"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SECTIONS: { title: string; links: [string, string][] }[] = [
  { title: "", links: [["/", "Dashboard"]] },
  { title: "Finance", links: [["/expenses", "Expenses"], ["/invoices", "Invoices & receipts"], ["/payroll", "Payroll"], ["/reports", "Reports"]] },
  { title: "Operations", links: [["/projects", "Projects"], ["/labour", "Attendance"], ["/materials", "Materials"], ["/equipment", "Equipment"], ["/site-reports", "Site diary"]] },
  { title: "Directory", links: [["/workers", "Workers"], ["/clients", "Clients"], ["/suppliers", "Suppliers"]] },
];

export function Nav({ admin }: { admin: boolean }) {
  const path = usePathname();
  const sections = admin ? [...SECTIONS, { title: "Admin", links: [["/users", "Users"]] as [string, string][] }] : SECTIONS;
  return (
    <nav className="space-y-4">
      {sections.map((s) => (
        <div key={s.title}>
          {s.title && <div className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{s.title}</div>}
          {s.links.map(([href, label]) => {
            const active = href === "/" ? path === "/" : path.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`block rounded-md px-3 py-1.5 text-sm ${active ? "bg-white/10 font-medium text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
