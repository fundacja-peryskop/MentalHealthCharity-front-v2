import { describe, expect, it, vi } from "vitest";

// shared/constants builds Yup messages with the app's i18n instance at import
// time; the browser language detector it uses has no place in a Node test.
vi.mock("../../locales/i18n", () => ({ default: { t: (key: string) => key } }));

import { Permissions, roleHasPermission } from "../shared/constants";
import { Roles } from "../users/constants";
import { isNavGroup, type NavEntry } from "./content";
import { buildNavigation, isActiveHref, VOLUNTEER_NAV_GROUP_ID } from "./navigation";

const t = (key: string) => key;

function navFor(role: Roles | null, hasUnread = false) {
    const user = role ? { user_role: role } : undefined;
    return buildNavigation({
        t,
        user,
        hasPermissions: (permission: Permissions) => !!user && roleHasPermission(user.user_role, permission),
        hasUnread,
    });
}

/** Flatten to hrefs, groups as "group:<id>[child hrefs]". */
const shape = (entries: NavEntry[]) =>
    entries.map((entry) =>
        isNavGroup(entry) ? `group:${entry.id}[${entry.items.map((item) => item.href).join(",")}]` : entry.href
    );

describe("buildNavigation", () => {
    it("guests: public pages and how it works", () => {
        expect(shape(navFor(null))).toEqual(["/articles", "/donations", "/how-it-works"]);
    });

    it("users (mentees): chat, no trainings or admin", () => {
        expect(shape(navFor(Roles.USER))).toEqual(["/articles", "/donations", "/chat"]);
    });

    it("volunteers: a volunteer group with trainings and availability", () => {
        expect(shape(navFor(Roles.VOLUNTEER))).toEqual([
            "/articles",
            "/donations",
            `group:${VOLUNTEER_NAV_GROUP_ID}[/trainings,/volunteer/availability]`,
            "/chat",
        ]);
        const group = navFor(Roles.VOLUNTEER).find(isNavGroup);
        expect(group?.label).toBe("common.navigation.volunteer_area");
    });

    it("editors: trainings link and the admin panel", () => {
        expect(shape(navFor(Roles.REDACTOR))).toEqual(["/articles", "/donations", "/trainings", "/chat", "/admin/"]);
    });

    it("supervisors and admins: trainings link and the admin panel, no availability", () => {
        for (const role of [Roles.VOLUNTEERSUPERVISOR, Roles.ADMIN]) {
            expect(shape(navFor(role))).toEqual(["/articles", "/donations", "/trainings", "/chat", "/admin/"]);
        }
    });

    it("drops the volunteer group when none of its pages is permitted", () => {
        const entries = buildNavigation({
            t,
            user: { user_role: Roles.VOLUNTEER },
            hasPermissions: () => false,
            hasUnread: false,
        });
        expect(entries.some(isNavGroup)).toBe(false);
    });

    it("marks chat when there are unread messages", () => {
        const chat = navFor(Roles.USER, true).find((entry) => !isNavGroup(entry) && entry.href === "/chat");
        expect(chat && !isNavGroup(chat) && chat.indicator).toBe(true);
    });
});

describe("isActiveHref", () => {
    it("matches the route and nested routes", () => {
        expect(isActiveHref("/chat", "/chat")).toBe(true);
        expect(isActiveHref("/chat", "/chat/12")).toBe(true);
        expect(isActiveHref("/admin/", "/admin")).toBe(true);
    });

    it("does not match siblings with a shared prefix, hashes or the root", () => {
        expect(isActiveHref("/article", "/articles")).toBe(false);
        expect(isActiveHref("/#mission", "/")).toBe(false);
        expect(isActiveHref("/", "/articles")).toBe(false);
    });
});

describe("roleHasPermission", () => {
    it("matches the route guard for the volunteer pages", () => {
        expect(roleHasPermission(Roles.VOLUNTEER, Permissions.MANAGE_OWN_AVAILABILITY)).toBe(true);
        expect(roleHasPermission(Roles.VOLUNTEER, Permissions.VIEW_TRAININGS)).toBe(true);
        expect(roleHasPermission(Roles.USER, Permissions.VIEW_TRAININGS)).toBe(false);
        expect(roleHasPermission(Roles.ADMIN, Permissions.MANAGE_USERS)).toBe(true);
    });

    it("is false for an unknown role instead of throwing", () => {
        expect(roleHasPermission("GHOST" as Roles, Permissions.READ_OWN_CHATS)).toBe(false);
    });
});
