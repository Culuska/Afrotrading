import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { ActionForm } from "@/components/ActionForm";
import { login } from "./actions";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await getUser()) redirect("/");
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-lg border border-line bg-panel p-6 shadow-sm">
        <div className="mb-6">
          <div className="text-xs font-semibold uppercase tracking-widest text-brand">MCR</div>
          <h1 className="text-lg font-semibold">Mogadishu Constructions &amp; Rehabilitation</h1>
          <p className="text-sm text-muted">Finance &amp; operations</p>
        </div>
        <ActionForm action={login} submit="Sign in" reset={false}>
          <div>
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required autoComplete="username" />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" required autoComplete="current-password" />
          </div>
        </ActionForm>
      </div>
    </main>
  );
}
