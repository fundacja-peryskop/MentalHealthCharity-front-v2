import { Section, Stack, Typography, XStack, YStack } from "@fundacja-peryskop/ui";
import {
    ArrowRight,
    Copy,
    ExternalLink,
    Globe,
    Heart,
    HeartHandshake,
    type LucideIcon,
    MessageCircleHeart,
    Monitor,
    ShieldCheck,
    Users,
} from "lucide-react";
import { useCallback } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { PageContainer } from "../modules/layout/PageContainer";
import { useIconColor } from "../modules/layout/useIconColor";

const BANK_ACCOUNT = "62 1870 1045 2083 1080 5210 0001";
const POMAGAM_URL = "https://pomagam.pl/rw9bkc";
const ANCHOR_RESET: React.CSSProperties = { textDecoration: "none", display: "inline-flex" };

/** Brand-tinted rounded square holding a lucide icon. */
function IconSquare({ icon: Icon, color, size = 48 }: { icon: LucideIcon; color: string; size?: number }) {
    return (
        <Stack
            width={size}
            height={size}
            borderRadius="$md"
            alignItems="center"
            justifyContent="center"
            backgroundColor="$primarySoft"
        >
            <Icon size={size * 0.5} color={color} />
        </Stack>
    );
}

const DonationsScreen = () => {
    const { t } = useTranslation();
    const icon = useIconColor();

    const handleCopyAccount = useCallback(() => {
        navigator.clipboard.writeText(BANK_ACCOUNT);
        toast.success(t("common.copied_to_clipboard"));
    }, [t]);

    const goals = [
        { icon: HeartHandshake, title: t("donations.goals.goal1_title"), desc: t("donations.goals.goal1_desc") },
        { icon: Users, title: t("donations.goals.goal2_title"), desc: t("donations.goals.goal2_desc") },
        { icon: ShieldCheck, title: t("donations.goals.goal3_title"), desc: t("donations.goals.goal3_desc") },
        { icon: Monitor, title: t("donations.goals.goal4_title"), desc: t("donations.goals.goal4_desc") },
    ];

    const whatIs = ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8", "p9"];

    return (
        <YStack>
            {/* Hero */}
            <Section backgroundColor="$primarySoft" alignItems="center" paddingVertical="$xxxl">
                <PageContainer alignItems="center" gap="$lg" maxWidth={720}>
                    <IconSquare icon={Heart} color={icon.primary ?? ""} size={64} />
                    <Typography variant="title1" tag="h1" align="center" $sm={{ fontSize: 34, lineHeight: 40 }}>
                        {t("donations.hero_title")}
                    </Typography>
                    <Typography variant="largeRegular" muted align="center" maxWidth={520}>
                        {t("donations.hero_subtitle")}
                    </Typography>
                </PageContainer>
            </Section>

            {/* What is the Foundation */}
            <Section alignItems="center" paddingVertical="$xxxl">
                <PageContainer gap="$lg" maxWidth={780}>
                    <Typography variant="title2" tag="h2">
                        {t("donations.what_is.title")}
                    </Typography>
                    <Stack height={1} backgroundColor="$borderColor" />
                    <YStack gap="$md" width="100%">
                        {whatIs.map((p) => (
                            <Typography key={p} variant="regularRegular" muted width="100%">
                                {t(`donations.what_is.${p}`)}
                            </Typography>
                        ))}
                    </YStack>
                </PageContainer>
            </Section>

            {/* Our goals */}
            <Section backgroundColor="$backgroundHover" alignItems="center" paddingVertical="$xxxl">
                <PageContainer gap="$xl" alignItems="center" maxWidth={1000}>
                    <Typography variant="title2" tag="h2" align="center">
                        {t("donations.goals.title")}
                    </Typography>
                    <XStack flexWrap="wrap" gap="$lg" justifyContent="center">
                        {goals.map(({ icon: GoalIcon, title, desc }) => (
                            <YStack
                                key={title}
                                width="100%"
                                $sm={{ width: "48%" }}
                                gap="$md"
                                padding="$xl"
                                borderRadius="$lg"
                                borderWidth={1}
                                borderColor="$borderColor"
                                backgroundColor="$background"
                            >
                                <IconSquare icon={GoalIcon} color={icon.primary ?? ""} />
                                <Typography variant="largeBold" tag="h3">
                                    {title}
                                </Typography>
                                <Typography variant="smallRegular" muted>
                                    {desc}
                                </Typography>
                            </YStack>
                        ))}
                    </XStack>
                </PageContainer>
            </Section>

            {/* How we work */}
            <Section alignItems="center" paddingVertical="$xxxl">
                <PageContainer gap="$lg" maxWidth={780}>
                    <XStack alignItems="center" gap="$md">
                        <IconSquare icon={Globe} color={icon.primary ?? ""} />
                        <Typography variant="title2" tag="h2">
                            {t("donations.how_we_work.title")}
                        </Typography>
                    </XStack>
                    <Stack height={1} backgroundColor="$borderColor" />
                    <YStack gap="$md" width="100%">
                        <Typography variant="regularRegular" muted width="100%">
                            {t("donations.how_we_work.p1")}
                        </Typography>
                        <Typography variant="regularRegular" muted width="100%">
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
                                <MessageCircleHeart size={22} color={icon.primary} />
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
                        <Typography variant="regularSemibold" width="100%" style={{ fontStyle: "italic" }}>
                            {t("donations.how_we_work.p5")}
                        </Typography>
                    </YStack>
                </PageContainer>
            </Section>

            {/* Donate CTA */}
            <Section backgroundColor="$primary" alignItems="center" paddingVertical="$xxxl">
                <PageContainer alignItems="center" gap="$lg" maxWidth={700}>
                    <Heart size={40} color="rgba(255,255,255,0.85)" />
                    <Typography variant="title2" tag="h2" align="center" color="$primaryText">
                        {t("donations.donate.title")}
                    </Typography>
                    <Typography variant="largeRegular" align="center" color="rgba(255,255,255,0.85)" maxWidth={500}>
                        {t("donations.donate.subtitle")}
                    </Typography>

                    <XStack
                        alignItems="center"
                        gap="$xs"
                        paddingHorizontal="$md"
                        paddingVertical="$xs"
                        borderRadius="$full"
                        backgroundColor="rgba(255,255,255,0.15)"
                    >
                        <Users size={16} color="white" />
                        <Typography variant="smallSemibold" color="$primaryText">
                            {t("donations.donate.supporters", { count: 6 })}
                        </Typography>
                    </XStack>

                    {/* Primary CTA — white pill with teal label */}
                    <a href={POMAGAM_URL} target="_blank" rel="noopener noreferrer" style={ANCHOR_RESET}>
                        <XStack
                            alignItems="center"
                            gap="$sm"
                            paddingHorizontal="$xl"
                            paddingVertical="$md"
                            borderRadius="$full"
                            backgroundColor="$background"
                            hoverStyle={{ backgroundColor: "$backgroundHover" }}
                        >
                            <Typography variant="regularSemibold" color="$primary">
                                {t("donations.donate.cta")}
                            </Typography>
                            <ArrowRight size={18} color={icon.primary} />
                        </XStack>
                    </a>

                    {/* Bank transfer */}
                    <YStack
                        width="100%"
                        maxWidth={420}
                        marginTop="$md"
                        padding="$lg"
                        borderRadius="$lg"
                        backgroundColor="rgba(255,255,255,0.1)"
                        gap="$sm"
                        alignItems="center"
                    >
                        <Typography variant="tinySemibold" color="rgba(255,255,255,0.7)">
                            {t("donations.donate.bank_title").toUpperCase()}
                        </Typography>
                        <Typography variant="largeBold" color="$primaryText" style={{ fontFamily: "monospace" }}>
                            {BANK_ACCOUNT}
                        </Typography>
                        <Stack
                            tag="button"
                            role="button"
                            onPress={handleCopyAccount}
                            flexDirection="row"
                            alignItems="center"
                            gap="$xs"
                            paddingHorizontal="$md"
                            paddingVertical="$xs"
                            borderRadius="$sm"
                            borderWidth={0}
                            cursor="pointer"
                            backgroundColor="rgba(255,255,255,0.15)"
                            hoverStyle={{ backgroundColor: "rgba(255,255,255,0.25)" }}
                        >
                            <Copy size={14} color="white" />
                            <Typography variant="smallSemibold" color="$primaryText">
                                {t("donations.donate.copy_account")}
                            </Typography>
                        </Stack>
                    </YStack>

                    <a href={POMAGAM_URL} target="_blank" rel="noopener noreferrer" style={ANCHOR_RESET}>
                        <XStack alignItems="center" gap="$xs">
                            <Typography variant="smallRegular" color="rgba(255,255,255,0.75)">
                                pomagam.pl/rw9bkc
                            </Typography>
                            <ExternalLink size={14} color="rgba(255,255,255,0.75)" />
                        </XStack>
                    </a>
                </PageContainer>
            </Section>
        </YStack>
    );
};

export default DonationsScreen;
