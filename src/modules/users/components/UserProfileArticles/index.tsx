import { Stack, XStack } from "@fundacja-peryskop/ui";
import { useTranslation } from "react-i18next";
import { DsArticleCard } from "../../../articles/components/DsArticleCard";
import { Article } from "../../../articles/types";
import SimpleCard from "../../../shared/components/SimpleCard";

interface Props {
    articles: Article[];
}

const UserProfileArticles = ({ articles }: Props) => {
    const { t } = useTranslation();
    return (
        <SimpleCard subtitle={t("profile.articles_subtitle")}>
            <XStack flexWrap="wrap" gap="$lg">
                {articles.map((article) => (
                    <Stack key={article.id} width="100%" $sm={{ width: "48%" }} $md={{ width: "31.5%" }}>
                        <DsArticleCard article={article} />
                    </Stack>
                ))}
            </XStack>
        </SimpleCard>
    );
};

export default UserProfileArticles;
