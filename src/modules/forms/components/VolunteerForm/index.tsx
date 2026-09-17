import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useFormik } from "formik";
import { ArrowLeft, ArrowRight, CheckCircle, Home } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import * as Yup from "yup";
import { useUser } from "../../../auth/components/AuthProvider";
import { DateTimePicker } from "../../../shared/components/DatePicker";
import InternalLink from "../../../shared/components/InternalLink";
import { VolunteerFormValues } from "../../types";
import FormWrapper from "../FormWrapper";

interface Props {
    onSubmit: (values: VolunteerFormValues) => void;
    initStep?: number;
}

const THEME_OPTIONS = [
    { value: "no", key: "no" },
    { value: "depression", key: "depression" },
    { value: "alcoholism", key: "alcoholism" },
    { value: "drug_addiction", key: "drug_addiction" },
    { value: "self_harm", key: "self_harm" },
    { value: "suicidal_thoughts", key: "suicidal_thoughts" },
    { value: "eating_disorders", key: "eating_disorders" },
    { value: "domestic_violence", key: "domestic_violence" },
    { value: "homelessness", key: "homelessness" },
    { value: "sexual_assault", key: "sexual_assault" },
    { value: "grief_loss", key: "grief_loss" },
    { value: "trauma", key: "trauma" },
    { value: "anxiety", key: "anxiety" },
    { value: "burnout", key: "burnout" },
    { value: "loneliness", key: "loneliness" },
];

const VolunteerForm = ({ onSubmit, initStep = 0 }: Props) => {
    const { t } = useTranslation();
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
        Yup.object({
            age: Yup.number().min(18, t("validation.age.min")).required(t("validation.required")),
        }),
        Yup.object({
            education: Yup.string().required(t("validation.required")),
        }),
        Yup.object({
            phone: Yup.string()
                .trim()
                .matches(/^\+?(?=[0-9 ()-]*[0-9])[0-9 ()-]+$/, t("volunteer_phone.invalid"))
                .required(t("validation.required")),
            contacts: Yup.array().of(Yup.string()).min(1, t("validation.required")),
        }),
        Yup.object({
            description: Yup.string().min(10, t("validation.description.tooShort")).required(t("validation.required")),
        }),
        Yup.object({
            interview_meeting_dates: Yup.array().min(1, t("validation.required")),
        }),
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
                setDirection(1);
                prevStepRef.current = step;
                setStep(validationSchemas.length);
            } else {
                setDirection(1);
                prevStepRef.current = step;
                setStep((prevStep) => prevStep + 1);
            }
        },
    });

    const handleBack = () => {
        setDirection(-1);
        prevStepRef.current = step;
        setStep((prevStep) => (prevStep > 0 ? prevStep - 1 : prevStep));
    };

    const handleAgeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const text = e.target.value;
        const formattedText = text.replace(/[^0-9]/g, "");
        formik.setFieldValue("age", formattedText);
    };

    const handleThemeToggle = (value: string) => {
        const current = formik.values.themes;
        const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
        formik.setFieldValue("themes", next);
    };

    // Success state
    if (step > LAST_STEP) {
        return (
            <FormWrapper subtitle="" title="" progress={100} direction={direction}>
                <div className="flex flex-col items-center py-6 text-center">
                    <div className="bg-primary-brand/10 mb-5 flex size-16 items-center justify-center rounded-full">
                        <CheckCircle className="text-primary-brand size-8" />
                    </div>
                    <h2 className="text-foreground text-2xl font-bold">
                        {t("form.volunteer.title.7", { defaultValue: "Dziękujemy!" })}
                    </h2>
                    <p className="text-muted-foreground mt-2 max-w-sm text-[15px]">
                        {t("form.volunteer.subtitle.7", {
                            defaultValue: "Twoje zgłoszenie zostało wysłane. Skontaktujemy się z Tobą wkrótce.",
                        })}
                    </p>
                    <div className="mt-8 flex w-full flex-col gap-2.5">
                        <Button className="w-full gap-2" render={<Link to="/" />}>
                            <Home className="size-4" />
                            {t("form.homepage")}
                        </Button>
                    </div>
                </div>
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
        >
            <form onSubmit={formik.handleSubmit}>
                {/* Step 0: Age */}
                {step === 0 && (
                    <div className="flex flex-col gap-5">
                        <div className="space-y-1.5">
                            <Label htmlFor="age">{t("form.volunteer.age_label")}</Label>
                            <Input
                                id="age"
                                name="age"
                                type="number"
                                min={0}
                                autoFocus
                                value={formik.values.age}
                                onChange={handleAgeInputChange}
                                onBlur={formik.handleBlur}
                                className="h-12"
                            />
                            {formik.touched.age && formik.errors.age && (
                                <p role="alert" className="text-destructive text-sm">
                                    {formik.errors.age}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 1: Education */}
                {step === 1 && (
                    <div className="flex flex-col gap-5">
                        <div className="space-y-1.5">
                            <Label htmlFor="education">{t("form.volunteer.education_label")}</Label>
                            <select
                                id="education"
                                name="education"
                                autoFocus
                                value={formik.values.education}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className="border-input focus-visible:border-ring focus-visible:ring-ring/30 h-12 w-full rounded-xl border bg-transparent px-3 py-1 text-sm transition-colors outline-none focus-visible:ring-2"
                            >
                                <option value="">---</option>
                                <option value="elementary">{t("form.volunteer.education.elementary")}</option>
                                <option value="high_school">{t("form.volunteer.education.high_school")}</option>
                                <option value="bachelor">{t("form.volunteer.education.bachelor")}</option>
                                <option value="master">{t("form.volunteer.education.master")}</option>
                                <option value="phd">{t("form.volunteer.education.phd")}</option>
                            </select>
                            {formik.touched.education && formik.errors.education && (
                                <p role="alert" className="text-destructive text-sm">
                                    {formik.errors.education}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 2: Phone */}
                {step === 2 && (
                    <div className="flex flex-col gap-5">
                        <div className="space-y-1.5">
                            <Label htmlFor="phone">{t("form.volunteer.phone_number_label")}</Label>
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                autoComplete="tel"
                                aria-invalid={Boolean(formik.touched.phone && formik.errors.phone)}
                                autoFocus
                                value={formik.values.phone}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className="h-12"
                            />
                            {formik.touched.phone && formik.errors.phone && (
                                <p role="alert" className="text-destructive text-sm">
                                    {formik.errors.phone}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 3: Description / Motivation */}
                {step === 3 && (
                    <div className="flex flex-col gap-5">
                        <div className="space-y-1.5">
                            <Label htmlFor="description">{t("form.volunteer.reason_label")}</Label>
                            <textarea
                                id="description"
                                name="description"
                                autoFocus
                                autoComplete="off"
                                value={formik.values.description}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                rows={5}
                                className="border-input focus-visible:border-ring focus-visible:ring-ring/30 w-full rounded-xl border bg-transparent px-4 py-3 text-sm leading-relaxed transition-colors outline-none focus-visible:ring-2"
                            />
                            {formik.touched.description && formik.errors.description && (
                                <p role="alert" className="text-destructive text-sm">
                                    {formik.errors.description}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 4: Interview dates */}
                {step === 4 && (
                    <div className="flex w-full flex-col items-center gap-5">
                        <DateTimePicker
                            values={formik.values.interview_meeting_dates}
                            onChange={(newValue) => formik.setFieldValue("interview_meeting_dates", newValue)}
                        />
                        {formik.touched.interview_meeting_dates && formik.errors.interview_meeting_dates && (
                            <span role="alert" className="text-destructive text-sm">
                                {formik.errors.interview_meeting_dates as string}
                            </span>
                        )}
                    </div>
                )}

                {/* Step 5: Source + Experience */}
                {step === 5 && (
                    <div className="flex flex-col gap-5">
                        <div className="space-y-1.5">
                            <Label htmlFor="source">{t("form.referral_source_label")}</Label>
                            <select
                                id="source"
                                name="source"
                                autoFocus
                                value={formik.values.source}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className="border-input focus-visible:border-ring focus-visible:ring-ring/30 h-12 w-full rounded-xl border bg-transparent px-3 py-1 text-sm transition-colors outline-none focus-visible:ring-2"
                            >
                                <option value="">---</option>
                                <option value="friend">{t("form.referral_source_options.friend")}</option>
                                <option value="socialMedia">{t("form.referral_source_options.social_media")}</option>
                                <option value="google">{t("form.referral_source_options.google")}</option>
                            </select>
                            {formik.touched.source && formik.errors.source && (
                                <p role="alert" className="text-destructive text-sm">
                                    {formik.errors.source}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="did_help">{t("form.volunteer.prior_experience_label")}</Label>
                            <select
                                id="did_help"
                                name="did_help"
                                value={formik.values.did_help}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className="border-input focus-visible:border-ring focus-visible:ring-ring/30 h-12 w-full rounded-xl border bg-transparent px-3 py-1 text-sm transition-colors outline-none focus-visible:ring-2"
                            >
                                <option value="">---</option>
                                <option value="yes_professional">
                                    {t("form.volunteer.prior_experience.yes_professional")}
                                </option>
                                <option value="yes_personal">
                                    {t("form.volunteer.prior_experience.yes_personal")}
                                </option>
                                <option value="no">{t("form.volunteer.prior_experience.no")}</option>
                            </select>
                            {formik.touched.did_help && formik.errors.did_help && (
                                <p role="alert" className="text-destructive text-sm">
                                    {formik.errors.did_help as string}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 6: Themes to avoid + TOS */}
                {step === 6 && (
                    <div className="flex flex-col gap-5">
                        <div className="space-y-3">
                            <Label>{t("form.volunteer.issues_to_avoid_label")}</Label>
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {THEME_OPTIONS.map((opt) => (
                                    <label
                                        key={opt.value}
                                        className={cn(
                                            "border-border hover:bg-muted/50 flex cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-3 transition-all",
                                            formik.values.themes.includes(opt.value) &&
                                                "border-primary-brand bg-primary-brand/5 ring-primary-brand/20 ring-1"
                                        )}
                                    >
                                        <Checkbox
                                            checked={formik.values.themes.includes(opt.value)}
                                            onCheckedChange={() => handleThemeToggle(opt.value)}
                                        />
                                        <span className="text-sm">
                                            {t(`form.volunteer.issues_to_avoid.${opt.key}`)}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <label className="flex cursor-pointer items-start gap-3 rounded-xl p-0">
                            <Checkbox
                                id="tos"
                                checked={formik.values.tos}
                                onCheckedChange={(checked) => formik.setFieldValue("tos", checked)}
                                className="mt-0.5"
                            />
                            <span className="text-muted-foreground text-sm leading-relaxed">
                                {t("crisis.tos_label", { defaultValue: "Wyrażam zgodę na" })}{" "}
                                <InternalLink target="_blank" to="/tos">
                                    {t("crisis.tos_link", {
                                        defaultValue: "warunki użytkowania i politykę prywatności",
                                    })}
                                </InternalLink>
                            </span>
                        </label>
                        {formik.touched.tos && formik.errors.tos && (
                            <span role="alert" className="text-destructive text-sm">
                                {formik.errors.tos}
                            </span>
                        )}
                    </div>
                )}

                {/* Navigation */}
                <div className="mt-8 flex items-center justify-between gap-3">
                    <Button variant="ghost" type="button" onClick={handleBack} disabled={step === 0} className="gap-2">
                        <ArrowLeft className="size-4" />
                        {t("form.back")}
                    </Button>
                    <Button type="submit" className="gap-2">
                        {step === LAST_STEP ? t("form.submit") : t("form.next")}
                        {step < LAST_STEP && <ArrowRight className="size-4" />}
                    </Button>
                </div>
            </form>
        </FormWrapper>
    );
};

export default VolunteerForm;
