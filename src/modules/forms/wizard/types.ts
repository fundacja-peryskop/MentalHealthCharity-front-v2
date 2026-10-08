import type { FormikProps } from "formik";
import type { ComponentType } from "react";
import type { AnyObjectSchema } from "yup";

/** A single step of a multi-step form. */
export interface WizardStep<T extends object> {
    /** Stable id - used as the animation key. */
    id: string;
    /** Validation for THIS step's fields only. */
    schema: AnyObjectSchema;
    /** Large heading (the question), already localised. */
    title: string;
    /** Optional supporting line under the heading, already localised. */
    subtitle?: string;
    /**
     * The step's input(s). Must be a stable component reference (defined at
     * module scope, not inline) so it is not remounted on every keystroke. It
     * reads form state through Formik context (`useField` / `useFormikContext`).
     */
    Field: ComponentType;
    /**
     * Extra gate beyond schema validation: return `true` to BLOCK advancing even
     * when the schema passes (e.g. an under-18 hard stop). The Continue button is
     * disabled while this is true.
     */
    blockAdvance?: (values: T) => boolean;
}

export type WizardStatus = "filling" | "submitting" | "success";

/** The controller returned by `useFormWizard`, consumed by `FormWizard`. */
export interface FormWizardApi<T extends object> {
    formik: FormikProps<T>;
    step: number;
    totalSteps: number;
    direction: 1 | -1;
    status: WizardStatus;
    current: WizardStep<T> | undefined;
    /** Continue is blocked by the current step's `blockAdvance`. */
    blocked: boolean;
    /** 0–100, for the progress bar. */
    progress: number;
    goBack: () => void;
}
