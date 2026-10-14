import { Typography, XStack } from "@fundacja-peryskop/ui";
import { categoryColor } from "../../helpers/categoryColor";

interface Props {
    label: string;
    /**
     * `onImage` keeps the pill readable when it sits on a photo/overlay: the
     * tint stays, but a translucent white scrim and subtle ring lift it off the
     * background. Defaults to the solid on-surface treatment used in card grids.
     */
    onImage?: boolean;
}

/**
 * Colour-coded category pill. The colour is derived from the category name (see
 * `categoryColor`) so each category is visually distinct yet stays on the
 * Peryskop palette, and the same category always gets the same colour across
 * the app. Decorative - the category is also conveyed by the surrounding card.
 */
export function CategoryTag({ label, onImage = false }: Props) {
    const { bg, text } = categoryColor(label);

    return (
        <XStack
            alignSelf="flex-start"
            paddingHorizontal="$md"
            paddingVertical="$xs"
            borderRadius="$full"
            maxWidth="100%"
            style={
                onImage ? { backgroundColor: bg, boxShadow: "0 2px 10px rgba(9,10,10,0.25)" } : { backgroundColor: bg }
            }
        >
            <Typography variant="tinyRegular" tag="span" numberOfLines={1} style={{ color: text, fontWeight: 600 }}>
                {label}
            </Typography>
        </XStack>
    );
}
