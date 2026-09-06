import { useCallback, useMemo, useSyncExternalStore } from "react";
import { useUser } from "../../auth/components/AuthProvider";
import { formTypes } from "../types";

export const PINNED_FORMS_LIMIT = 30;

const STORAGE_PREFIX = "mhc:pinned-forms:";
const EMPTY_IDS: number[] = [];

export type PinToggleResult = "pinned" | "unpinned" | "limit-reached";

export interface PinnedFormsController {
    pinnedIds: number[];
    count: number;
    limit: number;
    isFull: boolean;
    isPinned: (id: number) => boolean;
    togglePin: (id: number) => PinToggleResult;
    unpin: (id: number) => void;
    unpinAll: () => void;
}

/** Pins are per admin and per list, so two accounts sharing a browser never see each other's board. */
const buildStorageKey = (scope: formTypes, userId?: number) => `${STORAGE_PREFIX}${scope}:${userId ?? "anonymous"}`;

const readIds = (storageKey: string): number[] => {
    try {
        const raw = localStorage.getItem(storageKey);

        if (!raw) {
            return EMPTY_IDS;
        }

        const parsed: unknown = JSON.parse(raw);

        if (!Array.isArray(parsed)) {
            return EMPTY_IDS;
        }

        const ids = Array.from(new Set(parsed.filter((id): id is number => Number.isInteger(id)))).slice(
            0,
            PINNED_FORMS_LIMIT
        );

        return ids.length > 0 ? ids : EMPTY_IDS;
    } catch {
        // localStorage unavailable or corrupt payload — behave as if nothing was pinned
        return EMPTY_IDS;
    }
};

/**
 * Module-level store so every component reading the same key renders the same array instance
 * (required by useSyncExternalStore) and stays in sync without prop drilling.
 */
const snapshots = new Map<string, number[]>();
const listeners = new Map<string, Set<() => void>>();

const getSnapshot = (storageKey: string): number[] => {
    const cached = snapshots.get(storageKey);

    if (cached) {
        return cached;
    }

    const ids = readIds(storageKey);
    snapshots.set(storageKey, ids);

    return ids;
};

const emit = (storageKey: string) => listeners.get(storageKey)?.forEach((listener) => listener());

const areSameIds = (a: number[], b: number[]) => a.length === b.length && a.every((id, index) => id === b[index]);

/** Re-reads localStorage, keeping the cached array instance when nothing actually changed. */
const refreshSnapshot = (storageKey: string) => {
    const next = readIds(storageKey);

    if (areSameIds(getSnapshot(storageKey), next)) {
        return;
    }

    snapshots.set(storageKey, next);
    emit(storageKey);
};

const writeIds = (storageKey: string, ids: number[]) => {
    snapshots.set(storageKey, ids);

    try {
        if (ids.length > 0) {
            localStorage.setItem(storageKey, JSON.stringify(ids));
        } else {
            localStorage.removeItem(storageKey);
        }
    } catch {
        // localStorage unavailable — pins still work for the current session
    }

    emit(storageKey);
};

const createSubscribe = (storageKey: string) => (onStoreChange: () => void) => {
    const keyListeners = listeners.get(storageKey) ?? new Set<() => void>();

    // Nobody was listening, so writes from another tab may have been missed — resync first.
    if (keyListeners.size === 0) {
        refreshSnapshot(storageKey);
    }

    keyListeners.add(onStoreChange);
    listeners.set(storageKey, keyListeners);

    // Keep pins consistent when the same admin works in several tabs.
    const handleStorage = (event: StorageEvent) => {
        if (event.key !== null && event.key !== storageKey) {
            return;
        }

        refreshSnapshot(storageKey);
    };

    window.addEventListener("storage", handleStorage);

    return () => {
        keyListeners.delete(onStoreChange);
        window.removeEventListener("storage", handleStorage);
    };
};

/** Persisted "quick access" board of form ids, capped at PINNED_FORMS_LIMIT entries. */
export const usePinnedForms = (scope: formTypes): PinnedFormsController => {
    const { user } = useUser();
    const storageKey = useMemo(() => buildStorageKey(scope, user?.id), [scope, user?.id]);

    const subscribe = useMemo(() => createSubscribe(storageKey), [storageKey]);
    const readSnapshot = useCallback(() => getSnapshot(storageKey), [storageKey]);

    const pinnedIds = useSyncExternalStore(subscribe, readSnapshot, readSnapshot);

    const isPinned = useCallback((id: number) => pinnedIds.includes(id), [pinnedIds]);

    const togglePin = useCallback(
        (id: number): PinToggleResult => {
            const current = getSnapshot(storageKey);

            if (current.includes(id)) {
                writeIds(
                    storageKey,
                    current.filter((pinnedId) => pinnedId !== id)
                );

                return "unpinned";
            }

            if (current.length >= PINNED_FORMS_LIMIT) {
                return "limit-reached";
            }

            // Newest pin first — the form the admin just picked is the one they are about to work on.
            writeIds(storageKey, [id, ...current]);

            return "pinned";
        },
        [storageKey]
    );

    const unpin = useCallback(
        (id: number) => {
            const current = getSnapshot(storageKey);

            if (!current.includes(id)) {
                return;
            }

            writeIds(
                storageKey,
                current.filter((pinnedId) => pinnedId !== id)
            );
        },
        [storageKey]
    );

    const unpinAll = useCallback(() => writeIds(storageKey, EMPTY_IDS), [storageKey]);

    return {
        pinnedIds,
        count: pinnedIds.length,
        limit: PINNED_FORMS_LIMIT,
        isFull: pinnedIds.length >= PINNED_FORMS_LIMIT,
        isPinned,
        togglePin,
        unpin,
        unpinAll,
    };
};
