import { Stack } from "@fundacja-peryskop/ui";
import type { LucideIcon } from "lucide-react";

type StackProps = React.ComponentProps<typeof Stack>;

interface Props {
    icon: LucideIcon;
    /** Lucide icon colour (a resolved CSS colour from `useIconColor`). */
    color: string;
    /** Outer square size in px. */
    size?: number;
    /** Background tint - a DS colour token or any CSS colour. Defaults to the soft primary tint. */
    background?: StackProps["backgroundColor"];
}

/** Brand-tinted rounded square holding a lucide icon - the page's icon motif. */
export function IconBadge({ icon: Icon, color, size = 48, background = "$primarySoft" }: Props) {
    return (
        <Stack
            width={size}
            height={size}
            borderRadius="$md"
            alignItems="center"
            justifyContent="center"
            backgroundColor={background}
            flexShrink={0}
        >
            <Icon size={size * 0.5} color={color} />
        </Stack>
    );
}
