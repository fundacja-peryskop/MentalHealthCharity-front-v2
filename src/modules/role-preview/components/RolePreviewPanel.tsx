import { Radio, RadioGroup, Stack, Typography, XStack, YStack, shadows } from "@fundacja-peryskop/ui";
import { Eye, Play } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../auth/components/AuthProvider";
import { PillButton, StatusPill } from "../../layout/admin";
import { useIconColor } from "../../layout/useIconColor";
import { Roles } from "../../users/constants";
import { canPreviewRoles, isPreviewableRole, PREVIEWABLE_ROLES, ROLE_LABEL_KEYS } from "../rolePreview";

/**
 * Admin-only developer tool on the settings screen: pick a role and browse the
 * app as that role. Renders nothing for anyone who isn't an administrator.
 * Starting the preview goes to the homepage, because this screen itself is
 * administrator-only and would be unavailable in the previewed role.
 */
export function RolePreviewPanel() {
    const { t } = useTranslation();
    const { actualUser, setPreviewRole } = useUser();
    const icon = useIconColor();
    const navigate = useNavigate();
    const [role, setRole] = useState<Roles>(Roles.VOLUNTEER);

    if (!canPreviewRoles(actualUser)) return null;

    const startPreview = () => {
        setPreviewRole(role);
        navigate("/");
    };

    return (
        <YStack gap="$lg" padding="$xl" borderRadius="$lg" backgroundColor="$background" {...shadows.small}>
            <XStack gap="$md">
                <Stack
                    width={40}
                    height={40}
                    borderRadius="$md"
                    alignItems="center"
                    justifyContent="center"
                    backgroundColor="$backgroundHover"
                    flexShrink={0}
                >
                    <Eye size={20} color={icon.muted} />
                </Stack>
                <YStack gap="$xs" flex={1} minWidth={0}>
                    <XStack flexWrap="wrap" alignItems="center" gap="$sm">
                        <Typography variant="largeBold" tag="h2">
                            {t("role_preview.panel_title")}
                        </Typography>
                        <StatusPill tone="warning">{t("role_preview.panel_badge")}</StatusPill>
                    </XStack>
                    <Typography variant="smallRegular" muted width="100%">
                        {t("role_preview.panel_description")}
                    </Typography>
                    <Typography variant="smallRegular" muted width="100%">
                        {t("role_preview.panel_warning")}
                    </Typography>
                </YStack>
            </XStack>

            <RadioGroup
                label={t("role_preview.role_label")}
                value={role}
                onValueChange={(value) => {
                    if (isPreviewableRole(value)) setRole(value);
                }}
            >
                <XStack flexWrap="wrap" columnGap="$xl" rowGap="$sm">
                    {PREVIEWABLE_ROLES.map((option) => (
                        <Radio key={option} value={option} label={t(ROLE_LABEL_KEYS[option])} />
                    ))}
                </XStack>
            </RadioGroup>

            <XStack justifyContent="flex-end">
                <PillButton icon={Play} variant="solid" onPress={startPreview}>
                    {t("role_preview.start")}
                </PillButton>
            </XStack>
        </YStack>
    );
}
