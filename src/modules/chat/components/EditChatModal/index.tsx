import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormik } from "formik";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";
import Modal from "../../../shared/components/Modal";
import { Chat, EditChatPayload } from "../../types";

interface Props {
    open: boolean;
    onClose: () => void;
    onSubmit: (val: EditChatPayload) => void;
    chat: Chat;
}

const validationSchema = Yup.object({
    name: Yup.string().min(4, "Nazwa musi zawierać co najmniej 4 znaki").required("Nazwa jest wymagana"),
    is_active: Yup.boolean().required("Status jest wymagany"),
    id: Yup.number().required("Id jest wymagane"),
});

const EditChatModal = ({ onSubmit, chat, ...props }: Props) => {
    const { t } = useTranslation();

    const formik = useFormik<EditChatPayload>({
        initialValues: {
            name: chat.name ?? "",
            is_active: chat.is_active,
            id: chat.id,
        },
        validationSchema,
        onSubmit,
    });

    return (
        <Modal {...props} title={t("chat.edit_chat")}>
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
                <Button disabled={!formik.dirty} type="submit">
                    {!formik.dirty ? t("common.make_changes_to_save") : t("chat.edit_chat")}
                </Button>
            </form>
        </Modal>
    );
};

export default EditChatModal;
