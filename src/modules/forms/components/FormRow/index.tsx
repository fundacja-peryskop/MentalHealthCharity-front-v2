import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Pin } from "lucide-react";
import { useTranslation } from "react-i18next";
import formatDate from "../../../shared/helpers/formatDate";
import { translatedRoles } from "../../../users/constants";
import { translatedFormStatus } from "../../constants";
import { FormResponse, formStatus, MenteeForm, VolunteerForm } from "../../types";

/**
 * Single source of truth for the table layout, shared by the header and every row kind.
 * `minmax(min,fr)` columns never shrink below their minimum, so FORM_ROW_MIN_WIDTH has to be
 * derived from them — otherwise the grid overflows its row card and the last column (the pin
 * button) spills past the right edge on narrow viewports.
 */
const COLUMNS = [
    { minWidth: 140, grow: 1 }, // name
    { minWidth: 200, grow: 1.2 }, // email
    { minWidth: 110, grow: 0.8 }, // role
    { minWidth: 110, grow: 0.8 }, // creation date
    { minWidth: 240, grow: 1.4 }, // progress
    { minWidth: 48, grow: 0 }, // pin action
];

const COLUMN_GAP = 8; // gap-2
/** Row wrapper padding (px-2) + card border + card padding (p-2.5). */
const ROW_HORIZONTAL_CHROME = 16 + 2 + 20;

export const FORM_ROW_GRID_TEMPLATE_COLUMNS = COLUMNS.map(({ minWidth, grow }) =>
    grow > 0 ? `minmax(${minWidth}px,${grow}fr)` : `${minWidth}px`
).join(" ");

export const FORM_ROW_MIN_WIDTH =
    COLUMNS.reduce((total, { minWidth }) => total + minWidth, 0) +
    COLUMN_GAP * (COLUMNS.length - 1) +
    ROW_HORIZONTAL_CHROME;

export const FORM_ROW_COLUMN_COUNT = COLUMNS.length;

const STATUS_BADGE_CLASS_NAME: Record<formStatus, string> = {
    [formStatus.ACCEPTED]: "bg-success-brand/15 text-success-brand",
    [formStatus.REJECTED]: "bg-danger-brand/15 text-danger-brand",
    [formStatus.WAITED]: "bg-warning-brand/15 text-warning-brand",
};

interface Props {
    form: FormResponse<MenteeForm | VolunteerForm>;
    renderStepAddnotation: (step: number) => string;
    onOpen: () => void;
    isPinned: boolean;
    /** False when the pin limit is reached — the button stays visible but disabled to explain why. */
    canPin: boolean;
    onTogglePin: () => void;
    /** The pinned board ignores the status filter, so it labels each row with its status. */
    showStatus?: boolean;
}

const FormRow = ({ form, renderStepAddnotation, onOpen, isPinned, canPin, onTogglePin, showStatus }: Props) => {
    const { t } = useTranslation();

    const pinLabel = isPinned
        ? t("pinned_forms.unpin", { defaultValue: "Odepnij" })
        : canPin
          ? t("pinned_forms.pin", { defaultValue: "Przypnij" })
          : t("pinned_forms.limit_hint", { defaultValue: "Osiągnięto limit przypiętych formularzy" });

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={onOpen}
            onKeyDown={(event) => {
                // Ignore keys handled by nested controls (the pin button).
                if (event.target !== event.currentTarget) {
                    return;
                }

                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onOpen();
                }
            }}
            className={cn(
                "bg-card border-border/50 hover:border-primary-brand/40 hover:bg-muted/20 group grid cursor-pointer items-center gap-2 rounded-lg border p-2.5 text-left shadow-sm transition-colors",
                isPinned && "border-primary-brand/30"
            )}
            style={{ gridTemplateColumns: FORM_ROW_GRID_TEMPLATE_COLUMNS }}
        >
            <div className="flex min-w-0 items-center gap-1.5">
                <p className="text-foreground truncate text-sm font-medium">
                    {form.created_by.full_name || t("forms_fields.unknown_name", { defaultValue: "Unknown" })}
                </p>
                {showStatus && (
                    <Badge
                        variant="outline"
                        className={cn("shrink-0 text-[10px]", STATUS_BADGE_CLASS_NAME[form.form_status])}
                    >
                        {translatedFormStatus[form.form_status]}
                    </Badge>
                )}
            </div>
            <div className="min-w-0">
                <p className="text-foreground truncate text-xs">{form.created_by.email}</p>
            </div>
            <div className="min-w-0">
                <p className="text-foreground truncate text-xs">{translatedRoles[form.created_by.user_role]}</p>
            </div>
            <div className="min-w-0">
                <p className="text-foreground truncate text-xs">{formatDate(form.creation_date, "dd/MM/yyyy")}</p>
            </div>
            <div className="min-w-0">
                <p className="text-primary-brand truncate text-xs font-medium">
                    {`${renderStepAddnotation(form.current_step)} (${form.current_step}/${form.form_type.max_step})`}
                </p>
            </div>
            <div className="flex justify-end pr-1">
                <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label={pinLabel}
                    aria-pressed={isPinned}
                    title={pinLabel}
                    disabled={!isPinned && !canPin}
                    onClick={(event) => {
                        event.stopPropagation();
                        onTogglePin();
                    }}
                    className={cn(
                        "transition-opacity",
                        isPinned
                            ? "text-primary-brand hover:text-primary-brand opacity-100"
                            : "text-muted-foreground opacity-0 group-hover:opacity-100 focus-visible:opacity-100 max-md:opacity-100"
                    )}
                >
                    <Pin className={cn("size-3.5", isPinned && "fill-current")} />
                </Button>
            </div>
        </div>
    );
};

export default FormRow;
