import { Typography, XStack } from "@fundacja-peryskop/ui";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import EmailIcon from "../assets/static/email_icon.svg";
import { buildForwardedAuthSearch } from "../modules/auth/helpers/authRedirect";
import { AppLink } from "../modules/layout/AppLink";
import { InfoScreen } from "../modules/layout/InfoScreen";

const ConfirmEmailScreen = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const authSearch = buildForwardedAuthSearch(searchParams);

    return (
        <InfoScreen
            icon={<img src={EmailIcon} alt="" width={180} height={180} />}
            title={t("confirm_email_begin.title")}
            description={t("confirm_email_begin.description")}
        >
            <XStack gap="$xs" alignItems="center" flexWrap="wrap" justifyContent="center">
                <Typography variant="smallRegular" muted>
                    {t("confirm_email_begin.footer")}
                </Typography>
                <AppLink href={`/auth/register${authSearch}`} variant="smallSemibold" color="$primary">
                    {t("confirm_email_begin.change_email")}
                </AppLink>
                <AppLink href={`/login${authSearch}`} variant="smallSemibold" color="$primary">
                    {t("confirm_email_begin.login")}
                </AppLink>
            </XStack>
        </InfoScreen>
    );
};

export default ConfirmEmailScreen;
