import resolveAssetUrl from "@/modules/shared/helpers/resolveAssetUrl";
import { Article, Avatar, Person, Typography, YStack, shadows } from "@fundacja-peryskop/ui";
import { Link as RouterLink } from "react-router-dom";
import formatDate from "../../../shared/helpers/formatDate";
import { toExcerpt } from "../../helpers/excerpt";
import type { Article as ArticleData } from "../../types";
import { CategoryTag } from "../CategoryTag";

const LINK_RESET: React.CSSProperties = { textDecoration: "none", display: "block", width: "100%", height: "100%" };
const BANNER_FALLBACK = "https://placehold.co/600x300";

/**
 * Article rendered with the design system's `Article` compound (semantic
 * `<article>` + fixed-ratio banner) and author `Person`. The category is shown
 * as a colour-coded tag *above* the card, and the whole card links to the
 * article. Shared by the homepage and the articles list.
 */
export function DsArticleCard({ article }: { article: ArticleData }) {
    const author = article.created_by;

    return (
        <RouterLink to={`/article/${article.id}`} style={LINK_RESET}>
            <YStack gap="$sm" height="100%">
                <CategoryTag label={article.article_category.name} />

                <Article
                    flex={1}
                    padding="$none"
                    borderRadius="$lg"
                    borderWidth={1}
                    borderColor="$borderColor"
                    backgroundColor="$background"
                    overflow="hidden"
                    cursor="pointer"
                    {...shadows.small}
                    hoverStyle={{ borderColor: "$primary", y: -2 }}
                >
                    <Article.Banner borderRadius="$none">
                        <img
                            src={resolveAssetUrl(article.banner_url)}
                            alt={article.title}
                            onError={(event) => {
                                event.currentTarget.src = BANNER_FALLBACK;
                            }}
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        />
                    </Article.Banner>

                    <Article.Content padding="$lg" gap="$sm">
                        <Typography variant="largeBold" tag="h3">
                            {article.title}
                        </Typography>
                        <Typography variant="smallRegular" muted>
                            {toExcerpt(article.content)}
                        </Typography>
                        <Person
                            marginTop="$sm"
                            avatar={
                                <Avatar
                                    src={resolveAssetUrl(author.chat_avatar_url)}
                                    name={author.full_name}
                                    size={32}
                                />
                            }
                            name={author.full_name}
                            description={formatDate(article.creation_date)}
                        />
                    </Article.Content>
                </Article>
            </YStack>
        </RouterLink>
    );
}
