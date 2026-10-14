import { Stack, type GetProps } from "@fundacja-peryskop/ui";

type StackProps = GetProps<typeof Stack>;

/**
 * Centered content container (spec §3): caps width and applies consistent
 * horizontal gutters that widen on larger viewports. Sections use this to keep
 * their content aligned to a shared measure while backgrounds go full-bleed.
 */
export function PageContainer(props: StackProps) {
    return (
        <Stack
            width="100%"
            maxWidth={1200}
            alignSelf="center"
            paddingHorizontal="$lg"
            $sm={{ paddingHorizontal: "$xl" }}
            {...props}
        />
    );
}
