import { Section, Typography } from "@fundacja-peryskop/ui";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ArticleStatus } from "../../articles/constants";
import { articlesQueryOptions } from "../../articles/queries/articlesQueryOptions";
import { articlesHeadingKey } from "../content";
import { DsArticleCard } from "../../articles/components/DsArticleCard";
import { PageContainer } from "../../layout/PageContainer";

/** Newest published articles shown on the homepage - one full row of three. */
const MAX_ARTICLES = 3;

/**
 * Responsive article grid: one column on mobile, two from 640px, three from
 * 1000px (so the capped 1200px measure always shows three across). Driven by a
 * scoped min-width style rather than Tamagui media props, which resolve
 * unreliably here (the `sm` override wins at every width). Gap is the DS `$lg`
 * token (16px).
 */
const GRID_CLASS = "home-articles-grid";
const GRID_STYLE = `.${GRID_CLASS}{display:grid;gap:16px;grid-template-columns:1fr;}@media (min-width:640px){.${GRID_CLASS}{grid-template-columns:repeat(2,1fr);}}@media (min-width:1000px){.${GRID_CLASS}{grid-template-columns:repeat(3,1fr);}}`;

/**
 * §4.7 - "Artykuły" section. Left-aligned heading over a responsive grid of the
 * newest published articles (real data), each rendered with the design system's
 * `Article` card (`DsArticleCard`). Hidden entirely when there is nothing to show.
 */
export function ArticlesSection() {
    const { t } = useTranslation();
    const { data } = useQuery(articlesQueryOptions({ q: "", page: 1, size: 50 }));

    const published = useMemo(
        () =>
            data?.items
                .filter((article) => article.status === ArticleStatus.PUBLISHED)
                .sort((a, b) => new Date(b.creation_date).getTime() - new Date(a.creation_date).getTime())
                .slice(0, MAX_ARTICLES) ?? [],
        [data]
    );

    if (published.length === 0) return null;

    return (
        <Section paddingVertical="$xxxl" alignItems="center">
            <PageContainer gap="$xl">
                <Typography variant="title2" tag="h2" align="left">
                    {t(articlesHeadingKey)}
                </Typography>

                <style>{GRID_STYLE}</style>
                <div className={GRID_CLASS}>
                    {published.map((article) => (
                        <DsArticleCard key={article.id} article={article} />
                    ))}
                </div>
            </PageContainer>
        </Section>
    );
}
