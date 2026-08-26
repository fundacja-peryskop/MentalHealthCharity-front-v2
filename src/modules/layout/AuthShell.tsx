import { Stack, Typography, XStack, YStack, shadows } from "@fundacja-peryskop/ui";
import { Heart } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { brand } from "./content";

interface Props {
    title: string;
    subtitle?: string;
    /** Optional callout rendered under the subtitle (e.g. an intent notice). */
    notice?: ReactNode;
    /** The form. */
    children: ReactNode;
    /** Secondary action line under the card (e.g. "no account? register"). */
    footer?: ReactNode;
}

/**
 * Branded split layout shared by the auth screens: a brand panel on the left
 * (hidden on mobile) and a centered form card on the right.
 */
export function AuthShell({ title, subtitle, notice, children, footer }: Props) {
    const { t } = useTranslation();

    return (
        <XStack width="100%" minHeight="100vh" backgroundColor="$background">
            {/* Brand panel */}
            <YStack
                display="none"
                $md={{ display: "flex", width: "50%" }}
                backgroundColor="$primary"
                alignItems="center"
                justifyContent="center"
                padding="$xxxl"
            >
                <YStack maxWidth={400} alignItems="center" gap="$lg">
                    <Stack
                        width={64}
                        height={64}
                        borderRadius="$lg"
                        alignItems="center"
                        justifyContent="center"
                        backgroundColor="rgba(255,255,255,0.15)"
                    >
                        <Heart size={32} color="white" />
                    </Stack>
                    <Typography variant="title2" tag="span" color="$primaryText">
                        {brand.shortName}
                    </Typography>
                    <Typography variant="largeRegular" align="center" color="rgba(255,255,255,0.85)">
                        {t("homepage.title")}
                    </Typography>
                    <YStack maxWidth={320} padding="$lg" borderRadius="$md" backgroundColor="rgba(255,255,255,0.1)">
                        <Typography
                            variant="smallRegular"
                            color="rgba(255,255,255,0.9)"
                            style={{ fontStyle: "italic" }}
                        >
                            &quot;{t("homepage.trust_mission.description")}&quot;
                        </Typography>
                    </YStack>
                </YStack>
            </YStack>

            {/* Form panel */}
            <YStack
                flex={1}
                alignItems="center"
                justifyContent="center"
                paddingHorizontal="$lg"
                paddingVertical="$xxxl"
                gap="$lg"
            >
                <YStack
                    width="100%"
                    maxWidth={440}
                    padding="$xl"
                    borderRadius="$lg"
                    borderWidth={1}
                    borderColor="$borderColor"
                    backgroundColor="$background"
                    gap="$lg"
                    {...shadows.medium}
                >
                    <YStack gap="$xs" alignItems="center">
                        <Typography variant="title3" tag="h1" align="center">
                            {title}
                        </Typography>
                        {subtitle ? (
                            <Typography variant="regularRegular" muted align="center">
                                {subtitle}
                            </Typography>
                        ) : null}
                        {notice}
                    </YStack>
                    {children}
                </YStack>
                {footer}
            </YStack>
        </XStack>
    );
}
