import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/useBreakpoint";
import { Stack, Typography, XStack, YStack } from "@fundacja-peryskop/ui";
import {
    ArrowLeft,
    Bell,
    ClipboardCheck,
    ClipboardList,
    FileText,
    Flag,
    History,
    LayoutDashboard,
    Menu,
    MessageCircle,
    PlusCircle,
    Settings,
    UserCheck,
    Users,
    type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { useUser } from "../../../auth/components/AuthProvider";
import { useIconColor } from "../../../layout/useIconColor";
import { Roles } from "../../../users/constants";
import { Permissions } from "../../constants";
import usePermissions from "../../hooks/usePermissions";

const DRAWER_WIDTH = 248;
const ROW_RESET: React.CSSProperties = { textDecoration: "none", display: "block" };

interface Props {
    open: boolean;
    handleToggle: () => void;
}

type MenuItem = {
    text: string;
    icon: LucideIcon;
    to: string;
    permissions: Permissions;
    roles?: Roles[];
};

type MenuSection = {
    title: string;
    items: MenuItem[];
};

const normalizePath = (path: string) => path.replace(/\/+$/, "") || "/";

export const AdminSidebar = ({ handleToggle, open }: Props) => {
    const isMobile = useIsMobile();
    const { user } = useUser();
    const { hasPermissions } = usePermissions();
    const { t } = useTranslation();
    const location = useLocation();
    const c = useIconColor();

    const currentPath = normalizePath(location.pathname);

    const menuSections: MenuSection[] = [
        {
            title: t("admin.sidebar.sections.overview", { defaultValue: "Przegląd" }),
            items: [
                {
                    text: t("admin.sidebar.dashboard"),
                    icon: LayoutDashboard,
                    to: "/admin/",
                    permissions: Permissions.ADMIN_DASHBOARD,
                },
            ],
        },
        {
            title: t("admin.sidebar.sections.support", { defaultValue: "Obsługa wsparcia" }),
            items: [
                {
                    text: t("admin.sidebar.matching_mentees", { defaultValue: "Osoby w kryzysie" }),
                    icon: UserCheck,
                    to: "/admin/matching/mentees",
                    permissions: Permissions.MANAGE_CHATS,
                },
                {
                    text: t("admin.sidebar.matching_volunteers", { defaultValue: "Wolontariusze" }),
                    icon: Users,
                    to: "/admin/matching/volunteers",
                    permissions: Permissions.MANAGE_CHATS,
                },
                {
                    text: t("admin.sidebar.matching_alerts", { defaultValue: "Alerty parowania" }),
                    icon: Bell,
                    to: "/admin/matching/alerts",
                    permissions: Permissions.MANAGE_CHATS,
                },
                {
                    text: t("admin.sidebar.matching_history", { defaultValue: "Historia obsługi" }),
                    icon: History,
                    to: "/admin/matching/history",
                    permissions: Permissions.MANAGE_CHATS,
                },
                {
                    text: t("admin.sidebar.chats"),
                    icon: MessageCircle,
                    to: "/admin/chats/",
                    permissions: Permissions.MANAGE_CHATS,
                },
            ],
        },
        {
            title: t("admin.sidebar.sections.intake", { defaultValue: "Formularze i zgłoszenia" }),
            items: [
                {
                    text: t("admin.sidebar.mentee_forms"),
                    icon: ClipboardList,
                    to: "/admin/forms/mentee",
                    permissions: Permissions.MANAGE_MENTEE_FORMS,
                },
                {
                    text: t("admin.sidebar.volunteer_forms"),
                    icon: ClipboardCheck,
                    to: "/admin/forms/volunteer",
                    permissions: Permissions.MANAGE_VOLUNTEER_FORMS,
                },
                {
                    text: t("admin.sidebar.reports"),
                    icon: Flag,
                    to: "/admin/reports/",
                    permissions: Permissions.MANAGE_REPORTS,
                },
            ],
        },
        {
            title: t("admin.sidebar.sections.content", { defaultValue: "Treści" }),
            items: [
                {
                    text: t("admin.sidebar.articles"),
                    icon: FileText,
                    to: "/admin/articles/",
                    permissions: Permissions.MANAGE_ARTICLES,
                },
                {
                    text: t("articles.add_article"),
                    icon: PlusCircle,
                    to: "/articles/dashboard",
                    permissions: Permissions.CREATE_ARTICLE,
                },
            ],
        },
        {
            title: t("admin.sidebar.sections.admin", { defaultValue: "Administracja" }),
            items: [
                {
                    text: t("admin.sidebar.users"),
                    icon: Users,
                    to: "/admin/users/",
                    permissions: Permissions.MANAGE_USERS,
                },
                {
                    text: t("admin.sidebar.settings", { defaultValue: "Ustawienia" }),
                    icon: Settings,
                    to: "/admin/settings",
                    permissions: Permissions.MANAGE_USERS,
                    roles: [Roles.ADMIN],
                },
            ],
        },
    ];

    const NavRow = ({
        to,
        icon: Icon,
        label,
        active,
    }: {
        to: string;
        icon: LucideIcon;
        label: string;
        active?: boolean;
    }) => (
        <RouterLink to={to} style={ROW_RESET} aria-current={active ? "page" : undefined}>
            <XStack
                alignItems="center"
                gap="$md"
                paddingHorizontal="$lg"
                paddingVertical="$sm"
                borderLeftWidth={3}
                borderColor={active ? "$primary" : "$backgroundTransparent"}
                backgroundColor={active ? "$primarySoft" : "$backgroundTransparent"}
                cursor="pointer"
                hoverStyle={{ backgroundColor: active ? "$primarySoft" : "$backgroundHover" }}
            >
                <Icon size={20} color={active ? c.primary : c.muted} />
                <Typography variant="smallSemibold" color={active ? "$primary" : "$color"}>
                    {label}
                </Typography>
            </XStack>
        </RouterLink>
    );

    const sidebarContent = (
        <YStack width="100%" backgroundColor="$background" height="100%">
            <Typography variant="largeBold" align="center" paddingVertical="$lg">
                {t("admin.sidebar.title")}
            </Typography>
            <Stack height={1} backgroundColor="$borderColor" />
            <YStack tag="nav" aria-label="Admin navigation" paddingVertical="$md" gap="$md">
                {menuSections.map((section) => {
                    const visibleItems = section.items.filter(
                        (item) =>
                            hasPermissions(item.permissions) &&
                            (!item.roles || (!!user && item.roles.includes(user.user_role)))
                    );
                    if (visibleItems.length === 0) return null;

                    return (
                        <YStack key={section.title} gap="$xs">
                            <Typography
                                variant="tinySemibold"
                                color="$colorMuted"
                                paddingHorizontal="$lg"
                                style={{ textTransform: "uppercase", letterSpacing: 0.5 }}
                            >
                                {section.title}
                            </Typography>
                            <YStack>
                                {visibleItems.map((item) => (
                                    <NavRow
                                        key={item.to}
                                        to={item.to}
                                        icon={item.icon}
                                        label={item.text}
                                        active={currentPath === normalizePath(item.to)}
                                    />
                                ))}
                            </YStack>
                        </YStack>
                    );
                })}
                <NavRow to="/" icon={ArrowLeft} label={t("admin.sidebar.back")} />
            </YStack>
        </YStack>
    );

    return (
        <>
            {isMobile ? (
                <>
                    <XStack
                        width="100%"
                        alignItems="center"
                        gap="$sm"
                        paddingHorizontal="$md"
                        paddingVertical="$xs"
                        backgroundColor="$background"
                        borderBottomWidth={1}
                        borderColor="$borderColor"
                        style={{ position: "fixed", top: 0, left: 0, zIndex: 50 }}
                    >
                        <Stack
                            tag="button"
                            role="button"
                            aria-label="Toggle admin sidebar"
                            aria-expanded={open}
                            onPress={handleToggle}
                            padding="$xs"
                            borderWidth={0}
                            backgroundColor="$backgroundTransparent"
                            cursor="pointer"
                        >
                            <Menu size={24} color={c.color} />
                        </Stack>
                        <Typography variant="largeBold">{t("admin.sidebar.title")}</Typography>
                    </XStack>

                    <Sheet open={open} onOpenChange={handleToggle}>
                        <SheetContent
                            side="left"
                            showCloseButton={false}
                            className="p-0"
                            style={{ width: DRAWER_WIDTH }}
                        >
                            {sidebarContent}
                        </SheetContent>
                    </Sheet>
                </>
            ) : (
                <Stack
                    tag="aside"
                    aria-label="Admin navigation"
                    width={DRAWER_WIDTH}
                    flexShrink={0}
                    height="100vh"
                    overflow="scroll"
                    borderRightWidth={1}
                    borderColor="$borderColor"
                    style={{ position: "sticky", top: 0 }}
                >
                    {sidebarContent}
                </Stack>
            )}
        </>
    );
};

export default AdminSidebar;
