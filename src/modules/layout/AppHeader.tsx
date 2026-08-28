import logo from "@/assets/static/logo_small.webp";
import resolveAssetUrl from "@/modules/shared/helpers/resolveAssetUrl";
import { Avatar, Header, Stack, Typography, XStack, YStack } from "@fundacja-peryskop/ui";
import { useQuery } from "@tanstack/react-query";
import { LogOut, Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";
import { useUser } from "../auth/components/AuthProvider";
import { getChatsQueryOptions } from "../chat/queries/getChatsQueryOptions";
import { Permissions } from "../shared/constants";
import usePermissions from "../shared/hooks/usePermissions";
import { AppLink } from "./AppLink";
import { CtaButton } from "./CtaButton";
import { brand } from "./content";
import { useIconColor } from "./useIconColor";

const LINK_RESET: React.CSSProperties = { textDecoration: "none", display: "inline-flex" };
/** Sticks the header under the (non-sticky) announcement bar as the page scrolls. */
const STICKY: React.CSSProperties = { position: "sticky", top: 0, zIndex: 100 };

interface NavItem {
    label: string;
    href: string;
    /** Show an unread indicator dot (chat). */
    indicator?: boolean;
}

export function AppHeader() {
    const { t } = useTranslation();
    const { user, logout } = useUser();
    const { hasPermissions } = usePermissions();
    const { resolvedTheme, setTheme } = useTheme();
    const icon = useIconColor();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

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
            items.push({ label: t("footer.about_us", { defaultValue: "O nas" }), href: "/#about-us" });
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

    const themeToggle = (
        <Stack
            tag="button"
            role="button"
            aria-label={
                resolvedTheme === "dark"
                    ? t("common.light_mode", { defaultValue: "Jasny motyw" })
                    : t("common.dark_mode", { defaultValue: "Ciemny motyw" })
            }
            onPress={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            width={40}
            height={40}
            borderRadius="$full"
            alignItems="center"
            justifyContent="center"
            borderWidth={0}
            backgroundColor="$backgroundTransparent"
            cursor="pointer"
            hoverStyle={{ backgroundColor: "$backgroundHover" }}
        >
            {resolvedTheme === "dark" ? <Sun size={20} color={icon.color} /> : <Moon size={20} color={icon.color} />}
        </Stack>
    );

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
        <Header tag="header" width="100%" backgroundColor="$background" style={STICKY}>
            <XStack
                width="100%"
                maxWidth={1200}
                alignSelf="center"
                paddingHorizontal="$lg"
                $sm={{ paddingHorizontal: "$xl" }}
                paddingVertical="$sm"
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
                    {themeToggle}
                    {accountArea}
                </XStack>

                {/* Mobile toggle */}
                <Stack
                    tag="button"
                    role="button"
                    aria-label={menuOpen ? "Zamknij menu" : "Otwórz menu"}
                    aria-expanded={menuOpen}
                    onPress={() => setMenuOpen((open) => !open)}
                    display="flex"
                    $md={{ display: "none" }}
                    padding="$xs"
                    borderWidth={0}
                    backgroundColor="$backgroundTransparent"
                    cursor="pointer"
                >
                    {menuOpen ? <X size={24} color={icon.color} /> : <Menu size={24} color={icon.color} />}
                </Stack>
            </XStack>

            {/* Mobile panel */}
            {menuOpen ? (
                <YStack
                    $md={{ display: "none" }}
                    paddingHorizontal="$lg"
                    paddingBottom="$lg"
                    gap="$lg"
                    borderTopWidth={1}
                    borderColor="$borderColor"
                >
                    <YStack gap="$md" paddingTop="$md">
                        {navLinksList}
                    </YStack>
                    <XStack alignItems="center" justifyContent="space-between">
                        {accountArea}
                        {themeToggle}
                    </XStack>
                </YStack>
            ) : null}
        </Header>
    );
}
