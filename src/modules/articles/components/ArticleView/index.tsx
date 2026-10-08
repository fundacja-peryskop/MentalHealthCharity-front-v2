import { Article as DsArticle, Avatar, Section, Stack, Typography, XStack, YStack } from "@fundacja-peryskop/ui";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import { PageContainer } from "../../../layout/PageContainer";
import Markdown from "../../../shared/components/Markdown";
import formatDate from "../../../shared/helpers/formatDate";
import resolveAssetUrl from "../../../shared/helpers/resolveAssetUrl";
import { translatedRoles } from "../../../users/constants";
import { Article } from "../../types";
import { DsArticleCard } from "../DsArticleCard";
import Videoplayer from "../Videoplayer";

const LINK_RESET: React.CSSProperties = { textDecoration: "none", display: "inline-flex" };
const HERO_SCRIM = "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0.15) 100%)";

/**
 * "More articles" grid: one column on mobile, two from 640px, three from 1000px
 * - so the capped measure shows a single row of three. Driven by a scoped
 * min-width style rather than Tamagui media props, which resolve unreliably
 * here (the `sm` override wins at every width; see CLAUDE.md).
 */
const MORE_GRID_CLASS = "article-more-grid";
const MORE_GRID_STYLE = `.${MORE_GRID_CLASS}{display:grid;gap:16px;grid-template-columns:1fr;width:100%;}@media (min-width:640px){.${MORE_GRID_CLASS}{grid-template-columns:repeat(2,1fr);}}@media (min-width:1000px){.${MORE_GRID_CLASS}{grid-template-columns:repeat(3,1fr);}}`;

interface Props {
    article: Article;
    articles?: Article[];
}

const estimateReadingTime = (content: string) => {
    const words = content.replace(/[#*_~`>[\]()!|-]/g, "").split(/\s+/).length;
    return Math.max(1, Math.round(words / 200));
};

const ArticleView = ({ article, articles }: Props) => {
    const { t } = useTranslation();
    const readingTime = estimateReadingTime(article.content);
    const author = article.created_by;

    return (
        <DsArticle padding="$none">
            {/* Hero banner */}
            <Stack
                position="relative"
                minHeight={360}
                $md={{ minHeight: 460 }}
                justifyContent="flex-end"
                overflow="hidden"
            >
                <img
                    src={resolveAssetUrl(article.banner_url)}
                    alt=""
                    aria-hidden="true"
                    style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                    }}
                />
                <Stack position="absolute" top={0} left={0} right={0} bottom={0} style={{ background: HERO_SCRIM }} />

                <RouterLink to="/articles" style={{ ...LINK_RESET, position: "absolute", top: 24, left: 24 }}>
                    <Stack
                        width={40}
                        height={40}
                        borderRadius="$full"
                        alignItems="center"
                        justifyContent="center"
                        backgroundColor="rgba(0,0,0,0.4)"
                        hoverStyle={{ backgroundColor: "rgba(0,0,0,0.6)" }}
                        aria-label={t("chat.leaving.back", { defaultValue: "Wróć" })}
                    >
                        <ArrowLeft size={18} color="white" />
                    </Stack>
                </RouterLink>

                <PageContainer position="relative" maxWidth={820} paddingBottom="$xl" gap="$md" zIndex={1}>
                    <XStack
                        alignSelf="flex-start"
                        paddingHorizontal="$md"
                        paddingVertical="$xs"
                        borderRadius="$full"
                        backgroundColor="rgba(255,255,255,0.22)"
                    >
                        <Typography variant="tinyBold" color="white">
                            {article.article_category.name.toUpperCase()}
                        </Typography>
                    </XStack>

                    <Typography variant="title1" tag="h1" color="white" $sm={{ fontSize: 34, lineHeight: 40 }}>
                        {article.title}
                    </Typography>

                    <XStack alignItems="center" gap="$lg" flexWrap="wrap">
                        <RouterLink to={`/profile/${author.id}`} style={LINK_RESET}>
                            <XStack alignItems="center" gap="$sm">
                                <Avatar
                                    src={resolveAssetUrl(author.chat_avatar_url)}
                                    name={author.full_name}
                                    size={40}
                                />
                                <YStack>
                                    <Typography variant="smallBold" color="white">
                                        {author.full_name}
                                    </Typography>
                                    <Typography variant="tinyRegular" color="rgba(255,255,255,0.8)">
                                        {translatedRoles[author.user_role]}
                                    </Typography>
                                </YStack>
                            </XStack>
                        </RouterLink>

                        <XStack alignItems="center" gap="$xs">
                            <Calendar size={15} color="rgba(255,255,255,0.85)" />
                            <Typography variant="smallRegular" color="rgba(255,255,255,0.85)">
                                {formatDate(article.creation_date)}
                            </Typography>
                        </XStack>

                        <XStack alignItems="center" gap="$xs">
                            <Clock size={15} color="rgba(255,255,255,0.85)" />
                            <Typography variant="smallRegular" color="rgba(255,255,255,0.85)">
                                {t("articles.reading_time", {
                                    defaultValue: "{{count}} min czytania",
                                    count: readingTime,
                                })}
                            </Typography>
                        </XStack>
                    </XStack>
                </PageContainer>
            </Stack>

            {/* Body */}
            <Section alignItems="center" paddingVertical="$xxxl">
                <PageContainer maxWidth={820}>
                    {article.video_url ? (
                        <Videoplayer
                            className="mb-10 aspect-video overflow-hidden rounded-2xl shadow-lg"
                            src={article.video_url}
                        />
                    ) : null}
                    <div className="article-content">
                        <Markdown readOnly content={article.content} />
                    </div>
                </PageContainer>
            </Section>

            {/* More articles */}
            {articles && articles.length > 0 ? (
                <Section backgroundColor="$backgroundHover" paddingVertical="$xxxl" alignItems="center">
                    <PageContainer gap="$xl" alignItems="center">
                        <Typography variant="title2" tag="h2" align="center">
                            {t("articles.more_articles")}
                        </Typography>
                        <style>{MORE_GRID_STYLE}</style>
                        <div className={MORE_GRID_CLASS}>
                            {articles.map((a) => (
                                <DsArticleCard key={a.id} article={a} />
                            ))}
                        </div>
                    </PageContainer>
                </Section>
            ) : null}
        </DsArticle>
    );
};

export default ArticleView;
