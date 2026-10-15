import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { isValidElement, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import formatDate from "../../../shared/helpers/formatDate";
import { createRenderFieldValue } from "../../../shared/helpers/formRenderers/formRenderer";
import { arrayOfIsoDatesPlugin } from "../../../shared/helpers/formRenderers/plugins/arrayOfIsoDatesPlugin";
import { arrayOfNamedObjectsPlugin } from "../../../shared/helpers/formRenderers/plugins/arrayOfNamedObjectsPlugin";
import { booleanPlugin } from "../../../shared/helpers/formRenderers/plugins/booleanPlugin";
import { singleIsoDatePlugin } from "../../../shared/helpers/formRenderers/plugins/singleIsoDatePlugin";
import { isISODate } from "../../../shared/helpers/isISODate";
import UserTableItem from "../../../users/components/UserTableItem";
import { FormResponse, MenteeForm, VolunteerForm } from "../../types";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    form?: FormResponse<MenteeForm | VolunteerForm> | null;
    refetch?: () => void;
}

const FIELD_DISPLAY_PRIORITY = [
    "name",
    "email",
    "phone",
    "age",
    "contact_preference",
    "contacts",
    "themes",
    "description",
    "reason",
    "source",
    "education",
    "did_help",
    "interview_meeting_dates",
    "tos",
] as const;

const humanizeKey = (key: string) =>
    key
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());

const normalizeOptionTranslationKey = (value: string) => {
    if (value === "socialMedia") {
        return "social_media";
    }

    return value;
};

const extractOptionValue = (value: unknown): string | null => {
    if (typeof value === "string" || typeof value === "number") {
        return String(value);
    }

    if (value && typeof value === "object") {
        const option = value as Record<string, unknown>;

        if (typeof option.value === "string" || typeof option.value === "number") {
            return String(option.value);
        }

        if (typeof option.name === "string" || typeof option.name === "number") {
            return String(option.name);
        }
    }

    return null;
};

const getFieldPriority = (key: string) => {
    const idx = FIELD_DISPLAY_PRIORITY.findIndex((fieldKey) => fieldKey === key);
    return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
};

const INTERVIEW_DATES_PREVIEW_COUNT = 10;

const FormTableItem = ({ form, className, ...props }: Props) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [showAllInterviewDates, setShowAllInterviewDates] = useState(false);

    useEffect(() => {
        setShowAllInterviewDates(false);
    }, [form?.id]);

    const renderFieldValue = createRenderFieldValue([
        arrayOfNamedObjectsPlugin,
        arrayOfIsoDatesPlugin,
        singleIsoDatePlugin,
        booleanPlugin,
    ]);

    const fieldsArray = useMemo(() => {
        if (!form?.fields) {
            return [];
        }

        return Object.entries(form.fields).sort(([firstKey], [secondKey]) => {
            const priorityDiff = getFieldPriority(firstKey) - getFieldPriority(secondKey);
            if (priorityDiff !== 0) {
                return priorityDiff;
            }

            return firstKey.localeCompare(secondKey);
        });
    }, [form?.fields]);

    if (!form || !form.fields) {
        return null;
    }

    const hasDisplayValue = (value: unknown) => {
        if (value === null || value === undefined) {
            return false;
        }

        if (typeof value === "string") {
            const normalized = value.trim();
            return normalized !== "" && normalized !== "-";
        }

        return true;
    };

    const renderFormFieldValue = (key: string, value: unknown) => {
        if (value === null || value === undefined) {
            return null;
        }

        if (typeof value === "string") {
            const normalized = value.trim();
            if (normalized === "" || normalized === "-") {
                return null;
            }
        }

        if (Array.isArray(value) && value.length === 0) {
            return null;
        }

        const translateOptionValue = (translationKeys: string[], fallbackValue: string) => {
            for (const translationKey of translationKeys) {
                const translatedValue = t(translationKey);

                if (translatedValue !== translationKey) {
                    return translatedValue;
                }
            }

            return fallbackValue;
        };

        const renderTranslatedOptionList = (
            rawValue: unknown,
            mapTranslationKeys: (normalizedValue: string) => string[]
        ) => {
            const rawItems = Array.isArray(rawValue) ? rawValue : [rawValue];

            const translatedItems = rawItems
                .map((item) => extractOptionValue(item))
                .filter((item): item is string => Boolean(item && item.trim() && item.trim() !== "-"))
                .map((item) => {
                    const normalizedValue = normalizeOptionTranslationKey(item);

                    return translateOptionValue(mapTranslationKeys(normalizedValue), humanizeKey(item));
                });

            if (translatedItems.length === 0) {
                return null;
            }

            return translatedItems.join(", ");
        };

        if (key === "contact_preference" && typeof value === "string") {
            return t(`form.mentee.contact_preference_options.${value}.title`, { defaultValue: value });
        }

        if (key === "interview_meeting_dates" && Array.isArray(value)) {
            const isoDates = value.filter((date): date is string => typeof date === "string" && isISODate(date));

            if (isoDates.length === 0) {
                return null;
            }

            const visibleDates = showAllInterviewDates ? isoDates : isoDates.slice(0, INTERVIEW_DATES_PREVIEW_COUNT);
            const hiddenDatesCount = Math.max(isoDates.length - INTERVIEW_DATES_PREVIEW_COUNT, 0);

            return (
                <div className="flex flex-col gap-1.5">
                    <div className="flex flex-wrap gap-1.5">
                        {visibleDates.map((date, idx) => (
                            <Badge key={`${date}-${idx}`} className="px-2 py-0.5 text-[11px]">
                                {formatDate(date, "dd/MM/yyyy HH:mm")}
                            </Badge>
                        ))}
                    </div>

                    {isoDates.length > INTERVIEW_DATES_PREVIEW_COUNT && (
                        <button
                            type="button"
                            onClick={() => setShowAllInterviewDates((prev) => !prev)}
                            className="text-primary-brand w-fit text-[11px] font-semibold hover:underline"
                        >
                            {showAllInterviewDates
                                ? t("common.collapse", { defaultValue: "Zwiń" })
                                : t("common.show_more_count_click", {
                                      count: hiddenDatesCount,
                                      defaultValue: `i ${hiddenDatesCount} więcej. Kliknij aby pokazać`,
                                  })}
                        </button>
                    )}
                </div>
            );
        }

        if (key === "themes") {
            return renderTranslatedOptionList(value, (item) => [`form.volunteer.issues_to_avoid.${item}`]);
        }

        if (key === "contacts") {
            return renderTranslatedOptionList(value, (item) => [
                `form.mentee.contact_options.${item}`,
                `form.volunteer.contact_options.${item}`,
            ]);
        }

        if (key === "source" && typeof value === "string") {
            const normalizedValue = normalizeOptionTranslationKey(value);
            return translateOptionValue([`form.referral_source_options.${normalizedValue}`], humanizeKey(value));
        }

        if (key === "did_help" && typeof value === "string") {
            return translateOptionValue([`form.volunteer.prior_experience.${value}`], humanizeKey(value));
        }

        if (key === "education" && typeof value === "string") {
            return translateOptionValue([`form.volunteer.education.${value}`], humanizeKey(value));
        }

        const renderedValue = renderFieldValue(value);

        if (renderedValue === null || renderedValue === undefined || renderedValue === "") {
            return null;
        }

        if (typeof renderedValue === "string" || typeof renderedValue === "number") {
            if (!hasDisplayValue(renderedValue)) {
                return null;
            }

            return String(renderedValue);
        }

        if (Array.isArray(renderedValue)) {
            if (renderedValue.length === 0) {
                return null;
            }

            const canJoin = renderedValue.every((part) => typeof part === "string" || typeof part === "number");
            if (canJoin) {
                const joined = renderedValue.join(", ").trim();
                return joined ? joined : null;
            }
        }

        if (isValidElement(renderedValue)) {
            return renderedValue;
        }

        if (typeof renderedValue === "object") {
            try {
                const serialized = JSON.stringify(renderedValue);
                return serialized === "{}" || serialized === "[]" ? null : serialized;
            } catch {
                return String(renderedValue);
            }
        }

        return String(renderedValue);
    };

    const renderedFields = fieldsArray
        .map(([key, value]) => ({ key, value: renderFormFieldValue(key, value as unknown) }))
        .filter(({ value }) => hasDisplayValue(value));

    // Plain computation, not a hook: this runs after the early return above.
    const descriptionField = renderedFields.find(({ key }) => key === "description");
    const otherFields = renderedFields.filter(({ key }) => key !== "description");
    const orderedRenderedFields = descriptionField ? [...otherFields, descriptionField] : otherFields;

    const statusLabel = t(`form_status.${form.form_status.toLowerCase()}`, {
        defaultValue: form.form_status,
    });

    const statusClassName =
        form.form_status === "ACCEPTED"
            ? "bg-success-brand/15 text-success-brand"
            : form.form_status === "REJECTED"
              ? "bg-danger-brand/15 text-danger-brand"
              : "bg-warning-brand/15 text-warning-brand";

    return (
        <div className={cn(className)} {...props}>
            <div className="p-2.5 sm:p-3">
                <UserTableItem
                    user={form.created_by}
                    className="border-border/60 bg-muted/10 border p-2.5 shadow-none sm:p-3"
                    onEdit={() => navigate(`/admin/users?search=${form.created_by.email}`)}
                />

                <Separator className="my-3.5 sm:my-4" />

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <div className="border-border/60 bg-muted/20 rounded-lg border px-2.5 py-2">
                        <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
                            {t("forms_fields.progress", { defaultValue: "Progress" })}
                        </p>
                        <p className="text-foreground mt-0.5 text-xs font-semibold">
                            {form.current_step}/{form.form_type.max_step}
                        </p>
                    </div>

                    <div className="border-border/60 bg-muted/20 rounded-lg border px-2.5 py-2">
                        <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
                            {t("common.status", { defaultValue: "Status" })}
                        </p>
                        <Badge variant="outline" className={cn("mt-0.5 text-[11px]", statusClassName)}>
                            {statusLabel}
                        </Badge>
                    </div>

                    <div className="border-border/60 bg-muted/20 rounded-lg border px-2.5 py-2">
                        <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
                            {t("forms_fields.creation_date")}
                        </p>
                        <p className="text-foreground mt-0.5 text-xs font-semibold">
                            {formatDate(form.creation_date, "dd/MM/yyyy")}
                        </p>
                    </div>
                </div>

                <Separator className="my-3.5 sm:my-4" />

                <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                    {orderedRenderedFields.map(({ key, value }) => {
                        const renderedFieldValue = value;

                        return (
                            <div
                                key={key}
                                className={cn(
                                    "border-border/60 bg-card/70 flex flex-col rounded-lg border px-2.5 py-2",
                                    key === "description" && "col-span-full"
                                )}
                            >
                                <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
                                    {t(`forms_fields.${key}`, { defaultValue: humanizeKey(key) })}
                                </p>

                                {isValidElement(renderedFieldValue) ? (
                                    <div className="mt-1 text-[13px]">{renderedFieldValue}</div>
                                ) : (
                                    <p className="text-foreground mt-1 text-[13px] leading-relaxed break-words whitespace-pre-wrap">
                                        {renderedFieldValue as string}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default FormTableItem;
