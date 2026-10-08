import * as Yup from "yup";
import i18n from "../../locales/i18n";
import { Roles } from "../users/constants";
import { ErrorMessage } from "./types";

const Errors = {
    [ErrorMessage.FAILED_TO_FETCH_CHAT]: i18n.t("errors.failed_to_fetch_chat"),
    [ErrorMessage.FAILED_TO_FETCH_CHAT_NOTE]: i18n.t("errors.failed_to_fetch_chat_note"),
    [ErrorMessage.FAILED_TO_SAVE_NOTE]: i18n.t("errors.failed_to_save_note"),
    [ErrorMessage.FAILED_TO_CREATE_REPORT]: i18n.t("errors.failed_to_create_report"),
    [ErrorMessage.FAILED_TO_FETCH_PUBLIC_PROFILE]: i18n.t("errors.failed_to_fetch_public_profile"),
    [ErrorMessage.FAILED_TO_UPDATE_PUBLIC_PROFILE]: i18n.t("errors.failed_to_update_public_profile"),
    [ErrorMessage.FAILED_TO_FETCH_USER]: i18n.t("errors.failed_to_fetch_user"),
    [ErrorMessage.UNKNOWN]: i18n.t("errors.unknown"),
    [ErrorMessage.FAILED_TO_CREATE_CHAT]: i18n.t("errors.failed_to_create_chat"),
    [ErrorMessage.INCORRECT_EMAIL_OR_PASSWORD]: i18n.t("errors.incorrect_email_or_password"),
    [ErrorMessage.ARTICLE_CATEGORY_IS_USED]: i18n.t("errors.article_category_in_use"),
    [ErrorMessage.USER_NOT_FOUND]: i18n.t("errors.user_not_found"),
    [ErrorMessage.ARTICLE_CATEGORY_WITH_THAT_NAME_ALREADY_EXISTS]: i18n.t(
        "errors.article_category_with_that_name_already_exists"
    ),
    [ErrorMessage.INACTIVE_USER]: i18n.t("errors.inactive_user"),
    [ErrorMessage.INVALID_OR_EXPIRED_TOKEN]: i18n.t("errors.invalid_or_expired_confirmation_token"),
    [ErrorMessage.ARTICLE_CATEGORY_NOT_FOUND]: i18n.t("errors.article_category_not_found"),
    [ErrorMessage.FAILED_TO_EDIT_CHAT]: i18n.t("errors.failed_to_edit_chat"),
    [ErrorMessage.FAILED_TO_FETCH_REPORTS]: i18n.t("errors.failed_to_fetch_reports"),
    [ErrorMessage.THE_USER_WITH_THIS_USERNAME_ALREADY_EXISTS_IN_THE_SYSTEM]: i18n.t("errors.username_already_exists"),
};

export default Errors;

export enum Permissions {
    AlL = "*",
    CREATE_ARTICLE = "CREATE_ARTICLE",
    EDIT_ARTICLE = "EDIT_ARTICLE",
    CAN_READ_CHAT_HISTORY = "CAN_READ_CHAT_HISTORY",
    DELETE_ARTICLE = "DELETE_ARTICLE",
    PUBLISH_ARTICLE_AS_ADMIN = "PUBLISH_ARTICLE_AS_ADMIN",
    ADMIN_DASHBOARD = "ADMIN_DASHBOARD",
    SEARCH_USERS = "SEARCH_USERS",
    MANAGE_USERS = "MANAGE_USERS",
    MANAGE_ARTICLES = "MANAGE_ARTICLES",
    EDIT_CHAT_NOTE = "EDIT_CHAT_NOTE",
    MANAGE_REPORTS = "MANAGE_REPORTS",
    MANAGE_CHATS = "MANAGE_CHATS",
    READ_OWN_CHATS = "READ_OWN_CHATS",
    MANAGE_MENTEE_FORMS = "MANAGE_MENTEE_FORMS",
    EDIT_CHAT_DATA = "EDIT_CHAT_DATA",
    MANAGE_VOLUNTEER_FORMS = "MANAGE_VOLUNTEER_FORMS",
    CAN_CONFIRM_CONTRACT = "CAN_CONFIRM_CONTRACT",
    DELETE_OTHERS_CHAT_MESSAGES = "DELETE_OTHERS_CHAT_MESSAGES",
    MANAGE_OWN_AVAILABILITY = "MANAGE_OWN_AVAILABILITY",
    VIEW_TRAININGS = "VIEW_TRAININGS",
}

export const groupedPermissions = {
    [Roles.ADMIN]: [Permissions.AlL],
    [Roles.VOLUNTEERSUPERVISOR]: [Permissions.AlL],
    [Roles.VOLUNTEER]: [
        Permissions.CREATE_ARTICLE,
        Permissions.EDIT_ARTICLE,
        Permissions.DELETE_ARTICLE,
        Permissions.READ_OWN_CHATS,
        Permissions.EDIT_CHAT_DATA,
        Permissions.EDIT_CHAT_NOTE,
        Permissions.CAN_CONFIRM_CONTRACT,
        Permissions.MANAGE_OWN_AVAILABILITY,
        Permissions.VIEW_TRAININGS,
    ],
    [Roles.REDACTOR]: [
        Permissions.CREATE_ARTICLE,
        Permissions.EDIT_ARTICLE,
        Permissions.DELETE_ARTICLE,
        Permissions.READ_OWN_CHATS,
        Permissions.MANAGE_ARTICLES,
        Permissions.ADMIN_DASHBOARD,
        Permissions.EDIT_CHAT_NOTE,
        Permissions.VIEW_TRAININGS,
    ],
    [Roles.USER]: [Permissions.READ_OWN_CHATS],
};

export const validation = {
    password: Yup.string()
        .min(8, i18n.t("validation.incorrect_password_format"))
        .matches(/[A-Z]/, i18n.t("validation.min_one_uppercase"))
        .matches(/\d/, i18n.t("validation.min_one_number"))
        .required(i18n.t("validation.required")),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref("password"), undefined], i18n.t("validation.passwords_must_match"))
        .required(i18n.t("validation.required")),
    email: Yup.string().email(i18n.t("validation.invalid_email")).required(i18n.t("validation.required")),
    token: Yup.string().required(i18n.t("validation.required")),
};

/**
 * Permissive international phone number: an optional leading `+` country code
 * (e.g. `+48`), then 7–19 more characters of digits, spaces, hyphens, dots or
 * parentheses. Intentionally lenient - it accepts the common ways people write
 * a number rather than enforcing a single strict format.
 */
export const phoneRegex = /^\+?[0-9][0-9\s().-]{6,19}$/;

/** Strip characters that can't appear in a phone number (keeps digits and `+ () - . space`). */
export const sanitizePhone = (value: string) => value.replace(/[^\d+\s().-]/g, "");
