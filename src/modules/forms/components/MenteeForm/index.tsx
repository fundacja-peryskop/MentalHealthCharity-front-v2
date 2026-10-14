import { Typography, XStack, YStack } from "@fundacja-peryskop/ui";
import { useFormikContext } from "formik";
import { ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";
import { useUser } from "../../../auth/components/AuthProvider";
import { AppLink } from "../../../layout/AppLink";
import { CtaButton } from "../../../layout/CtaButton";
import { FormSelectField } from "../../../layout/form/FormSelectField";
import { FormTextField } from "../../../layout/form/FormTextField";
import { FormTextareaField } from "../../../layout/form/FormTextareaField";
import { useIconColor } from "../../../layout/useIconColor";
import { validation } from "../../../shared/constants";
import { MenteeFormValues } from "../../types";
import { FormWizard } from "../../wizard/components/FormWizard";
import { ChoiceCardGroup } from "../../wizard/fields/ChoiceCardGroup";
import { ConsentField } from "../../wizard/fields/ConsentField";
import type { WizardStep } from "../../wizard/types";
import { useFormWizard } from "../../wizard/useFormWizard";

const STORAGE_KEY = "peryskop:form:mentee:v1";
/** Consent is never persisted - it must be re-affirmed each time. */
const PERSIST_OMIT: (keyof MenteeFormValues)[] = ["tos"];

const digitsOnly = (value: string) => value.replace(/[^0-9]/g, "");
const isUnder18 = (age: string) => age !== "" && Number(age) > 0 && Number(age) < 18;

interface Props {
    onSubmit: (values: MenteeFormValues) => void | Promise<void>;
    /** Render the success state immediately (the user has already applied). */
    startCompleted?: boolean;
}

// ---------------------------------------------------------------------------
// Step fields - module-scoped so they keep identity across renders (no remount
// on keystroke). Each reads form state through Formik context.
// ---------------------------------------------------------------------------

function IdentityFields() {
    const { t } = useTranslation();
    const icon = useIconColor();
    const { values } = useFormikContext<MenteeFormValues>();
    const under18 = isUnder18(values.age);

    return (
        <YStack gap="$lg">
            <FormTextField name="name" label={t("form.mentee.name_label")} autoFocus />
            <YStack gap="$sm">
                <FormTextField
                    name="age"
                    label={t("form.volunteer.age_label")}
                    keyboardType="numeric"
                    sanitize={digitsOnly}
                />
                {under18 ? (
                    <YStack
                        gap="$xs"
                        padding="$md"
                        borderRadius="$md"
                        borderWidth={1}
                        borderColor="$danger"
                        backgroundColor="$dangerSoft"
                    >
                        <XStack alignItems="center" gap="$xs">
                            <ShieldAlert size={18} color={icon.danger} />
                            <Typography variant="smallBold">{t("crisis.under_18_title")}</Typography>
                        </XStack>
                        <Typography variant="smallRegular" muted width="100%">
                            {t("crisis.under_18_text")}
                        </Typography>
                        <AppLink href="tel:116111" variant="smallSemibold" color="$primary">
                            116 111 - {t("crisis.youth_helpline")}
                        </AppLink>
                    </YStack>
                ) : null}
            </YStack>
        </YStack>
    );
}

function EmailField() {
    const { t } = useTranslation();
    return <FormTextField name="email" type="email" label={t("form.mentee.contact_detail.email")} autoFocus />;
}

function DescriptionField() {
    const { t } = useTranslation();
    return <FormTextareaField name="description" label={t("form.mentee.issue_description_label")} rows={5} autoFocus />;
}

function ContactPreferenceField() {
    const { t } = useTranslation();
    return (
        <YStack gap="$md">
            <YStack gap="$xs">
                <Typography variant="regularSemibold">{t("form.mentee.contact_preference_label")}</Typography>
                <Typography variant="smallRegular" muted width="100%">
                    {t("form.mentee.contact_preference_hint")}
                </Typography>
            </YStack>
            <ChoiceCardGroup
                name="contact_preference"
                options={(["scheduled", "asynchronous"] as const).map((value) => ({
                    value,
                    title: t(`form.mentee.contact_preference_options.${value}.title`),
                    description: t(`form.mentee.contact_preference_options.${value}.description`),
                }))}
            />
        </YStack>
    );
}

function SourceConsentFields() {
    const { t } = useTranslation();
    const sourceOptions = [
        { value: "friend", label: t("form.referral_source_options.friend") },
        { value: "socialMedia", label: t("form.referral_source_options.social_media") },
        { value: "google", label: t("form.referral_source_options.google") },
    ];
    return (
        <YStack gap="$lg">
            <FormSelectField
                name="source"
                label={t("form.referral_source_label")}
                placeholder="---"
                options={sourceOptions}
            />
            <ConsentField name="tos" />
        </YStack>
    );
}

// ---------------------------------------------------------------------------

const MenteeForm = ({ onSubmit, startCompleted = false }: Props) => {
    const { t } = useTranslation();
    const { user } = useUser();
    const variant = user ? "" : "_new_user";

    const initialValues: MenteeFormValues = {
        age: "",
        name: user?.full_name || "",
        contacts: ["email"],
        email: user?.email || "",
        phone: "",
        description: "",
        contact_preference: "",
        source: "",
        tos: false,
    };

    const text = (kind: "title" | "subtitle", index: number) =>
        t(`form.mentee.${kind}${variant}.${index}`, { contact: "email" });

    const steps: WizardStep<MenteeFormValues>[] = [
        {
            id: "identity",
            title: text("title", 0),
            subtitle: text("subtitle", 0),
            schema: Yup.object({
                name: Yup.string().min(2, t("validation.name.tooShort")).required(t("validation.required")),
                age: Yup.number().min(18, t("crisis.under_18_title")).required(t("validation.required")),
            }),
            Field: IdentityFields,
            blockAdvance: (values) => isUnder18(values.age),
        },
        {
            id: "contact",
            title: text("title", 1),
            subtitle: text("subtitle", 1),
            schema: Yup.object({ contacts: Yup.array().min(1, t("validation.contacts.min")), email: validation.email }),
            Field: EmailField,
        },
        {
            id: "description",
            title: text("title", 2),
            subtitle: text("subtitle", 2),
            schema: Yup.object({
                description: Yup.string()
                    .min(10, t("validation.description.tooShort"))
                    .required(t("validation.required")),
            }),
            Field: DescriptionField,
        },
        {
            id: "preference",
            title: text("title", 3),
            subtitle: text("subtitle", 3),
            schema: Yup.object({
                contact_preference: Yup.string()
                    .oneOf(["scheduled", "asynchronous"])
                    .required(t("validation.required")),
            }),
            Field: ContactPreferenceField,
        },
        {
            id: "source",
            title: text("title", 4),
            subtitle: text("subtitle", 4),
            schema: Yup.object({
                source: Yup.string().required(t("validation.required")),
                tos: Yup.boolean().oneOf([true], t("validation.consent.required")),
            }),
            Field: SourceConsentFields,
        },
    ];

    const wizard = useFormWizard<MenteeFormValues>({
        steps,
        initialValues,
        storageKey: STORAGE_KEY,
        persistOmit: PERSIST_OMIT,
        onSubmit,
        startCompleted,
    });

    const successContent = (
        <YStack gap="$lg" width="100%" alignItems="center">
            <Typography variant="regularRegular" muted align="center">
                {t("form.mentee.success.lead")}
            </Typography>

            <YStack gap="$md" width="100%">
                {(["chat", "email", "timing"] as const).map((key) => (
                    <YStack key={key} gap="$xs">
                        <Typography variant="smallBold">{t(`form.mentee.success.cards.${key}.title`)}</Typography>
                        <Typography variant="smallRegular" muted width="100%">
                            {t(`form.mentee.success.cards.${key}.body`)}
                        </Typography>
                    </YStack>
                ))}
            </YStack>

            <Typography variant="smallBold" align="center">
                {t("form.mentee.success.closing")}
            </Typography>
            <CtaButton href="/" variant="primary" fullWidth>
                {t("form.homepage")}
            </CtaButton>
        </YStack>
    );

    return <FormWizard wizard={wizard} successTitle={t("form.mentee.title.5")} successContent={successContent} />;
};

export default MenteeForm;
