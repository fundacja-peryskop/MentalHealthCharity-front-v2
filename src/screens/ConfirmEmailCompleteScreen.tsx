import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { buildForwardedAuthSearch } from "../modules/auth/helpers/authRedirect";
import { InfoScreen } from "../modules/layout/InfoScreen";
import Loader from "../modules/shared/components/Loader";
import { confirmEmailCompleteQueryOptions } from "../modules/users/queries/confirmEmailCompleteQueryOptions";

const ConfirmEmailCompleteScreen = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const authSearch = buildForwardedAuthSearch(searchParams);
    const token = searchParams.get("token");
    const { isSuccess, isError } = useQuery(
        confirmEmailCompleteQueryOptions({
            token: token || "",
        })
    );

    useEffect(() => {
        if (isSuccess) {
            navigate(`/login${authSearch}`, { replace: true });
        }
    }, [authSearch, isSuccess, navigate]);

    if (isError) {
        return (
            <InfoScreen
                title={t("confirm_email_complete.error_title")}
                description={t("confirm_email_complete.error_description")}
            />
        );
    }

    return <Loader text={t("confirm_email_complete.loading_text")} title={t("confirm_email_complete.loading_title")} />;
};

export default ConfirmEmailCompleteScreen;
