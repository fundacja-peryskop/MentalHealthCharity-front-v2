import logo from "@/assets/static/logo_small.webp";
import { Header, Stack, Typography, XStack, YStack } from "@fundacja-peryskop/ui";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { useUser } from "../../auth/components/AuthProvider";
import { brand, headerCta, navLinks } from "../content";
import { AppLink } from "../../layout/AppLink";
import { CtaButton } from "../../layout/CtaButton";
import { useIconColor } from "../../layout/useIconColor";

const LINK_RESET: React.CSSProperties = { textDecoration: "none", display: "inline-flex" };

/**
 * §4.2 — marketing header: logo + wordmark, primary navigation, and a pill CTA.
 * On desktop the nav and CTA sit inline; below the `md` breakpoint they collapse
 * into a toggleable menu panel. Signed-in visitors get an account CTA instead of
 * "Dołącz" so the homepage never hides their access to the app.
 */
export function SiteHeader() {
    const [menuOpen, setMenuOpen] = useState(false);
    const { user } = useUser();
    const location = useLocation();
    const icon = useIconColor();

    // Close the mobile menu after navigating.
    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname, location.hash]);

    const cta = user ? { label: "Moje konto", href: `/profile/${user.id}` } : headerCta;

    const brandMark = (
        <RouterLink to="/" style={LINK_RESET} aria-label={brand.name}>
            <XStack alignItems="center" gap="$sm">
                <img src={logo} alt="" width={40} height={40} style={{ display: "block" }} />
                <Typography variant="largeBold" tag="span">
                    {brand.name}
                </Typography>
            </XStack>
        </RouterLink>
    );

    const navItems = navLinks.map((link) => (
        <AppLink
            key={link.href}
            href={link.href}
            external={link.external}
            variant="regularSemibold"
            color="$color"
            hoverStyle={{ color: "$primary" }}
        >
            {link.label}
        </AppLink>
    ));

    return (
        <Header tag="header" width="100%" backgroundColor="$background">
            <XStack
                width="100%"
                maxWidth={1200}
                alignSelf="center"
                paddingHorizontal="$lg"
                $sm={{ paddingHorizontal: "$xl" }}
                paddingVertical="$md"
                alignItems="center"
                justifyContent="space-between"
                gap="$lg"
            >
                {brandMark}

                {/* Desktop navigation */}
                <XStack display="none" $md={{ display: "flex" }} alignItems="center" gap="$xl">
                    {navItems}
                </XStack>

                {/* Desktop CTA */}
                <Stack display="none" $md={{ display: "flex" }}>
                    <CtaButton href={cta.href}>{cta.label}</CtaButton>
                </Stack>

                {/* Mobile menu toggle */}
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

            {/* Mobile menu panel */}
            {menuOpen ? (
                <YStack
                    $md={{ display: "none" }}
                    paddingHorizontal="$lg"
                    paddingBottom="$lg"
                    gap="$lg"
                    borderBottomWidth={1}
                    borderColor="$borderColor"
                >
                    <YStack gap="$md">{navItems}</YStack>
                    <CtaButton href={cta.href} fullWidth>
                        {cta.label}
                    </CtaButton>
                </YStack>
            ) : null}
        </Header>
    );
}
