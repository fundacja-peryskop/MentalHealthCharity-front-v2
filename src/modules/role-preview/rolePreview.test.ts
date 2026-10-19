import { describe, expect, it } from "vitest";
import { Roles } from "../users/constants";
import {
    applyRolePreview,
    canPreviewRoles,
    clearStoredRolePreview,
    PREVIEWABLE_ROLES,
    readStoredRolePreview,
    ROLE_PREVIEW_STORAGE_KEY,
    writeStoredRolePreview,
} from "./rolePreview";

/** Minimal in-memory Storage (the test environment is plain Node). */
function memoryStorage(initial: Record<string, string> = {}): Storage {
    const data = new Map(Object.entries(initial));
    return {
        get length() {
            return data.size;
        },
        clear: () => data.clear(),
        getItem: (key) => data.get(key) ?? null,
        key: (index) => [...data.keys()][index] ?? null,
        removeItem: (key) => void data.delete(key),
        setItem: (key, value) => void data.set(key, String(value)),
    };
}

const admin = { id: 1, user_role: Roles.ADMIN, full_name: "Ada" };

describe("canPreviewRoles", () => {
    it("allows only administrators", () => {
        expect(canPreviewRoles(admin)).toBe(true);
        for (const role of [Roles.VOLUNTEERSUPERVISOR, Roles.REDACTOR, Roles.VOLUNTEER, Roles.USER]) {
            expect(canPreviewRoles({ user_role: role })).toBe(false);
        }
        expect(canPreviewRoles(undefined)).toBe(false);
    });
});

describe("applyRolePreview", () => {
    it("swaps only the role for an administrator", () => {
        const previewed = applyRolePreview(admin, Roles.VOLUNTEER);
        expect(previewed).toEqual({ ...admin, user_role: Roles.VOLUNTEER });
        expect(admin.user_role).toBe(Roles.ADMIN); // not mutated
    });

    it("leaves the user untouched without a preview", () => {
        expect(applyRolePreview(admin, null)).toBe(admin);
        expect(applyRolePreview(undefined, Roles.USER)).toBeUndefined();
    });

    it("never lets a non-administrator change role", () => {
        const volunteer = { id: 2, user_role: Roles.VOLUNTEER };
        expect(applyRolePreview(volunteer, Roles.USER)).toBe(volunteer);
        const supervisor = { id: 3, user_role: Roles.VOLUNTEERSUPERVISOR };
        expect(applyRolePreview(supervisor, Roles.REDACTOR)).toBe(supervisor);
    });

    it("ignores roles outside the previewable set", () => {
        expect(applyRolePreview(admin, Roles.ADMIN)).toBe(admin);
        expect(applyRolePreview(admin, "SUPERUSER" as Roles)).toBe(admin);
    });

    it("can preview every non-admin role", () => {
        expect([...PREVIEWABLE_ROLES].sort()).toEqual(
            [Roles.REDACTOR, Roles.USER, Roles.VOLUNTEER, Roles.VOLUNTEERSUPERVISOR].sort()
        );
    });
});

describe("stored preview", () => {
    it("round-trips for the same user", () => {
        const storage = memoryStorage();
        writeStoredRolePreview(1, Roles.REDACTOR, storage);
        expect(readStoredRolePreview(1, storage)).toBe(Roles.REDACTOR);
    });

    it("is bound to the user who started it", () => {
        const storage = memoryStorage();
        writeStoredRolePreview(1, Roles.USER, storage);
        expect(readStoredRolePreview(2, storage)).toBeNull();
    });

    it("clears with a null role or clearStoredRolePreview", () => {
        const storage = memoryStorage();
        writeStoredRolePreview(1, Roles.USER, storage);
        writeStoredRolePreview(1, null, storage);
        expect(storage.getItem(ROLE_PREVIEW_STORAGE_KEY)).toBeNull();

        writeStoredRolePreview(1, Roles.USER, storage);
        clearStoredRolePreview(storage);
        expect(readStoredRolePreview(1, storage)).toBeNull();
    });

    it("rejects tampered or malformed values", () => {
        const tampered = memoryStorage({
            [ROLE_PREVIEW_STORAGE_KEY]: JSON.stringify({ userId: 1, role: Roles.ADMIN }),
        });
        expect(readStoredRolePreview(1, tampered)).toBeNull();
        expect(readStoredRolePreview(1, memoryStorage({ [ROLE_PREVIEW_STORAGE_KEY]: "{not json" }))).toBeNull();
    });

    it("survives unavailable storage", () => {
        const throwing = {
            getItem: () => {
                throw new Error("blocked");
            },
            setItem: () => {
                throw new Error("blocked");
            },
            removeItem: () => {
                throw new Error("blocked");
            },
        } as unknown as Storage;
        expect(readStoredRolePreview(1, throwing)).toBeNull();
        expect(() => writeStoredRolePreview(1, Roles.USER, throwing)).not.toThrow();
        expect(() => clearStoredRolePreview(throwing)).not.toThrow();
        expect(readStoredRolePreview(1, undefined)).toBeNull();
    });
});
