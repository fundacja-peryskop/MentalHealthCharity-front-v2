import { Stack, Typography, XStack } from "@fundacja-peryskop/ui";
import { Phone } from "lucide-react";
import { announcement } from "./content";
import { PageContainer } from "./PageContainer";

const ANCHOR_RESET: React.CSSProperties = { textDecoration: "none", display: "inline-flex" };

interface Props {
    /** When true the bar is slid out of view (handled by the sticky chrome wrapper). */
    collapsed?: boolean;
}

/**
 * §4.1 - full-width brand-teal utility strip above the header. Shows a crisis
 * reassurance line plus two emergency phone contacts. Renders as an `<aside>`
 * complementary landmark, wrapping to a centered stack on narrow viewports.
 *
 * Positioning/animation is owned by the layout's sticky chrome wrapper (the bar
 * and header slide together as one block, so the header always covers the bar).
 * This component is just the content; it sits behind the header, which overlaps
 * its bottom edge with rounded corners.
 */
export function AnnouncementBar({ collapsed = false }: Props) {
    return (
        <Stack
            tag="aside"
            width="100%"
            backgroundColor="$primary"
            position="relative"
            zIndex={0}
            aria-hidden={collapsed || undefined}
            style={{ pointerEvents: collapsed ? "none" : "auto" }}
        >
            <PageContainer
                minHeight={58}
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                gap="$xs"
                paddingTop="$sm"
                // The header overlaps the bar's bottom 16px (see AppHeader), so the
                // extra bottom padding keeps the text centred within the *visible*
                // strip rather than the full height.
                paddingBottom={24}
                $md={{ flexDirection: "row", justifyContent: "space-between" }}
            >
                <Typography variant="regularRegular" color="$primaryText" align="center">
                    {announcement.message}
                </Typography>

                <XStack alignItems="center" justifyContent="center" flexWrap="wrap" gap="$lg">
                    {announcement.contacts.map((contact) => (
                        <a key={contact.href} href={contact.href} style={ANCHOR_RESET}>
                            <XStack alignItems="center" gap="$xs">
                                <Phone size={18} color="white" strokeWidth={2.5} />
                                <Typography variant="regularSemibold" color="$primaryText">
                                    {contact.label}
                                </Typography>
                            </XStack>
                        </a>
                    ))}
                </XStack>
            </PageContainer>
        </Stack>
    );
}
