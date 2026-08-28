import { Button, Section, Stack, Typography, XStack, YStack, shadows } from "@fundacja-peryskop/ui";
import {
    ArrowLeft,
    ExternalLink,
    Globe,
    HeartHandshake,
    IdCard,
    KeyRound,
    ScanEye,
    ShieldAlert,
    ShieldX,
    type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageContainer } from "../modules/layout/PageContainer";
import { useIconColor } from "../modules/layout/useIconColor";
import {
    assessUrlThreats,
    isDonationPlatformUrl,
    LEAVING_URL_PARAM,
    OFFICIAL_FUNDRAISER_URL,
    parseSafeHttpUrl,
    type UrlThreat,
} from "../modules/shared/helpers/externalLink";

const officialFundraiser = parseSafeHttpUrl(OFFICIAL_FUNDRAISER_URL);

/** Marks a `<button>` as non-submitting; DS Button doesn't type `type`. */
const NON_SUBMIT = { type: "button" } as object;

// Maps each detected threat to a plain-language explanation shown to the user.
const THREAT_LABEL_KEYS: Record<UrlThreat, string> = {
    insecure: "chat.leaving.reason_insecure",
    "ip-host": "chat.leaving.reason_ip",
    punycode: "chat.leaving.reason_punycode",
    userinfo: "chat.leaving.reason_userinfo",
    impersonation: "chat.leaving.reason_impersonation",
    "suspicious-tld": "chat.leaving.reason_suspicious_tld",
};

/** Centered card shell used by every state. */
function Shell({ children }: { children: ReactNode }) {
    return (
        <Section alignItems="center" paddingVertical="$xxxl">
            <PageContainer alignItems="center">
                <YStack
                    width="100%"
                    maxWidth={520}
                    borderRadius="$lg"
                    overflow="hidden"
                    backgroundColor="$background"
                    {...shadows.medium}
                >
                    {children}
                </YStack>
            </PageContainer>
        </Section>
    );
}

function IconTile({ bg, icon: Icon, color }: { bg: string; icon: LucideIcon; color: string }) {
    return (
        <Stack
            alignSelf="center"
            width={64}
            height={64}
            borderRadius="$lg"
            alignItems="center"
            justifyContent="center"
            backgroundColor={bg as never}
        >
            <Icon size={30} color={color} strokeWidth={2.25} />
        </Stack>
    );
}

function DestinationRow({ hostname, href, iconColor }: { hostname: string; href: string; iconColor: string }) {
    return (
        <XStack
            alignItems="center"
            gap="$md"
            padding="$md"
            borderRadius="$md"
            borderWidth={1}
            borderColor="$borderColor"
            backgroundColor="$backgroundHover"
            width="100%"
        >
            <Stack
                width={44}
                height={44}
                borderRadius="$md"
                alignItems="center"
                justifyContent="center"
                backgroundColor="$background"
                borderWidth={1}
                borderColor="$borderColor"
            >
                <Globe size={20} color={iconColor} />
            </Stack>
            <YStack flex={1} minWidth={0}>
                <Typography variant="regularBold" numberOfLines={1}>
                    {hostname}
                </Typography>
                <Typography variant="tinyRegular" muted numberOfLines={1}>
                    {href}
                </Typography>
            </YStack>
        </XStack>
    );
}

const LeavingScreen = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const c = useIconColor();

    const rawUrl = params.get(LEAVING_URL_PARAM) ?? "";
    const url = parseSafeHttpUrl(rawUrl);

    const goBack = () => {
        if (window.history.length > 1) navigate(-1);
        else navigate("/chat");
    };

    const proceed = () => {
        // Never follow an unparseable or dangerous link, even if this is somehow
        // reached (the dangerous branch below has no "continue" button at all).
        if (!url || assessUrlThreats(url).length > 0) return;
        window.open(url.href, "_blank", "noopener,noreferrer");
        goBack();
    };

    const openOfficialFundraiser = () => {
        window.open(OFFICIAL_FUNDRAISER_URL, "_blank", "noopener,noreferrer");
        goBack();
    };

    const backButton = (
        <Button variant="primary" fullWidth onPress={goBack}>
            <ArrowLeft size={16} color={c.inverse} />
            <Typography variant="regularSemibold" color="$primaryText">
                {t("chat.leaving.back")}
            </Typography>
        </Button>
    );

    const sectionLabel = (text: string) => (
        <Typography
            variant="tinySemibold"
            color="$colorMuted"
            style={{ textTransform: "uppercase", letterSpacing: 0.5 }}
        >
            {text}
        </Typography>
    );

    // Malformed or unsafe link — never offer a way to follow it.
    if (!url) {
        return (
            <Shell>
                <YStack padding="$xl" gap="$md" alignItems="center">
                    <IconTile bg="$dangerSoft" icon={ShieldAlert} color={c.danger ?? ""} />
                    <Typography variant="title3" tag="h1" align="center">
                        {t("chat.leaving.invalid_title")}
                    </Typography>
                    <Typography variant="regularRegular" muted align="center" width="100%">
                        {t("chat.leaving.invalid_description")}
                    </Typography>
                    <Stack width="100%" paddingTop="$sm">
                        {backButton}
                    </Stack>
                </YStack>
            </Shell>
        );
    }

    // Dangerous links are blocked outright — there is no "continue anyway".
    const threats = assessUrlThreats(url);
    if (threats.length > 0) {
        return (
            <Shell>
                <YStack
                    backgroundColor="$dangerSoft"
                    paddingHorizontal="$xl"
                    paddingTop="$xl"
                    paddingBottom="$lg"
                    gap="$sm"
                    alignItems="center"
                >
                    <IconTile bg="$danger" icon={ShieldX} color={c.inverse ?? "white"} />
                    <XStack
                        alignItems="center"
                        gap="$xs"
                        paddingHorizontal="$md"
                        paddingVertical={2}
                        borderRadius="$full"
                        backgroundColor="$background"
                    >
                        <ShieldAlert size={13} color={c.danger} />
                        <Typography variant="tinyBold" color="$dangerTextSoft">
                            {t("chat.leaving.blocked_badge")}
                        </Typography>
                    </XStack>
                    <Typography variant="title3" tag="h1" align="center">
                        {t("chat.leaving.blocked_title")}
                    </Typography>
                    <Typography variant="regularRegular" muted align="center" width="100%">
                        {t("chat.leaving.blocked_description")}
                    </Typography>
                </YStack>

                <YStack padding="$xl" gap="$lg">
                    <YStack gap="$sm">
                        {sectionLabel(t("chat.leaving.destination_blocked"))}
                        <DestinationRow hostname={url.hostname} href={url.href} iconColor={c.danger ?? ""} />
                    </YStack>

                    <YStack gap="$sm">
                        {sectionLabel(t("chat.leaving.blocked_reasons_heading"))}
                        <YStack gap="$sm">
                            {threats.map((threat) => (
                                <XStack key={threat} alignItems="flex-start" gap="$sm">
                                    <Stack
                                        marginTop={2}
                                        width={28}
                                        height={28}
                                        borderRadius="$sm"
                                        alignItems="center"
                                        justifyContent="center"
                                        backgroundColor="$dangerSoft"
                                    >
                                        <ShieldX size={15} color={c.danger} />
                                    </Stack>
                                    <Typography variant="smallRegular" flex={1}>
                                        {t(THREAT_LABEL_KEYS[threat])}
                                    </Typography>
                                </XStack>
                            ))}
                        </YStack>
                    </YStack>

                    {backButton}
                </YStack>
            </Shell>
        );
    }

    // Donation platforms other than our own fundraiser: warn and steer to the official one.
    if (isDonationPlatformUrl(url)) {
        return (
            <Shell>
                <YStack
                    backgroundColor="$secondarySoft"
                    paddingHorizontal="$xl"
                    paddingTop="$xl"
                    paddingBottom="$lg"
                    gap="$sm"
                    alignItems="center"
                >
                    <IconTile bg="$secondary" icon={HeartHandshake} color={c.color ?? ""} />
                    <XStack
                        alignItems="center"
                        gap="$xs"
                        paddingHorizontal="$md"
                        paddingVertical={2}
                        borderRadius="$full"
                        backgroundColor="$background"
                    >
                        <ShieldAlert size={13} color={c.secondary} />
                        <Typography variant="tinyBold" color="$secondaryTextSoft">
                            {t("chat.leaving.donation_badge")}
                        </Typography>
                    </XStack>
                    <Typography variant="title3" tag="h1" align="center">
                        {t("chat.leaving.donation_title")}
                    </Typography>
                    <Typography variant="regularRegular" muted align="center" width="100%">
                        {t("chat.leaving.donation_description")}
                    </Typography>
                </YStack>

                <YStack padding="$xl" gap="$lg">
                    <YStack gap="$sm">
                        {sectionLabel(t("chat.leaving.donation_detected"))}
                        <DestinationRow hostname={url.hostname} href={url.href} iconColor={c.muted ?? ""} />
                    </YStack>

                    {officialFundraiser ? (
                        <YStack gap="$sm">
                            <Typography
                                variant="tinySemibold"
                                color="$primary"
                                style={{ textTransform: "uppercase", letterSpacing: 0.5 }}
                            >
                                {t("chat.leaving.donation_official_heading")}
                            </Typography>
                            <XStack
                                alignItems="center"
                                gap="$md"
                                padding="$md"
                                borderRadius="$md"
                                borderWidth={1}
                                borderColor="$primaryBorder"
                                backgroundColor="$primarySoft"
                                width="100%"
                            >
                                <Stack
                                    width={44}
                                    height={44}
                                    borderRadius="$md"
                                    alignItems="center"
                                    justifyContent="center"
                                    backgroundColor="$primary"
                                >
                                    <HeartHandshake size={20} color={c.inverse} />
                                </Stack>
                                <YStack flex={1} minWidth={0}>
                                    <Typography variant="regularBold" color="$primaryTextSoft" numberOfLines={1}>
                                        {officialFundraiser.hostname}
                                        {officialFundraiser.pathname}
                                    </Typography>
                                    <Typography variant="tinyRegular" color="$primaryTextSoft" numberOfLines={1}>
                                        {t("chat.leaving.donation_official_heading")}
                                    </Typography>
                                </YStack>
                            </XStack>
                        </YStack>
                    ) : null}

                    <YStack gap="$sm">
                        <Button variant="primary" fullWidth onPress={openOfficialFundraiser}>
                            <HeartHandshake size={16} color={c.inverse} />
                            <Typography variant="regularSemibold" color="$primaryText">
                                {t("chat.leaving.donation_official_cta")}
                            </Typography>
                        </Button>
                        <Button variant="mutedPrimary" fullWidth {...NON_SUBMIT} onPress={goBack}>
                            <ArrowLeft size={16} color={c.primary} />
                            <Typography variant="regularSemibold" color="$primaryDarker">
                                {t("chat.leaving.back")}
                            </Typography>
                        </Button>
                        <Stack
                            tag="button"
                            role="button"
                            {...NON_SUBMIT}
                            onPress={proceed}
                            alignSelf="center"
                            borderWidth={0}
                            backgroundColor="$backgroundTransparent"
                            cursor="pointer"
                            paddingVertical="$xs"
                        >
                            <Typography variant="tinyRegular" muted style={{ textDecorationLine: "underline" }}>
                                {t("chat.leaving.donation_proceed")}
                            </Typography>
                        </Stack>
                    </YStack>
                </YStack>
            </Shell>
        );
    }

    const tips = [
        { icon: KeyRound, text: t("chat.leaving.tip_password") },
        { icon: IdCard, text: t("chat.leaving.tip_data") },
        { icon: ScanEye, text: t("chat.leaving.tip_verify") },
        { icon: ShieldX, text: t("chat.leaving.tip_impersonation") },
    ];

    // Normal external link.
    return (
        <Shell>
            <YStack
                backgroundColor="$secondarySoft"
                paddingHorizontal="$xl"
                paddingTop="$xl"
                paddingBottom="$lg"
                gap="$sm"
                alignItems="center"
            >
                <IconTile bg="$secondary" icon={ExternalLink} color={c.color ?? ""} />
                <XStack
                    alignItems="center"
                    gap="$xs"
                    paddingHorizontal="$md"
                    paddingVertical={2}
                    borderRadius="$full"
                    backgroundColor="$background"
                >
                    <ShieldAlert size={13} color={c.secondary} />
                    <Typography variant="tinyBold" color="$secondaryTextSoft">
                        {t("chat.leaving.badge")}
                    </Typography>
                </XStack>
                <Typography variant="title3" tag="h1" align="center">
                    {t("chat.leaving.title")}
                </Typography>
                <Typography variant="regularRegular" muted align="center" width="100%">
                    <Trans
                        i18nKey="chat.leaving.subtitle"
                        values={{ host: url.hostname }}
                        components={{ strong: <strong /> }}
                    />
                </Typography>
            </YStack>

            <YStack padding="$xl" gap="$lg">
                <YStack gap="$sm">
                    {sectionLabel(t("chat.leaving.destination"))}
                    <DestinationRow hostname={url.hostname} href={url.href} iconColor={c.primary ?? ""} />
                </YStack>

                <YStack gap="$sm">
                    {sectionLabel(t("chat.leaving.tips_heading"))}
                    <YStack gap="$sm">
                        {tips.map(({ icon: Icon, text }, i) => (
                            <XStack key={i} alignItems="flex-start" gap="$sm">
                                <Stack
                                    marginTop={2}
                                    width={28}
                                    height={28}
                                    borderRadius="$sm"
                                    alignItems="center"
                                    justifyContent="center"
                                    backgroundColor="$secondarySoft"
                                >
                                    <Icon size={15} color={c.secondary} />
                                </Stack>
                                <Typography variant="smallRegular" flex={1}>
                                    {text}
                                </Typography>
                            </XStack>
                        ))}
                    </YStack>
                </YStack>

                <XStack gap="$sm" flexDirection="column" $sm={{ flexDirection: "row-reverse" }}>
                    <Stack flex={1}>{backButton}</Stack>
                    <Button variant="mutedPrimary" flex={1} {...NON_SUBMIT} onPress={proceed}>
                        <ExternalLink size={16} color={c.primary} />
                        <Typography variant="regularSemibold" color="$primaryDarker">
                            {t("chat.leaving.proceed")}
                        </Typography>
                    </Button>
                </XStack>
            </YStack>
        </Shell>
    );
};

export default LeavingScreen;
