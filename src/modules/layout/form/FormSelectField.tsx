import { Select, type SelectProps } from "@fundacja-peryskop/ui";
import { useField } from "formik";

export interface FormSelectFieldProps extends Omit<SelectProps, "value" | "onValueChange" | "error"> {
    /** Formik field name. */
    name: string;
}

/**
 * Design-system `Select` wired to Formik. Marks the field touched on selection
 * so its validation error surfaces immediately.
 */
export function FormSelectField({ name, ...rest }: FormSelectFieldProps) {
    const [field, meta, helpers] = useField(name);
    const errorText = meta.touched && meta.error ? meta.error : undefined;

    return (
        <Select
            value={field.value != null && field.value !== "" ? String(field.value) : undefined}
            onValueChange={(value) => {
                helpers.setValue(value);
                helpers.setTouched(true);
            }}
            error={errorText}
            {...rest}
        />
    );
}
