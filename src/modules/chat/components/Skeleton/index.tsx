import { Stack } from "@fundacja-peryskop/ui";
import type { GetProps } from "@fundacja-peryskop/ui";

type StackProps = GetProps<typeof Stack>;

interface Props extends StackProps {
    /** Shorthand: fully rounded block (for avatar placeholders). */
    circle?: boolean;
}

/**
 * Minimal loading placeholder built from DS tokens. The DS has no Skeleton yet,
 * so this lives in the chat module for now (to be promoted to the library
 * later). The gentle pulse is driven by the global `animate-pulse` utility,
 * which the app-wide `prefers-reduced-motion: reduce` rule already disables.
 */
const Skeleton = ({ circle = false, style, ...rest }: Props) => (
    <Stack
        backgroundColor="$backgroundStrong"
        borderRadius={circle ? "$full" : "$sm"}
        className="animate-pulse"
        style={style}
        {...rest}
    />
);

export default Skeleton;
