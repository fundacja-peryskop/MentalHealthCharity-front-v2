import { Footer, Stack, Typography, XStack, YStack } from "@fundacja-peryskop/ui";
import { Facebook, Linkedin } from "lucide-react";
import { brand, footer } from "../content";
import { AppLink } from "../../layout/AppLink";
import { PageContainer } from "../../layout/PageContainer";

const SOCIAL_ANCHOR: React.CSSProperties = { textDecoration: "none", display: "inline-flex" };

const SOCIAL_ICONS = { Facebook, LinkedIn: Linkedin } as const;

/**
 * §4.8 — footer. Full-bleed dark strip with a brand/mission column, link
 * columns, social icons and a copyright line. Content mirrors the app's
 * existing footer. Collapses columns on narrow viewports.
 */
export function SiteFooter() {
    return (
        <Footer tag="footer" role="contentinfo" width="100%" backgroundColor="$inkDarkest">
            <PageContainer paddingVertical="$xxxl" gap="$xl">
                <XStack flexWrap="wrap" justifyContent="space-between" gap="$xl">
                    {/* Brand + mission */}
                    <YStack width="100%" $md={{ width: "32%" }} gap="$sm">
                        <Typography variant="largeBold" tag="span" color="$colorInverse">
                            {brand.shortName}
                        </Typography>
                        <Typography variant="smallRegular" color="$skyBase">
                            {footer.mission}
                        </Typography>
                    </YStack>

                    {/* Link columns */}
                    {footer.columns.map((column) => (
                        <YStack
                            key={column.heading}
                            width="100%"
                            $sm={{ width: "30%" }}
                            $md={{ width: "18%" }}
                            gap="$md"
                        >
                            <Typography variant="smallSemibold" color="$skyDark">
                                {column.heading}
                            </Typography>
                            <YStack gap="$sm">
                                {column.links.map((link) => (
                                    <AppLink
                                        key={`${link.label}-${link.href}`}
                                        href={link.href}
                                        external={link.external}
                                        variant="smallRegular"
                                        color="$colorInverse"
                                        hoverStyle={{ color: "$primary" }}
                                    >
                                        {link.label}
                                    </AppLink>
                                ))}
                            </YStack>
                        </YStack>
                    ))}

                    {/* Social */}
                    <YStack width="100%" $sm={{ width: "30%" }} $md={{ width: "16%" }} gap="$md">
                        <Typography variant="smallSemibold" color="$skyDark">
                            Social
                        </Typography>
                        <XStack gap="$sm">
                            {footer.socials.map((social) => {
                                const Icon = SOCIAL_ICONS[social.label as keyof typeof SOCIAL_ICONS];
                                return (
                                    <a
                                        key={social.href}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={social.label}
                                        style={SOCIAL_ANCHOR}
                                    >
                                        <Stack
                                            width={40}
                                            height={40}
                                            borderRadius="$full"
                                            alignItems="center"
                                            justifyContent="center"
                                            backgroundColor="rgba(255,255,255,0.1)"
                                            hoverStyle={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                                        >
                                            {Icon ? <Icon size={18} color="white" /> : null}
                                        </Stack>
                                    </a>
                                );
                            })}
                        </XStack>
                    </YStack>
                </XStack>

                <Stack height={1} backgroundColor="rgba(255,255,255,0.1)" />

                <Typography variant="smallRegular" color="$skyDark" align="center">
                    {footer.copyright}
                </Typography>
            </PageContainer>
        </Footer>
    );
}
