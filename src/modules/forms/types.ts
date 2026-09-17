import { User } from "../auth/types";
import { MenteeMatchingState } from "../matching/types";

export interface FormOptions {
    id: number;
}

export interface CanUserSendFormOptions {
    form_type?: formTypes;
}

export interface CanUserSendFormResponse {
    can_send_form: boolean;
}

export enum formStatus {
    WAITED = "WAITED",
    ACCEPTED = "ACCEPTED",
    REJECTED = "REJECTED",
}

export enum formSorting {
    MIN_STAGE = "min_stage",
    MAX_STAGE = "max_stage",
    NEWEST = "newest",
    OLDEST = "oldest",
}

export interface FormOption {
    name: string;
    value: string;
}

export interface ReadAllFormOptions {
    search?: string;
    form_status: formStatus;
    form_type: formTypes;
    page: number;
    size: number;
    // Sorting options: "min_stage" (ascending order by current_step), "max_stage" (descending order by current_step), "newest" (descending order by creation_date), "oldest" (ascending order by creation_date)
    sort?: "min_stage" | "max_stage" | "newest" | "oldest";
}

export interface VolunteerFormValues {
    age: string;
    phone: string;
    tos: boolean;
    education: string;
    description: string;
    interview_meeting_dates: string[];
    source: string;
    reason: string;
    contacts: string[];
    did_help: string;
    themes: string[];
}

export interface VolunteerForm {
    age: string;
    phone: string;
    tos: boolean;
    education: string;
    description: string;
    reason: string;
    source: string;
    did_help: string;
    contacts: FormOption[];
    themes: FormOption[];
}

export interface MenteeFormValues {
    age: string;
    name: string;
    contacts: string[];
    description: string;
    contact_preference: "scheduled" | "asynchronous" | "";
    phone?: string;
    email: string;
    tos: boolean;
    source: string;
}

export interface MenteeForm {
    age: string;
    name: string;
    contacts: FormOption[];
    description: string;
    contact_preference: "scheduled" | "asynchronous";
    phone?: string;
    source: string;
}

export interface Form<T> {
    fields: T;
    message?: string;
    form_type: formTypes;
}

export interface FormResponse<T> {
    created_by: User;
    creation_date: string;
    current_step: number;
    fields: T;
    form_status: formStatus;
    notes: FormNote;
    matching_state?: MenteeMatchingState | null;
    form_type: {
        form_type: formTypes;
        id: number;
        is_active: boolean;
        max_step: number;
    };
    id: number;
    message: string | null;
}

export enum formNoteFields {
    INTERVIEW_DESCRIPTION = "interview_description",
    WORK_AREA = "work_area",
    AVAILABILITY = "availability",
    NOTE = "note",
}

export type FormNote =
    | {
          [key in formNoteFields]?: string;
      }
    | null;

export interface FormNotePayload {
    notes: FormNote;
    id: number;
}

export enum formTypes {
    MENTEE = "HELP",
    VOLUNTEER = "VOLUNTEER",
}
