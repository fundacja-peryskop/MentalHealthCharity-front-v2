import { Select, Typography, XStack, YStack } from "@fundacja-peryskop/ui";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ClipboardList } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { AdminPageHeader, FilterPills } from "../modules/layout/admin";
import MenteeFormsTable from "../modules/forms/components/MenteeFormsTable";
import { translatedFormStatus, translateFormSorting } from "../modules/forms/constants";
import { getFormsInfiniteQueryOptions } from "../modules/forms/queries/getFormsQueryOptions";
import queueMenteeFormMutation from "../modules/forms/queries/queueMenteeFormMutation";
import { formSorting, formStatus, formTypes } from "../modules/forms/types";
import AdminLayout from "../modules/shared/components/AdminLayout";

const ManageMenteeFormsScreen = () => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [status, setStatus] = useState<formStatus>(formStatus.WAITED);
    const [sort, setSort] = useState<formSorting>(formSorting.NEWEST);
    const [queueingFormId, setQueueingFormId] = useState<number | null>(null);

    const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(
        getFormsInfiniteQueryOptions({
            form_status: status,
            form_type: formTypes.MENTEE,
            sort,
            size: 25,
        })
    );

    const forms = data?.pages.flatMap((page) => page.items) ?? [];
    const totalForms = data?.pages[0]?.total ?? 0;
    const { mutate: queueForm } = useMutation({
        mutationFn: queueMenteeFormMutation,
        onMutate: ({ id }) => {
            setQueueingFormId(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["forms-infinite"] });
            queryClient.invalidateQueries({ queryKey: ["forms"] });
            queryClient.invalidateQueries({ queryKey: ["matching"] });
            toast.success(
                t("matching.move_form_to_queue_success", {
                    defaultValue: "Formularz przeniesiono do kolejki parowania",
                })
            );
        },
        onSettled: () => {
            setQueueingFormId(null);
        },
    });

    return (
        <AdminLayout>
            <YStack width="100%" gap="$lg">
                <AdminPageHeader
                    icon={ClipboardList}
                    tone="primary"
                    title={t("manage_mentee_forms.title")}
                    subtitle={t("manage_mentee_forms.subtitle")}
                />

                <XStack flexWrap="wrap" alignItems="flex-end" gap="$md">
                    <FilterPills
                        ariaLabel={t("common.status", { defaultValue: "Status" })}
                        value={status}
                        onChange={(value) => setStatus(value as formStatus)}
                        options={Object.keys(formStatus).map((option) => ({
                            value: option,
                            label: translatedFormStatus[option as formStatus],
                        }))}
                    />
                    <YStack width={220}>
                        <Select
                            value={sort}
                            onValueChange={(value) => setSort(value as formSorting)}
                            options={Object.values(formSorting).map((option) => ({
                                value: option,
                                label: translateFormSorting[option],
                            }))}
                        />
                    </YStack>
                </XStack>

                <div className="w-full min-w-0">
                    <div className="w-full max-w-full overflow-x-auto overflow-y-hidden">
                        <MenteeFormsTable
                            data={forms}
                            total={totalForms}
                            hasNextPage={Boolean(hasNextPage)}
                            isFetchingNextPage={isFetchingNextPage}
                            isInitialLoading={isLoading}
                            loadMore={fetchNextPage}
                            queueingFormId={queueingFormId}
                            onQueueForm={(form) => queueForm({ id: form.id })}
                        />
                    </div>
                </div>
                {isError && (
                    <Typography variant="smallRegular" color="$danger">
                        {t("common.no_data")}
                    </Typography>
                )}
            </YStack>
        </AdminLayout>
    );
};

export default ManageMenteeFormsScreen;
