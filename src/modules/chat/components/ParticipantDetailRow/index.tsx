import { Stack, Typography, XStack } from "@fundacja-peryskop/ui";
import { ReactNode } from "react";

interface Props {
    /** Field name, e.g. "Role". */
    label: string;
    /** Field value - text, a badge or a value with an action. */
    children: ReactNode;
}

/**
 * One label / value pair of the participant details list. Renders as a
 * `<dt>` + `<dd>` pair so it must sit inside a `<dl>`. The value wraps below
 * the label when the popover is too narrow for both on one line.
 */
const ParticipantDetailRow = ({ label, children }: Props) => (
    <XStack tag="div" flexWrap="wrap" alignItems="center" justifyContent="space-between" columnGap="$md" minHeight={32}>
        <Typography tag="dt" variant="smallRegular" color="$colorMuted">
            {label}
        </Typography>
        <Stack tag="dd" flexDirection="row" alignItems="center" gap="$xs" marginLeft={0} minWidth={0} flexShrink={1}>
            {children}
        </Stack>
    </XStack>
);

export default ParticipantDetailRow;
