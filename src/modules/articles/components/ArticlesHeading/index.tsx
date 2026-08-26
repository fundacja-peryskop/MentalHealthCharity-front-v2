import { Input, Typography, XStack, YStack } from "@fundacja-peryskop/ui";
import { PlusCircle, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CtaButton } from "../../../layout/CtaButton";
import { useIconColor } from "../../../layout/useIconColor";
import { Permissions } from "../../../shared/constants";
import usePermissions from "../../../shared/hooks/usePermissions";

interface Props {
    onSearch: (query: string) => void;
    search: string;
}

const ArticlesHeading = ({ onSearch, search }: Props) => {
    const { t } = useTranslation();
    const { hasPermissions } = usePermissions();
    const icon = useIconColor();

    return (
        <XStack gap="$md" flexWrap="wrap" alignItems="center">
            <YStack flex={1} minWidth={240}>
                <Input
                    value={search}
                    onChangeText={onSearch}
                    placeholder={t("common.search")}
                    aria-label={t("common.search")}
                    prefix={<Search size={18} color={icon.muted} />}
                />
            </YStack>

            {hasPermissions(Permissions.CREATE_ARTICLE) ? (
                <CtaButton href="/articles/dashboard" variant="primary" borderRadius="$md">
                    <PlusCircle size={18} color={icon.inverse} />
                    <Typography variant="regularSemibold" color="$primaryText">
                        {t("articles.add_article")}
                    </Typography>
                </CtaButton>
            ) : null}
        </XStack>
    );
};

export default ArticlesHeading;
