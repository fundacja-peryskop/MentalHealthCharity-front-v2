import resolveAssetUrl from "@/modules/shared/helpers/resolveAssetUrl";
import { Avatar, Stack, Typography, XStack, YStack } from "@fundacja-peryskop/ui";
import { ChevronRight, LogOut } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import { useUser } from "../auth/components/AuthProvider";
import type { NavItem } from "./content";
import { CtaButton } from "./CtaButton";
import { useIconColor } from "./useIconColor";

/**
 * The panel hangs from the bottom of the header as an absolutely-positioned
 * overlay, so opening it never changes page layout (an in-flow panel grew the
 * sticky header block and pushed the whole page down - iOS Safari has no scroll
 * anchoring to hide that). The backdrop is portaled to `<body>` because the
 * sticky chrome wrapper uses `transform`, which would otherwise trap a
 * `position: fixed` element inside it. Hidden from 768px up, where the header
 * shows the inline desktop nav. The positioned shell is a plain `<div>`: on a
 * Tamagui `YStack` its own atomic `position: relative` / `display: flex` classes
 * would win over these rules.
 */
const CLASS = "mobile-menu";
const STYLE = `
@keyframes ${CLASS}-in{from{opacity:0;transform:translateY(-10px);}to{opacity:1;transform:none;}}
@keyframes ${CLASS}-fade{from{opacity:0;}to{opacity:1;}}
.${CLASS}{position:absolute;top:100%;left:0;right:0;overflow-y:auto;overscroll-behavior:contain;outline:none;
  border-bottom-left-radius:24px;border-bottom-right-radius:24px;
  box-shadow:0 24px 48px rgba(9,10,10,.14);animation:${CLASS}-in .24s cubic-bezier(.22,1,.36,1);}
.${CLASS}__backdrop{position:fixed;inset:0;z-index:49;background:rgba(9,10,10,.45);animation:${CLASS}-fade .2s ease;}
.${CLASS}__link{text-decoration:none;display:block;border-radius:16px;}
.${CLASS}__link:focus-visible{outline:3px solid #06b7a7;outline-offset:2px;}
@media (min-width:768px){.${CLASS},.${CLASS}__backdrop{display:none;}}
@media (prefers-reduced-motion:reduce){.${CLASS},.${CLASS}__backdrop{animation:none;}}
`;

/** Breathing room kept below the panel when it is capped to the viewport. */
const VIEWPORT_MARGIN = 16;

const normalizePath = (path: string) => path.replace(/\/+$/, "") || "/";

/** A nav entry is "current" on its own route and any route nested under it. */
function isActive(href: string, pathname: string): boolean {
    if (href.includes("#")) return false;
    const target = normalizePath(href);
    const current = normalizePath(pathname);
    return current === target || current.startsWith(`${target}/`);
}

interface MobileMenuProps {
    /** DOM id, referenced by the toggle's `aria-controls`. */
    id: string;
    items: NavItem[];
    pathname: string;
    onClose: () => void;
}

/**
 * Mobile navigation panel (rendered only while open). Large, comfortably
 * tappable rows with a chevron, the current page highlighted, and the account
 * section (sign-in CTA, or profile + sign-out) at the bottom. Locks page scroll
 * while open; Escape or a tap on the backdrop closes it.
 */
export function MobileMenu({ id, items, pathname, onClose }: MobileMenuProps) {
    const { t } = useTranslation();
    const { user, logout } = useUser();
    const icon = useIconColor();
    const panelRef = useRef<HTMLDivElement>(null);
    const [maxHeight, setMaxHeight] = useState<number>();

    // Cap the panel to the space left under the header so long menus scroll
    // inside the panel instead of running off-screen.
    useLayoutEffect(() => {
        const measure = () => {
            const top = panelRef.current?.getBoundingClientRect().top ?? 0;
            setMaxHeight(Math.max(240, window.innerHeight - top - VIEWPORT_MARGIN));
        };
        measure();
        window.addEventListener("resize", measure);
        return () => window.removeEventListener("resize", measure);
    }, []);

    // Lock background scroll and close on Escape while open. Focus moves into
    // the panel so keyboard users land in the menu they just opened.
    useEffect(() => {
        const root = document.documentElement;
        const previousOverflow = root.style.overflow;
        root.style.overflow = "hidden";
        panelRef.current?.focus({ preventScroll: true });

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        document.addEventListener("keydown", onKeyDown);
        return () => {
            root.style.overflow = previousOverflow;
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [onClose]);

    return (
        <>
            <style>{STYLE}</style>
            {createPortal(<div className={`${CLASS}__backdrop`} onClick={onClose} aria-hidden />, document.body)}

            <div ref={panelRef} id={id} className={CLASS} tabIndex={-1} style={{ maxHeight }}>
                <YStack
                    backgroundColor="$background"
                    borderTopWidth={1}
                    borderColor="$borderColor"
                    paddingHorizontal="$lg"
                    paddingTop="$md"
                    paddingBottom="$xl"
                    gap="$lg"
                >
                    <nav aria-label={t("common.navigation.main_menu")}>
                        <YStack gap="$xs">
                            {items.map((item) => {
                                const active = isActive(item.href, pathname);
                                return (
                                    <RouterLink
                                        key={item.href}
                                        to={item.href}
                                        className={`${CLASS}__link`}
                                        aria-current={active ? "page" : undefined}
                                    >
                                        <XStack
                                            minHeight={56}
                                            alignItems="center"
                                            justifyContent="space-between"
                                            gap="$md"
                                            paddingHorizontal="$lg"
                                            borderRadius={16}
                                            backgroundColor={active ? "$primarySoft" : "$backgroundTransparent"}
                                            hoverStyle={{
                                                backgroundColor: active ? "$primarySoft" : "$backgroundHover",
                                            }}
                                            pressStyle={{
                                                backgroundColor: active ? "$primarySoft" : "$backgroundPress",
                                            }}
                                        >
                                            <XStack alignItems="center" gap="$sm">
                                                <Typography
                                                    variant="largeSemibold"
                                                    tag="span"
                                                    color={active ? "$primaryTextSoft" : "$color"}
                                                >
                                                    {item.label}
                                                </Typography>
                                                {item.indicator ? (
                                                    <Stack
                                                        role="img"
                                                        aria-label={t("common.navigation.aria.unread_messages")}
                                                        width={8}
                                                        height={8}
                                                        borderRadius="$full"
                                                        backgroundColor="$danger"
                                                    />
                                                ) : null}
                                            </XStack>
                                            <ChevronRight size={20} color={active ? icon.primary : icon.muted} />
                                        </XStack>
                                    </RouterLink>
                                );
                            })}
                        </YStack>
                    </nav>

                    <Stack height={1} backgroundColor="$borderColor" />

                    {user ? (
                        <YStack gap="$sm">
                            <RouterLink to={`/profile/${user.id}`} className={`${CLASS}__link`}>
                                <XStack
                                    alignItems="center"
                                    gap="$md"
                                    padding="$md"
                                    borderRadius={16}
                                    backgroundColor="$backgroundHover"
                                    pressStyle={{ backgroundColor: "$backgroundPress" }}
                                >
                                    <Avatar
                                        src={resolveAssetUrl(user.chat_avatar_url)}
                                        name={user.full_name}
                                        size={44}
                                    />
                                    <YStack flex={1} minWidth={0}>
                                        <Typography variant="regularBold" tag="span" numberOfLines={1}>
                                            {user.full_name}
                                        </Typography>
                                        <Typography variant="smallRegular" tag="span" muted>
                                            {t("common.navigation.my_account")}
                                        </Typography>
                                    </YStack>
                                    <ChevronRight size={20} color={icon.muted} />
                                </XStack>
                            </RouterLink>
                            <Stack
                                tag="button"
                                role="button"
                                onPress={() => logout()}
                                flexDirection="row"
                                alignItems="center"
                                justifyContent="center"
                                gap="$sm"
                                minHeight={48}
                                borderRadius="$full"
                                borderWidth={1}
                                borderColor="$borderColor"
                                backgroundColor="$backgroundTransparent"
                                cursor="pointer"
                                hoverStyle={{ backgroundColor: "$dangerSoft", borderColor: "$dangerSoft" }}
                                pressStyle={{ backgroundColor: "$dangerSoft", borderColor: "$dangerSoft" }}
                            >
                                <LogOut size={18} color={icon.danger} />
                                <Typography variant="regularSemibold" color="$danger">
                                    {t("common.navigation.logout")}
                                </Typography>
                            </Stack>
                        </YStack>
                    ) : (
                        <CtaButton href="/login" fullWidth>
                            {t("common.join_us", { defaultValue: "Zaloguj się" })}
                        </CtaButton>
                    )}
                </YStack>
            </div>
        </>
    );
}
