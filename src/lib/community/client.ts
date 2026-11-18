import type { ActionResult } from "./types";
export async function communityAction(action: string, payload?: unknown): Promise<ActionResult> {
  try {
    const response = await fetch("/api/comunidad", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, payload }) });
    const result = await response.json();
    return { ...result, ok: response.ok && result.ok === true };
  } catch { return { ok: false, message: "No pudimos conectar. Revisá tu conexión y volvé a intentar." }; }
}
