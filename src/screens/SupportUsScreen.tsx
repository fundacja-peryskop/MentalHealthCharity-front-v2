import { Section, Stack, Typography, XStack, YStack, shadows } from "@fundacja-peryskop/ui";
import { Copy } from "lucide-react";
import { useCallback } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "../hooks/useBreakpoint";
import { PageContainer } from "../modules/layout/PageContainer";
import { useIconColor } from "../modules/layout/useIconColor";
import ShareWebsite from "../modules/shared/components/ShareWebsite";

const BANK_ACCOUNT = "62 1870 1045 2083 1080 5210 0001";

const SupportUsScreen = () => {
    const { t } = useTranslation();
    const isMobile = useIsMobile();
    const icon = useIconColor();

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(BANK_ACCOUNT);
        toast.success(t("common.copied_to_clipboard"));
    }, [t]);

    return (
        <Section alignItems="center" paddingVertical="$xxxl">
            <PageContainer maxWidth={760} gap="$xl">
                <YStack gap="$sm">
                    <Typography variant="title2" tag="h1">
                        {t("support_us.title")}
                    </Typography>
                    <Typography variant="largeRegular" muted width="100%">
                        {t("support_us.subtitle")}
                    </Typography>
                </YStack>

                {/* Donation widget */}
                <YStack alignItems="center" width="100%">
                    <iframe
                        title="pomagam.pl"
                        frameBorder="0"
                        width={isMobile ? "300" : "430"}
                        height={isMobile ? "380" : "480"}
                        scrolling="no"
                        src="https://pomagam.pl/rw9bkc/widget/large"
                        style={{ borderRadius: 16, maxWidth: "100%" }}
                    />
                </YStack>

                {/* Share */}
                <YStack
                    width="100%"
                    gap="$md"
                    padding="$xl"
                    borderRadius="$lg"
                    backgroundColor="$background"
                    {...shadows.small}
                >
                    <Typography variant="title3" tag="h2">
                        {t("support_us.options.share.title")}
                    </Typography>
                    <Typography variant="regularRegular" muted width="100%">
                        {t("support_us.options.share.subtitle")}
                    </Typography>
                    <ShareWebsite />
                </YStack>

                {/* Bank transfer */}
                <YStack width="100%" gap="$md" padding="$xl" borderRadius="$lg" backgroundColor="$primarySoft">
                    <Typography variant="title3" tag="h2">
                        {t("support_us.options.donate.title")}
                    </Typography>
                    <Typography variant="regularRegular" width="100%">
                        {t("support_us.options.donate.subtitle")}
                    </Typography>
                    <XStack
                        alignItems="center"
                        justifyContent="space-between"
                        gap="$md"
                        flexWrap="wrap"
                        padding="$md"
                        borderRadius="$md"
                        backgroundColor="$background"
                    >
                        <Typography variant="largeBold" style={{ fontFamily: "monospace" }} userSelect="all">
                            {BANK_ACCOUNT}
                        </Typography>
                        <Stack
                            tag="button"
                            role="button"
                            aria-label={t("common.copied_to_clipboard", { defaultValue: "Kopiuj" })}
                            onPress={handleCopy}
                            flexDirection="row"
                            alignItems="center"
                            gap="$xs"
                            paddingHorizontal="$md"
                            paddingVertical="$sm"
                            borderRadius="$sm"
                            borderWidth={0}
                            cursor="pointer"
                            backgroundColor="$primary"
                            hoverStyle={{ backgroundColor: "$primaryHover" }}
                        >
                            <Copy size={16} color={icon.inverse} />
                            <Typography variant="smallSemibold" color="$primaryText">
                                {t("common.copy", { defaultValue: "Kopiuj" })}
                            </Typography>
                        </Stack>
                    </XStack>
                </YStack>
            </PageContainer>
        </Section>
    );
};

export default SupportUsScreen;
