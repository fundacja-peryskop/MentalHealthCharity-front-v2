import { Stack, Typography, XStack } from "@fundacja-peryskop/ui";
import { useField } from "formik";
import { Check } from "lucide-react";
import { useIconColor } from "../../../layout/useIconColor";

/** Non-submitting button marker (DS Stack doesn't type `type`). */
const NON_SUBMIT = { type: "button" } as object;

export interface ChipOption {
    value: string;
    label: string;
}

interface Props {
    name: string;
    options: ChipOption[];
}

/**
 * Multi-select rendered as toggleable chips with a checkbox affordance.
 * Formik-bound to a `string[]` field; each chip is a real toggle button
 * (`aria-pressed`) for keyboard and screen-reader support.
 */
export function ChipMultiSelect({ name, options }: Props) {
    const icon = useIconColor();
    const [field, , helpers] = useField<string[]>(name);
    const selectedValues = field.value ?? [];

    const toggle = (value: string) => {
        const next = selectedValues.includes(value)
            ? selectedValues.filter((v) => v !== value)
            : [...selectedValues, value];
        helpers.setValue(next);
    };

    return (
        <XStack flexWrap="wrap" gap="$sm">
            {options.map((option) => {
                const selected = selectedValues.includes(option.value);
                return (
                    <Stack
                        key={option.value}
                        tag="button"
                        role="button"
                        aria-pressed={selected}
                        {...NON_SUBMIT}
                        onPress={() => toggle(option.value)}
                        flexDirection="row"
                        alignItems="center"
                        gap="$sm"
                        width="100%"
                        $sm={{ width: "48%" }}
                        paddingHorizontal="$md"
                        paddingVertical="$sm"
                        borderRadius="$md"
                        borderWidth={1}
                        borderColor={selected ? "$primary" : "$borderColor"}
                        backgroundColor={selected ? "$primarySoft" : "$background"}
                        cursor="pointer"
                        hoverStyle={{ borderColor: "$primary" }}
                    >
                        <Stack
                            width={20}
                            height={20}
                            borderRadius="$xs"
                            alignItems="center"
                            justifyContent="center"
                            borderWidth={1}
                            borderColor={selected ? "$primary" : "$borderColor"}
                            backgroundColor={selected ? "$primary" : "$background"}
                        >
                            {selected ? <Check size={14} color={icon.inverse} /> : null}
                        </Stack>
                        <Typography variant="smallRegular" flex={1}>
                            {option.label}
                        </Typography>
                    </Stack>
                );
            })}
        </XStack>
    );
}
