import { describe, expect, it } from "vitest";
import { chatColor, chatInitials, type ChatColor } from "./chatColor";

/** All palette families the picker may return, for membership assertions. */
const isValidColor = (c: ChatColor) =>
    typeof c.bg === "string" &&
    /^#[0-9a-f]{6}$/i.test(c.bg) &&
    /^#[0-9a-f]{6}$/i.test(c.text) &&
    /^#[0-9a-f]{6}$/i.test(c.border);

describe("chatColor", () => {
    it("is deterministic - the same name always maps to the same colour", () => {
        expect(chatColor("Jan Kowalski")).toEqual(chatColor("Jan Kowalski"));
        expect(chatColor("Wsparcie")).toEqual(chatColor("Wsparcie"));
    });

    it("ignores case and surrounding whitespace", () => {
        expect(chatColor("Jan Kowalski")).toEqual(chatColor("  jan kowalski  "));
        expect(chatColor("ŻANETA")).toEqual(chatColor("żaneta"));
    });

    it("always returns a valid palette colour, including for edge-case names", () => {
        for (const name of ["", "   ", "!!!", "123", "Żółć", "😀 grupa", "Łukasz-Świętosław"]) {
            expect(isValidColor(chatColor(name))).toBe(true);
        }
    });

    it("handles an empty name deterministically", () => {
        expect(chatColor("")).toEqual(chatColor(""));
        expect(isValidColor(chatColor(""))).toBe(true);
    });

    it("spreads a large set of names across every available bucket", () => {
        const seen = new Set<string>();
        for (let i = 0; i < 500; i++) {
            seen.add(chatColor(`Czat uzytkownika ${i}`).bg);
        }
        // With 6 buckets and 500 varied names, every bucket should be hit.
        expect(seen.size).toBe(6);
    });
});

describe("chatInitials", () => {
    it("takes the first + last word initial for multi-word names", () => {
        expect(chatInitials("Jan Kowalski")).toBe("JK");
        expect(chatInitials("Anna Maria Nowak")).toBe("AN");
    });

    it("takes the first two letters for a single word", () => {
        expect(chatInitials("Wsparcie")).toBe("WS");
        expect(chatInitials("A")).toBe("A");
    });

    it("uppercases Polish letters correctly", () => {
        expect(chatInitials("żaneta świątek")).toBe("ŻŚ");
        expect(chatInitials("łukasz")).toBe("ŁU");
    });

    it("falls back to '?' for empty or whitespace-only names", () => {
        expect(chatInitials("")).toBe("?");
        expect(chatInitials("   ")).toBe("?");
    });
});
