import { User } from "../auth/types";

export enum MenteeMatchingStatus {
    WAITING = "WAITING",
    MATCHED = "MATCHED",
    PAUSED = "PAUSED",
    DECLINED = "DECLINED",
    REMATCH_REQUESTED = "REMATCH_REQUESTED",
    CLOSED = "CLOSED",
}

export interface VolunteerAvailabilityStatus {
    volunteer_id: number;
    declared_capacity: number | null;
    active_chat_count: number;
    free_slots: number;
    is_full: boolean;
    must_prompt: boolean;
    first_time_declaration: boolean;
    below_current_assignments: boolean;
    warning?: string | null;
    blocked_until?: string | null;
}

export interface VolunteerAvailabilityUpdate {
    declared_capacity: number;
}

export interface ManualPairRequest {
    user_id: number;
    volunteer_id: number;
    ignore_capacity: boolean;
}

export interface ManualPairResponse {
    chat_id: number;
    warning?: string | null;
}

export interface MatchingRunResult {
    matched_count: number;
    waiting_count: number;
    no_capacity_count: number;
    created_chat_ids: number[];
}

export interface MatchingAutomationSettings {
    automatic_matching_enabled: boolean;
    updated_at?: string | null;
    updated_by_id?: number | null;
}

export interface MatchingAutomationSettingsUpdate {
    automatic_matching_enabled: boolean;
}

export interface RematchDecisionRequest {
    wants_rematch: boolean;
}

export interface AdminAlertMetadata {
    waiting_user_ids?: number[];
    notified_user_ids?: number[];
    [key: string]: unknown;
}

export interface AdminAlert {
    message: string;
    metadata: AdminAlertMetadata | null;
    created_at: string;
}

export enum AutomationEventType {
    FORM_SUBMITTED = "FORM_SUBMITTED",
    FORM_QUEUED = "FORM_QUEUED",
    AVAILABILITY_UPDATED = "AVAILABILITY_UPDATED",
    CHAT_CREATED = "CHAT_CREATED",
    CHAT_CREATED_MANUALLY = "CHAT_CREATED_MANUALLY",
    CHAT_PARTICIPANT_ADDED = "CHAT_PARTICIPANT_ADDED",
    CHAT_PARTICIPANT_REMOVED = "CHAT_PARTICIPANT_REMOVED",
    CHAT_AUTO_CLOSE_SNOOZED = "CHAT_AUTO_CLOSE_SNOOZED",
    NO_CAPACITY = "NO_CAPACITY",
    REMATCH_REQUESTED = "REMATCH_REQUESTED",
    REMATCH_DECISION = "REMATCH_DECISION",
    MANUAL_PAIRING = "MANUAL_PAIRING",
    VOLUNTEER_REMOVED = "VOLUNTEER_REMOVED",
    CHAT_CLOSED = "CHAT_CLOSED",
    AUTOMATION_EXCLUSION_UPDATED = "AUTOMATION_EXCLUSION_UPDATED",
    ERROR = "ERROR",
    INFO = "INFO",
}

export interface UserTimelineOptions {
    cursor?: string;
    limit?: number;
    email?: string;
    user_id?: number;
}

export interface UserTimelineForm {
    id: number;
    status: "WAITED" | "ACCEPTED" | "REJECTED";
    current_step: number;
    creation_date: string;
}

export interface UserTimelineChat {
    id: number;
    name: string | null;
    status: "ACTIVE" | "CLOSED" | "ARCHIVED";
    matching_mode: "AUTO" | "MANUAL";
    creation_date: string;
    closed_at: string | null;
    volunteer: User | null;
}

export interface UserTimelineSummary {
    matching_status: MenteeMatchingStatus | null;
    latest_form: UserTimelineForm | null;
    current_chat: UserTimelineChat | null;
    latest_chat: UserTimelineChat | null;
    latest_volunteer: User | null;
    chat_created_at: string | null;
    chat_closed_at: string | null;
}

export interface UserTimelineEvent {
    id: number;
    occurred_at: string;
    event_type: AutomationEventType;
    label: string;
    detail: string;
    source: "automatic" | "manual" | "mail" | "error" | "system";
    form_id: number | null;
    chat_id: number | null;
    volunteer: User | null;
    actor: User | null;
    metadata: Record<string, unknown> | null;
}

export interface UserTimelineResponse {
    user: User;
    summary: UserTimelineSummary;
    forms: UserTimelineForm[];
    chats: UserTimelineChat[];
    events: UserTimelineEvent[];
    next_cursor: string | null;
    has_more: boolean;
}

export interface MenteeMatchingState {
    user_id: number;
    help_form_id: number | null;
    status: MenteeMatchingStatus;
    auto_matching_enabled: boolean;
    excluded_from_automation: boolean;
    queued_at: string;
    matched_at: string | null;
    current_chat_id: number | null;
}

export interface MenteeMatchingItem {
    user: User;
    state: MenteeMatchingState;
}

export interface VolunteerCapacityItem {
    volunteer: User;
    availability: VolunteerAvailabilityStatus;
}
