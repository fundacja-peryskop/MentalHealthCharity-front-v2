import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import ArticleEditor from "../modules/articles/components/ArticleEditor";
import { ArticleRequiredRoles, ArticleStatus } from "../modules/articles/constants";
import { getArticleByIdQueryOptions } from "../modules/articles/queries/getArticleByIdQueryOptions";
import updateArticleMutation from "../modules/articles/queries/updateArticleMutation";
import { CreateArticleValues, UpdateArticlePayload } from "../modules/articles/types";
import Container from "../modules/shared/components/Container";
import Loader from "../modules/shared/components/Loader";
import NotFoundScreen from "./NotFoundScreen";

const EditArticleScreen = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams();

    const [cloudSavedAt, setCloudSavedAt] = useState<number | null>(null);

    const { mutate: editArticle, isPending: isArticleEditPending } = useMutation({
        mutationFn: updateArticleMutation,
    });

    const { data, isLoading } = useQuery(
        getArticleByIdQueryOptions(
            { id: Number(id) },
            {
                enabled: !!id,
            }
        )
    );

    // In edit mode the banner is managed separately (the /banner endpoint on
    // image change), so the update payload must never carry a banner_url - sending
    // it back would let the resolved absolute URL be persisted and then doubled.
    const buildUpdatePayload = (values: CreateArticleValues, status: ArticleStatus): UpdateArticlePayload => ({
        banner_base64: "",
        article_category_id: values.article_category_id || 0,
        article_id: Number(id),
        content: values.content,
        required_role: values.required_role,
        status,
        title: values.title,
        video_url: values.video_url,
    });

    const handleEditArticle = async (values: CreateArticleValues) => {
        editArticle(buildUpdatePayload(values, values.status), {
            onSuccess: () => {
                toast.success(t("articles.article_created"));
                setTimeout(() => navigate("/articles/dashboard"), 2000);
            },
        });
    };

    const handleCreateDraft = async (values: CreateArticleValues) => {
        // Save in place - no redirect - so the author can keep working.
        editArticle(buildUpdatePayload(values, ArticleStatus.DRAFT), {
            onSuccess: () => {
                toast.success(t("articles.draft_saved"));
                setCloudSavedAt(Date.now());
            },
        });
    };

    const initialValues: CreateArticleValues = {
        title: data?.title || "",
        content: data?.content || "",
        banner_url: data?.banner_url,
        article_category_id: data?.article_category.id || 0,
        status: ArticleStatus.CORRECTED,
        required_role: data?.required_role || ArticleRequiredRoles.ANYONE,
        video_url: data?.video_url || "",
    };

    if (isLoading) {
        return <Loader variant="fullscreen" />;
    }

    if (!data) {
        return <NotFoundScreen />;
    }

    return (
        <Container parentClassName="z-0 bg-border-brand shadow-md" className="max-w-[1440px]">
            {isArticleEditPending && <Loader variant="fullscreen" />}
            <div className="mb-5">
                {data && (
                    <ArticleEditor
                        initialValues={initialValues}
                        onSaveDraft={handleCreateDraft}
                        articleId={Number(id)}
                        onSubmit={(values) => handleEditArticle(values)}
                        isSaving={isArticleEditPending}
                        lastCloudSavedAt={cloudSavedAt ?? (data.creation_date ? Date.parse(data.creation_date) : null)}
                        currentStatus={data.status}
                    />
                )}
            </div>
        </Container>
    );
};

export default EditArticleScreen;
