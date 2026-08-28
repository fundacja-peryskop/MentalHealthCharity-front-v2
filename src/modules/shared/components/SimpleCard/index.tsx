import { Typography, YStack, shadows } from "@fundacja-peryskop/ui";
import type { ReactNode } from "react";

interface Props {
    subtitle?: string;
    title?: string;
    text?: string;
    children?: ReactNode;
    /** Kept for call-site compatibility; the DS card owns its styling now. */
    className?: string;
    titleClassName?: string;
    textAlign?: "left" | "center" | "right" | "justify";
}

/**
 * Minimal content card on the design system — a soft-rounded surface with an
 * optional accent subtitle, heading and lead, plus arbitrary content below.
 */
const SimpleCard = ({ text, title, subtitle, children }: Props) => {
    return (
        <YStack
            tag="article"
            width="100%"
            gap="$lg"
            padding="$xl"
            borderRadius="$lg"
            backgroundColor="$background"
            {...shadows.small}
        >
            {subtitle || title || text ? (
                <YStack gap="$sm" width="100%">
                    {subtitle ? (
                        <Typography variant="regularSemibold" color="$primary">
                            {subtitle}
                        </Typography>
                    ) : null}
                    {title ? (
                        <Typography variant="title3" tag="h2" width="100%">
                            {title}
                        </Typography>
                    ) : null}
                    {text ? (
                        <Typography variant="regularRegular" muted width="100%">
                            {text}
                        </Typography>
                    ) : null}
                </YStack>
            ) : null}
            {children}
        </YStack>
    );
};

export default SimpleCard;
