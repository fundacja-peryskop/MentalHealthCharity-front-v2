import { YStack } from "@fundacja-peryskop/ui";
import { useQuery } from "@tanstack/react-query";
import { Flag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AdminPageHeader } from "../modules/layout/admin";
import ReportItem from "../modules/report/components/ReportItem";
import { getReportsQueryOptions } from "../modules/report/queries/getReportsQueryOptions";
import AdminLayout from "../modules/shared/components/AdminLayout";

const ReportsScreen = () => {
    const { data } = useQuery(
        getReportsQueryOptions({
            page: 1,
            size: 100,
            is_considered: false,
        })
    );
    const { t } = useTranslation();

    return (
        <AdminLayout>
            <YStack width="100%" gap="$lg">
                <AdminPageHeader
                    icon={Flag}
                    tone="danger"
                    title={t("admin.reports.title")}
                    subtitle={t("admin.reports.text")}
                    meta={t("admin.reports.subtitle", { total: data?.total })}
                />
                <YStack gap="$lg">
                    {data && data.items.map((report) => <ReportItem report={report} key={report.id} />)}
                </YStack>
            </YStack>
        </AdminLayout>
    );
};

export default ReportsScreen;
