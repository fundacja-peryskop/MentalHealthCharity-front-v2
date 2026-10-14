import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormik } from "formik";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";
import { Roles } from "../../../users/constants";
import { CreateChatFormValues } from "../../types";

const FLAG_OPTIONS = [{ value: "autoGroupChat", label: "Automatyczny czat grupowy" }];

const validationSchema = Yup.object({
    name: Yup.string().min(4, "Nazwa musi zawierać co najmniej 4 znaki").required("Nazwa jest wymagana"),
    flags: Yup.array().of(Yup.string()).required("Wybór flagi jest wymagany"),
    role: Yup.string().when("flags", (flags, schema) =>
        flags.includes("autoGroupChat")
            ? schema.required("Wybór roli jest wymagany, gdy wybrano Automatyczny czat grupowy")
            : schema
    ),
});

interface Props {
    isPending?: boolean;
    onSubmit: (values: CreateChatFormValues) => void;
    allowedAutoGroupRoles?: Roles[];
}

const CreateChatForm = ({ onSubmit, allowedAutoGroupRoles, isPending = false }: Props) => {
    const { t } = useTranslation();
    const roleOptions = allowedAutoGroupRoles ?? Object.values(Roles);
    const formik = useFormik<CreateChatFormValues>({
        initialValues: {
            name: "",
            flags: [],
            role: "",
        },
        validationSchema,
        onSubmit,
    });

    return (
        <form onSubmit={formik.handleSubmit} noValidate className="flex w-[400px] flex-col gap-4">
            <div className="space-y-1.5">
                <Label htmlFor="name">Nazwa</Label>
                <Input
                    id="name"
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                />
                {formik.touched.name && formik.errors.name && (
                    <p className="text-destructive text-sm">{formik.errors.name}</p>
                )}
            </div>

            <div className="space-y-1.5">
                <Label>Rozszerzenia</Label>
                {FLAG_OPTIONS.map((option) => (
                    <div key={option.value} className="flex items-center gap-2">
                        <Checkbox
                            id={`flag-${option.value}`}
                            checked={formik.values.flags.includes(option.value)}
                            onCheckedChange={(checked) => {
                                const flags = checked
                                    ? [...formik.values.flags, option.value]
                                    : formik.values.flags.filter((f) => f !== option.value);
                                formik.setFieldValue("flags", flags);
                            }}
                        />
                        <Label htmlFor={`flag-${option.value}`} className="font-normal">
                            {option.label}
                        </Label>
                    </div>
                ))}
                {formik.touched.flags && formik.errors.flags && (
                    <p className="text-destructive text-sm">{formik.errors.flags}</p>
                )}
            </div>

            {formik.values.flags.includes("autoGroupChat") && (
                <div className="space-y-1.5">
                    <Label htmlFor="role">Rola</Label>
                    <select
                        id="role"
                        name="role"
                        value={formik.values.role}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-8 w-full rounded-lg border bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:ring-3"
                    >
                        <option value="">---</option>
                        {roleOptions.map((role) => (
                            <option key={role} value={role}>
                                {role}
                            </option>
                        ))}
                    </select>
                    {formik.touched.role && formik.errors.role && (
                        <p className="text-destructive text-sm">{formik.errors.role}</p>
                    )}
                </div>
            )}

            <Button disabled={isPending} type="submit">
                {t("common.create")}
            </Button>
        </form>
    );
};

export default CreateChatForm;
