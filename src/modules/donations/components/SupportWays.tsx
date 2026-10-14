import { Stack, Typography, YStack } from "@fundacja-peryskop/ui";
import { HandCoins, HeartHandshake, type LucideIcon, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useIconColor } from "../../layout/useIconColor";

/**
 * Three-up grid inside the teal feature card: one column on mobile, three from
 * 760px. A plain `<div>` is used for the grid container because Tamagui's
 * `Stack` forces `display:flex` (the homepage grids do the same - see
 * CLAUDE.md).
 */
const WAYS_CLASS = "donations-ways-grid";
const WAYS_STYLE = `
.${WAYS_CLASS}{display:grid;gap:40px 24px;width:100%;max-width:920px;grid-template-columns:1fr;}
@media (min-width:760px){.${WAYS_CLASS}{grid-template-columns:repeat(3,1fr);}}
`;

/**
 * "Supporting us takes just a few minutes" - a single rounded brand-colour card
 * (mirrors the reference) with a centred heading and three icon columns. Each
 * icon sits on a cream disc so it reads against the teal fill. The reassuring,
 * low-friction framing promotes giving and builds trust before the donate band.
 */
export function SupportWays() {
    const { t } = useTranslation();
    const icon = useIconColor();

    const items: { icon: LucideIcon; title: string; desc: string }[] = [
        { icon: HandCoins, title: t("donations.ways.item1_title"), desc: t("donations.ways.item1_desc") },
        { icon: Zap, title: t("donations.ways.item2_title"), desc: t("donations.ways.item2_desc") },
        { icon: HeartHandshake, title: t("donations.ways.item3_title"), desc: t("donations.ways.item3_desc") },
    ];

    return (
        <YStack
            width="100%"
            alignItems="center"
            gap="$xl"
            paddingVertical="$xxxl"
            paddingHorizontal="$lg"
            borderRadius={32}
            backgroundColor="$primary"
        >
            <YStack alignItems="center" gap="$sm" maxWidth={620}>
                <Typography variant="title2" tag="h2" align="center" color="$primaryText">
                    {t("donations.ways.title")}
                </Typography>
                <Typography variant="largeRegular" align="center" color="rgba(255,255,255,0.88)">
                    {t("donations.ways.subtitle")}
                </Typography>
            </YStack>

            <div className={WAYS_CLASS}>
                <style>{WAYS_STYLE}</style>
                {items.map(({ icon: ItemIcon, title, desc }) => (
                    <YStack key={title} alignItems="center" gap="$sm">
                        <Stack
                            width={76}
                            height={76}
                            borderRadius="$full"
                            alignItems="center"
                            justifyContent="center"
                            backgroundColor="$background"
                            marginBottom="$xs"
                        >
                            <ItemIcon size={34} color={icon.primary} />
                        </Stack>
                        <Typography variant="largeBold" tag="h3" align="center" color="$primaryText">
                            {title}
                        </Typography>
                        <Typography
                            variant="regularRegular"
                            align="center"
                            color="rgba(255,255,255,0.88)"
                            maxWidth={280}
                        >
                            {desc}
                        </Typography>
                    </YStack>
                ))}
            </div>
        </YStack>
    );
}
