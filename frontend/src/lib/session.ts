/**
 * session.ts — Client-side session identity for Catalyst Studio.
 *
 * Generates a UUID-based session ID that persists for the lifetime of
 * the current browser tab.  A new tab gets a fresh session; navigating
 * within the same tab preserves context.
 *
 * Storage: sessionStorage  (tab-scoped, never persists across tabs)
 * Key:     "catalyst_session_id"
 *
 * To swap to server-side sessions, replace this module without touching
 * any component — all consumers depend on getSessionId() only.
 */

const SESSION_KEY = "catalyst_session_id";

/**
 * Return the current session ID, generating one if this is the first call.
 *
 * Safe to call from any client component.  Returns the same value for
 * the entire tab lifetime unless resetSession() is called.
 */
export function getSessionId(): string {
  if (typeof window === "undefined") {
    // SSR guard — server renders cannot access sessionStorage
    return "ssr-placeholder";
  }

  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

/**
 * Force-generate a brand-new session ID, overwriting the current one.
 *
 * Called by the MemoryHUD "clear session" button so the user can start
 * a fresh conversation without reloading the tab.
 */
export function resetSession(): string {
  if (typeof window === "undefined") return "ssr-placeholder";

  const id = crypto.randomUUID();
  sessionStorage.setItem(SESSION_KEY, id);
  return id;
}
