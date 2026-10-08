import { Section, Typography, YStack } from "@fundacja-peryskop/ui";
import { useQuery } from "@tanstack/react-query";
import debounce from "lodash.debounce";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { CategoryFilter } from "../modules/articles/components/CategoryFilter";
import { CompactArticleCard } from "../modules/articles/components/CompactArticleCard";
import { DsArticleCard } from "../modules/articles/components/DsArticleCard";
import { FeaturedArticleCard } from "../modules/articles/components/FeaturedArticleCard";
import ArticlesHeading from "../modules/articles/components/ArticlesHeading";
import { ArticleStatus } from "../modules/articles/constants";
import { articlesQueryOptions } from "../modules/articles/queries/articlesQueryOptions";
import type { Article } from "../modules/articles/types";
import { PageContainer } from "../modules/layout/PageContainer";

/**
 * Scoped grids. Tamagui's max-width media props resolve unreliably here (see
 * CLAUDE.md), so the responsive bento + "more" grids are plain min-width CSS.
 *
 * The bento is a magazine layout: a tall poster "lead" story on the left and a
 * stacked column of compact "headline" cards on the right that share the
 * poster's height (grid cells stretch, the side cards flex to fill). It
 * collapses to a single column below 1000px. The uniform `ab-rest` grid carries
 * any further articles (1 → 2 → 3 columns).
 */
const BENTO_STYLE = `
.ab{display:grid;gap:16px;grid-template-columns:1fr;}
@media (min-width:1000px){.ab--lead{grid-template-columns:1.6fr 1fr;}}
.ab__side{display:flex;flex-direction:column;gap:16px;}
.ab__side>*{flex:1 1 0;min-height:0;}
.ab-rest{display:grid;gap:16px;grid-template-columns:1fr;}
@media (min-width:640px){.ab-rest{grid-template-columns:repeat(2,1fr);}}
@media (min-width:1000px){.ab-rest{grid-template-columns:repeat(3,1fr);}}
`;

/**
 * Public articles page. A tinted header band (title, search, category filters)
 * sits over a creative "bento" showcase - one large poster lead story beside a
 * stack of compact headline cards - with any further articles flowing into a
 * uniform grid below. Designed to look intentional with as few as three articles.
 */
const ArticlesScreen = () => {
    const { t } = useTranslation();
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState(query);
    const [category, setCategory] = useState<string | null>(null);

    const debouncedSetQuery = useCallback(
        debounce((q: string) => setDebouncedQuery(q), 500),
        []
    );
    useEffect(() => {
        debouncedSetQuery(query);
    }, [query, debouncedSetQuery]);

    const { data, isLoading } = useQuery(articlesQueryOptions({ q: debouncedQuery, page: 1, size: 50 }));

    const published = useMemo<Article[]>(
        () =>
            data?.items
                .filter((article) => article.status === ArticleStatus.PUBLISHED)
                .sort((a, b) => new Date(b.creation_date).getTime() - new Date(a.creation_date).getTime()) ?? [],
        [data]
    );

    // Distinct categories (first-seen order) for the filter row.
    const categories = useMemo(() => {
        const seen = new Set<string>();
        for (const article of published) seen.add(article.article_category.name);
        return [...seen];
    }, [published]);

    const filtered = useMemo(
        () => (category ? published.filter((article) => article.article_category.name === category) : published),
        [published, category]
    );

    const [featured, ...others] = filtered;
    const highlights = others.slice(0, 2);
    const rest = others.slice(2);
    // The magazine bento needs a lead + two headlines to read as intentional;
    // with fewer articles we fall back to a plain, honest grid.
    const useBento = filtered.length >= 3;

    const isEmpty = !isLoading && filtered.length === 0;

    return (
        <YStack>
            <style>{BENTO_STYLE}</style>

            {/* Header */}
            <Section paddingTop="$xxxl" paddingBottom="$xl" alignItems="center">
                <PageContainer gap="$lg">
                    <YStack gap="$sm" maxWidth={640}>
                        <Typography variant="title1" tag="h1" style={{ fontSize: "clamp(32px, 4vw, 44px)" }}>
                            {t("articles.title")}
                        </Typography>
                        <Typography variant="largeRegular" muted>
                            {t("articles.subtitle")}
                        </Typography>
                    </YStack>
                    <ArticlesHeading onSearch={setQuery} search={query} />
                    <CategoryFilter categories={categories} selected={category} onSelect={setCategory} />
                </PageContainer>
            </Section>

            {/* Showcase + more */}
            <Section paddingVertical="$xxxl" alignItems="center">
                <PageContainer gap="$xxl" minHeight={360}>
                    {isEmpty ? (
                        <Typography variant="largeRegular" muted align="center" paddingVertical="$xxxl">
                            {t("common.not_found")}
                        </Typography>
                    ) : !featured ? null : useBento ? (
                        <>
                            <div className="ab ab--lead">
                                <FeaturedArticleCard article={featured} />
                                <div className="ab__side">
                                    {highlights.map((article) => (
                                        <CompactArticleCard key={article.id} article={article} />
                                    ))}
                                </div>
                            </div>

                            {rest.length > 0 && (
                                <YStack gap="$lg">
                                    <Typography variant="title3" tag="h2">
                                        {t("articles.more_articles")}
                                    </Typography>
                                    <div className="ab-rest">
                                        {rest.map((article) => (
                                            <DsArticleCard key={article.id} article={article} />
                                        ))}
                                    </div>
                                </YStack>
                            )}
                        </>
                    ) : (
                        <div className="ab-rest">
                            {filtered.map((article) => (
                                <DsArticleCard key={article.id} article={article} />
                            ))}
                        </div>
                    )}
                </PageContainer>
            </Section>
        </YStack>
    );
};

export default ArticlesScreen;
