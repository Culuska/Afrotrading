import { requireUser } from "@/lib/auth";
import { ROLES } from "@/lib/labels";
import { Nav } from "@/components/Nav";
import { logout } from "../login/actions";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div className="min-h-screen md:flex">
      <aside className="bg-[#16202c] p-4 md:sticky md:top-0 md:h-screen md:w-56 md:shrink-0 md:overflow-y-auto">
        <div className="mb-6 px-3">
          <div className="text-xs font-bold uppercase tracking-widest text-orange-400">MCR</div>
          <div className="text-sm font-medium leading-tight text-white">Mogadishu Constructions &amp; Rehabilitation</div>
        </div>
        <details className="md:hidden" >
          <summary className="cursor-pointer px-3 text-sm text-slate-300">Menu</summary>
          <div className="mt-3"><Nav admin={user.role === "ADMIN"} /></div>
        </details>
        <div className="hidden md:block"><Nav admin={user.role === "ADMIN"} /></div>
        <div className="mt-6 border-t border-white/10 px-3 pt-4 text-xs text-slate-400">
          <div className="text-slate-200">{user.name}</div>
          <div>{ROLES[user.role]}</div>
          <form action={logout} className="mt-2">
            <button className="text-orange-400 hover:underline">Sign out</button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
