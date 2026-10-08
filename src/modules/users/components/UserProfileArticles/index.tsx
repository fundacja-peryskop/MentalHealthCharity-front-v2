import { useTranslation } from "react-i18next";
import { DsArticleCard } from "../../../articles/components/DsArticleCard";
import { Article } from "../../../articles/types";
import SimpleCard from "../../../shared/components/SimpleCard";

interface Props {
    articles: Article[];
}

/**
 * Responsive grid (1 -> 2 -> 3 columns) of the user's articles. Uses a scoped
 * min-width CSS grid rather than Tamagui media props, which resolve unreliably
 * here (see CLAUDE.md).
 */
const GRID_CLASS = "profile-articles-grid";
const GRID_STYLE = `.${GRID_CLASS}{display:grid;gap:16px;grid-template-columns:1fr;width:100%;}@media (min-width:640px){.${GRID_CLASS}{grid-template-columns:repeat(2,1fr);}}@media (min-width:1000px){.${GRID_CLASS}{grid-template-columns:repeat(3,1fr);}}`;

const UserProfileArticles = ({ articles }: Props) => {
    const { t } = useTranslation();

    if (articles.length === 0) return null;

    return (
        <SimpleCard subtitle={t("profile.articles_subtitle")}>
            <style>{GRID_STYLE}</style>
            <div className={GRID_CLASS}>
                {articles.map((article) => (
                    <DsArticleCard key={article.id} article={article} />
                ))}
            </div>
        </SimpleCard>
    );
};

export default UserProfileArticles;
