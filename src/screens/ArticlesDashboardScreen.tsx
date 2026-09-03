import { Section, Typography, XStack, YStack } from "@fundacja-peryskop/ui";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import ArticleCard from "../modules/articles/components/ArticleCard";
import { ArticleStatus } from "../modules/articles/constants";
import { articlesByUserQueryOptions } from "../modules/articles/queries/articlesByUserQueryOptions";
import { useUser } from "../modules/auth/components/AuthProvider";
import type { User } from "../modules/auth/types";
import { PageContainer } from "../modules/layout/PageContainer";
import { PillButton } from "../modules/layout/admin";
import Loader from "../modules/shared/components/Loader";
import SimpleCard from "../modules/shared/components/SimpleCard";

interface StatusSectionProps {
    status: ArticleStatus;
    title: string;
    subtitle?: string;
    user?: User;
}

/**
 * One dashboard section per article status. Kept as its own component so the
 * `useQuery` hook is called once per render (never inside a loop).
 */
const ArticleStatusSection = ({ status, title, subtitle, user }: StatusSectionProps) => {
    const { t } = useTranslation();
    const { data, isLoading } = useQuery(
        articlesByUserQueryOptions(
            {
                status,
                author: user ? user.id : 0,
                page: 1,
                size: 100,
            },
            {
                retry: 1,
                refetchOnWindowFocus: false,
                enabled: !!user,
                queryKey: ["articles", status],
            }
        )
    );

    return (
        <SimpleCard subtitle={subtitle} title={title}>
            {isLoading && <Loader />}
            {data && data.total > 0 ? (
                <XStack flexWrap="wrap" gap="$md" marginTop="$md">
                    {data.items.map((article) => (
                        <YStack key={article.id} flex={1} minWidth={320} gap="$xs">
                            <ArticleCard draft={status === ArticleStatus.DRAFT} article={article} />
                            {article.reject_message !== "" && (
                                <Typography variant="smallRegular" color="$danger" width="100%">
                                    {article.reject_message}
                                </Typography>
                            )}
                        </YStack>
                    ))}
                </XStack>
            ) : (
                <Typography variant="regularRegular" muted marginTop="$sm" width="100%">
                    {t("articles.dashboard.not_found")}
                </Typography>
            )}
        </SimpleCard>
    );
};

const ArticleDashboardScreen = () => {
    const { t } = useTranslation();
    const { user } = useUser();

    const statuses: { key: ArticleStatus; title: string; subtitle?: string }[] = [
        {
            key: ArticleStatus.DRAFT,
            title: t("articles.dashboard.draft", { user: user?.full_name }),
            subtitle: t("articles.dashboard.draft_subtitle"),
        },
        { key: ArticleStatus.REJECTED, title: t("articles.dashboard.rejected") },
        { key: ArticleStatus.CORRECTED, title: t("articles.dashboard.corrected") },
        { key: ArticleStatus.SENT, title: t("articles.dashboard.sent") },
        { key: ArticleStatus.PUBLISHED, title: t("articles.dashboard.published") },
        { key: ArticleStatus.DELETED, title: t("articles.dashboard.deleted") },
    ];

    return (
        <Section paddingVertical="$xxl" alignItems="center">
            <PageContainer gap="$lg">
                <SimpleCard title={t("articles.dashboard.title")} subtitle={t("articles.dashboard.subtitle")}>
                    <XStack marginTop="$md">
                        <PillButton icon={Plus} variant="solid" to="/articles/create">
                            {t("articles.add_article")}
                        </PillButton>
                    </XStack>
                </SimpleCard>

                {statuses.map(({ key, title, subtitle }) => (
                    <ArticleStatusSection key={key} status={key} title={title} subtitle={subtitle} user={user} />
                ))}
            </PageContainer>
        </Section>
    );
};

export default ArticleDashboardScreen;
