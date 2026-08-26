import { Section, Stack, Typography, XStack, YStack } from "@fundacja-peryskop/ui";
import { useQuery } from "@tanstack/react-query";
import debounce from "lodash.debounce";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DsArticleCard } from "../modules/articles/components/DsArticleCard";
import ArticlesHeading from "../modules/articles/components/ArticlesHeading";
import { ArticleStatus } from "../modules/articles/constants";
import { articlesQueryOptions } from "../modules/articles/queries/articlesQueryOptions";
import { PageContainer } from "../modules/layout/PageContainer";

const ArticlesScreen = () => {
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState(query);
    const page = 1;
    const { t } = useTranslation();

    const debouncedSetQuery = useCallback(
        debounce((q: string) => {
            setDebouncedQuery(q);
        }, 500),
        []
    );

    useEffect(() => {
        debouncedSetQuery(query);
    }, [query, debouncedSetQuery]);

    const { data, isLoading } = useQuery(articlesQueryOptions({ q: debouncedQuery, page, size: 50 }));

    const published = useMemo(() => {
        return data?.items
            .filter((article) => article.status === ArticleStatus.PUBLISHED)
            .sort((a, b) => new Date(b.creation_date).getTime() - new Date(a.creation_date).getTime());
    }, [data]);

    const isEmpty = !isLoading && (!published || published.length === 0);

    return (
        <YStack>
            {/* Header band */}
            <Section backgroundColor="$primarySoft" paddingTop="$xxxl" paddingBottom="$xl" alignItems="center">
                <PageContainer gap="$lg">
                    <YStack gap="$sm" maxWidth={620}>
                        <Typography variant="title2" tag="h1">
                            {t("articles.title")}
                        </Typography>
                        <Typography variant="largeRegular" muted>
                            {t("articles.subtitle")}
                        </Typography>
                    </YStack>
                    <ArticlesHeading onSearch={setQuery} search={query} />
                </PageContainer>
            </Section>

            {/* Grid */}
            <Section paddingVertical="$xxxl" alignItems="center">
                <PageContainer minHeight={360}>
                    {isEmpty ? (
                        <Typography variant="largeRegular" muted align="center" paddingVertical="$xxxl">
                            {t("common.not_found")}
                        </Typography>
                    ) : (
                        <XStack flexWrap="wrap" gap="$lg">
                            {published?.map((article) => (
                                <Stack key={article.id} width="100%" $sm={{ width: "48%" }} $md={{ width: "31.5%" }}>
                                    <DsArticleCard article={article} />
                                </Stack>
                            ))}
                        </XStack>
                    )}
                </PageContainer>
            </Section>
        </YStack>
    );
};

export default ArticlesScreen;
