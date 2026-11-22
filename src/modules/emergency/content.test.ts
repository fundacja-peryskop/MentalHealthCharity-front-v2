import { describe, expect, it } from "vitest";
import { Roles } from "../users/constants";
import { getContactTagKeys } from "./content";
import type { SupportContact } from "./types";

// Fictional contacts only - real contact details live in the backend, never here.
const contact = (name: string, user_role: Roles, phone = "500 000 001"): SupportContact => ({ name, phone, user_role });

describe("getContactTagKeys", () => {
    it("labels Olga in the escalation group as the foundation president", () => {
        expect(getContactTagKeys(contact("Olga", Roles.ADMIN))).toEqual(["emergency.contacts.tags.president"]);
        expect(getContactTagKeys(contact(" Olga ", Roles.ADMIN, "500 000 002"))).toEqual([
            "emergency.contacts.tags.president",
        ]);
    });

    it("does not label an Olga outside the escalation group", () => {
        expect(getContactTagKeys(contact("Olga", Roles.VOLUNTEERSUPERVISOR))).toEqual([]);
    });

    it("leaves everyone else without a label", () => {
        expect(getContactTagKeys(contact("Jan", Roles.ADMIN))).toEqual([]);
        expect(getContactTagKeys(contact("Anna", Roles.VOLUNTEERSUPERVISOR))).toEqual([]);
    });
});
