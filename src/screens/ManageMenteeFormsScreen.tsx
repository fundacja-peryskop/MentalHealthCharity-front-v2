import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import MenteeFormsTable from "../modules/forms/components/MenteeFormsTable";
import FormsFilters from "../modules/forms/components/FormsFilters";
import { getFormsInfiniteQueryOptions } from "../modules/forms/queries/getFormsQueryOptions";
import queueMenteeFormMutation from "../modules/forms/queries/queueMenteeFormMutation";
import { formSorting, formStatus, formTypes } from "../modules/forms/types";
import AdminLayout from "../modules/shared/components/AdminLayout";
import SimpleCard from "../modules/shared/components/SimpleCard";
import useDebounce from "../modules/shared/hooks/useDebounce";

const ManageMenteeFormsScreen = () => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [status, setStatus] = useState<formStatus>(formStatus.WAITED);
    const [sort, setSort] = useState<formSorting>(formSorting.NEWEST);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search.trim(), 350);
    const [queueingFormId, setQueueingFormId] = useState<number | null>(null);

    const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(
        getFormsInfiniteQueryOptions({
            form_status: status,
            form_type: formTypes.MENTEE,
            sort,
            search: debouncedSearch || undefined,
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
            <SimpleCard title={t("manage_mentee_forms.title")} subtitle={t("manage_mentee_forms.subtitle")} />
            <FormsFilters
                search={search}
                onSearchChange={setSearch}
                status={status}
                onStatusChange={setStatus}
                sort={sort}
                onSortChange={setSort}
            />
            <div className="w-full min-w-0">
                <div className="w-full max-w-full overflow-x-auto overflow-y-hidden">
                    <MenteeFormsTable
                        key={`${status}:${sort}:${debouncedSearch}`}
                        isSearching={Boolean(debouncedSearch)}
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
            {isError && <p className="text-destructive">{t("common.no_data")}</p>}
        </AdminLayout>
    );
};

export default ManageMenteeFormsScreen;
