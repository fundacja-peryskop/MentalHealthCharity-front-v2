import { Typography, XStack, YStack } from "@fundacja-peryskop/ui";
import { ArrowRight } from "lucide-react";
import type { CSSProperties, MouseEvent, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import type { PitchCardContent, PitchTone } from "../content";
import { ChairIllustration } from "../illustrations/ChairIllustration";
import { ChatWindowMockup } from "../illustrations/ChatWindowMockup";
import { PersonWithBubblesIllustration } from "../illustrations/PersonWithBubblesIllustration";
import { PhoneIllustration } from "../illustrations/PhoneIllustration";

/**
 * Per-tone colours. `surface` is the resting (soft) card tint; `fill` is the
 * saturated brand colour the hover blob floods the card with - one step up from
 * the soft tint, and the same colour the tone's CTA button uses, so hovering
 * the card reads as "pressing" it.
 */
const TONE: Record<PitchTone, { surface: "$dangerSoft" | "$primarySoft"; fill: string }> = {
    help: { surface: "$dangerSoft", fill: "#ff5247" }, // danger / red.base
    volunteer: { surface: "$primarySoft", fill: "#06b7a7" }, // primary / teal.base
};

/**
 * §4.4 / §8 - the two bottom-corner illustrations for a pitch card.
 *
 * - "help": asking person (bottom-left) + two-people-in-frame (bottom-right).
 * - "volunteer": chair tilted left (bottom-left) + phone tilted right.
 */
function cornerArt(tone: PitchTone): { left: ReactNode; right: ReactNode } {
    if (tone === "help") {
        return {
            left: <PersonWithBubblesIllustration width={371} marginLeft={-50} marginBottom={-94} />,
            right: <ChatWindowMockup width={371} marginBottom={-94} />,
        };
    }
    return {
        left: <ChairIllustration width={228} rotate="-8deg" transformOrigin="center bottom" marginLeft={-20} />,
        right: <PhoneIllustration width={244} rotate="14deg" transformOrigin="center bottom" marginBottom={-112} />,
    };
}

const CARD_CLASS = "pitch-card";

/**
 * Hover/focus choreography, scoped to the card. All of it keys off `:hover` /
 * `:focus-visible` and the per-card `--fill` custom property, so there is no
 * JS animation loop - the browser compositor does the work.
 *
 * - `__blob`: a circle seeded at the cursor (`--bx`/`--by`, set on pointer move)
 *   that scales from 0 to flood the whole card with `--fill`.
 * - text turns light (`--pitch-title`/`--pitch-sub`) to stay legible on the fill.
 * - `__art`: the illustrations scale up a touch.
 * - `__cta` / `__arrow`: invert to a white chip so they read against the fill.
 */
const CARD_STYLE = `
.${CARD_CLASS}{position:relative;display:flex;flex:1;text-decoration:none;--pitch-title:#090a0a;--pitch-sub:#6c7072;border-radius:16px;}
.${CARD_CLASS}__blob{position:absolute;left:var(--bx,50%);top:var(--by,100%);width:1800px;height:1800px;margin:-900px 0 0 -900px;border-radius:9999px;background:var(--fill);transform:scale(0);transition:transform .55s cubic-bezier(.22,1,.36,1);z-index:0;pointer-events:none;}
.${CARD_CLASS}:hover .${CARD_CLASS}__blob,.${CARD_CLASS}:focus-visible .${CARD_CLASS}__blob{transform:scale(1);}
.${CARD_CLASS}:hover,.${CARD_CLASS}:focus-visible{--pitch-title:#ffffff;--pitch-sub:rgba(255,255,255,.92);}
.${CARD_CLASS}__art{transition:transform .55s cubic-bezier(.22,1,.36,1);transform-origin:center bottom;will-change:transform;}
.${CARD_CLASS}:hover .${CARD_CLASS}__art,.${CARD_CLASS}:focus-visible .${CARD_CLASS}__art{transform:scale(1.06);}
.${CARD_CLASS}__cta{background:var(--fill);color:#fff;transition:background .4s ease,color .4s ease;}
.${CARD_CLASS}:hover .${CARD_CLASS}__cta,.${CARD_CLASS}:focus-visible .${CARD_CLASS}__cta{background:#fff;color:var(--fill);}
.${CARD_CLASS}__arrow{background:var(--fill);color:#fff;transition:background .4s ease,color .4s ease,transform .4s ease;}
.${CARD_CLASS}:hover .${CARD_CLASS}__arrow,.${CARD_CLASS}:focus-visible .${CARD_CLASS}__arrow{background:#fff;color:var(--fill);transform:translateX(3px);}
.${CARD_CLASS}:focus-visible{outline:3px solid var(--fill);outline-offset:3px;}
@media (prefers-reduced-motion:reduce){.${CARD_CLASS}__blob,.${CARD_CLASS}__art,.${CARD_CLASS}__cta,.${CARD_CLASS}__arrow{transition:none;}}
`;

/** Seed the blob's origin at the pointer so it grows out from under the cursor. */
function seedBlobOrigin(event: MouseEvent<HTMLElement>) {
    const el = event.currentTarget;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--bx", `${event.clientX - rect.left}px`);
    el.style.setProperty("--by", `${event.clientY - rect.top}px`);
}

/**
 * §4.4 - a single "pitch" card: a large soft-rounded, colour-tinted entry point
 * with a heading, subtext, a pill CTA and tone artwork in the two bottom
 * corners. The whole card is one link; on hover a blob of the tone's brand
 * colour grows from the cursor to flood the card while the art lifts and the
 * text/CTA invert to read against it. Instantiated twice (help / volunteer).
 */
export function PitchCard({ tone, titleKey, subtitleKey, cta }: PitchCardContent) {
    const { t } = useTranslation();
    const { surface, fill } = TONE[tone];
    const art = cornerArt(tone);

    return (
        <RouterLink
            to={cta.href}
            className={CARD_CLASS}
            aria-label={`${t(titleKey)} - ${t(cta.labelKey)}`}
            style={{ "--fill": fill } as CSSProperties}
            onMouseEnter={seedBlobOrigin}
            onMouseMove={seedBlobOrigin}
        >
            <style>{CARD_STYLE}</style>

            <YStack
                flex={1}
                minHeight={500}
                paddingTop={46}
                paddingHorizontal="$xl"
                paddingBottom="$xl"
                borderRadius="$lg"
                backgroundColor={surface}
                position="relative"
                overflow="hidden"
                style={{ isolation: "isolate" }}
            >
                <span className={`${CARD_CLASS}__blob`} aria-hidden />

                {/* Artwork anchored into the two bottom corners, bleeding to the edges. */}
                <div
                    className={`${CARD_CLASS}__art`}
                    aria-hidden
                    style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "space-between",
                        paddingLeft: 8,
                        paddingRight: 8,
                        zIndex: 1,
                        pointerEvents: "none",
                    }}
                >
                    {art.left}
                    {art.right}
                </div>

                {/* Copy + CTA, above the blob. */}
                <YStack gap="$md" maxWidth={360} alignSelf="center" alignItems="center" position="relative" zIndex={2}>
                    <Typography variant="title2" tag="h3" align="center" style={{ color: "var(--pitch-title)" }}>
                        {t(titleKey)}
                    </Typography>
                    <Typography variant="regularSemibold" align="center" style={{ color: "var(--pitch-sub)" }}>
                        {t(subtitleKey)}
                    </Typography>
                    <XStack justifyContent="center">
                        <span
                            className={`${CARD_CLASS}__cta`}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                height: 44,
                                paddingLeft: 22,
                                paddingRight: 22,
                                borderRadius: 9999,
                                fontWeight: 600,
                                fontSize: 16,
                                lineHeight: "1",
                            }}
                        >
                            {t(cta.labelKey)}
                        </span>
                    </XStack>
                </YStack>

                {/* Decorative arrow echoing the CTA; the whole card is the real link. */}
                <span
                    className={`${CARD_CLASS}__arrow`}
                    aria-hidden
                    style={{
                        position: "absolute",
                        bottom: 24,
                        right: 24,
                        width: 52,
                        height: 52,
                        borderRadius: 9999,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 3,
                    }}
                >
                    <ArrowRight size={23} color="currentColor" strokeWidth={2.5} />
                </span>
            </YStack>
        </RouterLink>
    );
}
