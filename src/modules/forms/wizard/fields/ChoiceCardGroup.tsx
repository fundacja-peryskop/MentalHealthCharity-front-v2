import { Stack, Typography, XStack, YStack } from "@fundacja-peryskop/ui";
import { useField } from "formik";

/** Non-submitting button marker (DS Stack doesn't type `type`). */
const NON_SUBMIT = { type: "button" } as object;

export interface ChoiceOption {
    value: string;
    title: string;
    description?: string;
}

interface Props {
    name: string;
    options: ChoiceOption[];
    /** Stack as a column instead of side-by-side cards. */
    column?: boolean;
}

/**
 * Single-select group rendered as large, tappable cards (title + optional
 * description) - a friendlier, more legible alternative to a radio list for a
 * small set of choices. Formik-bound and keyboard accessible (`aria-pressed`).
 */
export function ChoiceCardGroup({ name, options, column = false }: Props) {
    const [field, meta, helpers] = useField<string>(name);
    const showError = (meta.touched || false) && meta.error;

    return (
        <YStack gap="$sm">
            <XStack gap="$sm" flexDirection={column ? "column" : "row"} flexWrap="wrap">
                {options.map((option) => {
                    const selected = field.value === option.value;
                    return (
                        <Stack
                            key={option.value}
                            tag="button"
                            role="radio"
                            aria-checked={selected}
                            {...NON_SUBMIT}
                            onPress={() => {
                                helpers.setValue(option.value);
                                helpers.setTouched(true);
                            }}
                            flex={column ? undefined : 1}
                            minWidth={column ? undefined : 180}
                            flexDirection="column"
                            alignItems="flex-start"
                            gap="$xs"
                            padding="$md"
                            borderRadius="$md"
                            borderWidth={1}
                            borderColor={selected ? "$primary" : "$borderColor"}
                            backgroundColor={selected ? "$primarySoft" : "$background"}
                            cursor="pointer"
                            hoverStyle={{ borderColor: "$primary" }}
                        >
                            <Typography variant="smallBold">{option.title}</Typography>
                            {option.description ? (
                                <Typography variant="tinyRegular" muted width="100%">
                                    {option.description}
                                </Typography>
                            ) : null}
                        </Stack>
                    );
                })}
            </XStack>
            {showError ? (
                <Typography variant="smallRegular" color="$danger">
                    {meta.error}
                </Typography>
            ) : null}
        </YStack>
    );
}
