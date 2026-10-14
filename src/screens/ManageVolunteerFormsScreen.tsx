import { Typography, YStack } from "@fundacja-peryskop/ui";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ClipboardCheck } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AdminPageHeader } from "../modules/layout/admin";
import FormsTable from "../modules/forms/components/FormsTable/index.tsx";
import FormsFilters from "../modules/forms/components/FormsFilters";
import { getFormsInfiniteQueryOptions } from "../modules/forms/queries/getFormsQueryOptions";
import { formNoteFields, formSorting, formStatus, formTypes } from "../modules/forms/types";
import AdminLayout from "../modules/shared/components/AdminLayout";
import useDebounce from "../modules/shared/hooks/useDebounce";

const ManageVolunteerFormsScreen = () => {
    const { t } = useTranslation();
    const [status, setStatus] = useState<formStatus>(formStatus.WAITED);
    const [sort, setSort] = useState<formSorting>(formSorting.NEWEST);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search.trim(), 350);

    const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(
        getFormsInfiniteQueryOptions({
            form_status: status,
            form_type: formTypes.VOLUNTEER,
            sort,
            search: debouncedSearch || undefined,
            size: 25,
        })
    );

    const forms = data?.pages.flatMap((page) => page.items) ?? [];
    const totalForms = data?.pages[0]?.total ?? 0;

    return (
        <AdminLayout>
            <YStack width="100%" gap="$lg">
                <AdminPageHeader
                    icon={ClipboardCheck}
                    tone="success"
                    title={t("manage_volunteer_forms.title")}
                    subtitle={t("manage_volunteer_forms.subtitle")}
                />

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
                        <FormsTable
                            key={`${status}:${sort}:${debouncedSearch}`}
                            isSearching={Boolean(debouncedSearch)}
                            onRefetch={refetch}
                            data={forms}
                            total={totalForms}
                            hasNextPage={Boolean(hasNextPage)}
                            isFetchingNextPage={isFetchingNextPage}
                            isInitialLoading={isLoading}
                            loadMore={fetchNextPage}
                            formNoteKeys={[
                                formNoteFields.AVAILABILITY,
                                formNoteFields.INTERVIEW_DESCRIPTION,
                                formNoteFields.WORK_AREA,
                            ]}
                            renderStepAddnotation={(id) => t(`manage_volunteer_forms.steps.${id - 1}`)}
                            pinScope={formTypes.VOLUNTEER}
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

export default ManageVolunteerFormsScreen;
