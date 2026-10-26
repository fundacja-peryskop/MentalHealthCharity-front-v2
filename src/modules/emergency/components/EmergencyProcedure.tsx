import { Button, Stack, Typography, XStack, YStack, shadows } from "@fundacja-peryskop/ui";
import { HeartPulse, LifeBuoy, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useIconColor } from "../../layout/useIconColor";
import { dial, EMERGENCY_NUMBER, IMMEDIATE_STEPS_COUNT } from "../content";

const STEP_NUMBERS = Array.from({ length: IMMEDIATE_STEPS_COUNT }, (_, index) => index);

const StepBadge = ({ number }: { number: number }) => (
    <Stack
        width={32}
        height={32}
        flexShrink={0}
        borderRadius="$full"
        alignItems="center"
        justifyContent="center"
        backgroundColor="$dangerSoft"
        aria-hidden
    >
        <Typography variant="smallSemibold" color="$dangerTextSoft">
            {number}
        </Typography>
    </Stack>
);

export const EmergencyProcedure = () => {
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

                <XStack>
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
                </XStack>
            </YStack>
        </XStack>
    );
};
