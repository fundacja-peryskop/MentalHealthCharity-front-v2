import { Section, Typography, YStack, shadows } from "@fundacja-peryskop/ui";
import { useTranslation } from "react-i18next";
import { AppLink } from "../modules/layout/AppLink";
import { PageContainer } from "../modules/layout/PageContainer";

const DOCUMENTS = [
    { href: "/klauzula-informacyjna-RODO.pdf", key: "tos.clause" },
    { href: "/polityka-prywatnosci-i-cookies.pdf", key: "tos.privacy_policy" },
    { href: "/przetwarzanie-danych-osobowych.pdf", key: "tos.data_processing" },
    { href: "/regulamin-serwisu.pdf", key: "tos.terms" },
];

const TosScreen = () => {
    const { t } = useTranslation();

    return (
        <Section alignItems="center" paddingVertical="$xxxl" minHeight="70vh">
            <PageContainer>
                <YStack
                    width="100%"
                    maxWidth={640}
                    alignSelf="center"
                    gap="$lg"
                    padding="$xl"
                    borderRadius="$lg"
                    borderWidth={1}
                    borderColor="$borderColor"
                    backgroundColor="$background"
                    {...shadows.small}
                >
                    <YStack gap="$sm">
                        <Typography variant="title2" tag="h1">
                            {t("tos.title")}
                        </Typography>
                        <Typography variant="largeRegular" muted>
                            {t("tos.subtitle")}
                        </Typography>
                    </YStack>
                    <YStack gap="$md">
                        {DOCUMENTS.map((doc) => (
                            <AppLink key={doc.href} href={doc.href} external variant="regularSemibold" color="$primary">
                                {t(doc.key)}
                            </AppLink>
                        ))}
                    </YStack>
                </YStack>
            </PageContainer>
        </Section>
    );
};

export default TosScreen;
