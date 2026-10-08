import { Button, Typography, XStack, YStack } from "@fundacja-peryskop/ui";
import { FormikProvider } from "formik";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useIconColor } from "../../../layout/useIconColor";
import { AnimatedStatus } from "../../../shared/components/AnimatedStatus";
import Loader from "../../../shared/components/Loader";
import type { FormWizardApi } from "../types";
import { FormProgressBar } from "./FormProgressBar";

/** Non-submitting button marker (DS Button/Stack don't type `type`). */
const NON_SUBMIT = { type: "button" } as object;

const stepVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 48 : -48, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -48 : 48, opacity: 0 }),
};

interface Props<T extends object> {
    wizard: FormWizardApi<T>;
    /** Heading of the success screen. */
    successTitle: string;
    /** Form-specific body of the success screen (what happens next, etc.). */
    successContent?: ReactNode;
}

/**
 * Focused, single-question-per-screen shell for a multi-step form. Renders one
 * step at a time (big heading + the step's field + Back/Continue), slides between
 * steps, swaps to a calm success state when done, and anchors a 2px progress line
 * to the bottom of the screen. Sits inside the normal page chrome (the navbar
 * stays). All form state comes from the `useFormWizard` controller; this
 * component is purely presentational.
 */
export function FormWizard<T extends object>({ wizard, successTitle, successContent }: Props<T>) {
    const { t } = useTranslation();
    const icon = useIconColor();
    const { formik, step, totalSteps, direction, status, current, blocked, progress, goBack } = wizard;

    const isLastStep = step === totalSteps - 1;
    const isSubmitting = status === "submitting";

    return (
        <FormikProvider value={formik}>
            <form onSubmit={formik.handleSubmit} noValidate>
                <YStack
                    backgroundColor="$background"
                    position="relative"
                    alignItems="center"
                    justifyContent="center"
                    paddingHorizontal="$lg"
                    paddingVertical="$xxxl"
                    // Fill the viewport below the navbar so a short step sits
                    // comfortably centred; the page scrolls for taller steps.
                    style={{ minHeight: "calc(100dvh - 140px)" }}
                >
                    <YStack width="100%" maxWidth={560}>
                        <AnimatePresence mode="wait" initial={false} custom={direction}>
                            {status === "success" ? (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <AnimatedStatus title={successTitle}>{successContent}</AnimatedStatus>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key={current?.id ?? step}
                                    custom={direction}
                                    variants={stepVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                >
                                    <YStack gap="$xl">
                                        <YStack gap="$sm">
                                            <Typography variant="tinyRegular" muted>
                                                {t("form.step_indicator", {
                                                    current: step + 1,
                                                    total: totalSteps,
                                                    defaultValue: `Krok ${step + 1} z ${totalSteps}`,
                                                })}
                                            </Typography>
                                            <Typography variant="title2" tag="h1" width="100%">
                                                {current?.title}
                                            </Typography>
                                            {current?.subtitle ? (
                                                <Typography variant="regularRegular" muted width="100%">
                                                    {current.subtitle}
                                                </Typography>
                                            ) : null}
                                        </YStack>

                                        {current ? <current.Field /> : null}

                                        <XStack alignItems="center" justifyContent="space-between" gap="$md">
                                            <Button
                                                variant="mutedPrimary"
                                                {...NON_SUBMIT}
                                                onPress={goBack}
                                                disabled={step === 0 || isSubmitting}
                                            >
                                                <ArrowLeft size={16} color={icon.primary} />
                                                <Typography variant="regularSemibold" color="$primaryDarker">
                                                    {t("form.back")}
                                                </Typography>
                                            </Button>
                                            <Button variant="primary" disabled={blocked || isSubmitting}>
                                                {isSubmitting ? (
                                                    <Loader variant="small" size={20} />
                                                ) : isLastStep ? (
                                                    t("form.submit")
                                                ) : (
                                                    t("form.next")
                                                )}
                                            </Button>
                                        </XStack>
                                    </YStack>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </YStack>

                    <FormProgressBar progress={progress} />
                </YStack>
            </form>
        </FormikProvider>
    );
}
