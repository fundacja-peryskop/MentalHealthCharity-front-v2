import { Section, Stack, Typography, XStack, YStack, shadows } from "@fundacja-peryskop/ui";
import { Download, ExternalLink, FileText, Image as ImageIcon, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import systemUsageInfographic from "../assets/static/courses/system_usage_infographic_assets_1_pl.png";
import volunteerCheatSheet from "../assets/static/courses/volunteer_cheat_sheet_pl.png";
import volunteerHandbookPart1 from "../assets/static/courses/volunteer_handbook_part_1_pl.pdf";
import volunteerHandbookPart2 from "../assets/static/courses/volunteer_handbook_part_2_pl.pdf";
import { PageContainer } from "../modules/layout/PageContainer";
import { useIconColor } from "../modules/layout/useIconColor";

type TrainingAsset = {
    id: string;
    title: string;
    description: string;
    file: string;
    kind: "image" | "pdf";
    format: string;
};

const ANCHOR_RESET: React.CSSProperties = { textDecoration: "none", display: "inline-flex" };

const TrainingsScreen = () => {
    const { t } = useTranslation();
    const c = useIconColor();

    const trainings: TrainingAsset[] = [
        {
            id: "handbook-part-1",
            title: t("trainings.items.handbook_part_1.title"),
            description: t("trainings.items.handbook_part_1.description"),
            file: volunteerHandbookPart1,
            kind: "pdf",
            format: "PDF",
        },
        {
            id: "handbook-part-2",
            title: t("trainings.items.handbook_part_2.title"),
            description: t("trainings.items.handbook_part_2.description"),
            file: volunteerHandbookPart2,
            kind: "pdf",
            format: "PDF",
        },
        {
            id: "cheat-sheet",
            title: t("trainings.items.cheat_sheet.title"),
            description: t("trainings.items.cheat_sheet.description"),
            file: volunteerCheatSheet,
            kind: "image",
            format: "PNG",
        },
        {
            id: "system-usage",
            title: t("trainings.items.system_usage.title"),
            description: t("trainings.items.system_usage.description"),
            file: systemUsageInfographic,
            kind: "image",
            format: "PNG",
        },
    ];

    const LinkButton = ({
        href,
        download,
        primary,
        icon: Icon,
        children,
    }: {
        href: string;
        download?: boolean;
        primary?: boolean;
        icon: LucideIcon;
        children: ReactNode;
    }) => (
        <a
            href={href}
            style={ANCHOR_RESET}
            {...(download ? { download: true } : { target: "_blank", rel: "noreferrer" })}
        >
            <XStack
                alignItems="center"
                gap="$xs"
                paddingHorizontal="$lg"
                paddingVertical="$sm"
                borderRadius="$full"
                borderWidth={primary ? 0 : 1}
                borderColor="$borderColor"
                backgroundColor={primary ? "$primary" : "$backgroundTransparent"}
                cursor="pointer"
                hoverStyle={{ backgroundColor: primary ? "$primaryHover" : "$backgroundHover" }}
            >
                <Icon size={16} color={primary ? c.inverse : c.color} />
                <Typography variant="regularSemibold" color={primary ? "$primaryText" : "$color"}>
                    {children}
                </Typography>
            </XStack>
        </a>
    );

    return (
        <YStack>
            {/* Header band */}
            <Section backgroundColor="$primarySoft" paddingTop="$xxxl" paddingBottom="$xl" alignItems="center">
                <PageContainer gap="$sm" maxWidth={1200}>
                    <Typography
                        variant="tinyBold"
                        color="$primary"
                        style={{ textTransform: "uppercase", letterSpacing: 3 }}
                    >
                        {t("trainings.eyebrow")}
                    </Typography>
                    <Typography variant="title2" tag="h1">
                        {t("trainings.title")}
                    </Typography>
                    <Typography variant="largeRegular" muted maxWidth={720} width="100%">
                        {t("trainings.subtitle")}
                    </Typography>
                </PageContainer>
            </Section>

            {/* Grid */}
            <Section paddingVertical="$xxxl" alignItems="center">
                <PageContainer maxWidth={1200}>
                    <XStack flexWrap="wrap" gap="$xl">
                        {trainings.map((training) => {
                            const previewTitle = t("trainings.preview_title", { title: training.title });
                            const KindIcon = training.kind === "pdf" ? FileText : ImageIcon;
                            return (
                                <YStack
                                    key={training.id}
                                    tag="article"
                                    width="100%"
                                    $md={{ width: "48%" }}
                                    gap="$lg"
                                    padding="$xl"
                                    borderRadius="$lg"
                                    backgroundColor="$background"
                                    {...shadows.small}
                                >
                                    <XStack alignItems="center" justifyContent="space-between" gap="$sm">
                                        <XStack
                                            alignItems="center"
                                            gap="$xs"
                                            paddingHorizontal="$sm"
                                            paddingVertical={2}
                                            borderRadius="$full"
                                            backgroundColor="$primarySoft"
                                        >
                                            <Typography variant="tinyBold" color="$primaryTextSoft">
                                                {training.format}
                                            </Typography>
                                        </XStack>
                                        <KindIcon size={18} color={c.muted} aria-hidden />
                                    </XStack>

                                    <Stack
                                        overflow="hidden"
                                        borderRadius="$md"
                                        borderWidth={1}
                                        borderColor="$borderColor"
                                        backgroundColor="$backgroundHover"
                                    >
                                        {training.kind === "pdf" ? (
                                            <iframe
                                                title={previewTitle}
                                                src={`${training.file}#page=1&view=fitH`}
                                                style={{ height: 320, width: "100%", border: 0, display: "block" }}
                                                loading="lazy"
                                            />
                                        ) : (
                                            <img
                                                src={training.file}
                                                alt={previewTitle}
                                                loading="lazy"
                                                style={{
                                                    height: 320,
                                                    width: "100%",
                                                    objectFit: "cover",
                                                    display: "block",
                                                }}
                                            />
                                        )}
                                    </Stack>

                                    <YStack gap="$xs">
                                        <Typography variant="title3" tag="h2">
                                            {training.title}
                                        </Typography>
                                        <Typography variant="regularRegular" muted width="100%">
                                            {training.description}
                                        </Typography>
                                    </YStack>

                                    <XStack flexWrap="wrap" gap="$sm">
                                        <LinkButton href={training.file} icon={ExternalLink}>
                                            {t("trainings.open")}
                                        </LinkButton>
                                        <LinkButton href={training.file} download primary icon={Download}>
                                            {t("common.download")}
                                        </LinkButton>
                                    </XStack>
                                </YStack>
                            );
                        })}
                    </XStack>
                </PageContainer>
            </Section>
        </YStack>
    );
};

export default TrainingsScreen;
