import { Section, Stack, Typography, XStack, YStack } from "@fundacja-peryskop/ui";
import {
    ArrowRight,
    Globe,
    Heart,
    HeartHandshake,
    type LucideIcon,
    MessageCircleHeart,
    Monitor,
    ShieldCheck,
    Sparkles,
    Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { DonationBox } from "../modules/donations/components/DonationBox";
import { IconBadge } from "../modules/donations/components/IconBadge";
import { ReadMoreProse } from "../modules/donations/components/ReadMoreProse";
import { StatCounter } from "../modules/donations/components/StatCounter";
import { PageContainer } from "../modules/layout/PageContainer";
import { useIconColor } from "../modules/layout/useIconColor";

const BANK_ACCOUNT = "62 1870 1045 2083 1080 5210 0001";
const POMAGAM_URL = "https://pomagam.pl/rw9bkc";
const SUPPORTERS = 6;

/** Goals grid: one column on mobile, two from 700px (a tidy 2×2). */
const GOALS_CLASS = "donations-goals-grid";
const GOALS_STYLE = `.${GOALS_CLASS}{display:grid;gap:16px;grid-template-columns:1fr;width:100%;}@media (min-width:700px){.${GOALS_CLASS}{grid-template-columns:repeat(2,1fr);}}`;

/** Smoothly scroll to the donate band (respecting reduced-motion). */
function scrollToDonate() {
    const target = document.getElementById("donate");
    if (!target) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}

const DonationsScreen = () => {
    const { t } = useTranslation();
    const icon = useIconColor();
    const primary = icon.primary ?? "";

    const trust = [
        { icon: ShieldCheck, label: t("donations.trust.anonymous") },
        { icon: Heart, label: t("donations.trust.free") },
        { icon: Users, label: t("donations.trust.supervised") },
    ];

    const stats = [
        { value: SUPPORTERS, suffix: "+", label: t("donations.stats.supporters_label") },
        { value: 100, suffix: "%", label: t("donations.stats.anonymous_label") },
        { value: 0, suffix: " zł", label: t("donations.stats.cost_label") },
    ];

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
        <YStack>
            <style>{GOALS_STYLE}</style>

            {/* Hero */}
            <Section backgroundColor="$primarySoft" alignItems="center" paddingVertical="$xxxl">
                <PageContainer alignItems="center" gap="$lg" maxWidth={720}>
                    <IconBadge icon={Heart} color={primary} size={64} background="$background" />
                    <Typography variant="title1" tag="h1" align="center" $sm={{ fontSize: 34, lineHeight: 40 }}>
                        {t("donations.hero_title")}
                    </Typography>
                    <Typography variant="largeRegular" muted align="center" maxWidth={520}>
                        {t("donations.hero_subtitle")}
                    </Typography>

                    <XStack flexWrap="wrap" gap="$sm" justifyContent="center">
                        {trust.map(({ icon: TrustIcon, label }) => (
                            <XStack
                                key={label}
                                alignItems="center"
                                gap="$xs"
                                paddingHorizontal="$md"
                                paddingVertical="$xs"
                                borderRadius="$full"
                                backgroundColor="$background"
                            >
                                <TrustIcon size={15} color={primary} />
                                <Typography variant="smallSemibold" color="$primaryTextSoft">
                                    {label}
                                </Typography>
                            </XStack>
                        ))}
                    </XStack>

                    <Stack
                        tag="button"
                        role="button"
                        onPress={scrollToDonate}
                        flexDirection="row"
                        alignItems="center"
                        gap="$sm"
                        marginTop="$sm"
                        paddingHorizontal="$xl"
                        paddingVertical="$md"
                        borderRadius="$full"
                        borderWidth={0}
                        cursor="pointer"
                        backgroundColor="$primary"
                        hoverStyle={{ backgroundColor: "$primaryHover" }}
                        pressStyle={{ backgroundColor: "$primaryPress" }}
                    >
                        <Typography variant="regularSemibold" color="$primaryText">
                            {t("donations.donate.cta")}
                        </Typography>
                        <ArrowRight size={18} color={icon.inverse} />
                    </Stack>
                </PageContainer>
            </Section>

            {/* Trust stats */}
            <Section alignItems="center" paddingVertical="$xxl">
                <PageContainer alignItems="center">
                    <XStack
                        width="100%"
                        maxWidth={720}
                        alignSelf="center"
                        justifyContent="space-around"
                        alignItems="flex-start"
                        flexWrap="wrap"
                        gap="$xl"
                    >
                        {stats.map((stat) => (
                            <StatCounter key={stat.label} value={stat.value} suffix={stat.suffix} label={stat.label} />
                        ))}
                    </XStack>
                </PageContainer>
            </Section>

            {/* Our goals */}
            <Section backgroundColor="$backgroundHover" alignItems="center" paddingVertical="$xxxl">
                <PageContainer gap="$xl" alignItems="center" maxWidth={1000}>
                    <YStack gap="$sm" alignItems="center">
                        <Typography variant="title2" tag="h2" align="center">
                            {t("donations.goals.title")}
                        </Typography>
                    </YStack>
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

            {/* What is the Foundation */}
            <Section alignItems="center" paddingVertical="$xxxl">
                <PageContainer gap="$lg" maxWidth={780}>
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
                </PageContainer>
            </Section>

            {/* How we work */}
            <Section backgroundColor="$backgroundHover" alignItems="center" paddingVertical="$xxxl">
                <PageContainer gap="$lg" maxWidth={780}>
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
                        <XStack
                            width="100%"
                            gap="$md"
                            alignItems="flex-start"
                            padding="$lg"
                            borderRadius="$md"
                            borderWidth={1}
                            borderColor="$primaryBorder"
                            backgroundColor="$primarySoft"
                        >
                            <Stack marginTop={2}>
                                <MessageCircleHeart size={22} color={primary} />
                            </Stack>
                            <YStack gap="$xs" flex={1}>
                                <Typography variant="regularSemibold" color="$primaryTextSoft">
                                    {t("donations.how_we_work.p3")}
                                </Typography>
                                <Typography variant="smallRegular" color="$primaryTextSoft">
                                    {t("donations.how_we_work.p4")}
                                </Typography>
                            </YStack>
                        </XStack>
                        <Typography variant="regularSemibold" style={{ fontStyle: "italic" }}>
                            {t("donations.how_we_work.p5")}
                        </Typography>
                    </YStack>
                </PageContainer>
            </Section>

            {/* Donate */}
            <div id="donate" />
            <Section backgroundColor="$primary" alignItems="center" paddingVertical="$xxxl">
                <PageContainer alignItems="center" gap="$lg" maxWidth={560}>
                    <IconBadge icon={Heart} color={primary} size={56} background="rgba(255,255,255,0.15)" />
                    <Typography variant="title2" tag="h2" align="center" color="$primaryText">
                        {t("donations.donate.title")}
                    </Typography>
                    <Typography variant="largeRegular" align="center" color="rgba(255,255,255,0.88)" maxWidth={460}>
                        {t("donations.donate.subtitle")}
                    </Typography>

                    <XStack
                        alignItems="center"
                        gap="$xs"
                        marginBottom="$sm"
                        paddingHorizontal="$md"
                        paddingVertical="$xs"
                        borderRadius="$full"
                        backgroundColor="rgba(255,255,255,0.15)"
                    >
                        <Users size={16} color="white" />
                        <Typography variant="smallSemibold" color="$primaryText">
                            {t("donations.donate.supporters", { count: SUPPORTERS })}
                        </Typography>
                    </XStack>

                    <DonationBox bankAccount={BANK_ACCOUNT} pomagamUrl={POMAGAM_URL} />
                </PageContainer>
            </Section>
        </YStack>
    );
};

export default DonationsScreen;
