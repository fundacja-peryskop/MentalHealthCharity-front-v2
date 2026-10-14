import { Button, XStack } from "@fundacja-peryskop/ui";
import { MDXEditorMethods } from "@mdxeditor/editor";
import { useFormik } from "formik";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import Markdown from "../../../shared/components/Markdown";
import SimpleCard from "../../../shared/components/SimpleCard";

/** Marks a `<button>` as non-submitting; DS Button doesn't type `type`. */
const NON_SUBMIT = { type: "button" } as object;

interface Props {
    content: string;
    isOwner: boolean;
    onSubmit: (values: { description: string }) => void;
}

const UserProfileDescription = ({ content, isOwner, onSubmit }: Props) => {
    const { t } = useTranslation();
    const editorRef = useRef<MDXEditorMethods>(null);

    const formik = useFormik({
        initialValues: { description: content },
        onSubmit,
    });

    return (
        <SimpleCard subtitle={t("profile.description_subtitle")}>
            {isOwner ? (
                <form onSubmit={formik.handleSubmit}>
                    <div className="relative z-[99999] block min-h-[600px]" onClick={() => editorRef.current?.focus()}>
                        <Markdown
                            ref={editorRef}
                            onChange={(markdown) => formik.setFieldValue("description", markdown)}
                            readOnly={!isOwner}
                            content={formik.values.description}
                            placeholder={t("profile.description_placeholder")}
                        />
                    </div>
                    {formik.dirty && (
                        <XStack gap="$md">
                            <Button variant="primary">{t("common.save")}</Button>
                            <Button
                                variant="mutedPrimary"
                                {...NON_SUBMIT}
                                onPress={() => {
                                    formik.resetForm();
                                    editorRef.current?.setMarkdown(content);
                                }}
                            >
                                {t("common.cancel")}
                            </Button>
                        </XStack>
                    )}
                </form>
            ) : (
                <Markdown
                    readOnly={!isOwner}
                    content={content.length ? content : t("profile.empty_description_placeholder")}
                />
            )}
        </SimpleCard>
    );
};

export default UserProfileDescription;
