import { useTranslation } from "react-i18next";
import { CtaButton } from "../modules/layout/CtaButton";
import { InfoScreen } from "../modules/layout/InfoScreen";

const AboutChatScreen = () => {
    const { t } = useTranslation();

    return (
        <InfoScreen title={t("chat.about.title")} description={t("chat.about.subtitle")}>
            <CtaButton href="/form/mentee-getting-started" variant="primary">
                {t("homepage.choose_mentee_button")}
            </CtaButton>
        </InfoScreen>
    );
};

export default AboutChatScreen;
