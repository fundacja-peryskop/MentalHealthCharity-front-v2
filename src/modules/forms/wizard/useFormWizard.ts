import { useFormik } from "formik";
import { useCallback, useEffect, useRef, useState } from "react";
import { clearFormProgress, loadFormProgress, saveFormProgress } from "./persistence";
import type { FormWizardApi, WizardStatus, WizardStep } from "./types";

export interface UseFormWizardOptions<T extends object> {
    steps: WizardStep<T>[];
    initialValues: T;
    /** localStorage key for progress persistence. */
    storageKey: string;
    /** Fields never written to storage (e.g. consent must be re-affirmed). Stable reference. */
    persistOmit?: (keyof T)[];
    /** Called on the last step. May be async; throwing keeps the user on the step. */
    onSubmit: (values: T) => void | Promise<void>;
    /** Show the success state immediately (e.g. the user has already applied). */
    startCompleted?: boolean;
}

const EMPTY_OMIT: never[] = [];

/**
 * Headless engine for a multi-step form: owns the current step, per-step
 * validation (via Formik), step transitions, progress, localStorage persistence
 * and the submit → success lifecycle. It renders nothing - `FormWizard` turns
 * this state into UI - which keeps the logic easy to reason about and to test.
 */
export function useFormWizard<T extends object>({
    steps,
    initialValues,
    storageKey,
    persistOmit = EMPTY_OMIT as unknown as (keyof T)[],
    onSubmit,
    startCompleted = false,
}: UseFormWizardOptions<T>): FormWizardApi<T> {
    const lastStep = steps.length - 1;
    const omitRef = useRef(persistOmit);

    // Read any saved progress once, on first render.
    const restored = useRef(startCompleted ? null : loadFormProgress<T>(storageKey, omitRef.current)).current;
    const initialStep = restored ? Math.min(Math.max(restored.step, 0), lastStep) : 0;

    const [step, setStep] = useState(initialStep);
    const [direction, setDirection] = useState<1 | -1>(1);
    const [status, setStatus] = useState<WizardStatus>(startCompleted ? "success" : "filling");

    const formik = useFormik<T>({
        initialValues: restored ? { ...initialValues, ...restored.values } : initialValues,
        validationSchema: steps[step]?.schema,
        onSubmit: async (values) => {
            if (step < lastStep) {
                setDirection(1);
                setStep((s) => s + 1);
                return;
            }
            setStatus("submitting");
            try {
                await onSubmit(values);
                clearFormProgress(storageKey);
                setStatus("success");
            } catch {
                // The caller surfaces the error (e.g. a toast); keep the user on
                // the last step with their answers intact so they can retry.
                setStatus("filling");
            }
        },
    });

    // Persist progress as the visitor types and advances - never once completed.
    const { values } = formik;
    useEffect(() => {
        if (status !== "filling") return;
        saveFormProgress(storageKey, step, values, omitRef.current);
    }, [storageKey, step, values, status]);

    const goBack = useCallback(() => {
        setDirection(-1);
        setStep((s) => (s > 0 ? s - 1 : s));
    }, []);

    const current = steps[step];
    const blocked = current?.blockAdvance?.(values) ?? false;
    const progress = status === "success" ? 100 : ((step + 1) / (steps.length + 1)) * 100;

    return { formik, step, totalSteps: steps.length, direction, status, current, blocked, progress, goBack };
}
