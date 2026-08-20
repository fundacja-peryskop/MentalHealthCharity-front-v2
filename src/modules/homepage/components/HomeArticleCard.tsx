import resolveAssetUrl from "@/modules/shared/helpers/resolveAssetUrl";
import { Article, Avatar, Badge, Person, Typography, shadows } from "@fundacja-peryskop/ui";
import { Link as RouterLink } from "react-router-dom";
import type { Article as ArticleData } from "../../articles/types";
import formatDate from "../../shared/helpers/formatDate";

const LINK_RESET: React.CSSProperties = { textDecoration: "none", display: "block", width: "100%" };
const BANNER_FALLBACK = "https://placehold.co/600x300";

/** Strip Markdown syntax so the excerpt reads as plain text. */
function toExcerpt(markdown: string, length = 120): string {
    const plain = markdown
        .replace(/[#*_~`>[\]()!|-]/g, "")
        .replace(/\n+/g, " ")
        .trim();
    return plain.length > length ? `${plain.slice(0, length)}…` : plain;
}

/**
 * §4.7 — one article rendered with the design system's `Article` compound
 * (semantic `<article>` + fixed-ratio banner), category `Badge`, and author
 * `Person`. Fed real article data; the whole card links to the article.
 */
export function HomeArticleCard({ article }: { article: ArticleData }) {
    const author = article.created_by;

    return (
        <RouterLink to={`/article/${article.id}`} style={LINK_RESET}>
            <Article
                height="100%"
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
                    <Badge dotColor="$primary" size="sm">
                        {article.article_category.name}
                    </Badge>
                    <Typography variant="largeBold" tag="h3">
                        {article.title}
                    </Typography>
                    <Typography variant="smallRegular" muted>
                        {toExcerpt(article.content)}
                    </Typography>
                    <Person
                        marginTop="$sm"
                        avatar={
                            <Avatar src={resolveAssetUrl(author.chat_avatar_url)} name={author.full_name} size={32} />
                        }
                        name={author.full_name}
                        description={formatDate(article.creation_date)}
                    />
                </Article.Content>
            </Article>
        </RouterLink>
    );
}
