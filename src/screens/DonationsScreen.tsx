import { Section, Stack, Typography, XStack, YStack } from "@fundacja-peryskop/ui";
import { Globe, Heart, HeartHandshake, type LucideIcon, Monitor, ShieldCheck, Sparkles, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import manUsingComputer from "@/assets/static/donations/man_using_computer.webp";
import manyHandsOnComputer from "@/assets/static/donations/many_hands_on_computer.webp";
import { DonateCircle } from "../modules/donations/components/DonateCircle";
import { DonationPhoto } from "../modules/donations/components/DonationPhoto";
import { HeroCollage } from "../modules/donations/components/HeroCollage";
import { IconBadge } from "../modules/donations/components/IconBadge";
import { ReadMoreProse } from "../modules/donations/components/ReadMoreProse";
import { SupportWays } from "../modules/donations/components/SupportWays";
import { PageContainer } from "../modules/layout/PageContainer";
import { useIconColor } from "../modules/layout/useIconColor";

const BANK_ACCOUNT = "62 1870 1045 2083 1080 5210 0001";
const POMAGAM_URL = "https://pomagam.pl/rw9bkc";
const SUPPORTERS = 6;

const ANCHOR_RESET: React.CSSProperties = { textDecoration: "none", display: "inline-flex" };

/** Goals grid: one column on mobile, two from 700px (a tidy 2×2). */
const GOALS_CLASS = "donations-goals-grid";

/**
 * Two-column "editorial" row (prose + photo). One column on mobile (text first,
 * photo below), two balanced columns from 900px. `--reverse` flips the columns
 * on desktop so photo sits on the left while keeping text first on mobile.
 * Scoped CSS is used because the DS media props resolve unreliably here (see
 * CLAUDE.md).
 */
const SPLIT_CLASS = "donations-split";
const LAYOUT_STYLE = `
.${GOALS_CLASS}{display:grid;gap:16px;grid-template-columns:1fr;width:100%;}
@media (min-width:700px){.${GOALS_CLASS}{grid-template-columns:repeat(2,1fr);}}
.${SPLIT_CLASS}{display:grid;gap:32px;grid-template-columns:1fr;align-items:center;width:100%;}
@media (min-width:900px){.${SPLIT_CLASS}{grid-template-columns:1fr 1fr;gap:48px;}.${SPLIT_CLASS}--reverse>*:first-child{order:2;}}
`;

/** Smoothly scroll an anchor into view (respecting reduced-motion). */
function scrollToId(id: string) {
    const target = document.getElementById(id);
    if (!target) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}

/**
 * "Wesprzyj nas" (donations) page. Built on the homepage's visual language: an
 * airy centered hero above a staggered card collage, a single teal feature card
 * framing how easy it is to give, warm editorial photo rows telling the
 * Foundation's story, the goals grid, and a large circular donate section as
 * the page's conversion focal point.
 */
const DonationsScreen = () => {
    const { t } = useTranslation();
    const icon = useIconColor();
    const primary = icon.primary ?? "";

    const goals: { icon: LucideIcon; title: string; desc: string }[] = [
        { icon: HeartHandshake, title: t("donations.goals.goal1_title"), desc: t("donations.goals.goal1_desc") },
        { icon: Users, title: t("donations.goals.goal2_title"), desc: t("donations.goals.goal2_desc") },
        { icon: ShieldCheck, title: t("donations.goals.goal3_title"), desc: t("donations.goals.goal3_desc") },
        { icon: Monitor, title: t("donations.goals.goal4_title"), desc: t("donations.goals.goal4_desc") },
    ];

    const aboutParagraphs = ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8", "p9"].map((p) =>
        t(`donations.what_is.${p}`)
    );

    return (
        <YStack backgroundColor="$background">
            <style>{LAYOUT_STYLE}</style>

            {/* Hero - airy centered copy above a staggered card collage. `overflow-x: clip`
                contains the full-bleed mobile marquee without creating a scroll container. */}
            <Section alignItems="center" paddingTop="$xxxl" paddingBottom="$xxl" style={{ overflowX: "clip" }}>
                <PageContainer alignItems="center">
                    <YStack alignItems="center" gap="$lg" maxWidth={720}>
                        <IconBadge icon={Heart} color={primary} size={64} background="$primarySoft" />
                        <Typography
                            variant="title1"
                            tag="h1"
                            align="center"
                            maxWidth={640}
                            style={{ fontSize: "clamp(34px, 5vw, 48px)", lineHeight: "1.15" }}
                        >
                            {t("donations.hero_title")}
                        </Typography>
                        <Typography variant="largeRegular" muted align="center" maxWidth={540}>
                            {t("donations.hero_subtitle")}
                        </Typography>

                        <XStack flexWrap="wrap" gap="$sm" justifyContent="center" marginTop="$xs">
                            <a href={POMAGAM_URL} target="_blank" rel="noopener noreferrer" style={ANCHOR_RESET}>
                                <XStack
                                    alignItems="center"
                                    gap="$sm"
                                    paddingHorizontal="$xl"
                                    paddingVertical="$md"
                                    borderRadius="$full"
                                    backgroundColor="$primary"
                                    hoverStyle={{ backgroundColor: "$primaryHover" }}
                                    pressStyle={{ backgroundColor: "$primaryPress" }}
                                >
                                    <Typography variant="regularSemibold" color="$primaryText">
                                        {t("donations.hero_cta")}
                                    </Typography>
                                    <Heart size={18} color={icon.inverse} />
                                </XStack>
                            </a>
                            <Stack
                                tag="button"
                                role="button"
                                onPress={() => scrollToId("mission")}
                                flexDirection="row"
                                alignItems="center"
                                gap="$sm"
                                paddingHorizontal="$xl"
                                paddingVertical="$md"
                                borderRadius="$full"
                                borderWidth={1}
                                borderColor="$primaryBorder"
                                cursor="pointer"
                                backgroundColor="$backgroundTransparent"
                                hoverStyle={{ backgroundColor: "$primarySoft" }}
                            >
                                <Typography variant="regularSemibold" color="$primaryTextSoft">
                                    {t("donations.hero_secondary")}
                                </Typography>
                            </Stack>
                        </XStack>
                    </YStack>
                </PageContainer>

                {/* The collage bleeds past the shared 1200 measure so the cards read large. */}
                <Stack
                    width="100%"
                    maxWidth={1440}
                    alignSelf="center"
                    marginTop="$xxl"
                    paddingHorizontal="$lg"
                    $sm={{ paddingHorizontal: "$xl" }}
                >
                    <HeroCollage pomagamUrl={POMAGAM_URL} />
                </Stack>
            </Section>

            {/* How easy it is to give - the single teal feature card. */}
            <Section alignItems="center" paddingBottom="$xxxl">
                <PageContainer maxWidth={1120}>
                    <SupportWays />
                </PageContainer>
            </Section>

            {/* What is the Foundation - prose paired with a supporting photo. */}
            <Section id="mission" backgroundColor="$backgroundHover" alignItems="center" paddingVertical="$xxxl">
                <PageContainer maxWidth={1040}>
                    <div className={SPLIT_CLASS}>
                        <YStack gap="$lg">
                            <XStack alignItems="center" gap="$md">
                                <IconBadge icon={Sparkles} color={primary} />
                                <Typography variant="title2" tag="h2">
                                    {t("donations.what_is.title")}
                                </Typography>
                            </XStack>
                            <Stack height={1} backgroundColor="$borderColor" />
                            <ReadMoreProse
                                paragraphs={aboutParagraphs}
                                initialCount={3}
                                moreLabel={t("donations.read_more")}
                                lessLabel={t("donations.read_less")}
                                accentColor={primary}
                            />
                        </YStack>
                        <DonationPhoto src={manUsingComputer} alt={t("donations.photos.computer")} maxWidth={460} />
                    </div>
                </PageContainer>
            </Section>

            {/* How we work - photo on the left (desktop), text on the right. */}
            <Section alignItems="center" paddingVertical="$xxxl">
                <PageContainer maxWidth={1040}>
                    <div className={`${SPLIT_CLASS} ${SPLIT_CLASS}--reverse`}>
                        <YStack gap="$lg">
                            <XStack alignItems="center" gap="$md">
                                <IconBadge icon={Globe} color={primary} />
                                <Typography variant="title2" tag="h2">
                                    {t("donations.how_we_work.title")}
                                </Typography>
                            </XStack>
                            <Stack height={1} backgroundColor="$borderColor" />
                            <YStack gap="$md" width="100%">
                                <Typography variant="regularRegular" muted>
                                    {t("donations.how_we_work.p1")}
                                </Typography>
                                <Typography variant="regularRegular" muted>
                                    {t("donations.how_we_work.p2")}
                                </Typography>
                                <Typography variant="regularRegular" muted>
                                    {t("donations.how_we_work.p3")}
                                </Typography>
                                <Typography variant="regularRegular" muted>
                                    {t("donations.how_we_work.p4")}
                                </Typography>
                                <Typography variant="regularSemibold" style={{ fontStyle: "italic" }}>
                                    {t("donations.how_we_work.p5")}
                                </Typography>
                            </YStack>
                        </YStack>
                        <DonationPhoto
                            src={manyHandsOnComputer}
                            alt={t("donations.photos.hands_computer")}
                            maxWidth={460}
                        />
                    </div>
                </PageContainer>
            </Section>

            {/* Our goals - a 2×2 grid of outlined cards with the homepage lift-on-hover. */}
            <Section backgroundColor="$backgroundHover" alignItems="center" paddingVertical="$xxxl">
                <PageContainer gap="$xl" alignItems="center" maxWidth={1000}>
                    <Typography variant="title2" tag="h2" align="center">
                        {t("donations.goals.title")}
                    </Typography>
                    <div className={GOALS_CLASS}>
                        {goals.map(({ icon: GoalIcon, title, desc }) => (
                            <YStack
                                key={title}
                                gap="$md"
                                padding="$xl"
                                borderRadius="$lg"
                                borderWidth={1}
                                borderColor="$borderColor"
                                backgroundColor="$background"
                                hoverStyle={{ borderColor: "$primary", y: -2 }}
                            >
                                <IconBadge icon={GoalIcon} color={primary} />
                                <Typography variant="largeBold" tag="h3">
                                    {title}
                                </Typography>
                                <Typography variant="smallRegular" muted>
                                    {desc}
                                </Typography>
                            </YStack>
                        ))}
                    </div>
                </PageContainer>
            </Section>

            {/* Donate - a large, unconventional circular focal point for the page. */}
            <DonateCircle pomagamUrl={POMAGAM_URL} bankAccount={BANK_ACCOUNT} supporters={SUPPORTERS} />
        </YStack>
    );
};

export default DonationsScreen;
