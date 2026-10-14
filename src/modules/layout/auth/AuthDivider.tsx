import { Stack, Typography, XStack } from "@fundacja-peryskop/ui";

/** A horizontal rule with a centred label ("or"), separating primary and secondary actions. */
export function AuthDivider({ label }: { label: string }) {
    return (
        <XStack alignItems="center" gap="$md" width="100%">
            <Stack flex={1} height={1} backgroundColor="$borderColor" />
            <Typography variant="smallRegular" muted>
                {label}
            </Typography>
            <Stack flex={1} height={1} backgroundColor="$borderColor" />
        </XStack>
    );
}
