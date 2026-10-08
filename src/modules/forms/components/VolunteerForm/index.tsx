import { Typography, YStack } from "@fundacja-peryskop/ui";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";
import { useUser } from "../../../auth/components/AuthProvider";
import { CtaButton } from "../../../layout/CtaButton";
import { FormSelectField } from "../../../layout/form/FormSelectField";
import { FormTextField } from "../../../layout/form/FormTextField";
import { FormTextareaField } from "../../../layout/form/FormTextareaField";
import { phoneRegex, sanitizePhone } from "../../../shared/constants";
import { VolunteerFormValues } from "../../types";
import { FormWizard } from "../../wizard/components/FormWizard";
import { ChipMultiSelect } from "../../wizard/fields/ChipMultiSelect";
import { ConsentField } from "../../wizard/fields/ConsentField";
import { DateField } from "../../wizard/fields/DateField";
import type { WizardStep } from "../../wizard/types";
import { useFormWizard } from "../../wizard/useFormWizard";

const STORAGE_KEY = "peryskop:form:volunteer:v1";
/** Consent is never persisted - it must be re-affirmed each time. */
const PERSIST_OMIT: (keyof VolunteerFormValues)[] = ["tos"];

const digitsOnly = (value: string) => value.replace(/[^0-9]/g, "");

const THEME_VALUES = [
    "no",
    "depression",
    "alcoholism",
    "drug_addiction",
    "self_harm",
    "suicidal_thoughts",
    "eating_disorders",
    "domestic_violence",
    "homelessness",
    "sexual_assault",
    "grief_loss",
    "trauma",
    "anxiety",
    "burnout",
    "loneliness",
];

interface Props {
    onSubmit: (values: VolunteerFormValues) => void | Promise<void>;
    /** Render the success state immediately (the user has already applied). */
    startCompleted?: boolean;
}

// ---------------------------------------------------------------------------
// Step fields - module-scoped so they keep identity across renders.
// ---------------------------------------------------------------------------

function AgeField() {
    const { t } = useTranslation();
    return (
        <FormTextField
            name="age"
            label={t("form.volunteer.age_label")}
            keyboardType="numeric"
            autoFocus
            sanitize={digitsOnly}
        />
    );
}

function EducationField() {
    const { t } = useTranslation();
    const options = ["elementary", "high_school", "bachelor", "master", "phd"].map((k) => ({
        value: k,
        label: t(`form.volunteer.education.${k}`),
    }));
    return (
        <FormSelectField
            name="education"
            label={t("form.volunteer.education_label")}
            placeholder="---"
            options={options}
        />
    );
}

function PhoneField() {
    const { t } = useTranslation();
    return (
        <FormTextField
            name="phone"
            label={t("form.volunteer.phone_number_label")}
            keyboardType="phone-pad"
            autoComplete={"tel" as never}
            placeholder="+48 600 700 800"
            autoFocus
            sanitize={sanitizePhone}
        />
    );
}

function ReasonField() {
    const { t } = useTranslation();
    return <FormTextareaField name="description" label={t("form.volunteer.reason_label")} rows={5} autoFocus />;
}

function DatesField() {
    return <DateField name="interview_meeting_dates" />;
}

function SourceExperienceFields() {
    const { t } = useTranslation();
    const sourceOptions = [
        { value: "friend", label: t("form.referral_source_options.friend") },
        { value: "socialMedia", label: t("form.referral_source_options.social_media") },
        { value: "google", label: t("form.referral_source_options.google") },
    ];
    const experienceOptions = ["yes_professional", "yes_personal", "no"].map((k) => ({
        value: k,
        label: t(`form.volunteer.prior_experience.${k}`),
    }));
    return (
        <YStack gap="$lg">
            <FormSelectField
                name="source"
                label={t("form.referral_source_label")}
                placeholder="---"
                options={sourceOptions}
            />
            <FormSelectField
                name="did_help"
                label={t("form.volunteer.prior_experience_label")}
                placeholder="---"
                options={experienceOptions}
            />
        </YStack>
    );
}

function ThemesConsentFields() {
    const { t } = useTranslation();
    const options = THEME_VALUES.map((value) => ({ value, label: t(`form.volunteer.issues_to_avoid.${value}`) }));
    return (
        <YStack gap="$lg">
            <YStack gap="$sm">
                <Typography variant="regularSemibold">{t("form.volunteer.issues_to_avoid_label")}</Typography>
                <ChipMultiSelect name="themes" options={options} />
            </YStack>
            <ConsentField name="tos" />
        </YStack>
    );
}

// ---------------------------------------------------------------------------

const VolunteerForm = ({ onSubmit, startCompleted = false }: Props) => {
    const { t } = useTranslation();
    const { user } = useUser();

    const initialValues: VolunteerFormValues = {
        age: "",
        contacts: ["-"],
        description: "",
        did_help: "",
        reason: "",
        education: "",
        phone: "",
        source: "",
        themes: [],
        tos: false,
        interview_meeting_dates: [],
    };

    const text = (kind: "title" | "subtitle", index: number) =>
        t(`form.volunteer.${kind}.${index}`, { contact: user?.email });

    const steps: WizardStep<VolunteerFormValues>[] = [
        {
            id: "age",
            title: text("title", 0),
            subtitle: text("subtitle", 0),
            schema: Yup.object({
                age: Yup.number().min(18, t("validation.age.min")).required(t("validation.required")),
            }),
            Field: AgeField,
        },
        {
            id: "education",
            title: text("title", 1),
            subtitle: text("subtitle", 1),
            schema: Yup.object({ education: Yup.string().required(t("validation.required")) }),
            Field: EducationField,
        },
        {
            id: "phone",
            title: text("title", 2),
            subtitle: text("subtitle", 2),
            schema: Yup.object({
                phone: Yup.string().matches(phoneRegex, t("validation.phone")).required(t("validation.required")),
                contacts: Yup.array().of(Yup.string()).min(1, t("validation.required")),
            }),
            Field: PhoneField,
        },
        {
            id: "reason",
            title: text("title", 3),
            subtitle: text("subtitle", 3),
            schema: Yup.object({
                description: Yup.string()
                    .min(10, t("validation.description.tooShort"))
                    .required(t("validation.required")),
            }),
            Field: ReasonField,
        },
        {
            id: "dates",
            title: text("title", 4),
            subtitle: text("subtitle", 4),
            schema: Yup.object({ interview_meeting_dates: Yup.array().min(1, t("validation.required")) }),
            Field: DatesField,
        },
        {
            id: "source",
            title: text("title", 5),
            subtitle: text("subtitle", 5),
            schema: Yup.object({
                source: Yup.string().required(t("validation.required")),
                did_help: Yup.string().required(t("validation.required")),
            }),
            Field: SourceExperienceFields,
        },
        {
            id: "themes",
            title: text("title", 6),
            subtitle: text("subtitle", 6),
            schema: Yup.object({
                themes: Yup.array(),
                tos: Yup.boolean().oneOf([true], t("validation.consent.required")),
            }),
            Field: ThemesConsentFields,
        },
    ];

    const wizard = useFormWizard<VolunteerFormValues>({
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
                {t("form.volunteer.subtitle.7")}
            </Typography>
            <CtaButton href="/" variant="primary" fullWidth>
                {t("form.homepage")}
            </CtaButton>
        </YStack>
    );

    return <FormWizard wizard={wizard} successTitle={t("form.volunteer.title.7")} successContent={successContent} />;
};

export default VolunteerForm;
