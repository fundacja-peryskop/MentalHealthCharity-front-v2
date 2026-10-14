import logo from "@/assets/static/logo_small.webp";
import resolveAssetUrl from "@/modules/shared/helpers/resolveAssetUrl";
import { Avatar, Header, Stack, Typography, XStack } from "@fundacja-peryskop/ui";
import { useQuery } from "@tanstack/react-query";
import { LogOut, Menu, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { useUser } from "../auth/components/AuthProvider";
import { getChatsQueryOptions } from "../chat/queries/getChatsQueryOptions";
import { Permissions } from "../shared/constants";
import usePermissions from "../shared/hooks/usePermissions";
import { AppLink } from "./AppLink";
import { CtaButton } from "./CtaButton";
import { brand, type NavItem } from "./content";
import { MobileMenu } from "./MobileMenu";
import { useIconColor } from "./useIconColor";

const LINK_RESET: React.CSSProperties = { textDecoration: "none", display: "inline-flex" };

const MENU_ID = "mobile-menu";
/** Where the header switches from the hamburger to the inline nav (the DS `$md`, min-width). */
const DESKTOP_QUERY = "(min-width: 768px)";

/**
 * Header row vertical padding: compact on desktop, roomier below 768px where the
 * header is the main tap target. Scoped CSS because the DS media props resolve
 * unreliably for layout here (see CLAUDE.md).
 */
const ROW_CLASS = "app-header-row";
const ROW_STYLE = `
.${ROW_CLASS}{padding-top:8px;padding-bottom:8px;}
@media (max-width:767.98px){.${ROW_CLASS}{padding-top:16px;padding-bottom:16px;}}
`;

/**
 * Header overlap styling. The header always sits 16px over the announcement bar
 * (the "content sits on the bar" treatment); stickiness and the slide animation
 * are owned by the layout's chrome wrapper, so the header and bar move together
 * and the header always covers the bar (no peeking sliver). Only the rounded top
 * corners animate away as the bar collapses, leaving the header flush at the top.
 */
function headerStyle(collapsed: boolean, reduceMotion: boolean): React.CSSProperties {
    return {
        position: "relative",
        zIndex: 1,
        marginTop: -16,
        borderTopLeftRadius: collapsed ? 0 : 20,
        borderTopRightRadius: collapsed ? 0 : 20,
        transition: reduceMotion ? "none" : "border-top-left-radius 0.35s ease, border-top-right-radius 0.35s ease",
    };
}

interface AppHeaderProps {
    /** Announcement bar collapsed (scrolled down) - flatten the header to the top. */
    collapsed?: boolean;
    reduceMotion?: boolean;
}

export function AppHeader({ collapsed = false, reduceMotion = false }: AppHeaderProps) {
    const { t } = useTranslation();
    const { user, logout } = useUser();
    const { hasPermissions } = usePermissions();
    const icon = useIconColor();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const toggleRef = useRef<HTMLElement>(null);

    // Closing via Escape / backdrop returns focus to the toggle that opened it.
    const closeMenu = useCallback(() => {
        setMenuOpen(false);
        toggleRef.current?.focus();
    }, []);

    // The panel is mobile-only; close it if the viewport grows into desktop so the
    // page scroll lock it holds is released.
    useEffect(() => {
        const media = window.matchMedia?.(DESKTOP_QUERY);
        if (!media) return;
        const onChange = () => {
            if (media.matches) setMenuOpen(false);
        };
        media.addEventListener("change", onChange);
        return () => media.removeEventListener("change", onChange);
    }, []);

    const { data: chats } = useQuery(
        getChatsQueryOptions({ size: 50, page: 1 }, { enabled: !!user, queryKey: ["chats"] })
    );
    const hasChats = !!chats && chats.total > 0;
    const hasUnread = hasChats && chats.items.some((chat) => chat.unread_count > 0);

    // Close the mobile menu after navigating.
    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname, location.hash]);

    const navItems = useMemo<NavItem[]>(() => {
        const items: NavItem[] = [
            { label: t("common.navigation.articles"), href: "/articles" },
            { label: t("common.navigation.donations"), href: "/donations" },
        ];
        if (hasPermissions(Permissions.VIEW_TRAININGS)) {
            items.push({ label: t("common.navigation.trainings"), href: "/trainings" });
        }
        if (hasChats) {
            items.push({ label: t("common.navigation.chat"), href: "/chat", indicator: hasUnread });
        }
        if (!user) {
            items.push({ label: t("common.navigation.how_it_works"), href: "/how-it-works" });
        }
        if (hasPermissions(Permissions.ADMIN_DASHBOARD)) {
            items.push({ label: t("common.navigation.admin"), href: "/admin/" });
        }
        return items;
    }, [t, hasChats, hasUnread, user, hasPermissions]);

    const brandMark = (
        <RouterLink to="/" style={LINK_RESET} aria-label={brand.name}>
            <XStack alignItems="center" gap="$sm">
                <img src={logo} alt="" width={36} height={36} style={{ display: "block" }} />
                <Typography variant="largeBold" tag="span">
                    {brand.shortName}
                </Typography>
            </XStack>
        </RouterLink>
    );

    const navLinksList = navItems.map((item) => (
        <XStack key={item.href} alignItems="center" gap="$xs">
            <AppLink href={item.href} variant="regularSemibold" color="$color" hoverStyle={{ color: "$primary" }}>
                {item.label}
            </AppLink>
            {item.indicator ? <Stack width={8} height={8} borderRadius="$full" backgroundColor="$danger" /> : null}
        </XStack>
    ));

    const accountArea = user ? (
        <XStack alignItems="center" gap="$sm">
            <RouterLink to={`/profile/${user.id}`} style={LINK_RESET}>
                <XStack alignItems="center" gap="$sm">
                    <Avatar src={resolveAssetUrl(user.chat_avatar_url)} name={user.full_name} size={32} />
                    <Typography variant="regularSemibold" numberOfLines={1} maxWidth={160}>
                        {user.full_name}
                    </Typography>
                </XStack>
            </RouterLink>
            <Stack
                tag="button"
                role="button"
                aria-label={t("common.navigation.logout")}
                onPress={() => logout()}
                width={40}
                height={40}
                borderRadius="$full"
                alignItems="center"
                justifyContent="center"
                borderWidth={0}
                backgroundColor="$backgroundTransparent"
                cursor="pointer"
                hoverStyle={{ backgroundColor: "$dangerSoft" }}
            >
                <LogOut size={18} color={icon.danger} />
            </Stack>
        </XStack>
    ) : (
        <CtaButton href="/login">{t("common.join_us", { defaultValue: "Dołącz" })}</CtaButton>
    );

    return (
        <Header tag="header" width="100%" backgroundColor="$background" style={headerStyle(collapsed, reduceMotion)}>
            <style>{ROW_STYLE}</style>
            <XStack
                className={ROW_CLASS}
                width="100%"
                maxWidth={1200}
                alignSelf="center"
                paddingHorizontal="$lg"
                $sm={{ paddingHorizontal: "$xl" }}
                alignItems="center"
                justifyContent="space-between"
                gap="$lg"
            >
                {brandMark}

                {/* Desktop nav */}
                <XStack display="none" $md={{ display: "flex" }} alignItems="center" gap="$xl">
                    {navLinksList}
                </XStack>

                {/* Desktop right */}
                <XStack display="none" $md={{ display: "flex" }} alignItems="center" gap="$sm">
                    {accountArea}
                </XStack>

                {/* Mobile toggle */}
                <Stack
                    ref={toggleRef}
                    tag="button"
                    role="button"
                    aria-label={menuOpen ? t("common.navigation.close_menu") : t("common.navigation.open_menu")}
                    aria-expanded={menuOpen}
                    aria-controls={MENU_ID}
                    onPress={() => setMenuOpen((open) => !open)}
                    display="flex"
                    $md={{ display: "none" }}
                    width={44}
                    height={44}
                    marginRight={-10}
                    alignItems="center"
                    justifyContent="center"
                    borderRadius="$full"
                    borderWidth={0}
                    backgroundColor={menuOpen ? "$backgroundHover" : "$backgroundTransparent"}
                    pressStyle={{ backgroundColor: "$backgroundPress" }}
                    cursor="pointer"
                >
                    {menuOpen ? <X size={24} color={icon.color} /> : <Menu size={24} color={icon.color} />}
                </Stack>
            </XStack>

            {menuOpen ? (
                <MobileMenu id={MENU_ID} items={navItems} pathname={location.pathname} onClose={closeMenu} />
            ) : null}
        </Header>
    );
}
