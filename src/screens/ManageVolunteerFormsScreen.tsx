import { Select, Typography, XStack, YStack } from "@fundacja-peryskop/ui";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ClipboardCheck } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AdminPageHeader, FilterPills } from "../modules/layout/admin";
import FormsTable from "../modules/forms/components/FormsTable/index.tsx";
import { translatedFormStatus, translateFormSorting } from "../modules/forms/constants";
import { getFormsInfiniteQueryOptions } from "../modules/forms/queries/getFormsQueryOptions";
import { formNoteFields, formSorting, formStatus, formTypes } from "../modules/forms/types";
import AdminLayout from "../modules/shared/components/AdminLayout";

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
            <YStack width="100%" gap="$lg">
                <AdminPageHeader
                    icon={ClipboardCheck}
                    tone="success"
                    title={t("manage_volunteer_forms.title")}
                    subtitle={t("manage_volunteer_forms.subtitle")}
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
