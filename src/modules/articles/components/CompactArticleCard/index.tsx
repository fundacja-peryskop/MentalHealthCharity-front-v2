import resolveAssetUrl from "@/modules/shared/helpers/resolveAssetUrl";
import { Stack, Typography, XStack, YStack, shadows } from "@fundacja-peryskop/ui";
import { Link as RouterLink } from "react-router-dom";
import formatDate from "../../../shared/helpers/formatDate";
import type { Article as ArticleData } from "../../types";
import { CategoryTag } from "../CategoryTag";

const LINK_RESET: React.CSSProperties = { textDecoration: "none", display: "block", width: "100%", height: "100%" };
const BANNER_FALLBACK = "https://placehold.co/300x300";

const CARD_CLASS = "compact-card";
const CARD_STYLE = `
.${CARD_CLASS}__img{transition:transform .5s cubic-bezier(.22,1,.36,1);will-change:transform;}
.${CARD_CLASS}:hover .${CARD_CLASS}__img{transform:scale(1.05);}
@media (prefers-reduced-motion:reduce){.${CARD_CLASS}__img{transition:none;}}
`;

/**
 * Horizontal "headline" card: a square thumbnail beside the category tag, title
 * and date. Compact enough to stack two in the bento's side column next to the
 * poster lead. The whole card links to the article.
 */
export function CompactArticleCard({ article }: { article: ArticleData }) {
    return (
        <RouterLink to={`/article/${article.id}`} style={LINK_RESET} aria-label={article.title}>
            <style>{CARD_STYLE}</style>
            <XStack
                className={CARD_CLASS}
                height="100%"
                minHeight={132}
                borderRadius="$lg"
                borderWidth={1}
                borderColor="$borderColor"
                backgroundColor="$background"
                overflow="hidden"
                cursor="pointer"
                tag="article"
                {...shadows.small}
                hoverStyle={{ borderColor: "$primary" }}
            >
                <Stack width="40%" maxWidth={180} minWidth={110} overflow="hidden" backgroundColor="$backgroundStrong">
                    <img
                        className={`${CARD_CLASS}__img`}
                        src={resolveAssetUrl(article.banner_url)}
                        alt=""
                        aria-hidden
                        onError={(event) => {
                            event.currentTarget.src = BANNER_FALLBACK;
                        }}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                </Stack>

                <YStack flex={1} padding="$md" gap="$xs" justifyContent="center">
                    <CategoryTag label={article.article_category.name} />
                    <Typography variant="regularSemibold" tag="h3" numberOfLines={2}>
                        {article.title}
                    </Typography>
                    <Typography variant="tinyRegular" muted>
                        {formatDate(article.creation_date)}
                    </Typography>
                </YStack>
            </XStack>
        </RouterLink>
    );
}
