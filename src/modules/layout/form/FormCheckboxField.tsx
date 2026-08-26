import { Checkbox, type CheckboxProps } from "@fundacja-peryskop/ui";
import { useField } from "formik";

export interface FormCheckboxFieldProps extends Omit<CheckboxProps, "checked" | "onCheckedChange" | "error"> {
    /** Formik field name. */
    name: string;
}

/**
 * Design-system `Checkbox` wired to Formik. Surfaces the field's validation
 * error once touched (e.g. a required "accept terms" box).
 */
export function FormCheckboxField({ name, ...rest }: FormCheckboxFieldProps) {
    const [field, meta, helpers] = useField<boolean>({ name, type: "checkbox" });
    const errorText = meta.touched && meta.error ? meta.error : undefined;

    return (
        <Checkbox
            checked={Boolean(field.value)}
            onCheckedChange={(checked) => helpers.setValue(checked)}
            error={errorText}
            {...rest}
        />
    );
}
