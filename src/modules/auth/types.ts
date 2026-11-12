import { Roles } from "../users/constants";

export interface LoginFormValues {
    email: string;
    password: string;
}

export interface RegisterFormValues {
    password: string;
    email: string;
    full_name: string;
    confirmPassword: string;
    policy_confirm: boolean;
}

export interface RegisterPayload extends RegisterFormValues {
    intent?: string;
    next?: string;
}

export interface LoginAccessTokenResponse {
    access_token: string;
    token_type: string;
}

export interface RegisterResponse extends User {
    reset_token: string;
}

export interface User {
    email: string;
    full_name: string;
    user_role: Roles;
    is_assigned_to_chat: boolean;
    excluded_from_automation: boolean;
    chat_avatar_url?: string;
    user_public_profile?: {
        avatar_url?: string;
        description?: string;
    } | null;
    id: number;
    /** Stable public identifier (the auth token subject). */
    uuid?: string;
}

export interface ResetPasswordPayload {
    email: string;
    token: string;
    new_password: string;
}
