/**
 * Form progress persistence (localStorage).
 *
 * A multi-step form stores its current step and the values entered so far, so a
 * visitor who leaves and comes back can continue where they stopped. Everything
 * is wrapped in try/catch - storage may be unavailable (private mode, blocked
 * cookies) and must never break the form. Callers pass `omit` to keep sensitive
 * or must-be-fresh fields (e.g. a consent checkbox) out of storage entirely.
 */

export interface PersistedProgress<T> {
    step: number;
    values: Partial<T>;
}

function withoutOmitted<T extends object>(values: Partial<T>, omit: (keyof T)[]): Partial<T> {
    if (omit.length === 0) return { ...values };
    const copy = { ...values };
    for (const key of omit) delete copy[key];
    return copy;
}

/** Read saved progress, or `null` when there is none / it is unreadable. */
export function loadFormProgress<T extends object>(key: string, omit: (keyof T)[] = []): PersistedProgress<T> | null {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as PersistedProgress<T>;
        if (typeof parsed?.step !== "number" || typeof parsed?.values !== "object" || parsed.values === null) {
            return null;
        }
        return { step: parsed.step, values: withoutOmitted(parsed.values, omit) };
    } catch {
        return null;
    }
}

/** Save the current step + values (minus `omit`ted fields). */
export function saveFormProgress<T extends object>(key: string, step: number, values: T, omit: (keyof T)[] = []): void {
    try {
        const payload: PersistedProgress<T> = { step, values: withoutOmitted(values, omit) };
        localStorage.setItem(key, JSON.stringify(payload));
    } catch {
        /* storage unavailable - progress simply won't persist */
    }
}

/** Drop saved progress (e.g. after a successful submit). */
export function clearFormProgress(key: string): void {
    try {
        localStorage.removeItem(key);
    } catch {
        /* ignore */
    }
}
