import { Stack, Typography, XStack } from "@fundacja-peryskop/ui";
import { useTranslation } from "react-i18next";
import { categoryColor } from "../../helpers/categoryColor";

interface Props {
    /** Distinct category names to offer as filters. */
    categories: string[];
    /** Currently selected category, or `null` for "all". */
    selected: string | null;
    onSelect: (category: string | null) => void;
}

/** A single pill. Active categories flood with their own palette colour. */
function FilterPill({
    label,
    active,
    color,
    onPress,
}: {
    label: string;
    active: boolean;
    color?: { bg: string; text: string };
    onPress: () => void;
}) {
    return (
        <Stack
            tag="button"
            role="button"
            aria-pressed={active}
            onPress={onPress}
            paddingHorizontal="$md"
            paddingVertical="$xs"
            borderRadius="$full"
            borderWidth={1}
            cursor="pointer"
            backgroundColor={active ? "$color" : "$background"}
            borderColor={active ? "$color" : "$borderColor"}
            hoverStyle={{ borderColor: "$color" }}
            // When a category is active we override with its own palette colour.
            style={active && color ? { backgroundColor: color.bg, borderColor: color.bg } : undefined}
        >
            <Typography
                variant="tinyRegular"
                tag="span"
                numberOfLines={1}
                style={{ fontWeight: 600, color: active ? (color ? color.text : "#ffffff") : "#6c7072" }}
            >
                {label}
            </Typography>
        </Stack>
    );
}

/**
 * Horizontal, wrapping row of category filter pills. "All" plus one pill per
 * category; the active pill uses that category's own palette colour (see
 * `categoryColor`) so the filter echoes the tags on the cards. Filtering itself
 * is handled by the parent - this is a controlled, presentational component.
 */
export function CategoryFilter({ categories, selected, onSelect }: Props) {
    const { t } = useTranslation();
    if (categories.length === 0) return null;

    return (
        <XStack flexWrap="wrap" gap="$sm" alignItems="center" role="group" aria-label={t("articles.filter_label")}>
            <FilterPill
                label={t("articles.all_categories")}
                active={selected === null}
                onPress={() => onSelect(null)}
            />
            {categories.map((name) => (
                <FilterPill
                    key={name}
                    label={name}
                    active={selected === name}
                    color={categoryColor(name)}
                    onPress={() => onSelect(selected === name ? null : name)}
                />
            ))}
        </XStack>
    );
}
