import logo from "@/assets/static/logo_small.webp";
import { Typography, XStack, YStack } from "@fundacja-peryskop/ui";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import { brand } from "../../../layout/content";

/** Matches the global header logo; balances the two-line label beside it. */
const LOGO_SIZE = 36;

const LINK_RESET: React.CSSProperties = { textDecoration: "none", display: "inline-flex", minWidth: 0 };

interface Props {
    /** Logo only - for the collapsed sidebar rail. */
    compact?: boolean;
}

/**
 * The foundation's logo and name at the top of the chat sidebar - the way back
 * to the home page from the full-screen chat, which has no global header.
 * The "back to the home page" hint under the name makes the purpose obvious.
 * A real link, so it also opens in a new tab with a middle click.
 */
const ChatHomeLink = ({ compact = false }: Props) => {
    const { t } = useTranslation();

    return (
        <RouterLink to="/" aria-label={t("chat.home_link.label")} style={LINK_RESET}>
            <XStack
                alignItems="center"
                gap="$sm"
                minWidth={0}
                cursor="pointer"
                hoverStyle={{ opacity: 0.8 }}
                pressStyle={{ opacity: 0.65 }}
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
                    <YStack minWidth={0}>
                        <Typography variant="largeBold" tag="span" numberOfLines={1}>
                            {brand.name}
                        </Typography>
                        <Typography variant="tinyRegular" tag="span" color="$colorMuted" numberOfLines={1}>
                            {t("chat.home_link.hint")}
                        </Typography>
                    </YStack>
                )}
            </XStack>
        </RouterLink>
    );
};

export default ChatHomeLink;
