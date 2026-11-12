import { describe, expect, it } from "vitest";
import { Roles } from "./constants";
import { FALLBACK_ROLE_TONE, getRoleTone, ROLE_TONES } from "./roleTones";

describe("getRoleTone", () => {
    it("returns the configured tone for every known role", () => {
        for (const role of Object.values(Roles)) {
            expect(getRoleTone(role)).toBe(ROLE_TONES[role] ?? FALLBACK_ROLE_TONE);
        }
    });

    it("gives staff roles distinct colours", () => {
        const staff = [Roles.ADMIN, Roles.VOLUNTEERSUPERVISOR, Roles.VOLUNTEER, Roles.REDACTOR];
        const chips = staff.map((role) => getRoleTone(role).chip);
        expect(new Set(chips).size).toBe(staff.length);
    });

    it("falls back to grey for unknown or missing roles", () => {
        expect(getRoleTone("SOME_FUTURE_ROLE")).toBe(FALLBACK_ROLE_TONE);
        expect(getRoleTone(undefined)).toBe(FALLBACK_ROLE_TONE);
        expect(getRoleTone(null)).toBe(FALLBACK_ROLE_TONE);
        expect(getRoleTone("")).toBe(FALLBACK_ROLE_TONE);
    });
});
