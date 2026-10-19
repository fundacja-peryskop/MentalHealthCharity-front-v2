/**
 * Role preview: lets an administrator see the app the way another role sees it
 * (navigation, reachable routes, role-dependent screens).
 *
 * It is a UI-only switch. `useUser().user` reports the previewed role, so the
 * menu, `usePermissions` and the route guard all follow it, but every API
 * request still carries the administrator's own token: the server keeps
 * answering (and authorising) as the administrator. Nothing is ever sent to
 * the server with the previewed role.
 *
 * The choice lives in `sessionStorage`: it survives navigation and reloads in
 * the same tab, ends when the tab closes, and is bound to the user id that
 * started it, so it can never carry over to another account.
 */
import type { User } from "../auth/types";
import { Roles } from "../users/constants";

/** Roles an administrator can preview, from most to least privileged. */
export const PREVIEWABLE_ROLES: readonly Roles[] = [
    Roles.VOLUNTEERSUPERVISOR,
    Roles.REDACTOR,
    Roles.VOLUNTEER,
    Roles.USER,
];

/** i18n keys of the role names (`common.roles.*`). */
export const ROLE_LABEL_KEYS: Record<Roles, string> = {
    [Roles.ADMIN]: "common.roles.admin",
    [Roles.VOLUNTEERSUPERVISOR]: "common.roles.volunteer_supervisor",
    [Roles.REDACTOR]: "common.roles.redactor",
    [Roles.VOLUNTEER]: "common.roles.volunteer",
    [Roles.USER]: "common.roles.user",
};

export const ROLE_PREVIEW_STORAGE_KEY = "peryskop:role-preview";

export interface StoredRolePreview {
    userId: number;
    role: Roles;
}

/** Only administrators can preview other roles. */
export function canPreviewRoles(user: Pick<User, "user_role"> | undefined): boolean {
    return user?.user_role === Roles.ADMIN;
}

export function isPreviewableRole(role: unknown): role is Roles {
    return PREVIEWABLE_ROLES.includes(role as Roles);
}

/**
 * The user as the UI should see them: unchanged unless an administrator has an
 * active preview, in which case only `user_role` is swapped. Any other input
 * (no user, a non-admin, an unknown role) returns the user untouched, so the
 * preview can only ever narrow what the UI shows.
 */
export function applyRolePreview<T extends Pick<User, "user_role">>(user: T | undefined, previewRole: Roles | null) {
    if (!user || !previewRole || !canPreviewRoles(user) || !isPreviewableRole(previewRole)) return user;
    return { ...user, user_role: previewRole };
}

/** The previewed role stored for `userId`, or null (none, another user's, or invalid). */
export function readStoredRolePreview(userId: number, storage: Storage | undefined = safeSessionStorage()) {
    try {
        const raw = storage?.getItem(ROLE_PREVIEW_STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as Partial<StoredRolePreview>;
        return parsed.userId === userId && isPreviewableRole(parsed.role) ? parsed.role : null;
    } catch {
        return null;
    }
}

/** Persist (or, with `role: null`, clear) the preview for this tab. */
export function writeStoredRolePreview(
    userId: number,
    role: Roles | null,
    storage: Storage | undefined = safeSessionStorage()
) {
    try {
        if (role && isPreviewableRole(role)) {
            storage?.setItem(ROLE_PREVIEW_STORAGE_KEY, JSON.stringify({ userId, role } satisfies StoredRolePreview));
        } else {
            storage?.removeItem(ROLE_PREVIEW_STORAGE_KEY);
        }
    } catch {
        // Storage can be unavailable (private mode, blocked site data); the
        // preview then simply lasts until the next reload.
    }
}

export function clearStoredRolePreview(storage: Storage | undefined = safeSessionStorage()) {
    try {
        storage?.removeItem(ROLE_PREVIEW_STORAGE_KEY);
    } catch {
        // See writeStoredRolePreview.
    }
}

function safeSessionStorage(): Storage | undefined {
    try {
        return typeof window === "undefined" ? undefined : window.sessionStorage;
    } catch {
        return undefined;
    }
}
