import logo from "@/assets/static/logo_small.webp";
import { Typography, XStack, YStack } from "@fundacja-peryskop/ui";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import { AuthCover } from "./auth/AuthCover";
import { brand } from "./content";

interface Props {
    /** Heading shown at the top-left of the form column. Omit for a lead-with-content screen. */
    title?: string;
    subtitle?: string;
    /** Optional callout rendered under the subtitle (e.g. an intent notice). */
    notice?: ReactNode;
    /** The form. */
    children: ReactNode;
    /** Secondary action area under the form (e.g. "no account? create one"). */
    footer?: ReactNode;
}

const BRAND_LINK_RESET: React.CSSProperties = {
    textDecoration: "none",
    display: "inline-flex",
    alignSelf: "flex-start",
};

/**
 * Split-screen layout shared by every auth screen: a left column with the brand
 * mark, heading and form, and a full-height cover image on the right (desktop
 * only). Full-bleed - the app chrome is hidden on auth routes - so it reads as a
 * focused, standalone entry point. The form column fades/slides in on mount
 * (disabled under `prefers-reduced-motion`). Layout only: all copy comes in via
 * props, so the shell stays reusable across login, register and password flows.
 */
export function AuthShell({ title, subtitle, notice, children, footer }: Props) {
    const { t } = useTranslation();
    const reduce = useReducedMotion();

    return (
        <XStack width="100%" backgroundColor="$background" style={{ minHeight: "100dvh" }}>
            {/* Form column */}
            <YStack
                flex={1}
                alignItems="center"
                justifyContent="center"
                paddingHorizontal="$xl"
                paddingVertical="$xxxl"
                $md={{ paddingHorizontal: "$xxxl" }}
            >
                <motion.div
                    initial={reduce ? false : { opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    style={{ width: "100%", maxWidth: 420 }}
                >
                    <YStack gap="$xl" width="100%">
                        <RouterLink to="/" aria-label={brand.name} style={BRAND_LINK_RESET}>
                            <XStack alignItems="center" gap="$sm">
                                <img src={logo} alt="" width={32} height={32} style={{ display: "block" }} />
                                <Typography variant="largeBold" tag="span">
                                    {brand.shortName}
                                </Typography>
                            </XStack>
                        </RouterLink>

                        {title || subtitle || notice ? (
                            <YStack gap="$sm">
                                {title ? (
                                    <Typography
                                        variant="title1"
                                        tag="h1"
                                        style={{ fontSize: "clamp(30px, 3.6vw, 40px)", lineHeight: "1.12" }}
                                    >
                                        {title}
                                    </Typography>
                                ) : null}
                                {subtitle ? (
                                    <Typography variant="regularRegular" muted>
                                        {subtitle}
                                    </Typography>
                                ) : null}
                                {notice}
                            </YStack>
                        ) : null}

                        {children}
                        {footer}
                    </YStack>
                </motion.div>
            </YStack>

            <AuthCover headline={t("auth.cover.headline")} subline={t("auth.cover.subline")} />
        </XStack>
    );
}
