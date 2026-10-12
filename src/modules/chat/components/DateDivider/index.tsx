import { Stack, Typography, XStack } from "@fundacja-peryskop/ui";
import { useTranslation } from "react-i18next";
import { describeMessageDay } from "../../helpers/chatTime";

interface Props {
    /** Creation date of the first message of a new day. */
    date: string;
}

/**
 * Centered "Dzisiaj / Wczoraj / 12 października 2026" pill shown above the first
 * message of each calendar day, so it is clear how old a conversation slice is.
 */
const DateDivider = ({ date }: Props) => {
    const { t, i18n } = useTranslation();
    const day = describeMessageDay(date, i18n.language);
    const label = day.kind === "today" ? t("chat.today") : day.kind === "yesterday" ? t("chat.yesterday") : day.label;

    return (
        <XStack alignItems="center" justifyContent="center" paddingVertical="$sm" aria-hidden>
            <Stack paddingHorizontal="$md" paddingVertical={4} borderRadius="$full" backgroundColor="$backgroundStrong">
                <Typography variant="tinySemibold" color="$colorMuted">
                    {label}
                </Typography>
            </Stack>
        </XStack>
    );
};

export default DateDivider;
