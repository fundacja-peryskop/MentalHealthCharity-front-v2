import { Stack, Typography, XStack, YStack } from "@fundacja-peryskop/ui";
import { ArrowRight, Check, Copy, ExternalLink, Landmark } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useIconColor } from "../../layout/useIconColor";

const ANCHOR_RESET: React.CSSProperties = { textDecoration: "none", display: "flex", width: "100%" };
const PRESET_AMOUNTS = [20, 50, 100, 200] as const;

interface Props {
    bankAccount: string;
    pomagamUrl: string;
}

type Method = "online" | "transfer";

/**
 * The interactive heart of the donations page: pick a suggested amount, then
 * choose how to give - straight to pomagam.pl, or by bank transfer with a
 * one-tap copy. A white card meant to sit on the teal donate band. Purely a
 * presentational/controlled widget; it holds only its own local UI state.
 */
export function DonationBox({ bankAccount, pomagamUrl }: Props) {
    const { t } = useTranslation();
    const icon = useIconColor();
    const [amount, setAmount] = useState<number | null>(50);
    const [method, setMethod] = useState<Method>("online");
    const [copied, setCopied] = useState(false);

    const copyAccount = async () => {
        try {
            await navigator.clipboard.writeText(bankAccount);
            setCopied(true);
            toast.success(t("common.copied_to_clipboard"));
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error(t("common.error", { defaultValue: "Coś poszło nie tak" }));
        }
    };

    const ctaLabel = amount ? t("donations.donate.cta_amount", { amount }) : t("donations.donate.cta");

    return (
        <YStack width="100%" maxWidth={480} backgroundColor="$background" borderRadius="$lg" padding="$xl" gap="$lg">
            {/* Amount presets */}
            <YStack gap="$sm">
                <Typography variant="smallSemibold" color="$colorMuted">
                    {t("donations.donate.choose_amount")}
                </Typography>
                <XStack flexWrap="wrap" gap="$sm">
                    {PRESET_AMOUNTS.map((value) => {
                        const active = amount === value;
                        return (
                            <AmountChip key={value} active={active} onPress={() => setAmount(value)}>
                                {value} zł
                            </AmountChip>
                        );
                    })}
                    <AmountChip active={amount === null} onPress={() => setAmount(null)}>
                        {t("donations.donate.custom_amount")}
                    </AmountChip>
                </XStack>
            </YStack>

            {/* Method segmented control */}
            <XStack backgroundColor="$backgroundHover" borderRadius="$full" padding={4} gap={4}>
                <SegmentButton active={method === "online"} onPress={() => setMethod("online")}>
                    {t("donations.donate.method_online")}
                </SegmentButton>
                <SegmentButton active={method === "transfer"} onPress={() => setMethod("transfer")}>
                    {t("donations.donate.method_transfer")}
                </SegmentButton>
            </XStack>

            {method === "online" ? (
                <YStack gap="$sm">
                    <a href={pomagamUrl} target="_blank" rel="noopener noreferrer" style={ANCHOR_RESET}>
                        <XStack
                            width="100%"
                            alignItems="center"
                            justifyContent="center"
                            gap="$sm"
                            paddingVertical="$md"
                            borderRadius="$full"
                            backgroundColor="$primary"
                            hoverStyle={{ backgroundColor: "$primaryHover" }}
                            pressStyle={{ backgroundColor: "$primaryPress" }}
                        >
                            <Typography variant="regularSemibold" color="$primaryText">
                                {ctaLabel}
                            </Typography>
                            <ArrowRight size={18} color={icon.inverse} />
                        </XStack>
                    </a>
                    <XStack alignItems="center" justifyContent="center" gap="$xs">
                        <Typography variant="tinyRegular" muted>
                            pomagam.pl/rw9bkc
                        </Typography>
                        <ExternalLink size={13} color={icon.muted} />
                    </XStack>
                </YStack>
            ) : (
                <YStack
                    gap="$sm"
                    padding="$md"
                    borderRadius="$md"
                    borderWidth={1}
                    borderColor="$borderColor"
                    backgroundColor="$backgroundHover"
                >
                    <XStack alignItems="center" gap="$xs">
                        <Landmark size={15} color={icon.muted} />
                        <Typography variant="tinySemibold" color="$colorMuted">
                            {t("donations.donate.bank_title").toUpperCase()}
                        </Typography>
                    </XStack>
                    <Typography variant="regularSemibold" style={{ fontFamily: "monospace", letterSpacing: "0.02em" }}>
                        {bankAccount}
                    </Typography>
                    <Stack
                        tag="button"
                        role="button"
                        onPress={copyAccount}
                        flexDirection="row"
                        alignItems="center"
                        justifyContent="center"
                        gap="$xs"
                        paddingVertical="$sm"
                        borderRadius="$sm"
                        borderWidth={0}
                        cursor="pointer"
                        backgroundColor={copied ? "$successSoft" : "$primarySoft"}
                        hoverStyle={{ backgroundColor: copied ? "$successSoft" : "$primaryLightest" }}
                    >
                        {copied ? <Check size={15} color={icon.primary} /> : <Copy size={15} color={icon.primary} />}
                        <Typography variant="smallSemibold" color="$primaryTextSoft">
                            {copied ? t("common.copied_to_clipboard") : t("donations.donate.copy_account")}
                        </Typography>
                    </Stack>
                </YStack>
            )}
        </YStack>
    );
}

/** A selectable suggested-amount pill. */
function AmountChip({
    active,
    onPress,
    children,
}: {
    active: boolean;
    onPress: () => void;
    children: React.ReactNode;
}) {
    return (
        <Stack
            tag="button"
            role="button"
            aria-pressed={active}
            onPress={onPress}
            paddingHorizontal="$lg"
            paddingVertical="$sm"
            borderRadius="$full"
            borderWidth={1}
            cursor="pointer"
            backgroundColor={active ? "$primary" : "$background"}
            borderColor={active ? "$primary" : "$borderColor"}
            hoverStyle={{ borderColor: "$primary" }}
        >
            <Typography variant="regularSemibold" color={active ? "$primaryText" : "$color"}>
                {children}
            </Typography>
        </Stack>
    );
}

/** One half of the payment-method segmented control. */
function SegmentButton({
    active,
    onPress,
    children,
}: {
    active: boolean;
    onPress: () => void;
    children: React.ReactNode;
}) {
    return (
        <Stack
            tag="button"
            role="button"
            aria-pressed={active}
            onPress={onPress}
            flex={1}
            alignItems="center"
            justifyContent="center"
            paddingVertical="$sm"
            borderRadius="$full"
            borderWidth={0}
            cursor="pointer"
            backgroundColor={active ? "$background" : "$backgroundTransparent"}
            {...(active ? shadowProps : {})}
        >
            <Typography variant="smallSemibold" color={active ? "$color" : "$colorMuted"}>
                {children}
            </Typography>
        </Stack>
    );
}

const shadowProps = { shadowColor: "$shadowColor", shadowRadius: 6, shadowOffset: { width: 0, height: 1 } } as const;
