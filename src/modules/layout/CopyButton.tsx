import { Stack } from "@fundacja-peryskop/ui";
import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useIconColor } from "./useIconColor";

/** How long (ms) the check mark stays after a successful copy. */
const COPIED_FEEDBACK_MS = 2000;

export interface CopyButtonProps {
    /** Text written to the clipboard. */
    value: string;
    /** Accessible name, e.g. "Copy email address". Pass a localised string. */
    label: string;
}

/**
 * Small icon-only button that copies `value` to the clipboard, confirming with
 * a toast and a brief check mark. Built from DS primitives; 32px keeps it a
 * comfortable touch target without dominating dense rows.
 */
export function CopyButton({ value, label }: CopyButtonProps) {
    const { t } = useTranslation();
    const icon = useIconColor();
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!copied) return;
        const timer = window.setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
        return () => window.clearTimeout(timer);
    }, [copied]);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            toast.success(t("common.copied_to_clipboard"));
        } catch {
            toast.error(t("common.copy_failed"));
        }
    };

    return (
        <Stack
            tag="button"
            role="button"
            aria-label={label}
            onPress={copy}
            width={32}
            height={32}
            flexShrink={0}
            alignItems="center"
            justifyContent="center"
            borderRadius="$full"
            borderWidth={0}
            cursor="pointer"
            backgroundColor="$backgroundTransparent"
            hoverStyle={{ backgroundColor: "$backgroundHover" }}
            pressStyle={{ backgroundColor: "$backgroundPress" }}
            focusVisibleStyle={{ outlineColor: "$borderColorFocus", outlineWidth: 2, outlineStyle: "solid" }}
        >
            {copied ? (
                <Check size={16} color={icon.primary} aria-hidden />
            ) : (
                <Copy size={16} color={icon.muted} aria-hidden />
            )}
        </Stack>
    );
}
