import { FormikProps } from "formik";
import { useCallback, useEffect, useRef, useState } from "react";
import { CreateArticleValues } from "../types";

const PREFIX = "mhc:article-draft:";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const DEBOUNCE_MS = 1000;

type DraftText = Pick<
    CreateArticleValues,
    "title" | "content" | "article_category_id" | "video_url" | "required_role" | "status"
>;

interface StoredDraft {
    savedAt: number;
    values: DraftText;
}

/** Text-only subset persisted locally - the banner (File) is intentionally excluded. */
const pickText = (v: CreateArticleValues): DraftText => ({
    title: v.title,
    content: v.content,
    article_category_id: v.article_category_id,
    video_url: v.video_url,
    required_role: v.required_role,
    status: v.status,
});

const sameText = (a: DraftText, b: DraftText) => JSON.stringify(a) === JSON.stringify(b);

/** Build the storage key so a "new" draft never leaks into editing an existing article. */
export const buildDraftKey = (userId: number, articleId?: number) =>
    articleId ? `${PREFIX}edit:${articleId}` : `${PREFIX}new:${userId}`;

/** Drop drafts that are corrupt or older than MAX_AGE_MS so localStorage never fills up. */
const pruneOldDrafts = () => {
    try {
        const now = Date.now();
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (!key || !key.startsWith(PREFIX)) continue;
            try {
                const parsed = JSON.parse(localStorage.getItem(key) ?? "") as StoredDraft;
                if (!parsed?.savedAt || now - parsed.savedAt > MAX_AGE_MS) {
                    localStorage.removeItem(key);
                }
            } catch {
                localStorage.removeItem(key);
            }
        }
    } catch {
        // localStorage unavailable (private mode / disabled) - nothing to prune
    }
};

/**
 * Local-first data-loss protection for the article editor:
 * - debounced autosave of the text fields to localStorage while the form is dirty,
 * - a restore handle when a newer local draft differs from the server baseline,
 * - a native beforeunload warning on tab close/refresh with unsaved changes.
 */
export function useArticleDraft(formik: FormikProps<CreateArticleValues>, storageKey: string | null) {
    const [restorable, setRestorable] = useState<StoredDraft | null>(null);
    const [lastLocalSavedAt, setLastLocalSavedAt] = useState<number | null>(null);
    const initializedKeyRef = useRef<string | null>(null);
    // After a save we suppress autosave/warnings until the user edits again.
    const suppressedSnapshotRef = useRef<string | null>(null);

    const { dirty, values, initialValues, setValues } = formik;

    // Load an existing draft once per storage key.
    useEffect(() => {
        if (!storageKey || initializedKeyRef.current === storageKey) return;
        initializedKeyRef.current = storageKey;
        pruneOldDrafts();
        try {
            const raw = localStorage.getItem(storageKey);
            if (!raw) return;
            const parsed = JSON.parse(raw) as StoredDraft;
            if (!parsed?.values) return;
            // Nothing to offer if the draft matches the current server/initial baseline.
            if (sameText(parsed.values, pickText(initialValues))) {
                localStorage.removeItem(storageKey);
                return;
            }
            setRestorable(parsed);
            setLastLocalSavedAt(parsed.savedAt);
        } catch {
            try {
                localStorage.removeItem(storageKey);
            } catch {
                /* ignore */
            }
        }
    }, [storageKey, initialValues]);

    // Debounced autosave whenever the form is dirty.
    useEffect(() => {
        if (!storageKey || !dirty) return;
        const snapshot = JSON.stringify(pickText(values));
        // Skip while suppressed right after a save (until the user changes something).
        if (suppressedSnapshotRef.current === snapshot) return;
        suppressedSnapshotRef.current = null;
        const handle = setTimeout(() => {
            const savedAt = Date.now();
            try {
                localStorage.setItem(storageKey, JSON.stringify({ savedAt, values: pickText(values) }));
                setLastLocalSavedAt(savedAt);
            } catch {
                /* quota / unavailable - ignore */
            }
        }, DEBOUNCE_MS);
        return () => clearTimeout(handle);
    }, [storageKey, dirty, values]);

    // Warn before closing/refreshing the tab with unsaved changes.
    useEffect(() => {
        const handler = (e: BeforeUnloadEvent) => {
            const suppressed = suppressedSnapshotRef.current === JSON.stringify(pickText(values));
            if (dirty && !suppressed) {
                e.preventDefault();
                e.returnValue = "";
            }
        };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [dirty, values]);

    const restore = useCallback(() => {
        setRestorable((current) => {
            if (current) {
                setValues({ ...values, ...current.values });
            }
            return null;
        });
    }, [setValues, values]);

    const discard = useCallback(() => {
        if (storageKey) {
            try {
                localStorage.removeItem(storageKey);
            } catch {
                /* ignore */
            }
        }
        setRestorable(null);
        setLastLocalSavedAt(null);
    }, [storageKey]);

    // Call once the form has been committed to the server (submit or save-draft)
    // so a stale copy is never restored after a successful save.
    const markSaved = useCallback(() => {
        if (storageKey) {
            try {
                localStorage.removeItem(storageKey);
            } catch {
                /* ignore */
            }
        }
        suppressedSnapshotRef.current = JSON.stringify(pickText(values));
        setRestorable(null);
        setLastLocalSavedAt(null);
    }, [storageKey, values]);

    return {
        restorableAt: restorable?.savedAt ?? null,
        lastLocalSavedAt,
        restore,
        discard,
        markSaved,
    };
}
