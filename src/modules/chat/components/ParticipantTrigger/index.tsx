import { Stack, type GetProps } from "@fundacja-peryskop/ui";
import { forwardRef } from "react";
import { useTranslation } from "react-i18next";

interface Props extends Omit<GetProps<typeof Stack>, "tag" | "role"> {
    /** Participant's name - used for the accessible label ("Show details: …"). */
    name: string;
}

/**
 * Unstyled button that opens a participant's details popover. Wraps whatever
 * represents the person (an avatar, an avatar + name row) and adds the press,
 * hover and keyboard-focus affordances.
 *
 * Forwards its ref and spreads the remaining props because `Popover` renders
 * the trigger `asChild` - it injects the ref, `onPress` and `aria-expanded`.
 */
const ParticipantTrigger = forwardRef<HTMLButtonElement, Props>(function ParticipantTrigger(
    { name, children, ...rest },
    ref
) {
    const { t } = useTranslation();

    return (
        <Stack
            ref={ref as never}
            tag="button"
            role="button"
            aria-label={t("chat.participant_details.open", { name })}
            aria-haspopup="dialog"
            padding={0}
            borderWidth={0}
            borderRadius="$full"
            backgroundColor="$backgroundTransparent"
            cursor="pointer"
            focusVisibleStyle={{
                outlineColor: "$borderColorFocus",
                outlineWidth: 2,
                outlineStyle: "solid",
                outlineOffset: 2,
            }}
            {...rest}
        >
            {children}
        </Stack>
    );
});

export default ParticipantTrigger;
