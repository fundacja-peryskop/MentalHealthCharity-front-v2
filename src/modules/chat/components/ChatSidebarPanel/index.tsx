import { cn } from "@/lib/utils";
import { PropsWithChildren } from "react";
import { useIsMobile, useIsWideDesktop } from "../../../../hooks/useBreakpoint";

interface Props {
    className?: string;
    /**
     * Closes the panel. Used by the overlay scrim (mobile + medium widths) so a
     * tap outside the panel dismisses it. The panel's own header close button
     * handles the explicit case.
     */
    onClose?: () => void;
}

/**
 * Container for the auxiliary chat panels (details, help rules, note, contract).
 *
 * Responsive behaviour, so the conversation is never squeezed:
 *  - wide screens (>= 1200px): a rounded side column next to the conversation;
 *  - medium screens (900-1199px): an overlay drawer sliding in from the right,
 *    over a dimming scrim;
 *  - mobile (< 900px): a full-screen overlay.
 */
const ChatSidebarPanel = ({ children, className, onClose }: PropsWithChildren<Props>) => {
    const isMobile = useIsMobile();
    const isWide = useIsWideDesktop();
    const isDrawer = !isMobile && !isWide;

    // Mobile: full-screen overlay.
    if (isMobile) {
        return (
            <div
                className={cn("bg-card fixed inset-0 z-50 flex h-[100dvh] w-full flex-col", className)}
                role="dialog"
                aria-modal="true"
            >
                {children}
            </div>
        );
    }

    // Medium: right-hand drawer over a scrim.
    if (isDrawer) {
        return (
            <>
                <div
                    className="fixed inset-0 z-40 bg-black/30"
                    onClick={onClose}
                    aria-hidden
                    style={{ cursor: onClose ? "pointer" : "default" }}
                />
                <div
                    className={cn(
                        "bg-card animate-slide-in-right fixed top-0 right-0 z-50 flex h-[100dvh] w-[min(400px,100%)] flex-col rounded-l-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)]",
                        className
                    )}
                    role="dialog"
                    aria-modal="true"
                >
                    {children}
                </div>
            </>
        );
    }

    // Wide: rounded side column matching the chat shell.
    return (
        <div
            className={cn(
                "bg-card flex h-full w-[320px] shrink-0 flex-col overflow-hidden rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]",
                className
            )}
        >
            {children}
        </div>
    );
};

export default ChatSidebarPanel;
