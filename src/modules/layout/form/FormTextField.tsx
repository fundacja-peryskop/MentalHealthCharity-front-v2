import { Input, type InputProps } from "@fundacja-peryskop/ui";
import { useField } from "formik";

type TextFieldType = "text" | "email" | "password";

export interface FormTextFieldProps extends Omit<InputProps, "value" | "onChangeText" | "onBlur" | "error"> {
    /** Formik field name. */
    name: string;
    label?: string;
    /** Maps to the right web input semantics (email keyboard, masked password). */
    type?: TextFieldType;
}

/**
 * Design-system text `Input` wired to Formik. Shows the field's validation
 * error once the field has been touched. Reused across every migrated form.
 */
export function FormTextField({ name, label, type = "text", ...rest }: FormTextFieldProps) {
    const [field, meta, helpers] = useField<string>(name);
    const errorText = meta.touched && meta.error ? meta.error : undefined;

    const typeProps: Partial<InputProps> =
        type === "password"
            ? { secureTextEntry: true, autoComplete: "password" as never }
            : type === "email"
              ? {
                    keyboardType: "email-address",
                    autoCapitalize: "none",
                    autoComplete: "email" as never,
                }
              : {};

    return (
        <Input
            label={label}
            value={field.value ?? ""}
            onChangeText={(text) => helpers.setValue(text)}
            onBlur={() => helpers.setTouched(true)}
            error={errorText}
            {...typeProps}
            {...rest}
        />
    );
}
