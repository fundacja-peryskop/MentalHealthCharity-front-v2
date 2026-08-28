import { Stack, Typography, XStack } from "@fundacja-peryskop/ui";
import { Phone } from "lucide-react";
import { announcement } from "./content";
import { PageContainer } from "./PageContainer";

const ANCHOR_RESET: React.CSSProperties = { textDecoration: "none", display: "inline-flex" };

/**
 * §4.1 — full-width brand-teal utility strip above the header. Shows a crisis
 * reassurance line plus two emergency phone contacts. Renders as a
 * `<aside>` complementary landmark. Wraps to a centered stack on narrow
 * viewports.
 */
export function AnnouncementBar() {
    return (
        <Stack tag="aside" width="100%" backgroundColor="$primary" paddingVertical="$sm">
            <PageContainer
                flexDirection="column"
                alignItems="center"
                gap="$xs"
                $md={{ flexDirection: "row", justifyContent: "space-between" }}
            >
                <Typography variant="tinyRegular" color="$primaryText" align="center">
                    {announcement.message}
                </Typography>

                <XStack alignItems="center" justifyContent="center" flexWrap="wrap" gap="$md">
                    {announcement.contacts.map((contact) => (
                        <a key={contact.href} href={contact.href} style={ANCHOR_RESET}>
                            <XStack alignItems="center" gap="$xs">
                                <Phone size={13} color="white" strokeWidth={2.5} />
                                <Typography variant="tinySemibold" color="$primaryText">
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
