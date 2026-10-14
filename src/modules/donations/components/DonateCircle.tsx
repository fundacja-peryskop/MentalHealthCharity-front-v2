import { Section, Stack, Typography, XStack, YStack } from "@fundacja-peryskop/ui";
import { Check, Copy, Heart, Users } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { PageContainer } from "../../layout/PageContainer";

/**
 * Scoped styles for the circular donate composition. Plain CSS (not Tamagui
 * props) because it relies on SVG text-on-a-path, keyframe animation and
 * layered box-shadows. Colours mirror DS palette values (primary / green
 * scales) since SVG fills and gradients cannot take theme tokens.
 *
 * - `__disc`: the large, almost-fullscreen circle (sized by viewport width and
 *   height so it always fits on screen). It clips to its own circle: the ring
 *   boxes are squares, and a rotating square's bounding box grows up to √2×,
 *   which would otherwise push past the viewport edge on phones.
 * - `__ring`: two concentric translucent bands carrying text, rotating slowly in
 *   opposite directions.
 * - `__orb`: the central "3D" button - a lit radial-gradient sphere with inner
 *   shading, a soft drop shadow, a gloss highlight and a pulsing halo. It floats
 *   gently and swells on hover.
 *
 * All motion is switched off under `prefers-reduced-motion`.
 */
const CLASS = "donate-circle";
const STYLE = `
@keyframes ${CLASS}-spin{to{transform:rotate(360deg);}}
@keyframes ${CLASS}-float{0%,100%{transform:translateY(0);}50%{transform:translateY(-8px);}}
@keyframes ${CLASS}-halo{0%{box-shadow:0 0 0 0 rgba(125,222,134,.45);}100%{box-shadow:0 0 0 34px rgba(125,222,134,0);}}
.${CLASS}__disc{position:relative;width:min(92vw,720px,82vh);aspect-ratio:1;border-radius:9999px;overflow:hidden;
  display:flex;align-items:center;justify-content:center;
  background:radial-gradient(circle at 50% 50%,rgba(6,183,167,.22) 0%,rgba(6,183,167,.07) 55%,rgba(6,183,167,0) 72%);
  box-shadow:inset 0 0 0 1px rgba(193,237,233,.14);}
.${CLASS}__ring{position:absolute;pointer-events:none;}
.${CLASS}__ring svg{display:block;width:100%;height:100%;overflow:visible;}
.${CLASS}__ring--outer{inset:2%;animation:${CLASS}-spin 48s linear infinite;}
.${CLASS}__ring--inner{inset:15%;animation:${CLASS}-spin 36s linear infinite reverse;}
.${CLASS}__band{fill:none;stroke-width:24;}
.${CLASS}__ring--outer .${CLASS}__band{stroke:rgba(193,237,233,.08);}
.${CLASS}__ring--inner .${CLASS}__band{stroke:rgba(125,222,134,.08);}
.${CLASS}__text{font-size:11px;font-weight:700;letter-spacing:3px;}
.${CLASS}__ring--outer .${CLASS}__text{fill:#c1ede9;}
.${CLASS}__ring--inner .${CLASS}__text{fill:#7dde86;}
.${CLASS}__float{position:relative;z-index:1;animation:${CLASS}-float 5s ease-in-out infinite;}
.${CLASS}__orb{position:relative;width:clamp(150px,34vw,240px);aspect-ratio:1;border-radius:9999px;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;text-decoration:none;
  background:radial-gradient(circle at 34% 28%,#83dbd3 0%,#06b7a7 42%,#05897d 72%,#035c54 100%);
  box-shadow:inset 0 -16px 32px rgba(2,46,42,.45),inset 0 10px 22px rgba(255,255,255,.22),0 26px 50px rgba(0,0,0,.45);
  transition:transform .4s cubic-bezier(.22,1,.36,1);}
.${CLASS}__orb::before{content:"";position:absolute;top:9%;left:22%;width:46%;height:26%;border-radius:50%;
  background:radial-gradient(ellipse at 50% 40%,rgba(255,255,255,.55),rgba(255,255,255,0) 70%);pointer-events:none;}
.${CLASS}__orb::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;
  animation:${CLASS}-halo 2.6s cubic-bezier(.22,1,.36,1) infinite;}
.${CLASS}__orb:hover{transform:scale(1.07);}
.${CLASS}__orb:active{transform:scale(.97);}
.${CLASS}__orb:focus-visible{outline:3px solid #7dde86;outline-offset:6px;}
@media (prefers-reduced-motion:reduce){
  .${CLASS}__ring--outer,.${CLASS}__ring--inner,.${CLASS}__float,.${CLASS}__orb::after{animation:none;}
  .${CLASS}__orb{transition:none;}
  .${CLASS}__orb:hover,.${CLASS}__orb:active{transform:none;}
}
`;

/** Circle of radius 138 in a 300×300 box, starting at 9 o'clock and running clockwise. */
const RING_PATH = "M 150,150 m -138,0 a 138,138 0 1,1 276,0 a 138,138 0 1,1 -276,0";
/** 2π·138 - the text is stretched to exactly fill the circumference. */
const RING_LENGTH = 867;

/** A rotating translucent band with a phrase repeated around it (decorative). */
function TextRing({ id, variant, phrase }: { id: string; variant: "outer" | "inner"; phrase: string }) {
    const text = `${phrase} • ${phrase} • `;
    return (
        <div className={`${CLASS}__ring ${CLASS}__ring--${variant}`} aria-hidden>
            <svg viewBox="0 0 300 300">
                <defs>
                    <path id={id} d={RING_PATH} />
                </defs>
                <circle className={`${CLASS}__band`} cx="150" cy="150" r="138" />
                <text className={`${CLASS}__text`} dominantBaseline="central">
                    <textPath href={`#${id}`} textLength={RING_LENGTH} lengthAdjust="spacing">
                        {text}
                    </textPath>
                </text>
            </svg>
        </div>
    );
}

interface Props {
    pomagamUrl: string;
    bankAccount: string;
    supporters: number;
}

/**
 * "Darowizny" - the page's closing focal point. A large, almost-fullscreen circle
 * wrapped in two rotating bands of text, with a big animated "3D" donate button
 * at its centre that opens pomagam.pl. Bank transfer stays one tap away below.
 * Anchored as `#donate` so other CTAs on the page can scroll here.
 */
export function DonateCircle({ pomagamUrl, bankAccount, supporters }: Props) {
    const { t, i18n } = useTranslation();
    const [copied, setCopied] = useState(false);
    const upper = (key: string) => t(key).toLocaleUpperCase(i18n.language);

    const copyAccount = async () => {
        try {
            await navigator.clipboard.writeText(bankAccount);
            setCopied(true);
            toast.success(t("common.copied_to_clipboard"));
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error(t("common.error", { defaultValue: "Coś poszło nie tak" }));
        }
    };

    return (
        <Section id="donate" backgroundColor="$primaryDarkest" alignItems="center" paddingVertical="$xxxl">
            <style>{STYLE}</style>
            <PageContainer alignItems="center" gap="$xl">
                <YStack alignItems="center" gap="$sm" maxWidth={560}>
                    <Typography variant="title2" tag="h2" align="center" color="$primaryText">
                        {t("donations.donate.title")}
                    </Typography>
                    <Typography variant="largeRegular" align="center" color="rgba(255,255,255,0.78)">
                        {t("donations.donate.subtitle")}
                    </Typography>
                </YStack>

                <div className={`${CLASS}__disc`}>
                    <TextRing id="donate-ring-outer" variant="outer" phrase={upper("donations.donate.ring_primary")} />
                    <TextRing
                        id="donate-ring-inner"
                        variant="inner"
                        phrase={upper("donations.donate.ring_secondary")}
                    />
                    <div className={`${CLASS}__float`}>
                        <a
                            className={`${CLASS}__orb`}
                            href={pomagamUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={t("donations.donate.cta")}
                        >
                            <Heart size={34} color="#ffffff" fill="#ffffff" />
                            <Typography
                                tag="span"
                                color="$primaryText"
                                style={{ fontSize: "clamp(20px, 4.4vw, 28px)", lineHeight: "1", fontWeight: 800 }}
                            >
                                {t("donations.donate.circle_cta")}
                            </Typography>
                        </a>
                    </div>
                </div>

                <YStack alignItems="center" gap="$md">
                    <XStack
                        alignItems="center"
                        gap="$xs"
                        paddingHorizontal="$md"
                        paddingVertical="$xs"
                        borderRadius="$full"
                        backgroundColor="rgba(255,255,255,0.08)"
                    >
                        <Users size={16} color="#c1ede9" />
                        <Typography variant="smallSemibold" color="$primaryLightest">
                            {t("donations.donate.supporters", { count: supporters })}
                        </Typography>
                    </XStack>

                    <XStack flexWrap="wrap" alignItems="center" justifyContent="center" gap="$sm">
                        <Typography variant="smallRegular" color="rgba(255,255,255,0.7)">
                            {t("donations.donate.transfer_label")}
                        </Typography>
                        <Typography
                            variant="regularSemibold"
                            color="$primaryText"
                            style={{ fontFamily: "monospace", letterSpacing: "0.02em" }}
                        >
                            {bankAccount}
                        </Typography>
                        <Stack
                            tag="button"
                            role="button"
                            onPress={copyAccount}
                            aria-label={t("donations.donate.copy_account")}
                            flexDirection="row"
                            alignItems="center"
                            gap="$xs"
                            paddingHorizontal="$md"
                            paddingVertical="$xs"
                            borderRadius="$full"
                            borderWidth={1}
                            borderColor="rgba(193,237,233,0.3)"
                            cursor="pointer"
                            backgroundColor="$backgroundTransparent"
                            hoverStyle={{ backgroundColor: "rgba(255,255,255,0.08)" }}
                        >
                            {copied ? <Check size={14} color="#7dde86" /> : <Copy size={14} color="#c1ede9" />}
                            <Typography variant="smallSemibold" color="$primaryLightest">
                                {copied ? t("common.copied_to_clipboard") : t("donations.donate.copy_account")}
                            </Typography>
                        </Stack>
                    </XStack>
                </YStack>
            </PageContainer>
        </Section>
    );
}
