import { unstable_rethrow } from "next/navigation";

export type ActionState = { error?: string; ok?: string } | undefined;

// Wraps a server action so thrown errors become a message shown in the form
// instead of crashing the page. Redirects/notFound are re-thrown as Next expects.
export function safe(fn: (fd: FormData) => Promise<string | void>) {
  return async (_prev: ActionState, fd: FormData): Promise<ActionState> => {
    try {
      const ok = await fn(fd);
      return { ok: ok || "Saved" };
    } catch (e) {
      unstable_rethrow(e);
      const msg = e instanceof Error ? e.message : "Something went wrong";
      if (msg.includes("Unique constraint")) return { error: "A record with that value already exists." };
      return { error: msg };
    }
  };
}

export function str(fd: FormData, k: string, required = true): string {
  const v = String(fd.get(k) ?? "").trim();
  if (required && !v) throw new Error(`${k.replace(/([A-Z])/g, " $1").toLowerCase()} is required`);
  return v;
}

export function optStr(fd: FormData, k: string): string | null {
  const v = String(fd.get(k) ?? "").trim();
  return v || null;
}
