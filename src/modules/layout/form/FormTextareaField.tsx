import { Textarea, type TextareaProps } from "@fundacja-peryskop/ui";
import { useField } from "formik";

export interface FormTextareaFieldProps extends Omit<TextareaProps, "value" | "onChangeText" | "onBlur" | "error"> {
    /** Formik field name. */
    name: string;
    label?: string;
}

/**
 * Design-system auto-resizing `Textarea` wired to Formik. Surfaces the field's
 * validation error once touched.
 */
export function FormTextareaField({ name, ...rest }: FormTextareaFieldProps) {
    const [field, meta, helpers] = useField<string>(name);
    const errorText = meta.touched && meta.error ? meta.error : undefined;

    return (
        <Textarea
            value={field.value ?? ""}
            onChangeText={(text) => helpers.setValue(text)}
            onBlur={() => helpers.setTouched(true)}
            error={errorText}
            {...rest}
        />
    );
}
