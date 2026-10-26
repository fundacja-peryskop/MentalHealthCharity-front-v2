import type { User } from "../auth/types";
import { Permissions } from "../shared/constants";
import { Roles } from "../users/constants";
import type { NavEntry, NavItem } from "./content";

interface NavigationInput {
    t: (key: string) => string;
    /** The signed-in user as the UI sees them (role preview applied). */
    user: Pick<User, "user_role"> | undefined;
    hasPermissions: (permission: Permissions) => boolean;
    /** Any chat has unread messages. */
    hasUnread: boolean;
}

export const VOLUNTEER_NAV_GROUP_ID = "volunteer";

/**
 * Header navigation for the current user, shared by the desktop nav and the
 * mobile menu. Volunteers get a "Volunteer" group with their own tools
 * (trainings, availability, life-threatening procedure); other roles that can view trainings get a plain
 * link.
 */
export function buildNavigation({ t, user, hasPermissions, hasUnread }: NavigationInput): NavEntry[] {
    const entries: NavEntry[] = [
        { label: t("common.navigation.articles"), href: "/articles" },
        { label: t("common.navigation.donations"), href: "/donations" },
    ];

    if (user?.user_role === Roles.VOLUNTEER) {
        const volunteerItems: NavItem[] = [];
        if (hasPermissions(Permissions.VIEW_TRAININGS)) {
            volunteerItems.push({ label: t("common.navigation.trainings"), href: "/trainings" });
        }
        if (hasPermissions(Permissions.MANAGE_OWN_AVAILABILITY)) {
            volunteerItems.push({ label: t("common.navigation.availability"), href: "/volunteer/availability" });
        }
        if (hasPermissions(Permissions.VIEW_EMERGENCY_PROCEDURE)) {
            volunteerItems.push({ label: t("common.navigation.emergency"), href: "/volunteer/emergency" });
        }
        if (volunteerItems.length > 0) {
            entries.push({
                id: VOLUNTEER_NAV_GROUP_ID,
                label: t("common.navigation.volunteer_area"),
                items: volunteerItems,
            });
        }
    } else if (hasPermissions(Permissions.VIEW_TRAININGS)) {
        entries.push({ label: t("common.navigation.trainings"), href: "/trainings" });
    }

    // Every signed-in person gets the chat tab (even before their first chat
    // exists), with an unread dot when any chat has new messages.
    if (user) {
        entries.push({ label: t("common.navigation.chat"), href: "/chat", indicator: hasUnread });
    } else {
        entries.push({ label: t("common.navigation.how_it_works"), href: "/how-it-works" });
    }

    if (hasPermissions(Permissions.ADMIN_DASHBOARD)) {
        entries.push({ label: t("common.navigation.admin"), href: "/admin/" });
    }

    return entries;
}

const normalizePath = (path: string) => path.replace(/\/+$/, "") || "/";

/** A nav entry is "current" on its own route and any route nested under it. */
export function isActiveHref(href: string, pathname: string): boolean {
    if (href.includes("#")) return false;
    const target = normalizePath(href);
    const current = normalizePath(pathname);
    return current === target || current.startsWith(`${target}/`);
}
