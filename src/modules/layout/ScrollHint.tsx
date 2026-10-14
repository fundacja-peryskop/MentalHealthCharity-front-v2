import { Typography } from "@fundacja-peryskop/ui";
import { ChevronDown } from "lucide-react";
import { useEffect, useState, type RefObject } from "react";
import { useIconColor } from "./useIconColor";

/**
 * Plain `<button>` (not a Tamagui primitive) so the fixed positioning and the
 * show / hide transition below are not overridden by Tamagui's atomic classes.
 * `nowrap` keeps it on one line: anchored at `left: 50%`, a fixed element would
 * otherwise shrink to half the viewport and wrap its label on phones.
 * It fades in with a short delay so it doesn't flash on load, and the arrow
 * bobs gently; both are static under reduced motion.
 */
const CLASS = "scroll-hint";
const STYLE = `
@keyframes ${CLASS}-bob{0%,100%{transform:translateY(0);}50%{transform:translateY(3px);}}
.${CLASS}{position:fixed;left:50%;bottom:calc(24px + env(safe-area-inset-bottom));z-index:40;
  display:inline-flex;align-items:center;gap:6px;padding:10px 16px 10px 18px;border-radius:9999px;cursor:pointer;
  white-space:nowrap;
  background:#ffffff;border:1px solid #e3e5e5;box-shadow:0 10px 30px rgba(9,10,10,.12);
  opacity:0;visibility:hidden;transform:translate(-50%,8px);
  transition:opacity .3s ease,transform .3s ease,visibility 0s linear .3s;}
.${CLASS}--visible{opacity:1;visibility:visible;transform:translate(-50%,0);
  transition:opacity .3s ease .6s,transform .3s ease .6s,visibility 0s linear .6s;}
.${CLASS}:focus-visible{outline:3px solid #06b7a7;outline-offset:3px;}
.${CLASS}__arrow{display:inline-flex;animation:${CLASS}-bob 1.6s ease-in-out infinite;}
@media (prefers-reduced-motion:reduce){.${CLASS},.${CLASS}--visible{transition:none;}.${CLASS}__arrow{animation:none;}}
`;

interface Props {
    /** The element the reader should reach (e.g. the page's main button). */
    target: RefObject<HTMLElement>;
    label: string;
}

/**
 * A small floating "scroll to continue" pill, shown only while `target` is
 * still below the visible area. Clicking it scrolls the target into view.
 * Hidden as soon as the target appears, and never shown if it fits on screen.
 */
export function ScrollHint({ target, label }: Props) {
    const icon = useIconColor();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const node = target.current;
        if (!node || typeof IntersectionObserver === "undefined") return;
        const observer = new IntersectionObserver(
            ([entry]) => setVisible(!entry.isIntersecting && entry.boundingClientRect.top > 0),
            { rootMargin: "0px 0px -24px 0px" }
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, [target]);

    const scrollToTarget = () => {
        const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        target.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    };

    return (
        <>
            <style>{STYLE}</style>
            <button
                type="button"
                className={`${CLASS}${visible ? ` ${CLASS}--visible` : ""}`}
                onClick={scrollToTarget}
                aria-hidden={!visible}
                tabIndex={visible ? 0 : -1}
            >
                {/* Tamagui text sets its own `white-space`, so nowrap goes on it directly. */}
                <Typography variant="smallSemibold" tag="span" style={{ whiteSpace: "nowrap" }}>
                    {label}
                </Typography>
                <span className={`${CLASS}__arrow`} aria-hidden>
                    <ChevronDown size={18} color={icon.primary} strokeWidth={2.5} />
                </span>
            </button>
        </>
    );
}
