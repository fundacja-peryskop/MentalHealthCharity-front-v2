import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, ImageOff, User as UserIcon } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { User } from "../../../auth/types";
import Markdown from "../../../shared/components/Markdown";
import Modal from "../../../shared/components/Modal";
import formatDate from "../../../shared/helpers/formatDate";
import resolveAssetUrl from "../../../shared/helpers/resolveAssetUrl";
import { translatedRoles } from "../../../users/constants";
import { CreateArticleValues } from "../../types";
import Videoplayer from "../Videoplayer";

interface Props {
    open: boolean;
    onClose: () => void;
    values: CreateArticleValues;
    author: User;
    categoryName?: string;
}

const stripMarkdown = (text: string) =>
    text
        .replace(/[#*_~`>[\]()!|-]/g, "")
        .replace(/\n+/g, " ")
        .trim();

const estimateReadingTime = (content: string) => {
    const words = stripMarkdown(content).split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
};

const isValidUrl = (value: string) => {
    try {
        new URL(value);
        return true;
    } catch {
        return false;
    }
};

const ArticlePreviewModal = ({ open, onClose, values, author, categoryName }: Props) => {
    const { t } = useTranslation();

    // Resolve the banner the same way readers will see it: object URL for a freshly
    // picked File, resolved API URL for an existing string.
    const bannerUrl = useMemo(() => {
        if (values.banner_url instanceof File) {
            return URL.createObjectURL(values.banner_url);
        }
        if (typeof values.banner_url === "string" && values.banner_url) {
            return resolveAssetUrl(values.banner_url);
        }
        return undefined;
    }, [values.banner_url]);

    useEffect(() => {
        return () => {
            if (values.banner_url instanceof File && bannerUrl) {
                URL.revokeObjectURL(bannerUrl);
            }
        };
    }, [values.banner_url, bannerUrl]);

    const readingTime = estimateReadingTime(values.content);
    const hasVideo = !!values.video_url && isValidUrl(values.video_url);
    const title = values.title || t("articles.preview.untitled");
    const today = formatDate(new Date().toISOString());
    const excerpt = stripMarkdown(values.content).slice(0, 120);

    return (
        <Modal
            title={t("articles.preview.title")}
            open={open}
            onClose={onClose}
            className="max-h-[95vh] w-full max-sm:max-w-[calc(100%-1rem)] sm:max-w-5xl"
            contentClassName="space-y-8"
        >
            {/* Card preview - how the article appears on listings */}
            <section className="space-y-3">
                <h3 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                    {t("articles.preview.card_heading")}
                </h3>
                <div className="bg-card mx-auto w-full max-w-sm overflow-hidden rounded-xl border shadow-sm">
                    <div className="relative">
                        {bannerUrl ? (
                            <img src={bannerUrl} alt={title} className="h-48 w-full object-cover" />
                        ) : (
                            <div className="bg-muted text-muted-foreground flex h-48 w-full items-center justify-center">
                                <ImageOff className="size-8" />
                            </div>
                        )}
                        {categoryName && (
                            <Badge className="text-foreground dark:bg-card/80 absolute bottom-3 left-3 rounded-md bg-white/80 px-2.5 py-1 text-xs font-semibold uppercase shadow-sm backdrop-blur-sm">
                                {categoryName}
                            </Badge>
                        )}
                    </div>
                    <div className="p-5">
                        <h4 className="text-foreground line-clamp-2 text-lg font-semibold">{title}</h4>
                        <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">
                            {excerpt ? `${excerpt}…` : t("articles.preview.no_content")}
                        </p>
                        <div className="mt-4 flex items-center gap-2.5">
                            <Avatar className="size-8 rounded-full">
                                <AvatarImage src={resolveAssetUrl(author.chat_avatar_url)} alt={author.full_name} />
                                <AvatarFallback className="rounded-full text-xs">
                                    <UserIcon className="size-3.5" />
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-foreground text-xs font-medium">{author.full_name}</p>
                                <p className="text-muted-foreground text-[11px]">{today}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Separator />

            {/* Full article preview - mirrors the reader-facing ArticleView layout */}
            <section className="space-y-3">
                <h3 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                    {t("articles.preview.article_heading")}
                </h3>
                <article className="overflow-hidden rounded-xl border">
                    <div className="relative flex min-h-[240px] items-end overflow-hidden md:min-h-[320px]">
                        {bannerUrl ? (
                            <img
                                src={bannerUrl}
                                alt=""
                                aria-hidden
                                className="absolute inset-0 h-full w-full object-cover"
                            />
                        ) : (
                            <div className="bg-muted text-muted-foreground absolute inset-0 flex flex-col items-center justify-center gap-2">
                                <ImageOff className="size-8" />
                                <span className="text-sm">{t("articles.preview.no_banner")}</span>
                            </div>
                        )}
                        <div className="from-background via-background/80 absolute inset-0 bg-gradient-to-t to-transparent" />

                        <div className="relative z-10 w-full px-6 pb-8 md:px-8">
                            {categoryName && (
                                <Badge className="bg-primary-brand/90 mb-4 border-0 px-3 py-1 text-xs font-semibold tracking-wide text-white uppercase backdrop-blur-sm">
                                    {categoryName}
                                </Badge>
                            )}
                            <h1 className="text-foreground text-2xl leading-tight font-bold tracking-tight md:text-4xl md:leading-tight">
                                {title}
                            </h1>

                            <div className="mt-5 flex flex-wrap items-center gap-4">
                                <div className="flex items-center gap-2.5">
                                    <Avatar className="ring-background/50 size-10 ring-2">
                                        <AvatarImage
                                            src={resolveAssetUrl(author.chat_avatar_url)}
                                            alt={author.full_name}
                                        />
                                        <AvatarFallback>
                                            <UserIcon className="size-4" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-foreground text-sm font-semibold">{author.full_name}</p>
                                        <p className="text-muted-foreground text-xs">
                                            {translatedRoles[author.user_role]}
                                        </p>
                                    </div>
                                </div>

                                <Separator orientation="vertical" className="!h-6 opacity-30" />

                                <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
                                    <Calendar className="size-3.5" />
                                    <span>{today}</span>
                                </div>

                                <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
                                    <Clock className="size-3.5" />
                                    <span>
                                        {t("articles.reading_time", {
                                            defaultValue: "{{count}} min",
                                            count: readingTime,
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-8 md:px-8">
                        {hasVideo && (
                            <Videoplayer
                                className="mb-8 aspect-video overflow-hidden rounded-2xl shadow-lg"
                                src={values.video_url}
                            />
                        )}
                        {values.content.trim() ? (
                            <div className="article-content">
                                <Markdown readOnly content={values.content} />
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-sm italic">{t("articles.preview.no_content")}</p>
                        )}
                    </div>
                </article>
            </section>
        </Modal>
    );
};

export default ArticlePreviewModal;
