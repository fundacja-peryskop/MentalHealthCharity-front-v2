import { Button, Checkbox, Input, Select, Stack, Textarea, Typography, XStack, YStack } from "@fundacja-peryskop/ui";
import { useFormik } from "formik";
import { ArrowLeft, CheckCircle, Clock3, Home, Mail, ShieldAlert } from "lucide-react";
import { Dispatch, SetStateAction, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { useUser } from "../../../auth/components/AuthProvider";
import { AppLink } from "../../../layout/AppLink";
import { useIconColor } from "../../../layout/useIconColor";
import Loader from "../../../shared/components/Loader";
import { validation } from "../../../shared/constants";
import { MenteeFormValues } from "../../types";
import FormWrapper from "../FormWrapper";

/** Marks a `<button>` as non-submitting; DS Button/Stack don't type `type`. */
const NON_SUBMIT = { type: "button" } as object;

interface Props {
    onSubmit: (values: MenteeFormValues) => void;
    step: number;
    setStep: Dispatch<SetStateAction<number>>;
    isLoading?: boolean;
}

const MenteeForm = ({ onSubmit, setStep, step, isLoading }: Props) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const icon = useIconColor();
    const { user, isFetchingUser: isLoadingUserSession } = useUser();
    const isFormDataLoading = (isLoadingUserSession && !user) || isLoading;
    const [direction, setDirection] = useState(1);
    const prevStepRef = useRef(step);

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

    const validationSchemas = [
        Yup.object({
            name: Yup.string().min(2, t("validation.name.tooShort")).required(t("validation.required")),
            age: Yup.number().min(18, t("crisis.under_18_title")).required(t("validation.required")),
        }),
        Yup.object({
            contacts: Yup.array().min(1, t("validation.contacts.min")),
            email: validation.email,
        }),
        Yup.object({
            description: Yup.string().min(10, t("validation.description.tooShort")).required(t("validation.required")),
        }),
        Yup.object({
            contact_preference: Yup.string().oneOf(["scheduled", "asynchronous"]).required(t("validation.required")),
        }),
        Yup.object({
            source: Yup.string().required(t("validation.required")),
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
                return;
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

    const errorFor = (name: keyof MenteeFormValues) =>
        formik.touched[name] && formik.errors[name] ? String(formik.errors[name]) : undefined;

    const ageNum = Number(formik.values.age);
    const isUnder18 = formik.values.age !== "" && ageNum > 0 && ageNum < 18;

    const referralSourceOptions = [
        { value: "friend", label: t("form.referral_source_options.friend") },
        { value: "socialMedia", label: t("form.referral_source_options.social_media") },
        { value: "google", label: t("form.referral_source_options.google") },
    ];

    // Success state
    if (step > LAST_STEP) {
        const successCards = [
            {
                icon: Home,
                title: t("form.mentee.success.cards.chat.title"),
                body: t("form.mentee.success.cards.chat.body"),
            },
            {
                icon: Mail,
                title: t("form.mentee.success.cards.email.title"),
                body: t("form.mentee.success.cards.email.body"),
            },
            {
                icon: Clock3,
                title: t("form.mentee.success.cards.timing.title"),
                body: t("form.mentee.success.cards.timing.body"),
            },
        ];

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
                        {t("form.mentee.title.5", { defaultValue: "Dziękujemy!" })}
                    </Typography>
                    <Typography variant="regularRegular" muted align="center" width="100%">
                        {t("form.mentee.success.lead")}
                    </Typography>

                    <YStack gap="$sm" width="100%" marginTop="$md">
                        {successCards.map(({ icon: CardIcon, title, body }) => (
                            <XStack
                                key={title}
                                gap="$md"
                                alignItems="flex-start"
                                padding="$md"
                                borderRadius="$md"
                                borderWidth={1}
                                borderColor="$borderColor"
                                backgroundColor="$backgroundHover"
                            >
                                <Stack
                                    width={40}
                                    height={40}
                                    borderRadius="$full"
                                    alignItems="center"
                                    justifyContent="center"
                                    backgroundColor="$primarySoft"
                                >
                                    <CardIcon size={18} color={icon.primary} />
                                </Stack>
                                <YStack flex={1} gap="$xs">
                                    <Typography variant="smallBold">{title}</Typography>
                                    <Typography variant="smallRegular" muted width="100%">
                                        {body}
                                    </Typography>
                                </YStack>
                            </XStack>
                        ))}
                    </YStack>

                    <Typography variant="smallBold" align="center" marginTop="$sm">
                        {t("form.mentee.success.closing")}
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
            subtitle={t(user ? `form.mentee.subtitle.${step}` : `form.mentee.subtitle_new_user.${step}`, {
                contact: formik.values.phone || "email",
            })}
            title={t(user ? `form.mentee.title.${step}` : `form.mentee.title_new_user.${step}`)}
            progress={((step + 1) / (LAST_STEP + 2)) * 100}
            stepIndicator={`${step + 1} / ${validationSchemas.length}`}
            direction={direction}
            stepKey={step}
        >
            <form onSubmit={formik.handleSubmit} noValidate>
                {/* Step 0: Name + Age */}
                {step === 0 ? (
                    <YStack gap="$lg">
                        <Input
                            label={t("form.mentee.name_label")}
                            autoFocus
                            value={formik.values.name}
                            onChangeText={(v) => formik.setFieldValue("name", v)}
                            onBlur={() => formik.setFieldTouched("name", true)}
                            error={errorFor("name")}
                        />
                        <YStack gap="$sm">
                            <Input
                                label={t("form.volunteer.age_label")}
                                keyboardType="numeric"
                                value={formik.values.age}
                                onChangeText={(v) => formik.setFieldValue("age", v.replace(/[^0-9]/g, ""))}
                                onBlur={() => formik.setFieldTouched("age", true)}
                                error={isUnder18 ? undefined : errorFor("age")}
                            />
                            {isUnder18 ? (
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
                                        116 111 — {t("crisis.youth_helpline")}
                                    </AppLink>
                                </YStack>
                            ) : null}
                        </YStack>
                    </YStack>
                ) : null}

                {/* Step 1: Contact */}
                {step === 1 ? (
                    <YStack gap="$lg">
                        {formik.values.contacts.includes("phone") ? (
                            <Input
                                label={t("form.mentee.contact_detail.phone")}
                                autoFocus
                                keyboardType="phone-pad"
                                value={formik.values.phone}
                                onChangeText={(v) => formik.setFieldValue("phone", v)}
                                onBlur={() => formik.setFieldTouched("phone", true)}
                                error={errorFor("phone")}
                            />
                        ) : null}
                        <Input
                            label={t("form.mentee.contact_detail.email")}
                            autoFocus={!formik.values.contacts.includes("phone")}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={formik.values.email}
                            onChangeText={(v) => formik.setFieldValue("email", v)}
                            onBlur={() => formik.setFieldTouched("email", true)}
                            error={errorFor("email")}
                        />
                    </YStack>
                ) : null}

                {/* Step 2: Description */}
                {step === 2 ? (
                    <Textarea
                        label={t("form.mentee.issue_description_label")}
                        rows={5}
                        value={formik.values.description}
                        onChangeText={(v) => formik.setFieldValue("description", v)}
                        onBlur={() => formik.setFieldTouched("description", true)}
                        error={errorFor("description")}
                    />
                ) : null}

                {/* Step 3: Contact preference */}
                {step === 3 ? (
                    <YStack gap="$md">
                        <YStack gap="$xs">
                            <Typography variant="regularSemibold">
                                {t("form.mentee.contact_preference_label")}
                            </Typography>
                            <Typography variant="smallRegular" muted width="100%">
                                {t("form.mentee.contact_preference_hint")}
                            </Typography>
                        </YStack>
                        <XStack gap="$sm">
                            {(["scheduled", "asynchronous"] as const).map((value) => {
                                const selected = formik.values.contact_preference === value;
                                return (
                                    <Stack
                                        key={value}
                                        tag="button"
                                        role="button"
                                        {...NON_SUBMIT}
                                        aria-pressed={selected}
                                        onPress={() => formik.setFieldValue("contact_preference", value)}
                                        flex={1}
                                        flexDirection="column"
                                        alignItems="flex-start"
                                        gap="$xs"
                                        padding="$md"
                                        borderRadius="$md"
                                        borderWidth={1}
                                        borderColor={selected ? "$primary" : "$borderColor"}
                                        backgroundColor={selected ? "$primarySoft" : "$background"}
                                        cursor="pointer"
                                    >
                                        <Typography variant="smallBold">
                                            {t(`form.mentee.contact_preference_options.${value}.title`)}
                                        </Typography>
                                        <Typography variant="tinyRegular" muted width="100%">
                                            {t(`form.mentee.contact_preference_options.${value}.description`)}
                                        </Typography>
                                    </Stack>
                                );
                            })}
                        </XStack>
                        {(formik.touched.contact_preference || formik.submitCount > 0) &&
                        formik.errors.contact_preference ? (
                            <Typography variant="smallRegular" color="$danger">
                                {formik.errors.contact_preference}
                            </Typography>
                        ) : null}
                    </YStack>
                ) : null}

                {/* Step 4: Source + TOS */}
                {step === 4 ? (
                    <YStack gap="$lg">
                        <Select
                            label={t("form.referral_source_label")}
                            placeholder="---"
                            options={referralSourceOptions}
                            value={formik.values.source || undefined}
                            onValueChange={(v) => {
                                formik.setFieldValue("source", v);
                                formik.setFieldTouched("source", true);
                            }}
                            error={errorFor("source")}
                        />
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
                    <Button variant="primary" disabled={isFormDataLoading || isUnder18}>
                        {isFormDataLoading ? (
                            <Loader variant="small" size={20} />
                        ) : step === LAST_STEP ? (
                            t("form.submit")
                        ) : (
                            t("form.next")
                        )}
                    </Button>
                </XStack>
            </form>
        </FormWrapper>
    );
};

export default MenteeForm;
