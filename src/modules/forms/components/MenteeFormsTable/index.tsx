import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Loader2, MoveRight } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { translatedRoles, Roles } from "../../../users/constants";
import formatDate from "../../../shared/helpers/formatDate";
import { formStatus, FormResponse, formTypes, MenteeForm } from "../../types";
import MenteeFormPreviewModal from "../MenteeFormPreviewModal";

interface Props {
    data: FormResponse<MenteeForm>[];
    total: number;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    isInitialLoading?: boolean;
    isSearching?: boolean;
    loadMore: () => Promise<unknown>;
    onQueueForm: (form: FormResponse<MenteeForm>) => void;
    queueingFormId?: number | null;
}

const MenteeFormsTable = ({
    data,
    total,
    hasNextPage,
    isFetchingNextPage,
    isInitialLoading,
    isSearching = false,
    loadMore,
    onQueueForm,
    queueingFormId,
}: Props) => {
    const { t } = useTranslation();
    const [previewForm, setPreviewForm] = useState<FormResponse<MenteeForm> | null>(null);

    if (isInitialLoading && data.length === 0) {
        return (
            <div className="flex flex-col gap-3 p-2">
                {Array.from({ length: 6 }, (_, idx) => (
                    <div key={idx} className="bg-card border-border/50 rounded-xl border p-4">
                        <Skeleton className="h-8 w-full" />
                    </div>
                ))}
            </div>
        );
    }

    if (!isInitialLoading && data.length === 0) {
        return (
            <div className="flex min-h-40 items-center justify-center rounded-xl border border-dashed">
                <p className="text-muted-foreground text-sm">
                    {isSearching ? t("forms_search.no_results") : t("common.no_data", { defaultValue: "Brak danych" })}
                </p>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="border-border/50 overflow-x-auto rounded-xl border">
                <Table className="min-w-[980px]">
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t("forms_fields.name", { defaultValue: "Imię" })}</TableHead>
                            <TableHead>{t("forms_fields.email", { defaultValue: "Email" })}</TableHead>
                            <TableHead>{t("forms_fields.role", { defaultValue: "Rola" })}</TableHead>
                            <TableHead>{t("forms_fields.creation_date", { defaultValue: "Data wysłania" })}</TableHead>
                            <TableHead>{t("matching.matching_status", { defaultValue: "Parowanie" })}</TableHead>
                            <TableHead>{t("common.actions", { defaultValue: "Akcje" })}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((form) => {
                            const isQueueing = queueingFormId === form.id;
                            const canQueue =
                                form.form_status === formStatus.WAITED &&
                                form.form_type.form_type === formTypes.MENTEE &&
                                form.created_by.user_role === Roles.USER &&
                                !form.created_by.excluded_from_automation &&
                                !form.matching_state;

                            return (
                                <TableRow key={form.id}>
                                    <TableCell className="font-medium">
                                        {form.created_by.full_name ||
                                            t("forms_fields.unknown_name", { defaultValue: "Nieznane" })}
                                    </TableCell>
                                    <TableCell>{form.created_by.email}</TableCell>
                                    <TableCell>{translatedRoles[form.created_by.user_role]}</TableCell>
                                    <TableCell>{formatDate(form.creation_date, "dd/MM/yyyy")}</TableCell>
                                    <TableCell>
                                        {form.matching_state ? (
                                            <Badge variant="secondary">
                                                {t("matching.in_matching_queue", {
                                                    defaultValue: "W kolejce parowania",
                                                })}
                                            </Badge>
                                        ) : canQueue ? (
                                            <Badge variant="outline">
                                                {t("matching.not_queued", { defaultValue: "Nieprzeniesiony" })}
                                            </Badge>
                                        ) : (
                                            <span className="text-muted-foreground text-sm">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Button size="sm" variant="outline" onClick={() => setPreviewForm(form)}>
                                                <FileText className="size-4" />
                                                {t("matching.view_form", { defaultValue: "Zobacz formularz" })}
                                            </Button>
                                            {canQueue && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => onQueueForm(form)}
                                                    disabled={isQueueing}
                                                >
                                                    {isQueueing ? (
                                                        <Loader2 className="size-4 animate-spin" />
                                                    ) : (
                                                        <MoveRight className="size-4" />
                                                    )}
                                                    {t("matching.move_form_to_queue", {
                                                        defaultValue: "Przenieś do sparowania",
                                                    })}
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 px-1">
                {total > 0 && <p className="text-muted-foreground text-xs">Total: {total}</p>}
                {hasNextPage && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => loadMore()}
                        disabled={isFetchingNextPage}
                    >
                        {isFetchingNextPage && <Loader2 className="size-4 animate-spin" />}
                        {t("common.load_more", { defaultValue: "Wczytaj więcej" })}
                    </Button>
                )}
            </div>
            <MenteeFormPreviewModal
                open={Boolean(previewForm)}
                form={previewForm}
                formId={previewForm?.id ?? null}
                onClose={() => setPreviewForm(null)}
            />
        </div>
    );
};

export default MenteeFormsTable;
