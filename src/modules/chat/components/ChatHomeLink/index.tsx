import logo from "@/assets/static/logo_small.webp";
import { ConfirmDialog, Stack, Typography } from "@fundacja-peryskop/ui";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { brand } from "../../../layout/content";

const LOGO_SIZE = 32;

interface Props {
    /** Logo only - for the collapsed sidebar rail. */
    compact?: boolean;
}

/**
 * The foundation's logo and name at the top of the chat sidebar - the way back
 * to the home page from the full-screen chat, which has no global header.
 *
 * Leaving asks for confirmation first, so a mis-tap never pulls someone out of
 * a conversation (a draft typed in the composer would be lost).
 */
const ChatHomeLink = ({ compact = false }: Props) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [confirmOpen, setConfirmOpen] = useState(false);

    const goHome = () => {
        setConfirmOpen(false);
        navigate("/");
    };

    return (
        <>
            <Stack
                tag="button"
                role="button"
                aria-label={t("chat.home_link.label")}
                aria-haspopup="dialog"
                onPress={() => setConfirmOpen(true)}
                flexDirection="row"
                alignItems="center"
                gap="$sm"
                minWidth={0}
                padding={0}
                borderWidth={0}
                borderRadius="$sm"
                backgroundColor="$backgroundTransparent"
                cursor="pointer"
                hoverStyle={{ opacity: 0.8 }}
                pressStyle={{ opacity: 0.65 }}
                focusVisibleStyle={{
                    outlineColor: "$borderColorFocus",
                    outlineWidth: 2,
                    outlineStyle: "solid",
                    outlineOffset: 4,
                }}
            >
                <img
                    src={logo}
                    alt=""
                    aria-hidden
                    width={LOGO_SIZE}
                    height={LOGO_SIZE}
                    style={{ display: "block", flexShrink: 0 }}
                />
                {compact ? null : (
                    <Typography variant="largeBold" tag="span" numberOfLines={1}>
                        {brand.name}
                    </Typography>
                )}
            </Stack>

            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                onConfirm={goHome}
                title={t("chat.home_link.confirm_title")}
                description={t("chat.home_link.confirm_description")}
                confirmLabel={t("chat.home_link.confirm")}
                cancelLabel={t("chat.home_link.cancel")}
                closeLabel={t("common.close")}
            />
        </>
    );
};

export default ChatHomeLink;
