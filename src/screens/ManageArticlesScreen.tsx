import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Typography, YStack } from "@fundacja-peryskop/ui";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FileText, Plus } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import ArticlesManager from "../modules/articles/components/ArticlesManager";
import { ArticleStatus, translatedAdminArticleStatus } from "../modules/articles/constants";
import changeStatusMutation from "../modules/articles/queries/changeStatusMutation";
import { readPublicArticlesQueryOptions } from "../modules/articles/queries/readPublicArticlesQueryOptions";
import { UpdateStatusFormValues } from "../modules/articles/types";
import { AdminPageHeader, FilterPills, PillButton } from "../modules/layout/admin";
import AdminLayout from "../modules/shared/components/AdminLayout";
import Loader from "../modules/shared/components/Loader";
import SearchUser from "../modules/users/components/SearchUser";

const ManageArticlesScreen = () => {
    const { t } = useTranslation();
    const [status, setStatus] = useState<ArticleStatus>(ArticleStatus.SENT);
    const [filterByUser, setFilterByUser] = useState<number | undefined>();

    const { data, isLoading, refetch } = useQuery(
        readPublicArticlesQueryOptions(
            {
                status,
                page: 1,
                size: 100,
                author: filterByUser,
            },
            {
                queryKey: ["readPublicArticles", { status, page: 1, size: 100, author: filterByUser }],
            }
        )
    );

    const { mutate } = useMutation({
        mutationFn: changeStatusMutation,
        onSuccess: () => {
            toast.success(t("manage_articles.article_status_changed"));
            refetch();
        },
    });

    const handleChangeStatus = ({ reject_message, status }: UpdateStatusFormValues, id: number) => {
        mutate({ id, status, reject_message });
    };

    return (
        <AdminLayout>
            <YStack width="100%" gap="$lg">
                <AdminPageHeader
                    icon={FileText}
                    tone="primary"
                    title={t("manage_articles.title")}
                    subtitle={t("manage_articles.subtitle")}
                    actions={
                        <PillButton icon={Plus} variant="solid" to="/articles/create">
                            {t("articles.add_article")}
                        </PillButton>
                    }
                />

                <YStack gap="$md">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger render={<div />}>
                                <SearchUser disabled onChange={(user) => setFilterByUser(user?.id)} />
                            </TooltipTrigger>
                            <TooltipContent>{t("common.unavailable_in_beta")}</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <FilterPills
                        ariaLabel={t("common.status", { defaultValue: "Status" })}
                        value={status}
                        onChange={(value) => setStatus(value as ArticleStatus)}
                        options={Object.keys(ArticleStatus).map((option) => ({
                            value: option,
                            label: translatedAdminArticleStatus[option as ArticleStatus],
                        }))}
                    />
                </YStack>

                {isLoading && <Loader />}
                {data && data.total === 0 && (
                    <Typography variant="regularRegular" muted align="center" width="100%">
                        {t("common.not_found")}
                    </Typography>
                )}
                {data && data.items && <ArticlesManager onChangeStatus={handleChangeStatus} articles={data.items} />}
            </YStack>
        </AdminLayout>
    );
};

export default ManageArticlesScreen;
