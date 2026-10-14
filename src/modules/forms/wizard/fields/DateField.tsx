import { Typography, YStack } from "@fundacja-peryskop/ui";
import { useField } from "formik";
import { DateTimePicker } from "../../../shared/components/DatePicker";

/**
 * Formik-bound wrapper around the shared date/time picker (a `string[]` of ISO
 * datetimes). Surfaces the field's validation error once touched.
 */
export function DateField({ name }: { name: string }) {
    const [field, meta, helpers] = useField<string[]>(name);
    const showError = meta.touched && meta.error;

    return (
        <YStack gap="$sm" width="100%" alignItems="center">
            <DateTimePicker
                values={field.value ?? []}
                onChange={(next) => {
                    helpers.setValue(next);
                    helpers.setTouched(true);
                }}
            />
            {showError ? (
                <Typography variant="smallRegular" color="$danger">
                    {meta.error}
                </Typography>
            ) : null}
        </YStack>
    );
}
