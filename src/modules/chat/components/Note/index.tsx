import { MDXEditorMethods } from "@mdxeditor/editor";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, StickyNote, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Markdown from "../../../shared/components/Markdown";
import readError from "../../../shared/helpers/readError";
import useDebounce from "../../../shared/hooks/useDebounce";
import editNoteMutation from "../../queries/editNoteMutation";
import { getChatNoteQueryOptions } from "../../queries/getChatNoteQueryOptions";
import { Chat } from "../../types";
import ChatSidebarPanel from "../ChatSidebarPanel";

interface Props {
    chat: Chat;
    onClose: () => void;
}

const Note = ({ chat, onClose }: Props) => {
    const { data, isError, error, isLoading } = useQuery(getChatNoteQueryOptions({ id: chat.id }));
    const ref = useRef<MDXEditorMethods>(null);
    const { t } = useTranslation();
    const [content, setContent] = useState<string>(data ? data.content : "");

    const {
        error: saveNoteError,
        isPending,
        mutate,
    } = useMutation({
        mutationFn: editNoteMutation,
        onMutate: () => {
            setEdited(true);
        },
        onSuccess: () => {
            setEdited(false);
        },
        onError: () => {
            setEdited(true);
        },
    });

    const [edited, setEdited] = useState(false);
    const debounceValue = useDebounce(content, 1000);

    useEffect(() => {
        if (data) {
            ref.current?.insertMarkdown(data ? data.content : "");
            ref.current?.setMarkdown(data ? data.content : "");
            setContent(data ? data.content : "");
        }
    }, [data]);

    useEffect(() => {
        if (chat.is_active && debounceValue && edited) {
            mutate({ content: debounceValue, id: chat.id });
        }
    }, [debounceValue, chat.id, chat.is_active, edited, mutate]);

    return (
        <ChatSidebarPanel onClose={onClose}>
            {/* Header */}
            <div className="border-border/50 flex h-16 items-center justify-between border-b px-4">
                <div className="flex items-center gap-2.5">
                    <StickyNote className="text-primary-brand size-5" />
                    <h3 className="text-foreground text-sm font-semibold">{t("chat.note_title")}</h3>
                    {isPending && <Loader2 className="text-muted-foreground size-4 animate-spin" />}
                </div>
                <button
                    onClick={onClose}
                    className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-1.5 transition-colors"
                    aria-label={t("common.close", { defaultValue: "Close" })}
                >
                    <X className="size-4" />
                </button>
            </div>

            {/* Error banner */}
            {saveNoteError && (
                <div className="bg-destructive/10 border-destructive/20 border-b px-4 py-2">
                    <p className="text-destructive text-xs">{readError(saveNoteError)}</p>
                </div>
            )}

            {/* Editor */}
            <div onClick={() => ref.current && ref.current.focus()} className="min-h-0 flex-1 overflow-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="text-muted-foreground size-6 animate-spin" />
                    </div>
                ) : typeof content === "string" || content === null ? (
                    <Markdown
                        onChange={(value) => {
                            if (!chat.is_active) return;
                            setContent(value);
                            setEdited(true);
                        }}
                        ref={ref}
                        autoFocus
                        content={content || ""}
                        readonly={!chat.is_active}
                    />
                ) : null}

                {isError && <p className="text-destructive mt-2.5 px-4 text-center text-sm">{readError(error)}</p>}
            </div>
        </ChatSidebarPanel>
    );
};

export default Note;
