import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import resolveAssetUrl from "@/modules/shared/helpers/resolveAssetUrl";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, LogOut, Menu, Moon, Sun, X } from "lucide-react";
import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import Logo from "../../../../assets/static/logo_small.webp";
import { useIsMobile, useIsTablet } from "../../../../hooks/useBreakpoint";
import { useTheme } from "../../../../hooks/useTheme";
import { useUser } from "../../../auth/components/AuthProvider";
import { getChatsQueryOptions } from "../../../chat/queries/getChatsQueryOptions";
import { Roles } from "../../../users/constants";
import { Permissions } from "../../constants";
import usePermissions from "../../hooks/usePermissions";
import { NavlinkProps } from "../../types";
import NavLink from "../NavLink";
import ThemeToggle from "../ThemeToggle";

const Navbar = () => {
    const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
    const location = useLocation();
    const { user, logout } = useUser();
    const isAdminPanel = location.pathname.includes("/admin");
    const isChatScreen = location.pathname.startsWith("/chat");
    // The redesigned homepage renders its own header (SiteHeader), so the global
    // Navbar is suppressed on "/".
    const isHomeScreen = location.pathname === "/";
    const { data: chats } = useQuery(
        getChatsQueryOptions(
            { size: 50, page: 1 },
            {
                enabled: !!user,
                queryKey: ["chats"],
            }
        )
    );
    const { resolvedTheme, setTheme } = useTheme();

    const { hasPermissions } = usePermissions();
    const { t } = useTranslation();
    const isVolunteer = user?.user_role === Roles.VOLUNTEER;
    const userDisplayName = user
        ? user.full_name?.trim() || user.email || t("common.navigation.my_account", { defaultValue: "Moje konto" })
        : "";
    const userInitial = userDisplayName.charAt(0).toUpperCase();
    const isMobile = useIsMobile();
    const isTablet = useIsTablet();
    const hideBrandName = isTablet && !isMobile;

    const mainPages: NavlinkProps[] = useMemo(() => {
        const basePages: NavlinkProps[] = [
            { name: t("common.navigation.home"), to: "/" },
            { name: t("common.navigation.articles"), to: "/articles" },
            ...(!isVolunteer
                ? [
                      {
                          name: t("common.navigation.trainings"),
                          to: "/trainings",
                          permissions: Permissions.VIEW_TRAININGS,
                      },
                  ]
                : []),
            { name: t("common.navigation.donations"), to: "/donations" },
        ];

        if (chats && chats.total > 0) {
            basePages.push({
                name: t("common.navigation.chat"),
                to: "/chat",
                indicator: chats.items.some((chat) => chat.unread_count > 0),
            });
        }

        return basePages;
    }, [chats, isVolunteer, t]);

    const volunteerPages: NavlinkProps[] = useMemo(() => {
        if (!isVolunteer) return [];

        return [
            {
                name: t("common.navigation.trainings"),
                to: "/trainings",
                permissions: Permissions.VIEW_TRAININGS,
            },
            {
                name: t("common.navigation.availability"),
                to: "/volunteer/availability",
                permissions: Permissions.MANAGE_OWN_AVAILABILITY,
            },
        ];
    }, [isVolunteer, t]);

    const adminPage: NavlinkProps = useMemo(
        () => ({
            name: t("common.navigation.admin"),
            to: "/admin/",
            permissions: Permissions.ADMIN_DASHBOARD,
        }),
        [t]
    );

    useEffect(() => {
        setIsDrawerOpen(false);
    }, [location]);

    if (isAdminPanel || isHomeScreen) return null;

    const primaryPages = mainPages.filter((page) => !page.permissions || hasPermissions(page.permissions));
    const visibleVolunteerPages = volunteerPages.filter(
        (page) => !page.permissions || hasPermissions(page.permissions)
    );
    const showVolunteerMenu = isVolunteer && visibleVolunteerPages.length > 0;
    const showAdminLink = hasPermissions(Permissions.ADMIN_DASHBOARD);
    const mobilePages = showAdminLink ? [...primaryPages, adminPage] : primaryPages;
    const isVolunteerSectionActive = visibleVolunteerPages.some((page) => location.pathname === page.to);
    const volunteerMenuLabel = t("common.navigation.volunteer_area");

    return (
        <>
            <header
                className={`bg-card/95 border-border/60 top-0 z-50 w-full border-b px-4 py-2 backdrop-blur-md ${
                    isChatScreen ? "fixed right-0 left-0" : "sticky"
                }`}
            >
                <nav className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4">
                    {/* Logo + brand name */}
                    <Link to="/" className="flex shrink-0 items-center gap-2.5 no-underline">
                        <img src={Logo} alt="Logo" className="w-10" />
                        {!hideBrandName && (
                            <span className="text-foreground hidden text-lg font-bold sm:inline">Peryskop</span>
                        )}
                    </Link>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex items-center justify-center rounded-lg p-2 transition-colors md:hidden"
                        onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                        aria-label="Toggle navigation menu"
                        aria-expanded={isDrawerOpen}
                    >
                        {isDrawerOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                    </button>

                    {/* Mobile Sheet */}
                    <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                        <SheetContent
                            side="right"
                            showCloseButton={false}
                            className="flex w-[280px] flex-col gap-0 p-0 sm:max-w-[280px]"
                        >
                            {/* Mobile header */}
                            <div className="flex items-center justify-between px-5 py-4">
                                <Link to="/" className="flex items-center gap-2 no-underline">
                                    <img src={Logo} alt="Logo" className="w-8" />
                                    <span className="text-foreground text-base font-bold">Peryskop</span>
                                </Link>
                                <button
                                    onClick={() => setIsDrawerOpen(false)}
                                    className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-1.5 transition-colors"
                                    aria-label="Close menu"
                                >
                                    <X className="size-4" />
                                </button>
                            </div>

                            <Separator />

                            {/* Navigation links */}
                            <div className="flex flex-col px-3 py-3">
                                {mobilePages.map(({ name, to }) => {
                                    const isActive = location.pathname === to;
                                    return (
                                        <Link
                                            key={to}
                                            to={to}
                                            className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium no-underline transition-colors ${
                                                isActive
                                                    ? "bg-primary-brand/10 text-primary-brand"
                                                    : "text-foreground hover:bg-muted"
                                            }`}
                                        >
                                            {name}
                                            <ChevronRight
                                                className={`size-4 ${isActive ? "text-primary-brand" : "text-muted-foreground"}`}
                                            />
                                        </Link>
                                    );
                                })}
                                {showVolunteerMenu && (
                                    <div className="mt-2 border-t pt-2">
                                        <p className="text-muted-foreground px-3 py-2 text-xs font-semibold tracking-wide uppercase">
                                            {volunteerMenuLabel}
                                        </p>
                                        {visibleVolunteerPages.map(({ name, to }) => {
                                            const isActive = location.pathname === to;
                                            return (
                                                <Link
                                                    key={to}
                                                    to={to}
                                                    className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium no-underline transition-colors ${
                                                        isActive
                                                            ? "bg-primary-brand/10 text-primary-brand"
                                                            : "text-foreground hover:bg-muted"
                                                    }`}
                                                >
                                                    {name}
                                                    <ChevronRight
                                                        className={`size-4 ${isActive ? "text-primary-brand" : "text-muted-foreground"}`}
                                                    />
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <Separator />

                            {/* Theme toggle */}
                            <div className="px-3 py-3">
                                <button
                                    onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                                    className="text-foreground hover:bg-muted flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
                                >
                                    {resolvedTheme === "dark" ? (
                                        <Sun className="size-4" />
                                    ) : (
                                        <Moon className="size-4" />
                                    )}
                                    {resolvedTheme === "dark"
                                        ? t("common.light_mode", {
                                              defaultValue: "Light mode",
                                          })
                                        : t("common.dark_mode", {
                                              defaultValue: "Dark mode",
                                          })}
                                </button>
                            </div>

                            {/* Bottom: user section */}
                            <div className="mt-auto">
                                <Separator />
                                {user ? (
                                    <div className="flex flex-col gap-1 px-3 py-3">
                                        <Link
                                            to={`/profile/${user.id}`}
                                            className="hover:bg-muted flex items-center gap-3 rounded-lg px-3 py-2.5 no-underline transition-colors"
                                        >
                                            <Avatar className="size-8 rounded-full">
                                                <AvatarImage
                                                    src={resolveAssetUrl(user.chat_avatar_url)}
                                                    alt={userDisplayName}
                                                />
                                                <AvatarFallback className="bg-primary-brand/15 text-primary-brand rounded-full text-xs">
                                                    {userInitial}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-foreground truncate text-sm font-medium">
                                                    {userDisplayName}
                                                </p>
                                                <p className="text-muted-foreground truncate text-xs">{user.email}</p>
                                            </div>
                                        </Link>
                                        <button
                                            onClick={logout}
                                            className="text-destructive hover:bg-destructive/10 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
                                        >
                                            <LogOut className="size-4" />
                                            {t("common.navigation.logout")}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2 px-5 py-4">
                                        <Link to="/login" className="no-underline">
                                            <Button className="w-full">{t("common.join_us")}</Button>
                                        </Link>
                                        <Link to="/auth/register" className="no-underline">
                                            <Button variant="outline" className="w-full">
                                                {t("common.sign_up")}
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </SheetContent>
                    </Sheet>

                    {/* Desktop Menu */}
                    <div className="hidden items-center gap-6 min-[1100px]:absolute min-[1100px]:left-1/2 min-[1100px]:-translate-x-1/2 md:flex">
                        {primaryPages.map((props) => (
                            <NavLink key={props.to} {...props} />
                        ))}
                        {showVolunteerMenu && (
                            <DropdownMenu>
                                <DropdownMenuTrigger
                                    render={
                                        <button
                                            className={`hover:text-primary-brand relative inline-flex items-center gap-1 px-3 py-2 text-xl font-semibold whitespace-nowrap transition-colors duration-200 ${
                                                isVolunteerSectionActive
                                                    ? "text-primary-brand opacity-100"
                                                    : "text-foreground opacity-90 hover:opacity-100"
                                            }`}
                                        />
                                    }
                                >
                                    {volunteerMenuLabel}
                                    <ChevronDown className="size-4" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="center">
                                    {visibleVolunteerPages.map((page) => (
                                        <DropdownMenuItem
                                            key={page.to}
                                            render={<Link to={page.to} className="no-underline" />}
                                        >
                                            {page.name}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                        {showAdminLink && <NavLink {...adminPage} />}
                    </div>

                    {/* User Menu (Desktop) */}
                    <div className="hidden min-w-0 shrink-0 items-center gap-2 md:flex">
                        <ThemeToggle />
                        {user ? (
                            <TooltipProvider>
                                <DropdownMenu>
                                    <Tooltip>
                                        <TooltipTrigger render={<span />}>
                                            <DropdownMenuTrigger
                                                render={
                                                    <button className="bg-background hover:bg-muted flex max-w-[220px] min-w-0 items-center gap-2 rounded-lg p-2 transition-colors xl:max-w-[280px]" />
                                                }
                                            >
                                                <span className="text-foreground min-w-0 truncate text-sm font-medium">
                                                    {userDisplayName}
                                                </span>
                                                <Avatar className="shrink-0 rounded-md">
                                                    <AvatarImage
                                                        src={resolveAssetUrl(user.chat_avatar_url)}
                                                        alt={userDisplayName}
                                                    />
                                                    <AvatarFallback className="bg-primary-brand/15 text-primary-brand rounded-md">
                                                        {userInitial}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </DropdownMenuTrigger>
                                        </TooltipTrigger>
                                        <TooltipContent>{user.email}</TooltipContent>
                                    </Tooltip>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            render={<Link to={`/profile/${user.id}`} className="no-underline" />}
                                        >
                                            {t("common.navigation.my_account")}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={logout}>
                                            {t("common.navigation.logout")}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TooltipProvider>
                        ) : (
                            <div className="flex gap-4">
                                <Link to="/login">
                                    <Button>{t("common.join_us")}</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </nav>
            </header>
            {isChatScreen && <div aria-hidden="true" className="h-14 shrink-0" />}
        </>
    );
};

export default Navbar;
