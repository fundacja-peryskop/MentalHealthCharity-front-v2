import { Button, Stack, Typography, XStack, YStack, shadows } from "@fundacja-peryskop/ui";
import { useReducedMotion } from "framer-motion";
import { ArrowDown, HeartPulse, LifeBuoy, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useIconColor } from "../../../layout/useIconColor";
import { CONTACTS_SECTION_ID, dial, EMERGENCY_NUMBER, IMMEDIATE_STEPS_COUNT } from "../../content";
import StepBadge from "../StepBadge";

const STEP_NUMBERS = Array.from({ length: IMMEDIATE_STEPS_COUNT }, (_, index) => index);

/** Jumps to the phone list - both procedures end with "phone your supervisor". */
const SupervisorPhonesButton = () => {
    const { t } = useTranslation();
    const c = useIconColor();
    const reduceMotion = useReducedMotion();

    const scrollToContacts = () =>
        document
            .getElementById(CONTACTS_SECTION_ID)
            ?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });

    return (
        <Button variant="mutedPrimary" onPress={scrollToContacts}>
            <ArrowDown size={16} color={c.primary} aria-hidden />
            <Typography variant="regularSemibold" color="$primaryDarker">
                {t("emergency.supervisor_phones")}
            </Typography>
        </Button>
    );
};

const EmergencyProcedure = () => {
    const { t } = useTranslation();
    const c = useIconColor();

    return (
        <XStack flexWrap="wrap" gap="$xl" alignItems="stretch">
            <YStack
                tag="section"
                aria-labelledby="emergency-thoughts"
                flex={1}
                minWidth={280}
                gap="$md"
                padding="$xl"
                borderRadius="$lg"
                backgroundColor="$background"
                {...shadows.small}
            >
                <Stack
                    width={44}
                    height={44}
                    borderRadius="$md"
                    alignItems="center"
                    justifyContent="center"
                    backgroundColor="$secondarySoft"
                    aria-hidden
                >
                    <LifeBuoy size={22} color={c.secondary} />
                </Stack>
                <YStack gap="$xs">
                    <Typography variant="title3" tag="h2" id="emergency-thoughts">
                        {t("emergency.thoughts.title")}
                    </Typography>
                    <Typography variant="regularRegular" muted width="100%">
                        {t("emergency.thoughts.description")}
                    </Typography>
                </YStack>
                <XStack marginTop="auto" paddingTop="$sm">
                    <SupervisorPhonesButton />
                </XStack>
            </YStack>

            <YStack
                tag="section"
                aria-labelledby="emergency-immediate"
                flex={2}
                minWidth={320}
                gap="$lg"
                padding="$xl"
                borderRadius="$lg"
                borderWidth={1}
                borderColor="$danger"
                backgroundColor="$background"
                {...shadows.small}
            >
                <XStack alignItems="center" gap="$md">
                    <Stack
                        width={44}
                        height={44}
                        flexShrink={0}
                        borderRadius="$md"
                        alignItems="center"
                        justifyContent="center"
                        backgroundColor="$dangerSoft"
                        aria-hidden
                    >
                        <HeartPulse size={22} color={c.danger} />
                    </Stack>
                    <Typography variant="title3" tag="h2" id="emergency-immediate" flex={1}>
                        {t("emergency.immediate.title")}
                    </Typography>
                </XStack>

                <YStack tag="ol" gap="$md" margin={0} padding={0} style={{ listStyle: "none" }}>
                    {STEP_NUMBERS.map((index) => (
                        <XStack tag="li" key={index} gap="$md" alignItems="flex-start">
                            <StepBadge number={index + 1} />
                            <Typography variant="regularRegular" flex={1} paddingTop={4} width="100%">
                                {t(`emergency.immediate.steps.${index}`)}
                            </Typography>
                        </XStack>
                    ))}
                </YStack>

                <XStack flexWrap="wrap" gap="$md">
                    <Button
                        variant="danger"
                        aria-label={t("emergency.immediate.call_emergency_aria", { number: EMERGENCY_NUMBER })}
                        onPress={() => dial(EMERGENCY_NUMBER)}
                    >
                        <Phone size={16} color={c.inverse} aria-hidden />
                        <Typography variant="regularSemibold" color="$primaryText">
                            {t("emergency.immediate.call_emergency", { number: EMERGENCY_NUMBER })}
                        </Typography>
                    </Button>
                    <SupervisorPhonesButton />
                </XStack>
            </YStack>
        </XStack>
    );
};

export default EmergencyProcedure;
