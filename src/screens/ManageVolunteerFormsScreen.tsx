import { Button } from "@/components/ui/button";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Filter } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import FormsTable from "../modules/forms/components/FormsTable/index.tsx";
import { translatedFormStatus, translateFormSorting } from "../modules/forms/constants";
import { getFormsInfiniteQueryOptions } from "../modules/forms/queries/getFormsQueryOptions";
import { formNoteFields, formSorting, formStatus, formTypes } from "../modules/forms/types";
import AdminLayout from "../modules/shared/components/AdminLayout";
import SimpleCard from "../modules/shared/components/SimpleCard";

const ManageVolunteerFormsScreen = () => {
    const { t } = useTranslation();
    const [status, setStatus] = useState<formStatus>(formStatus.WAITED);
    const [sort, setSort] = useState<formSorting>(formSorting.NEWEST);

    const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(
        getFormsInfiniteQueryOptions({
            form_status: status,
            form_type: formTypes.VOLUNTEER,
            sort,
            size: 25,
        })
    );

    const forms = data?.pages.flatMap((page) => page.items) ?? [];
    const totalForms = data?.pages[0]?.total ?? 0;

    return (
        <AdminLayout>
            <SimpleCard title={t("manage_volunteer_forms.title")} subtitle={t("manage_volunteer_forms.subtitle")} />
            <div className="mt-5 mb-4 flex w-full flex-wrap items-center gap-3">
                {Object.keys(formStatus).map((option) => (
                    <Button
                        key={option}
                        className="whitespace-nowrap text-white"
                        style={{ opacity: option === status ? 1 : 0.5 }}
                        onClick={() => setStatus(option as formStatus)}
                    >
                        <Filter className="size-4" />
                        {translatedFormStatus[option as formStatus]}
                    </Button>
                ))}
                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as formSorting)}
                    className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-8 min-w-[180px] rounded-lg border bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:ring-3 max-sm:w-full"
                >
                    {Object.values(formSorting).map((option) => (
                        <option key={option} value={option}>
                            {translateFormSorting[option]}
                        </option>
                    ))}
                </select>
            </div>
            <div className="w-full min-w-0">
                <div className="w-full max-w-full overflow-x-auto overflow-y-hidden">
                    <FormsTable
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
            {isError && <p className="text-destructive">{t("common.no_data")}</p>}
        </AdminLayout>
    );
};

export default ManageVolunteerFormsScreen;
