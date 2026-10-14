import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronDown, Pin, PinOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const CLEAR_CONFIRM_TIMEOUT_MS = 4000;

interface Props {
    count: number;
    limit: number;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
    onUnpinAll: () => void;
}

/** Section header of the pinned block, rendered as a row of the forms table. */
const PinnedFormsHeader = ({ count, limit, isCollapsed, onToggleCollapse, onUnpinAll }: Props) => {
    const { t } = useTranslation();
    const [isConfirmingClear, setIsConfirmingClear] = useState(false);

    // The "unpin all" confirmation is transient — never leave the button armed.
    useEffect(() => {
        if (!isConfirmingClear) {
            return;
        }

        const timeout = setTimeout(() => setIsConfirmingClear(false), CLEAR_CONFIRM_TIMEOUT_MS);

        return () => clearTimeout(timeout);
    }, [isConfirmingClear]);

    const collapseLabel = isCollapsed
        ? t("pinned_forms.expand", { defaultValue: "Rozwiń" })
        : t("pinned_forms.collapse", { defaultValue: "Zwiń" });

    return (
        <div className="flex h-full items-center gap-2">
            <Pin className="text-primary-brand size-3.5 shrink-0 fill-current" />
            <p className="text-foreground text-xs font-semibold tracking-wide uppercase">
                {t("pinned_forms.title", { defaultValue: "Przypięte formularze" })}
            </p>
            <Badge variant="outline" className="text-[10px]">
                {count}/{limit}
            </Badge>

            <div className="ml-auto flex items-center gap-1">
                <Button
                    variant={isConfirmingClear ? "destructive" : "ghost"}
                    size="xs"
                    onClick={() => {
                        if (!isConfirmingClear) {
                            setIsConfirmingClear(true);

                            return;
                        }

                        onUnpinAll();
                        setIsConfirmingClear(false);
                    }}
                >
                    <PinOff className="size-3" />
                    <span className="max-sm:sr-only">
                        {isConfirmingClear
                            ? t("pinned_forms.unpin_all_confirm", { defaultValue: "Na pewno?" })
                            : t("pinned_forms.unpin_all", { defaultValue: "Odepnij wszystkie" })}
                    </span>
                </Button>
                <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-expanded={!isCollapsed}
                    aria-label={collapseLabel}
                    title={collapseLabel}
                    onClick={onToggleCollapse}
                >
                    <ChevronDown className={cn("size-3.5 transition-transform", isCollapsed && "-rotate-90")} />
                </Button>
            </div>
        </div>
    );
};

export default PinnedFormsHeader;
