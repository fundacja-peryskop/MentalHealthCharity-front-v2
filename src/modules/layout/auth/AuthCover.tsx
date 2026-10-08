import authCover from "@/assets/static/auth_cover.webp";
import { Typography, YStack } from "@fundacja-peryskop/ui";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";

interface Props {
    /** Large overlay headline shown over the image. */
    headline: string;
    /** Optional supporting line under the headline. */
    subline?: string;
}

const OVERLAY = "linear-gradient(to top, rgba(9,10,10,0.78) 0%, rgba(9,10,10,0.30) 45%, rgba(9,10,10,0.08) 100%)";

/** Photo attribution for the cover image (Pexels). */
const CREDIT_URL = "https://www.pexels.com/@karola-g/";
const CREDIT_HANDLE = "@karola-g";

/**
 * The right-hand visual panel of the auth split layout: a full-bleed cover image
 * with a dark bottom scrim and a warm headline. Hidden below the `md` breakpoint
 * (auth is a single form column on mobile). The image does a slow, subtle
 * zoom-in on mount; disabled under `prefers-reduced-motion`. Purely decorative -
 * the image is `aria-hidden` and the headline is a `<span>`, not a heading, so it
 * doesn't compete with the form's `<h1>`.
 */
export function AuthCover({ headline, subline }: Props) {
    const { t } = useTranslation();
    const reduce = useReducedMotion();

    return (
        <YStack
            display="none"
            $md={{ display: "flex" }}
            width="54%"
            position="relative"
            overflow="hidden"
            justifyContent="flex-end"
            padding="$xxl"
        >
            <motion.img
                src={authCover}
                alt=""
                aria-hidden
                initial={reduce ? false : { scale: 1.08 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div aria-hidden style={{ position: "absolute", inset: 0, background: OVERLAY }} />

            {/* Photo attribution (small print, author handle links out). */}
            <Typography
                tag="span"
                variant="tinyRegular"
                position="absolute"
                top="$md"
                right="$lg"
                zIndex={1}
                style={{ color: "rgba(255,255,255,0.72)" }}
            >
                {t("auth.cover.credit")}{" "}
                <a
                    href={CREDIT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "rgba(255,255,255,0.95)", textDecoration: "underline" }}
                >
                    {CREDIT_HANDLE}
                </a>
            </Typography>

            <motion.div
                initial={reduce ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                style={{ position: "relative", zIndex: 1, maxWidth: 560 }}
            >
                <YStack gap="$sm">
                    <Typography
                        variant="title1"
                        tag="span"
                        style={{ color: "#ffffff", fontSize: "clamp(28px, 3.4vw, 44px)", lineHeight: "1.12" }}
                    >
                        {headline}
                    </Typography>
                    {subline ? (
                        <Typography variant="largeRegular" tag="span" style={{ color: "rgba(255,255,255,0.88)" }}>
                            {subline}
                        </Typography>
                    ) : null}
                </YStack>
            </motion.div>
        </YStack>
    );
}
