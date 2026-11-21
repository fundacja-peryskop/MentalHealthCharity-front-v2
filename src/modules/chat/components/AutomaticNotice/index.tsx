import logo from "@/assets/static/logo_small.webp";
import { Stack, Typography, XStack, YStack } from "@fundacja-peryskop/ui";
import { Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useIconColor } from "../../../layout/useIconColor";

/** Same bubble shape as an incoming message, so it reads as part of the conversation. */
const BUBBLE_RADIUS = { borderRadius: 18, borderBottomLeftRadius: 6 } as const;

interface Props {
    /** Play the incoming-message entrance (only when it first appears). */
    animate?: boolean;
}

/**
 * A message-like note from Peryskop itself, shown once under a person's first
 * message in a support chat: the other side may not answer right away, and
 * the two of them can agree on fixed times or write loosely. Clearly labelled
 * as automatic so nobody mistakes it for their volunteer.
 */
const AutomaticNotice = ({ animate = false }: Props) => {
    const { t } = useTranslation();
    const icon = useIconColor();
    const label = t("chat.first_message_notice.label");

    return (
        <XStack
            role="note"
            aria-label={label}
            width="100%"
            gap="$sm"
            alignItems="flex-end"
            marginTop="$md"
            className={animate ? "chat-msg-in-left" : undefined}
        >
            <Stack
                width={36}
                height={36}
                flexShrink={0}
                borderRadius="$full"
                alignItems="center"
                justifyContent="center"
                backgroundColor="$background"
                borderWidth={1}
                borderColor="$backgroundStrong"
                aria-hidden
            >
                <img src={logo} alt="" width={22} height={22} style={{ objectFit: "contain" }} />
            </Stack>
            <YStack maxWidth="72%" gap={2} minWidth={0}>
                <Typography variant="tinySemibold" color="$colorMuted" paddingHorizontal="$xs">
                    {label}
                </Typography>
                <YStack
                    gap="$xs"
                    paddingHorizontal="$lg"
                    paddingVertical="$md"
                    backgroundColor="$secondarySoft"
                    borderWidth={1}
                    borderColor="$secondaryBorder"
                    style={BUBBLE_RADIUS}
                >
                    <XStack alignItems="center" gap="$xs">
                        <Clock size={15} color={icon.color} aria-hidden />
                        <Typography variant="regularSemibold" color="$secondaryTextSoft">
                            {t("chat.first_message_notice.title")}
                        </Typography>
                    </XStack>
                    <Typography variant="regularRegular" color="$secondaryTextSoft" width="100%">
                        {t("chat.first_message_notice.body")}
                    </Typography>
                </YStack>
            </YStack>
        </XStack>
    );
};

export default AutomaticNotice;
