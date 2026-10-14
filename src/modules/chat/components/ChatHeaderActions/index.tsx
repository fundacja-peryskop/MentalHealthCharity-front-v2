import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { Menu } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "../../../../hooks/useBreakpoint";

export type ChatActionTone = "default" | "warning" | "danger";

export interface ChatHeaderAction {
    id: string;
    /** Accessible label + sheet row text + desktop tooltip. */
    label: string;
    icon: LucideIcon;
    onClick: () => void;
    tone?: ChatActionTone;
    disabled?: boolean;
}

interface Props {
    actions: ChatHeaderAction[];
}

/** Per-tone colours for the desktop icon buttons. */
const DESKTOP_TONE: Record<ChatActionTone, string> = {
    default: "text-muted-foreground hover:bg-muted hover:text-foreground",
    warning: "text-warning-brand hover:bg-warning-brand/10",
    danger: "text-destructive hover:bg-destructive/10",
};

/** Per-tone colours for the mobile sheet rows. */
const SHEET_TONE: Record<ChatActionTone, string> = {
    default: "text-foreground hover:bg-muted",
    warning: "text-warning-brand hover:bg-warning-brand/10",
    danger: "text-destructive hover:bg-destructive/10",
};

/**
 * Chat header actions (notes, report, contract, help, details, snooze, close).
 *
 * The caller passes already permission-gated actions as data, so this component
 * only owns presentation:
 *  - desktop: a compact row of icon buttons with tooltips;
 *  - mobile: a single "more" (hamburger) button that opens a bottom sheet with
 *    large, clearly labelled rows - easier to hit and understand on a phone.
 *
 * Non-default tones (snooze = warning, close = danger) are visually separated
 * from the everyday actions.
 */
const ChatHeaderActions = ({ actions }: Props) => {
    const { t } = useTranslation();
    const isMobile = useIsMobile();
    const [open, setOpen] = useState(false);

    if (actions.length === 0) return null;

    // Index of the first "special" (non-default) action, used to insert a divider.
    const firstSpecial = actions.findIndex((a) => (a.tone ?? "default") !== "default");

    if (!isMobile) {
        return (
            <div className="flex shrink-0 items-center gap-0.5">
                {actions.map((action, index) => {
                    const tone = action.tone ?? "default";
                    const Icon = action.icon;
                    return (
                        <div key={action.id} className="flex items-center">
                            {firstSpecial > 0 && index === firstSpecial && (
                                <div className="bg-border/60 mx-1 h-5 w-px" />
                            )}
                            <Tooltip>
                                <TooltipTrigger
                                    render={
                                        <button
                                            type="button"
                                            onClick={action.onClick}
                                            disabled={action.disabled}
                                            aria-label={action.label}
                                            className={cn(
                                                "flex size-10 items-center justify-center rounded-full transition-colors disabled:opacity-50",
                                                DESKTOP_TONE[tone]
                                            )}
                                        >
                                            <Icon className="size-5" />
                                        </button>
                                    }
                                />
                                <TooltipContent>{action.label}</TooltipContent>
                            </Tooltip>
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label={t("chat.more_actions", { defaultValue: "Więcej opcji" })}
                aria-haspopup="menu"
                className="text-muted-foreground hover:bg-muted hover:text-foreground flex size-10 shrink-0 items-center justify-center rounded-full transition-colors"
            >
                <Menu className="size-6" />
            </button>

            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent side="bottom" className="rounded-t-2xl pb-[max(env(safe-area-inset-bottom),0.5rem)]">
                    <SheetHeader className="pb-0">
                        <SheetTitle>{t("chat.actions_title", { defaultValue: "Opcje rozmowy" })}</SheetTitle>
                    </SheetHeader>
                    <div className="flex flex-col px-2 pb-2" role="menu">
                        {actions.map((action, index) => {
                            const tone = action.tone ?? "default";
                            const Icon = action.icon;
                            return (
                                <div key={action.id}>
                                    {firstSpecial > 0 && index === firstSpecial && (
                                        <div className="bg-border/60 mx-3 my-1 h-px" />
                                    )}
                                    <button
                                        type="button"
                                        role="menuitem"
                                        disabled={action.disabled}
                                        onClick={() => {
                                            action.onClick();
                                            setOpen(false);
                                        }}
                                        className={cn(
                                            "flex w-full items-center gap-3.5 rounded-xl px-3 py-3.5 text-left transition-colors disabled:opacity-50",
                                            SHEET_TONE[tone]
                                        )}
                                    >
                                        <Icon className="size-5 shrink-0" />
                                        <span className="text-base font-medium">{action.label}</span>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
};

export default ChatHeaderActions;
