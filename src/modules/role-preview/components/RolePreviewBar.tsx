import { Typography, XStack } from "@fundacja-peryskop/ui";
import { Eye, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../auth/components/AuthProvider";
import { PillButton } from "../../layout/admin";
import { useIconColor } from "../../layout/useIconColor";
import { isPreviewableRole, PREVIEWABLE_ROLES, ROLE_LABEL_KEYS } from "../rolePreview";

const CLASS = "role-preview-bar";
const STYLE = `
.${CLASS}__select{font:inherit;font-weight:600;font-size:15px;color:inherit;background:#fff;cursor:pointer;
  border:1px solid rgba(9,10,10,.18);border-radius:999px;padding:4px 12px;min-height:32px;}
.${CLASS}__select:focus-visible{outline:3px solid #06b7a7;outline-offset:2px;}
`;

/** Where "End preview" takes the administrator: back to the tool's home. */
const PREVIEW_HOME = "/admin/settings";

/**
 * Shown at the top of every page while an administrator previews another role.
 * In the normal document flow (not fixed), so it never covers page content,
 * including the chat composer. The role can be switched in place; ending the
 * preview returns to the settings screen, since the current page may not exist
 * for administrators (e.g. a volunteer-only route).
 */
export function RolePreviewBar() {
    const { t } = useTranslation();
    const { previewRole, setPreviewRole } = useUser();
    const icon = useIconColor();
    const navigate = useNavigate();

    if (!previewRole) return null;

    const endPreview = () => {
        setPreviewRole(null);
        navigate(PREVIEW_HOME);
    };

    return (
        <XStack
            tag="aside"
            aria-label={t("role_preview.bar_label")}
            flexShrink={0}
            width="100%"
            flexWrap="wrap"
            alignItems="center"
            justifyContent="center"
            columnGap="$md"
            rowGap="$xs"
            paddingVertical="$sm"
            paddingHorizontal="$lg"
            backgroundColor="$secondarySoft"
            borderBottomWidth={1}
            borderColor="$borderColor"
        >
            <style>{STYLE}</style>
            <XStack alignItems="center" gap="$sm">
                <Eye size={18} color={icon.secondary} aria-hidden />
                <label htmlFor={`${CLASS}-role`}>
                    <Typography variant="regularBold" tag="span" color="$secondaryTextSoft">
                        {t("role_preview.bar_title")}
                    </Typography>
                </label>
                <select
                    id={`${CLASS}-role`}
                    className={`${CLASS}__select`}
                    value={previewRole}
                    onChange={(event) => {
                        if (isPreviewableRole(event.target.value)) setPreviewRole(event.target.value);
                    }}
                >
                    {PREVIEWABLE_ROLES.map((role) => (
                        <option key={role} value={role}>
                            {t(ROLE_LABEL_KEYS[role])}
                        </option>
                    ))}
                </select>
            </XStack>
            <Typography variant="smallRegular" color="$secondaryTextSoft">
                {t("role_preview.bar_hint")}
            </Typography>
            <PillButton icon={X} onPress={endPreview}>
                {t("role_preview.end")}
            </PillButton>
        </XStack>
    );
}
