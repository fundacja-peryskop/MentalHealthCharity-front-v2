import resolveAssetUrl from "@/modules/shared/helpers/resolveAssetUrl";
import { Avatar, Typography, XStack, YStack, shadows } from "@fundacja-peryskop/ui";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import formatDate from "../../../shared/helpers/formatDate";
import { toExcerpt } from "../../helpers/excerpt";
import type { Article as ArticleData } from "../../types";
import { CategoryTag } from "../CategoryTag";

const LINK_RESET: React.CSSProperties = { textDecoration: "none", display: "block", width: "100%", height: "100%" };
const BANNER_FALLBACK = "https://placehold.co/900x1200";

const CARD_CLASS = "feat-card";

/**
 * Hover choreography for the featured poster: the banner zooms a touch while the
 * whole card lifts (the lift is a DS `hoverStyle`). Compositor-only, and off
 * under `prefers-reduced-motion`.
 */
const CARD_STYLE = `
.${CARD_CLASS}__img{transition:transform .6s cubic-bezier(.22,1,.36,1);will-change:transform;}
.${CARD_CLASS}:hover .${CARD_CLASS}__img{transform:scale(1.05);}
@media (prefers-reduced-motion:reduce){.${CARD_CLASS}__img{transition:none;}}
`;

/**
 * Large "poster" article card for the lead story on the articles page: the
 * banner fills the whole tile with a dark gradient scrim, and the category tag,
 * title, excerpt and author sit over it in white - an editorial, magazine-cover
 * feel that anchors the bento grid. The whole card links to the article.
 */
export function FeaturedArticleCard({ article }: { article: ArticleData }) {
    const { t } = useTranslation();
    const author = article.created_by;

    return (
        <RouterLink to={`/article/${article.id}`} style={LINK_RESET} aria-label={article.title}>
            <style>{CARD_STYLE}</style>
            <YStack
                className={CARD_CLASS}
                height="100%"
                minHeight={440}
                borderRadius="$lg"
                overflow="hidden"
                position="relative"
                cursor="pointer"
                tag="article"
                {...shadows.medium}
                hoverStyle={{ y: -2 }}
            >
                {/* Banner, full-bleed behind the copy. */}
                <img
                    className={`${CARD_CLASS}__img`}
                    src={resolveAssetUrl(article.banner_url)}
                    alt=""
                    aria-hidden
                    onError={(event) => {
                        event.currentTarget.src = BANNER_FALLBACK;
                    }}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                />
                {/* Legibility scrim: dark at the bottom, clear at the top. */}
                <div
                    aria-hidden
                    style={{
                        position: "absolute",
                        inset: 0,
                        background:
                            "linear-gradient(to top, rgba(9,10,10,0.82) 0%, rgba(9,10,10,0.35) 42%, rgba(9,10,10,0) 70%)",
                    }}
                />

                {/* Copy pinned to the bottom. */}
                <YStack position="relative" zIndex={1} marginTop="auto" padding="$xl" gap="$sm">
                    <XStack justifyContent="space-between" alignItems="center" gap="$sm">
                        <CategoryTag label={article.article_category.name} onImage />
                        <Typography
                            variant="tinyRegular"
                            tag="span"
                            style={{ color: "rgba(255,255,255,0.85)", fontWeight: 600, letterSpacing: "0.04em" }}
                        >
                            {t("articles.featured").toUpperCase()}
                        </Typography>
                    </XStack>

                    <Typography variant="title3" tag="h2" numberOfLines={3} style={{ color: "#ffffff" }}>
                        {article.title}
                    </Typography>

                    <Typography variant="regularRegular" numberOfLines={2} style={{ color: "rgba(255,255,255,0.85)" }}>
                        {toExcerpt(article.content, 160)}
                    </Typography>

                    <XStack alignItems="center" gap="$sm" marginTop="$xs">
                        <Avatar src={resolveAssetUrl(author.chat_avatar_url)} name={author.full_name} size={36} />
                        <YStack>
                            <Typography variant="regularSemibold" numberOfLines={1} style={{ color: "#ffffff" }}>
                                {author.full_name}
                            </Typography>
                            <Typography variant="tinyRegular" style={{ color: "rgba(255,255,255,0.75)" }}>
                                {formatDate(article.creation_date)}
                            </Typography>
                        </YStack>
                    </XStack>
                </YStack>
            </YStack>
        </RouterLink>
    );
}
