import { Stack, Typography, XStack, YStack, shadows } from "@fundacja-peryskop/ui";
import { motion } from "framer-motion";
import { useIconColor } from "../../../layout/useIconColor";

interface Props {
    progress: number;
    title: string;
    subtitle: string;
    stepIndicator?: string;
    children?: React.ReactNode;
    direction?: number;
    /**
     * Distinct key per step — drives the slide animation on step change. Using
     * an explicit key (instead of the title, which can repeat across steps)
     * guarantees the content re-mounts to the current step.
     */
    stepKey?: string | number;
}

const slideVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
};

const FormWrapper = ({ progress, subtitle, title, stepIndicator, children, direction = 1, stepKey }: Props) => {
    const icon = useIconColor();

    return (
        <YStack
            width="100%"
            maxWidth={560}
            borderRadius="$lg"
            overflow="hidden"
            backgroundColor="$background"
            {...shadows.medium}
        >
            {/* Progress line */}
            <Stack height={4} width="100%" backgroundColor="$backgroundHover" position="relative" overflow="hidden">
                <motion.div
                    style={{ position: "absolute", top: 0, bottom: 0, left: 0, backgroundColor: icon.primary }}
                    initial={false}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                />
            </Stack>

            <YStack paddingHorizontal="$xl" paddingTop="$xxl" paddingBottom="$xl">
                {stepIndicator ? (
                    <XStack
                        alignSelf="flex-start"
                        marginBottom="$lg"
                        paddingHorizontal="$md"
                        paddingVertical="$xs"
                        borderRadius="$full"
                        backgroundColor="$primarySoft"
                    >
                        <Typography variant="tinyBold" color="$primaryTextSoft">
                            {stepIndicator}
                        </Typography>
                    </XStack>
                ) : null}

                <motion.div
                    key={stepKey ?? title}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                    <YStack gap="$xl">
                        {title || subtitle ? (
                            <YStack gap="$sm">
                                {title ? (
                                    <Typography variant="title2" tag="h1" width="100%">
                                        {title}
                                    </Typography>
                                ) : null}
                                {subtitle ? (
                                    <Typography variant="regularRegular" muted width="100%">
                                        {subtitle}
                                    </Typography>
                                ) : null}
                            </YStack>
                        ) : null}
                        {children}
                    </YStack>
                </motion.div>
            </YStack>
        </YStack>
    );
};

export default FormWrapper;
