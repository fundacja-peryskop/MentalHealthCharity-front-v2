import { Stack, Typography, XStack, YStack } from "@fundacja-peryskop/ui";
import { ArrowRight, HandHeart, Heart } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import helpingHands from "@/assets/static/donations/helping_hands.webp";
import usingPhone from "@/assets/static/donations/using_phone.webp";
import { useIconColor } from "../../layout/useIconColor";

/**
 * Staggered "collage" under the hero copy (mirrors the reference's floating-card
 * composition, re-expressed in our palette and type). Five cards of different
 * widths and heights sit in one row, each nudged down the Y axis by a different
 * amount so none share a top edge - a high / low / lowest / low / high rhythm.
 *
 * Desktop (>=960px): a 5-column grid with per-card `translateY`; the parent lets
 * it bleed past the page measure so the cards read large. Below 960px it becomes
 * an edge-to-edge marquee: the cards drift continuously left-to-right in an
 * infinite loop (pauses on touch/hover, static and swipeable under reduced
 * motion). Child-combinator selectors (specificity 0-2-0) win over Tamagui's
 * atomic classes; a plain `<div>` drives the grid because Tamagui's `Stack`
 * forces `display:flex` (the homepage grids do the same - see CLAUDE.md).
 */
const COLLAGE_CLASS = "donations-collage";
const MARQUEE_CLASS = "donations-marquee";
const COLLAGE_STYLE = `
.${COLLAGE_CLASS}{position:relative;display:grid;gap:16px;width:100%;align-items:start;padding-bottom:88px;
  grid-template-columns:1fr 1.12fr 0.95fr 1.12fr 1fr;}
.${COLLAGE_CLASS}>.dc-stat{height:400px;transform:translateY(0);}
.${COLLAGE_CLASS}>.dc-health{height:340px;transform:translateY(110px);}
.${COLLAGE_CLASS}>.dc-center{height:280px;transform:translateY(180px);}
.${COLLAGE_CLASS}>.dc-edu{height:340px;transform:translateY(120px);}
.${COLLAGE_CLASS}>.dc-help{height:400px;transform:translateY(0);}
.${COLLAGE_CLASS}__img{transition:transform .5s cubic-bezier(.22,1,.36,1);}
.${COLLAGE_CLASS}__photo:hover .${COLLAGE_CLASS}__img{transform:scale(1.05);}
.${MARQUEE_CLASS}{width:100vw;margin-left:calc(50% - 50vw);overflow:hidden;}
.${MARQUEE_CLASS}__track{display:flex;gap:14px;width:max-content;animation:dc-marquee 40s linear infinite;}
.${MARQUEE_CLASS}:hover .${MARQUEE_CLASS}__track{animation-play-state:paused;}
.${MARQUEE_CLASS}__item{flex:0 0 clamp(240px,72vw,290px);}
@keyframes dc-marquee{from{transform:translateX(calc(-50% - 7px));}to{transform:translateX(0);}}
@media (prefers-reduced-motion:reduce){
  .${COLLAGE_CLASS}__img{transition:none;}
  .${MARQUEE_CLASS}{overflow-x:auto;}
  .${MARQUEE_CLASS}__track{animation:none;}
}
`;

/** Shared card height in the mobile marquee. */
const MARQUEE_HEIGHT = 340;

const LINK_RESET: React.CSSProperties = { textDecoration: "none", display: "block", width: "100%", height: "100%" };

interface Props {
    pomagamUrl: string;
}

/** True once the viewport is at least `px` wide (SSR-safe, updates on resize). */
function useMinWidth(px: number): boolean {
    const query = `(min-width:${px}px)`;
    const [matches, setMatches] = useState(
        () => typeof window !== "undefined" && !!window.matchMedia && window.matchMedia(query).matches
    );
    useEffect(() => {
        if (typeof window === "undefined" || !window.matchMedia) return;
        const mq = window.matchMedia(query);
        const update = () => setMatches(mq.matches);
        update();
        mq.addEventListener?.("change", update);
        return () => mq.removeEventListener?.("change", update);
    }, [query]);
    return matches;
}

/** Smoothly scroll the donate band into view (respecting reduced-motion). */
function scrollToDonate() {
    const target = document.getElementById("donate");
    if (!target) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}

/** A fresh-green circular arrow button - our decorative/interactive accent. */
function ArrowDisc({ color }: { color: string }) {
    return (
        <Stack
            width={44}
            height={44}
            borderRadius="$full"
            alignItems="center"
            justifyContent="center"
            backgroundColor="$success"
            flexShrink={0}
        >
            <ArrowRight size={21} color={color} strokeWidth={2.5} />
        </Stack>
    );
}

/** The translucent "CTA strip" pinned to the bottom of the stat / help cards. */
function CtaStrip({ label, arrowColor }: { label: string; arrowColor: string }) {
    return (
        <XStack
            alignItems="center"
            justifyContent="space-between"
            gap="$sm"
            paddingVertical="$sm"
            paddingLeft="$md"
            paddingRight="$sm"
            borderRadius="$full"
            backgroundColor="rgba(255,255,255,0.14)"
        >
            <Typography variant="regularSemibold" color="$primaryText">
                {label}
            </Typography>
            <ArrowDisc color={arrowColor} />
        </XStack>
    );
}

type CardProps = { cls?: string; height?: number };

/** Dark stat card with a donate strip. */
function StatCard({ cls, height, pomagamUrl }: CardProps & { pomagamUrl: string }) {
    const { t } = useTranslation();
    const icon = useIconColor();
    const arrow = icon.color ?? "#022e2a";
    return (
        <YStack
            className={cls}
            width="100%"
            height={height}
            justifyContent="space-between"
            gap="$md"
            padding="$xl"
            borderRadius="$lg"
            backgroundColor="$primaryDarkest"
            overflow="hidden"
        >
            <YStack gap="$sm">
                <Stack
                    width={48}
                    height={48}
                    borderRadius="$md"
                    alignItems="center"
                    justifyContent="center"
                    backgroundColor="rgba(255,255,255,0.12)"
                >
                    <HandHeart size={24} color={icon.inverse} />
                </Stack>
                <Typography
                    tag="span"
                    color="$primaryLighter"
                    style={{ fontSize: "clamp(44px, 9vw, 60px)", lineHeight: "1", fontWeight: 800 }}
                >
                    {t("donations.collage.stat_value")}
                </Typography>
                <Typography variant="largeSemibold" color="$primaryText">
                    {t("donations.collage.stat_label")}
                </Typography>
            </YStack>
            <a href={pomagamUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                <CtaStrip label={t("donations.collage.stat_cta")} arrowColor={arrow} />
            </a>
        </YStack>
    );
}

/** A photo card: full-bleed image, top category label, bottom heading over a dark scrim. */
function PhotoCard({
    cls,
    height,
    src,
    alt,
    label,
    title,
}: CardProps & { src: string; alt: string; label: string; title: string }) {
    return (
        <Stack
            className={`${cls ?? ""} ${COLLAGE_CLASS}__photo`}
            width="100%"
            height={height}
            position="relative"
            borderRadius="$lg"
            overflow="hidden"
            backgroundColor="$primaryDarkest"
        >
            <img
                className={`${COLLAGE_CLASS}__img`}
                src={src}
                alt={alt}
                loading="lazy"
                decoding="async"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
            {/* Dark scrim so the overlaid copy stays legible. */}
            <Stack
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                style={{ background: "linear-gradient(to top, rgba(2,46,42,0.82) 0%, rgba(2,46,42,0) 62%)" }}
                pointerEvents="none"
            />
            <XStack
                position="absolute"
                top={16}
                left={16}
                paddingHorizontal="$sm"
                paddingVertical={5}
                borderRadius="$full"
                backgroundColor="rgba(0,0,0,0.38)"
            >
                <Typography variant="tinySemibold" color="$primaryText">
                    {label}
                </Typography>
            </XStack>
            <YStack position="absolute" left={18} right={18} bottom={18}>
                <Typography variant="title3" tag="h3" color="$primaryText">
                    {title}
                </Typography>
            </YStack>
        </Stack>
    );
}

/** Light "join in" card - scrolls to the donate band. */
function SocialCard({ cls, height }: CardProps) {
    const { t } = useTranslation();
    const icon = useIconColor();
    return (
        <YStack
            className={cls}
            width="100%"
            height={height}
            tag="button"
            role="button"
            onPress={scrollToDonate}
            justifyContent="space-between"
            gap="$md"
            padding="$xl"
            borderWidth={0}
            cursor="pointer"
            borderRadius="$lg"
            backgroundColor="$primarySoft"
            hoverStyle={{ backgroundColor: "$primaryLightest" }}
        >
            <Typography variant="title3" tag="span" color="$primaryTextSoft">
                {t("donations.collage.social_title")}
            </Typography>
            <XStack
                alignSelf="flex-start"
                alignItems="center"
                gap="$xs"
                paddingHorizontal="$md"
                paddingVertical="$sm"
                borderRadius="$full"
                backgroundColor="$primary"
            >
                <Typography variant="smallSemibold" color="$primaryText">
                    {t("donations.collage.social_cta")}
                </Typography>
                <Heart size={14} color={icon.inverse} />
            </XStack>
        </YStack>
    );
}

/** Tall teal accent card - a direct route to pomagam.pl. */
function HelpCard({ cls, height, pomagamUrl }: CardProps & { pomagamUrl: string }) {
    const { t } = useTranslation();
    const icon = useIconColor();
    const arrow = icon.color ?? "#022e2a";
    return (
        <a
            className={cls}
            href={pomagamUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={height ? { ...LINK_RESET, height } : LINK_RESET}
        >
            <YStack
                height="100%"
                justifyContent="space-between"
                gap="$lg"
                padding="$xl"
                borderRadius="$lg"
                backgroundColor="$primary"
                overflow="hidden"
                hoverStyle={{ backgroundColor: "$primaryHover" }}
                pressStyle={{ backgroundColor: "$primaryPress" }}
            >
                <Stack
                    width={48}
                    height={48}
                    borderRadius="$full"
                    alignItems="center"
                    justifyContent="center"
                    backgroundColor="rgba(255,255,255,0.18)"
                >
                    <Heart size={24} color={icon.inverse} />
                </Stack>
                <YStack gap="$lg">
                    <YStack gap="$xs">
                        <Typography variant="title3" tag="span" color="$primaryText">
                            {t("donations.collage.cta_title")}
                        </Typography>
                        <Typography variant="regularRegular" color="rgba(255,255,255,0.88)">
                            {t("donations.collage.cta_desc")}
                        </Typography>
                    </YStack>
                    <CtaStrip label={t("donations.collage.cta_bar")} arrowColor={arrow} />
                </YStack>
            </YStack>
        </a>
    );
}

export function HeroCollage({ pomagamUrl }: Props) {
    const { t } = useTranslation();
    const isDesktop = useMinWidth(960);

    if (isDesktop) {
        return (
            <div className={COLLAGE_CLASS}>
                <style>{COLLAGE_STYLE}</style>
                <StatCard cls="dc-stat" pomagamUrl={pomagamUrl} />
                <PhotoCard
                    cls="dc-health"
                    src={helpingHands}
                    alt={t("donations.photos.helping_hands")}
                    label={t("donations.collage.photo1_label")}
                    title={t("donations.collage.photo1_title")}
                />
                <SocialCard cls="dc-center" />
                <PhotoCard
                    cls="dc-edu"
                    src={usingPhone}
                    alt={t("donations.photos.phone")}
                    label={t("donations.collage.photo2_label")}
                    title={t("donations.collage.photo2_title")}
                />
                <HelpCard cls="dc-help" pomagamUrl={pomagamUrl} />
            </div>
        );
    }

    const cards: ReactNode[] = [
        <StatCard key="stat" height={MARQUEE_HEIGHT} pomagamUrl={pomagamUrl} />,
        <PhotoCard
            key="health"
            height={MARQUEE_HEIGHT}
            src={helpingHands}
            alt={t("donations.photos.helping_hands")}
            label={t("donations.collage.photo1_label")}
            title={t("donations.collage.photo1_title")}
        />,
        <SocialCard key="center" height={MARQUEE_HEIGHT} />,
        <PhotoCard
            key="edu"
            height={MARQUEE_HEIGHT}
            src={usingPhone}
            alt={t("donations.photos.phone")}
            label={t("donations.collage.photo2_label")}
            title={t("donations.collage.photo2_title")}
        />,
        <HelpCard key="help" height={MARQUEE_HEIGHT} pomagamUrl={pomagamUrl} />,
    ];

    // The set is rendered twice so the track can loop seamlessly; the copy is
    // hidden from assistive tech so each card is announced once.
    return (
        <div className={MARQUEE_CLASS} role="group" aria-label={t("donations.collage.aria")}>
            <style>{COLLAGE_STYLE}</style>
            <div className={`${MARQUEE_CLASS}__track`}>
                {[...cards, ...cards].map((card, index) => (
                    <div
                        key={index}
                        className={`${MARQUEE_CLASS}__item`}
                        aria-hidden={index >= cards.length || undefined}
                    >
                        {card}
                    </div>
                ))}
            </div>
        </div>
    );
}
