import { Typography, XStack, YStack } from "@fundacja-peryskop/ui";
import { AtSign, Lock, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useIconColor } from "../../../layout/useIconColor";
import SimpleCard from "../../../shared/components/SimpleCard";

interface Props {
    username: string;
    email: string;
}

/**
 * Private account summary shown to the profile owner only: name and email as
 * clean icon rows, plus a note that the section is private.
 */
const UserProfileSettings = ({ email, username }: Props) => {
    const { t } = useTranslation();
    const icon = useIconColor();

    const rows = [
        { key: "name", Icon: User, label: t("profile.settings_acc_name", { name: username }) },
        { key: "email", Icon: AtSign, label: t("profile.settings_acc_email", { email }) },
    ];

    return (
        <SimpleCard subtitle={t("profile.settings_subtitle")}>
            <YStack gap="$md">
                {rows.map(({ key, Icon, label }) => (
                    <XStack key={key} gap="$sm" alignItems="center">
                        <Icon size={18} color={icon.muted} />
                        <Typography variant="regularRegular">{label}</Typography>
                    </XStack>
                ))}

                <XStack
                    gap="$xs"
                    alignItems="center"
                    marginTop="$xs"
                    paddingHorizontal="$md"
                    paddingVertical="$sm"
                    borderRadius="$md"
                    backgroundColor="$backgroundHover"
                >
                    <Lock size={15} color={icon.muted} />
                    <Typography variant="smallRegular" muted>
                        {t("profile.this_section_is_private")}
                    </Typography>
                </XStack>
            </YStack>
        </SimpleCard>
    );
};

export default UserProfileSettings;
