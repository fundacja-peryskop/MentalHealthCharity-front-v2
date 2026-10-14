import { Typography, YStack } from "@fundacja-peryskop/ui";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { useIconColor } from "../../../layout/useIconColor";

export type StatusVariant = "success" | "error";

interface Props {
    title: string;
    children?: ReactNode;
    /** `success` draws a check in a teal circle; `error` draws a cross in a red circle. */
    variant?: StatusVariant;
}

const ICON_PATH: Record<StatusVariant, string> = {
    success: "M5 12.5l4 4L19 7",
    error: "M7 7l10 10M17 7L7 17",
};

/**
 * A calm, reusable result state: a soft circle whose mark (check or cross) draws
 * itself in, then the title and supporting content fade up underneath - a quiet,
 * reassuring confirmation rather than a loud celebration. Respects
 * `prefers-reduced-motion`. Shared by the multi-step forms and the auth flow.
 */
export function AnimatedStatus({ title, children, variant = "success" }: Props) {
    const icon = useIconColor();
    const reduce = useReducedMotion();
    const isError = variant === "error";
    const stroke = isError ? icon.danger : icon.primary;

    const fadeUp = (delay: number) =>
        reduce
            ? { initial: false as const }
            : {
                  initial: { opacity: 0, y: 10 },
                  animate: { opacity: 1, y: 0 },
                  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as const },
              };

    return (
        <YStack alignItems="center" gap="$lg" width="100%">
            <motion.div
                initial={reduce ? false : { scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 220, damping: 18, delay: reduce ? 0 : 0.05 }}
            >
                <YStack
                    width={92}
                    height={92}
                    borderRadius="$full"
                    backgroundColor={isError ? "$dangerSoft" : "$primarySoft"}
                    alignItems="center"
                    justifyContent="center"
                >
                    <svg width="44" height="44" viewBox="0 0 24 24" aria-hidden focusable="false">
                        <motion.path
                            d={ICON_PATH[variant]}
                            fill="none"
                            stroke={stroke}
                            strokeWidth={2.5}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            initial={reduce ? false : { pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.5, delay: reduce ? 0 : 0.25, ease: "easeInOut" }}
                        />
                    </svg>
                </YStack>
            </motion.div>

            <motion.div {...fadeUp(0.3)} style={{ width: "100%", textAlign: "center" }}>
                <Typography variant="title2" tag="h1" align="center">
                    {title}
                </Typography>
            </motion.div>

            {children ? (
                <motion.div {...fadeUp(0.45)} style={{ width: "100%" }}>
                    {children}
                </motion.div>
            ) : null}
        </YStack>
    );
}
