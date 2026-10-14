import { Typography, XStack, YStack, shadows } from "@fundacja-peryskop/ui";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowRightCircle } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { PillButton } from "../../../layout/admin";
import { useIconColor } from "../../../layout/useIconColor";
import Modal from "../../../shared/components/Modal";
import formatDate from "../../../shared/helpers/formatDate";
import { ReportTranslationKeys } from "../../constants";
import changeStatusMutationOptions from "../../queries/changeStatusMutationOptions";
import { getReportsQueryOptions } from "../../queries/getReportsQueryOptions";
import { Report } from "../../types";

interface Props {
    report: Report;
}

const ReportCard = ({ report }: Props) => {
    const { t } = useTranslation();
    const c = useIconColor();
    const [loading, setLoading] = useState(false);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const { refetch } = useQuery(
        getReportsQueryOptions({
            page: 1,
            size: 100,
            is_considered: false,
        })
    );
    const { mutate } = useMutation({
        mutationFn: changeStatusMutationOptions,
        onMutate: () => {
            setLoading(true);
        },
        onSuccess: () => {
            refetch();
            setLoading(false);
            setShowConfirmationModal(false);
        },
        onError: () => {
            toast.error(t("common.error"));
        },
    });

    return (
        <>
            <YStack
                width="100%"
                gap="$lg"
                padding="$xl"
                borderRadius="$lg"
                backgroundColor="$background"
                {...shadows.small}
            >
                <XStack flexWrap="wrap" alignItems="flex-start" justifyContent="space-between" gap="$lg">
                    <YStack flex={1} minWidth={0} maxWidth={800} gap="$xs">
                        <Typography variant="regularSemibold" tag="h3">
                            {report.subject}
                        </Typography>
                        <Typography variant="smallRegular" muted width="100%">
                            {report.description}
                        </Typography>
                    </YStack>

                    <YStack minWidth={200} gap="$xs">
                        <Typography variant="smallRegular">{formatDate(report.creation_date)}</Typography>
                        <Typography variant="tinyRegular" muted>
                            {t("report.author", { defaultValue: "Autor" })}: {report.created_by.full_name}
                        </Typography>
                        <Typography variant="tinyRegular" muted>
                            Email: {report.created_by.email}
                        </Typography>
                    </YStack>
                </XStack>

                <XStack flexWrap="wrap" alignItems="center" justifyContent="space-between" gap="$sm">
                    <PillButton icon={ArrowRightCircle} variant="solid" onPress={() => setShowConfirmationModal(true)}>
                        {t("report.resolve", { defaultValue: "Rozstrzygnij" })}
                    </PillButton>
                    <XStack
                        alignItems="center"
                        gap="$xs"
                        paddingHorizontal="$md"
                        paddingVertical="$xs"
                        borderRadius="$full"
                        backgroundColor="$dangerSoft"
                    >
                        <AlertCircle size={15} color={c.danger} />
                        <Typography variant="tinyBold" color="$dangerTextSoft">
                            {t(ReportTranslationKeys[report.report_type])}
                        </Typography>
                    </XStack>
                </XStack>
            </YStack>

            <Modal
                title={t("report.confirmation_modal_title")}
                open={showConfirmationModal}
                onClose={() => setShowConfirmationModal(false)}
            >
                <YStack gap="$lg">
                    <Typography variant="regularRegular" muted maxWidth={700} width="100%">
                        {t("report.confirmation_modal_text")}
                    </Typography>
                    {loading && (
                        <Typography variant="smallRegular" muted>
                            {t("common.loading")}
                        </Typography>
                    )}
                    <XStack gap="$sm" flexWrap="wrap">
                        <PillButton
                            variant="solid"
                            disabled={loading}
                            onPress={() =>
                                mutate({
                                    user_report_id: report.id,
                                })
                            }
                        >
                            {t("common.confirm")}
                        </PillButton>
                        <PillButton disabled={loading} onPress={() => setShowConfirmationModal(false)}>
                            {t("common.cancel")}
                        </PillButton>
                    </XStack>
                </YStack>
            </Modal>
        </>
    );
};

export default ReportCard;
