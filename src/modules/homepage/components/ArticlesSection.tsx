import { Section, Stack, Typography, XStack } from "@fundacja-peryskop/ui";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { ArticleStatus } from "../../articles/constants";
import { articlesQueryOptions } from "../../articles/queries/articlesQueryOptions";
import { articlesHeading } from "../content";
import { HomeArticleCard } from "./HomeArticleCard";
import { PageContainer } from "../../layout/PageContainer";

const MAX_ARTICLES = 6;

/**
 * §4.7 — "Artykuły" section. Left-aligned heading over a responsive grid of the
 * newest published articles (real data). Pure data-mapping: one
 * `HomeArticleCard` per article. Hidden entirely when there is nothing to show.
 */
export function ArticlesSection() {
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
                    {articlesHeading}
                </Typography>

                <XStack flexWrap="wrap" gap="$lg">
                    {published.map((article) => (
                        <Stack key={article.id} width="100%" $sm={{ width: "48%" }} $md={{ width: "31.5%" }}>
                            <HomeArticleCard article={article} />
                        </Stack>
                    ))}
                </XStack>
            </PageContainer>
        </Section>
    );
}
