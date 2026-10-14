import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useFormik } from "formik";
import { AlertCircle, Cloud, Eye, History, Laptop, Loader2, Save, Send, Settings } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";
import { useUser } from "../../../auth/components/AuthProvider";
import ChangeImageInput from "../../../shared/components/ChangeImageInput";
import Loader from "../../../shared/components/Loader";
import Markdown from "../../../shared/components/Markdown";
import SimpleCard from "../../../shared/components/SimpleCard";
import { Roles } from "../../../users/constants";
import {
    ArticleRequiredRoles,
    ArticleStatus,
    translatedArticleRequiredRoles,
    translatedArticleStatus,
} from "../../constants";
import { buildDraftKey, useArticleDraft } from "../../hooks/useArticleDraft";
import { getCategoriesQueryOptions } from "../../queries/getCategoriesQueryOptions";
import updateArticleBannerMutation from "../../queries/updateArticleBannerMutation";
import { CreateArticleValues } from "../../types";
import ArticlePreviewModal from "../ArticlePreviewModal";
import CreateArticleCategoryModal from "../CreateCategoryModal";
import SaveDraftWarningModal from "../SaveDraftWarningModal";
import Videoplayer from "../Videoplayer";

interface Props {
    initialValues?: CreateArticleValues;
    onSubmit: (values: CreateArticleValues) => void;
    onSaveDraft: (values: CreateArticleValues) => void;
    articleId?: number;
    /** Whether a save to the server is currently in flight. */
    isSaving?: boolean;
    /** Timestamp (ms) of the last successful save to the server, if known. */
    lastCloudSavedAt?: number | null;
    /** Current persisted status of the article being edited (undefined when creating). */
    currentStatus?: ArticleStatus;
}

const TITLE_MIN = 3;
const TITLE_MAX = 150;
const CONTENT_MIN = 20;

const formatTimestamp = (ts: number | null) =>
    ts ? new Date(ts).toLocaleString("pl-PL", { dateStyle: "medium", timeStyle: "short" }) : null;

const RequiredMark = () => (
    <span aria-hidden className="text-destructive ml-0.5">
        *
    </span>
);

const ArticleEditor = ({
    initialValues,
    onSubmit,
    onSaveDraft,
    articleId,
    isSaving = false,
    lastCloudSavedAt = null,
    currentStatus,
}: Props) => {
    const { t } = useTranslation();
    const { user, isLoading } = useUser();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isDraftWarningOpen, setIsDraftWarningOpen] = useState(false);
    // Clears the local draft once the form is committed to the server; assigned
    // below after the draft hook is initialised.
    const commitDraftRef = useRef<() => void>(() => {});
    const { data: categories, isLoading: isCategoriesLoading, refetch } = useQuery(getCategoriesQueryOptions());
    const { mutate: updateArticleBanner, isPending: isArticleBannerUpdatePending } = useMutation({
        mutationFn: updateArticleBannerMutation,
        onSuccess: () => {
            toast.success(t("articles.article_banner_updated"));
        },
    });

    const handleUpdateApiArticleBanner = (banner: File) => {
        if (!articleId) return;
        updateArticleBanner({ article_id: articleId, banner });
    };

    // Only statuses that make sense as a "submit as" target from the editor.
    const allowedStatuses = useMemo(
        () => [
            {
                value: ArticleStatus.SENT,
                role: [Roles.ADMIN, Roles.REDACTOR, Roles.VOLUNTEER, Roles.VOLUNTEERSUPERVISOR],
            },
            {
                value: ArticleStatus.PUBLISHED,
                role: [Roles.ADMIN, Roles.REDACTOR, Roles.VOLUNTEERSUPERVISOR],
            },
            {
                value: ArticleStatus.CORRECTED,
                role: [Roles.ADMIN, Roles.REDACTOR, Roles.VOLUNTEER, Roles.VOLUNTEERSUPERVISOR],
            },
        ],
        []
    );

    const formik = useFormik<CreateArticleValues>({
        initialValues: {
            title: "",
            content: "",
            article_category_id: null,
            banner_url: undefined,
            required_role: ArticleRequiredRoles.ANYONE,
            status: ArticleStatus.SENT,
            video_url: "",
            ...initialValues,
        },
        enableReinitialize: true,
        validationSchema: Yup.object({
            title: Yup.string()
                .trim()
                .required(t("validation.required"))
                .min(TITLE_MIN, t("validation.min_length", { count: TITLE_MIN }))
                .max(TITLE_MAX, t("validation.max_length", { count: TITLE_MAX })),
            content: Yup.string()
                .required(t("validation.required"))
                .test("not-empty", t("validation.required"), (v) => !!v && v.trim().length > 0)
                .test("min-content", t("validation.min_length", { count: CONTENT_MIN }), (v) => {
                    if (!v) return false;
                    // Ignore markdown noise when checking that there is real content.
                    const plain = v.replace(/[#*_~`>[\]()!|-]/g, "").trim();
                    return plain.length >= CONTENT_MIN;
                }),
            article_category_id: Yup.number().nullable().required(t("articles.category_required")),
            video_url: Yup.string().url(t("validation.invalid_url")),
        }),
        onSubmit: (values) => {
            commitDraftRef.current();
            onSubmit(values);
        },
    });

    const draft = useArticleDraft(formik, user ? buildDraftKey(user.id, articleId) : null);
    commitDraftRef.current = draft.markSaved;

    if (isLoading || !user) {
        return <Loader variant="fullscreen" />;
    }

    const errorList = Object.entries(formik.errors).filter(([, message]) => !!message) as [string, string][];
    const showErrorSummary = formik.submitCount > 0 && errorList.length > 0;

    const selectedCategoryName = categories?.items.find(
        (category) => category.id === formik.values.article_category_id
    )?.name;

    const localSavedText = formatTimestamp(draft.lastLocalSavedAt);
    const cloudSavedText = formatTimestamp(lastCloudSavedAt);

    const performSaveDraft = () => {
        draft.markSaved();
        onSaveDraft(formik.values);
    };

    const handleSaveDraftClick = async () => {
        // A draft is lenient: it only needs a valid title and a category so the
        // author can safely come back to it later.
        const touched: Record<string, boolean> = { title: true, article_category_id: true };
        const title = formik.values.title?.trim() ?? "";

        if (title.length < TITLE_MIN || !formik.values.article_category_id) {
            formik.setTouched({ ...formik.touched, ...touched }, true);
            toast.error(t("articles.draft_requirements"));
            return;
        }

        // Saving as draft changes the lifecycle status of an already-submitted or
        // published article - warn the author before it happens.
        if (currentStatus && currentStatus !== ArticleStatus.DRAFT) {
            setIsDraftWarningOpen(true);
            return;
        }

        performSaveDraft();
    };

    const handleRestoreDraft = () => {
        draft.restore();
        toast.success(t("articles.draft_restore.restored"));
    };

    const handleDiscardDraft = () => {
        draft.discard();
        toast(t("articles.draft_restore.discarded"));
    };

    return (
        <form onSubmit={formik.handleSubmit} noValidate>
            {draft.restorableAt && (
                <div
                    role="status"
                    className="border-primary/30 bg-primary/5 mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4"
                >
                    <div className="flex items-center gap-2.5">
                        <History className="text-primary size-5 shrink-0" />
                        <p className="text-sm">
                            {t("articles.draft_restore.message", {
                                time: new Date(draft.restorableAt).toLocaleString("pl-PL"),
                            })}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button type="button" size="sm" onClick={handleRestoreDraft}>
                            {t("articles.draft_restore.restore")}
                        </Button>
                        <Button type="button" size="sm" variant="ghost" onClick={handleDiscardDraft}>
                            {t("articles.draft_restore.discard")}
                        </Button>
                    </div>
                </div>
            )}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                <SimpleCard className="min-w-0 flex-1">
                    <ChangeImageInput
                        className="min-h-[360px] md:min-h-[480px]"
                        value={formik.values.banner_url}
                        isLoading={isArticleBannerUpdatePending}
                        onChange={(image) => {
                            formik.setFieldValue("banner_url", image);
                            if (articleId && image) {
                                handleUpdateApiArticleBanner(image);
                            }
                        }}
                    />

                    <div className="my-5 flex flex-wrap gap-5 md:flex-nowrap md:items-start">
                        <div className="w-full space-y-1.5">
                            <Label htmlFor="title">
                                {t("articles.form.title")}
                                <RequiredMark />
                            </Label>
                            <Input
                                id="title"
                                name="title"
                                maxLength={TITLE_MAX}
                                placeholder={t("articles.form.title_placeholder")}
                                aria-invalid={!!(formik.touched.title && formik.errors.title)}
                                value={formik.values.title}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                            {formik.touched.title && formik.errors.title ? (
                                <p className="text-destructive text-sm">{formik.errors.title as string}</p>
                            ) : (
                                <p className="text-muted-foreground text-xs">
                                    {t("articles.form.title_counter", {
                                        count: formik.values.title.length,
                                        max: TITLE_MAX,
                                    })}
                                </p>
                            )}
                        </div>
                        <div className="w-full space-y-1.5">
                            <Label htmlFor="article_category_id">
                                {t("articles.form.article_category_id")}
                                <RequiredMark />
                            </Label>
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <select
                                    id="article_category_id"
                                    name="article_category_id"
                                    disabled={isCategoriesLoading}
                                    value={formik.values.article_category_id ?? ""}
                                    aria-invalid={
                                        !!(formik.touched.article_category_id && formik.errors.article_category_id)
                                    }
                                    onChange={(e) =>
                                        formik.setFieldValue(
                                            "article_category_id",
                                            e.target.value ? Number(e.target.value) : null
                                        )
                                    }
                                    onBlur={formik.handleBlur}
                                    className="border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive h-10 w-full min-w-0 rounded-lg border bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:ring-3 disabled:opacity-50 sm:flex-1"
                                >
                                    <option value="">{t("articles.form.select_category")}</option>
                                    {categories?.items.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-10 w-full shrink-0 gap-2.5 px-4 sm:w-auto"
                                    onClick={() => setIsModalOpen(true)}
                                >
                                    <Settings className="size-5" />
                                    {t("articles.manage_categories")}
                                </Button>
                            </div>
                            {formik.touched.article_category_id && formik.errors.article_category_id && (
                                <p className="text-destructive text-sm">{formik.errors.article_category_id}</p>
                            )}
                            {isCategoriesLoading && <Loader />}
                        </div>
                    </div>

                    {formik.values.video_url && !formik.errors.video_url && (
                        <Videoplayer className="my-5 h-[600px]" src={formik.values.video_url} />
                    )}
                    <div className="mb-5 w-full space-y-1.5">
                        <Label htmlFor="video_url">{t("articles.form.video_url")}</Label>
                        <Input
                            id="video_url"
                            name="video_url"
                            placeholder="https://youtube.com/watch?v=..."
                            aria-invalid={!!(formik.touched.video_url && formik.errors.video_url)}
                            value={formik.values.video_url}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        />
                        {formik.touched.video_url && formik.errors.video_url && (
                            <p className="text-destructive text-sm">{formik.errors.video_url as string}</p>
                        )}
                    </div>

                    <div className="mb-2.5 space-y-1.5">
                        <Label>
                            {t("articles.form.content_label")}
                            <RequiredMark />
                        </Label>
                        <div
                            className="rounded-[10px]"
                            style={{
                                outline:
                                    formik.touched.content && formik.errors.content
                                        ? "2px solid var(--color-danger-brand)"
                                        : "none",
                            }}
                        >
                            <Markdown
                                className="article-editor-md"
                                onChange={(markdown) => formik.setFieldValue("content", markdown)}
                                readOnly={false}
                                placeholder={t("articles.form.content")}
                                content={formik.values.content}
                            />
                        </div>
                        {formik.touched.content && formik.errors.content && (
                            <p className="text-destructive text-sm">{formik.errors.content as string}</p>
                        )}
                    </div>

                    {showErrorSummary && (
                        <div
                            role="alert"
                            className="border-destructive/40 bg-destructive/5 mb-4 flex gap-3 rounded-lg border p-4"
                        >
                            <AlertCircle className="text-destructive mt-0.5 size-5 shrink-0" />
                            <div className="space-y-1">
                                <p className="text-destructive text-sm font-medium">{t("articles.form.fix_errors")}</p>
                                <ul className="text-destructive/90 list-inside list-disc text-sm">
                                    {errorList.map(([field, message]) => (
                                        <li key={field}>{message}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    <div className="flex w-full flex-wrap items-end justify-between gap-4 md:flex-nowrap">
                        <div className="flex flex-wrap gap-4 md:flex-nowrap md:gap-6">
                            <Button type="submit" className="gap-2">
                                <Send className="size-4" />
                                {t("articles.send")}
                            </Button>
                            <Button
                                onClick={() => setIsPreviewOpen(true)}
                                variant="ghost"
                                type="button"
                                className="gap-2"
                            >
                                <Eye className="size-4" />
                                {t("articles.preview.button")}
                            </Button>
                        </div>

                        <div className="flex flex-wrap gap-4 md:flex-nowrap">
                            <div className="space-y-1.5">
                                <Label htmlFor="required_role">{t("articles.form.required_role")}</Label>
                                <select
                                    id="required_role"
                                    name="required_role"
                                    disabled={isCategoriesLoading}
                                    value={formik.values.required_role}
                                    onChange={(e) => formik.setFieldValue("required_role", e.target.value)}
                                    onBlur={formik.handleBlur}
                                    className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-10 w-[200px] rounded-lg border bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:ring-3"
                                >
                                    {Object.values(ArticleRequiredRoles).map((role) => (
                                        <option key={role} value={role}>
                                            {translatedArticleRequiredRoles[role]}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="status">{t("articles.form.status")}</Label>
                                <select
                                    id="status"
                                    name="status"
                                    disabled={isCategoriesLoading}
                                    value={formik.values.status}
                                    onChange={(e) => formik.setFieldValue("status", e.target.value)}
                                    onBlur={formik.handleBlur}
                                    className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-10 w-[200px] rounded-lg border bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:ring-3"
                                >
                                    {allowedStatuses
                                        .filter(({ role }) => role.includes(user.user_role))
                                        .map(({ value }) => (
                                            <option key={value} value={value}>
                                                {translatedArticleStatus[value]}
                                            </option>
                                        ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </SimpleCard>

                <aside className="w-full lg:w-72 lg:shrink-0">
                    <div className="bg-card space-y-4 rounded-xl border p-4 lg:sticky lg:top-4">
                        <div className="flex items-center gap-2 border-b pb-3">
                            <Save className="text-primary size-4" />
                            <h3 className="text-foreground text-sm font-semibold">{t("articles.sidebar.title")}</h3>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-start gap-2.5">
                                <Laptop className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-foreground text-xs font-medium">
                                        {t("articles.sidebar.local_label")}
                                    </p>
                                    <p className="text-muted-foreground text-xs">
                                        {localSavedText ?? t("articles.sidebar.local_none")}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2.5">
                                <Cloud className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-foreground text-xs font-medium">
                                        {t("articles.sidebar.cloud_label")}
                                    </p>
                                    <p className="text-muted-foreground text-xs">
                                        {cloudSavedText ?? t("articles.sidebar.cloud_none")}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Button
                            type="button"
                            onClick={handleSaveDraftClick}
                            disabled={isSaving}
                            className="w-full gap-2"
                        >
                            {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                            {t("articles.save_draft_version")}
                        </Button>
                        <p className="text-muted-foreground text-[11px] leading-snug">{t("articles.sidebar.hint")}</p>
                    </div>
                </aside>
            </div>

            <CreateArticleCategoryModal open={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={refetch} />
            <ArticlePreviewModal
                open={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                values={formik.values}
                author={user}
                categoryName={selectedCategoryName}
            />
            <SaveDraftWarningModal
                open={isDraftWarningOpen}
                currentStatus={currentStatus ?? ArticleStatus.DRAFT}
                onClose={() => setIsDraftWarningOpen(false)}
                onConfirm={() => {
                    setIsDraftWarningOpen(false);
                    performSaveDraft();
                }}
            />
        </form>
    );
};

export default ArticleEditor;
