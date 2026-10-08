import { motion } from "framer-motion";
import { useIconColor } from "../../../layout/useIconColor";

/**
 * A 2px progress line pinned to the very bottom edge of the viewport, filling
 * from left to right as the visitor advances through the form. Fixed-position so
 * it spans the full screen width regardless of the form's own layout.
 */
export function FormProgressBar({ progress }: { progress: number }) {
    const icon = useIconColor();
    const value = Math.round(progress);

    return (
        <div
            role="progressbar"
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={100}
            style={{ position: "fixed", left: 0, right: 0, bottom: 0, height: 2, zIndex: 60, pointerEvents: "none" }}
        >
            <motion.div
                style={{ height: "100%", backgroundColor: icon.primary, transformOrigin: "left" }}
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
        </div>
    );
}
