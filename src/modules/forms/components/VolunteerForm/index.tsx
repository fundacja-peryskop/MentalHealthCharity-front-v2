import { Button, Checkbox, Input, Select, Stack, Textarea, Typography, XStack, YStack } from "@fundacja-peryskop/ui";
import { useFormik } from "formik";
import { ArrowLeft, Check, CheckCircle } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { useUser } from "../../../auth/components/AuthProvider";
import { AppLink } from "../../../layout/AppLink";
import { useIconColor } from "../../../layout/useIconColor";
import { DateTimePicker } from "../../../shared/components/DatePicker";
import { VolunteerFormValues } from "../../types";
import FormWrapper from "../FormWrapper";

/** Marks a `<button>` as non-submitting; DS Button/Stack don't type `type`. */
const NON_SUBMIT = { type: "button" } as object;

const THEME_OPTIONS = [
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
    onSubmit: (values: VolunteerFormValues) => void;
    initStep?: number;
}

const VolunteerForm = ({ onSubmit, initStep = 0 }: Props) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const icon = useIconColor();
    const { user } = useUser();

    const [step, setStep] = useState(initStep);
    const [direction, setDirection] = useState(1);
    const prevStepRef = useRef(step);

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

    const validationSchemas = [
        Yup.object({ age: Yup.number().min(18, t("validation.age.min")).required(t("validation.required")) }),
        Yup.object({ education: Yup.string().required(t("validation.required")) }),
        Yup.object({
            phone: Yup.string()
                .matches(/^[0-9]+$/, t("validation.phone"))
                .required(t("validation.required")),
            contacts: Yup.array().of(Yup.string()).min(1, t("validation.required")),
        }),
        Yup.object({
            description: Yup.string().min(10, t("validation.description.tooShort")).required(t("validation.required")),
        }),
        Yup.object({ interview_meeting_dates: Yup.array().min(1, t("validation.required")) }),
        Yup.object({
            source: Yup.string().required(t("validation.required")),
            did_help: Yup.string().required(t("validation.required")),
        }),
        Yup.object({
            themes: Yup.array(),
            tos: Yup.boolean().oneOf([true], t("validation.consent.required")),
        }),
    ];

    const LAST_STEP = validationSchemas.length - 1;

    const formik = useFormik({
        initialValues,
        validationSchema: validationSchemas[step],
        onSubmit: (values) => {
            if (step === LAST_STEP) {
                onSubmit(values);
            }
            setDirection(1);
            prevStepRef.current = step;
            setStep((prev) => prev + 1);
        },
    });

    const handleBack = () => {
        setDirection(-1);
        prevStepRef.current = step;
        setStep((prev) => (prev > 0 ? prev - 1 : prev));
    };

    const errorFor = (name: keyof VolunteerFormValues) =>
        formik.touched[name] && formik.errors[name] ? String(formik.errors[name]) : undefined;

    const handleThemeToggle = (value: string) => {
        const current = formik.values.themes;
        const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
        formik.setFieldValue("themes", next);
    };

    const educationOptions = ["elementary", "high_school", "bachelor", "master", "phd"].map((k) => ({
        value: k,
        label: t(`form.volunteer.education.${k}`),
    }));
    const sourceOptions = [
        { value: "friend", label: t("form.referral_source_options.friend") },
        { value: "socialMedia", label: t("form.referral_source_options.social_media") },
        { value: "google", label: t("form.referral_source_options.google") },
    ];
    const experienceOptions = ["yes_professional", "yes_personal", "no"].map((k) => ({
        value: k,
        label: t(`form.volunteer.prior_experience.${k}`),
    }));

    // Success state
    if (step > LAST_STEP) {
        return (
            <FormWrapper subtitle="" title="" progress={100} direction={direction} stepKey="success">
                <YStack alignItems="center" gap="$md" paddingVertical="$md">
                    <Stack
                        width={64}
                        height={64}
                        borderRadius="$full"
                        alignItems="center"
                        justifyContent="center"
                        backgroundColor="$primarySoft"
                    >
                        <CheckCircle size={32} color={icon.primary} />
                    </Stack>
                    <Typography variant="title3" tag="h2" align="center">
                        {t("form.volunteer.title.7", { defaultValue: "Dziękujemy!" })}
                    </Typography>
                    <Typography variant="regularRegular" muted align="center" width="100%">
                        {t("form.volunteer.subtitle.7", {
                            defaultValue: "Twoje zgłoszenie zostało wysłane. Skontaktujemy się z Tobą wkrótce.",
                        })}
                    </Typography>
                    <Button variant="primary" fullWidth onPress={() => navigate("/")}>
                        {t("form.homepage")}
                    </Button>
                </YStack>
            </FormWrapper>
        );
    }

    return (
        <FormWrapper
            subtitle={t(`form.volunteer.subtitle.${step}`, { contact: user?.email })}
            title={t(`form.volunteer.title.${step}`, { contact: user?.email })}
            progress={((step + 1) / (LAST_STEP + 2)) * 100}
            stepIndicator={`${step + 1} / ${validationSchemas.length}`}
            direction={direction}
            stepKey={step}
        >
            <form onSubmit={formik.handleSubmit} noValidate>
                {step === 0 ? (
                    <Input
                        label={t("form.volunteer.age_label")}
                        keyboardType="numeric"
                        autoFocus
                        value={formik.values.age}
                        onChangeText={(v) => formik.setFieldValue("age", v.replace(/[^0-9]/g, ""))}
                        onBlur={() => formik.setFieldTouched("age", true)}
                        error={errorFor("age")}
                    />
                ) : null}

                {step === 1 ? (
                    <Select
                        label={t("form.volunteer.education_label")}
                        placeholder="---"
                        options={educationOptions}
                        value={formik.values.education || undefined}
                        onValueChange={(v) => {
                            formik.setFieldValue("education", v);
                            formik.setFieldTouched("education", true);
                        }}
                        error={errorFor("education")}
                    />
                ) : null}

                {step === 2 ? (
                    <Input
                        label={t("form.volunteer.phone_number_label")}
                        keyboardType="phone-pad"
                        autoFocus
                        value={formik.values.phone}
                        onChangeText={(v) => formik.setFieldValue("phone", v)}
                        onBlur={() => formik.setFieldTouched("phone", true)}
                        error={errorFor("phone")}
                    />
                ) : null}

                {step === 3 ? (
                    <Textarea
                        label={t("form.volunteer.reason_label")}
                        rows={5}
                        value={formik.values.description}
                        onChangeText={(v) => formik.setFieldValue("description", v)}
                        onBlur={() => formik.setFieldTouched("description", true)}
                        error={errorFor("description")}
                    />
                ) : null}

                {step === 4 ? (
                    <YStack alignItems="center" gap="$md" width="100%">
                        <DateTimePicker
                            values={formik.values.interview_meeting_dates}
                            onChange={(newValue) => formik.setFieldValue("interview_meeting_dates", newValue)}
                        />
                        {errorFor("interview_meeting_dates") ? (
                            <Typography variant="smallRegular" color="$danger">
                                {errorFor("interview_meeting_dates")}
                            </Typography>
                        ) : null}
                    </YStack>
                ) : null}

                {step === 5 ? (
                    <YStack gap="$lg">
                        <Select
                            label={t("form.referral_source_label")}
                            placeholder="---"
                            options={sourceOptions}
                            value={formik.values.source || undefined}
                            onValueChange={(v) => {
                                formik.setFieldValue("source", v);
                                formik.setFieldTouched("source", true);
                            }}
                            error={errorFor("source")}
                        />
                        <Select
                            label={t("form.volunteer.prior_experience_label")}
                            placeholder="---"
                            options={experienceOptions}
                            value={formik.values.did_help || undefined}
                            onValueChange={(v) => {
                                formik.setFieldValue("did_help", v);
                                formik.setFieldTouched("did_help", true);
                            }}
                            error={errorFor("did_help")}
                        />
                    </YStack>
                ) : null}

                {step === 6 ? (
                    <YStack gap="$lg">
                        <YStack gap="$sm">
                            <Typography variant="regularSemibold">
                                {t("form.volunteer.issues_to_avoid_label")}
                            </Typography>
                            <XStack flexWrap="wrap" gap="$sm">
                                {THEME_OPTIONS.map((value) => {
                                    const selected = formik.values.themes.includes(value);
                                    return (
                                        <Stack
                                            key={value}
                                            tag="button"
                                            role="button"
                                            aria-pressed={selected}
                                            {...NON_SUBMIT}
                                            onPress={() => handleThemeToggle(value)}
                                            flexDirection="row"
                                            alignItems="center"
                                            gap="$sm"
                                            width="100%"
                                            $sm={{ width: "48%" }}
                                            paddingHorizontal="$md"
                                            paddingVertical="$sm"
                                            borderRadius="$md"
                                            borderWidth={1}
                                            borderColor={selected ? "$primary" : "$borderColor"}
                                            backgroundColor={selected ? "$primarySoft" : "$background"}
                                            cursor="pointer"
                                        >
                                            <Stack
                                                width={20}
                                                height={20}
                                                borderRadius="$xs"
                                                alignItems="center"
                                                justifyContent="center"
                                                borderWidth={1}
                                                borderColor={selected ? "$primary" : "$borderColor"}
                                                backgroundColor={selected ? "$primary" : "$background"}
                                            >
                                                {selected ? <Check size={14} color={icon.inverse} /> : null}
                                            </Stack>
                                            <Typography variant="smallRegular" flex={1}>
                                                {t(`form.volunteer.issues_to_avoid.${value}`)}
                                            </Typography>
                                        </Stack>
                                    );
                                })}
                            </XStack>
                        </YStack>

                        <Checkbox
                            checked={formik.values.tos}
                            onCheckedChange={(checked) => formik.setFieldValue("tos", checked)}
                            error={errorFor("tos")}
                            size="sm"
                            label={
                                <Typography variant="smallRegular">
                                    {t("crisis.tos_label", { defaultValue: "Wyrażam zgodę na" })}{" "}
                                    <AppLink href="/tos" external variant="smallSemibold" color="$primary">
                                        {t("crisis.tos_link", {
                                            defaultValue: "warunki użytkowania i politykę prywatności",
                                        })}
                                    </AppLink>
                                </Typography>
                            }
                        />
                    </YStack>
                ) : null}

                {/* Navigation */}
                <XStack marginTop="$xl" alignItems="center" justifyContent="space-between" gap="$md">
                    <Button variant="mutedPrimary" {...NON_SUBMIT} onPress={handleBack} disabled={step === 0}>
                        <ArrowLeft size={16} color={icon.primary} />
                        <Typography variant="regularSemibold" color="$primaryDarker">
                            {t("form.back")}
                        </Typography>
                    </Button>
                    <Button variant="primary">{step === LAST_STEP ? t("form.submit") : t("form.next")}</Button>
                </XStack>
            </form>
        </FormWrapper>
    );
};

export default VolunteerForm;
