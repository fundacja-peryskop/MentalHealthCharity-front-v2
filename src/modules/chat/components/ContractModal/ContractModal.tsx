import { Button } from "@/components/ui/button";
import { MDXEditorMethods } from "@mdxeditor/editor";
import { useMutation, useQuery } from "@tanstack/react-query";
import { t } from "i18next";
import { BookOpen, CheckCircle, Loader2, X } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import Markdown from "../../../shared/components/Markdown";
import { Permissions } from "../../../shared/constants";
import useDebounce from "../../../shared/hooks/useDebounce";
import usePermissions from "../../../shared/hooks/usePermissions";
import { confirmContractForChatMutation } from "../../queries/confirmContractForChat";
import { editContractForChatMutation } from "../../queries/editContractForChat";
import { getContractForChat } from "../../queries/getContractForChat";
import ChatSidebarPanel from "../ChatSidebarPanel";

interface Props {
    onClose: () => void;
    chatId: string;
    readonly?: boolean;
}

const ContractSidebar = ({ onClose, chatId, readonly = false }: Props) => {
    const [content, setContent] = useState("");
    const [edited, setEdited] = useState(false);
    const ref = useRef<MDXEditorMethods>(null);
    const { data, isLoading, refetch } = useQuery(getContractForChat({ id: chatId }));
    const { hasPermissions } = usePermissions();
    const debouncedContent = useDebounce(content, 1000);

    useLayoutEffect(() => {
        if (data) {
            ref.current?.setMarkdown(data.content);
            setContent(data.content);
        }
    }, [data, chatId]);

    const { mutate: editContract, isPending: isSaving } = useMutation({
        mutationFn: editContractForChatMutation,
        onSuccess: () => {
            setEdited(false);
            refetch();
        },
        onError: () => {
            setEdited(true);
        },
    });

    useEffect(() => {
        if (
            !readonly &&
            debouncedContent &&
            edited &&
            data &&
            !data.is_confirmed &&
            debouncedContent !== data.content
        ) {
            editContract({ id: chatId, body: debouncedContent });
        }
    }, [debouncedContent, data, edited, chatId, editContract, readonly]);

    const { mutate: confirmContract } = useMutation({
        mutationFn: confirmContractForChatMutation,
        onSuccess: () => {
            toast.success(t("chat.contract_confirmed"));
            refetch();
        },
    });

    const handleConfirmContract = () => {
        confirmContract({
            id: chatId,
            body: { is_confirmed: true },
        });
    };

    return (
        <ChatSidebarPanel onClose={onClose}>
            {/* Header */}
            <div className="border-border/50 flex h-16 items-center justify-between border-b px-4">
                <div className="flex items-center gap-2.5">
                    <BookOpen className="text-primary-brand size-5" />
                    <h3 className="text-foreground text-sm font-semibold">{t("chat.contract")}</h3>
                    {isSaving && <Loader2 className="text-muted-foreground size-4 animate-spin" />}
                </div>
                <button
                    onClick={onClose}
                    className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-1.5 transition-colors"
                    aria-label={t("common.close", { defaultValue: "Close" })}
                >
                    <X className="size-4" />
                </button>
            </div>

            {/* Confirmed banner */}
            {data?.is_confirmed && (
                <div className="bg-success-brand/10 border-success-brand/20 flex items-center gap-2 border-b px-4 py-2">
                    <CheckCircle className="text-success-brand size-4" />
                    <p className="text-success-brand text-xs font-medium">{t("chat.contract_confirmed_desc")}</p>
                </div>
            )}

            {/* Editor */}
            <div onClick={() => ref.current?.focus()} className="min-h-0 flex-1 overflow-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="text-muted-foreground size-6 animate-spin" />
                    </div>
                ) : (
                    <Markdown
                        onChange={(value) => {
                            if (readonly) return;
                            setContent(value);
                            setEdited(true);
                        }}
                        ref={ref}
                        content={content}
                        readonly={readonly || data?.is_confirmed}
                    />
                )}
            </div>

            {/* Footer */}
            {!readonly && hasPermissions(Permissions.CAN_CONFIRM_CONTRACT) && data && !data.is_confirmed && (
                <div className="border-border/50 border-t px-4 py-3">
                    <Button onClick={handleConfirmContract} size="sm" className="w-full">
                        {t("chat.accept_contract")}
                    </Button>
                </div>
            )}
        </ChatSidebarPanel>
    );
};

export default ContractSidebar;
