import { Stack, Typography, XStack, YStack, shadows } from "@fundacja-peryskop/ui";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useIconColor } from "./useIconColor";

/**
 * Shared design-system building blocks for the admin area: a consistent page
 * header, segmented filter pills, status pills and pill-shaped buttons/links.
 * Keeps every admin screen on the same DS chrome without repeating markup.
 */

type Tone = "primary" | "warning" | "danger" | "success";

const TILE_BG: Record<Tone, string> = {
    primary: "$primarySoft",
    warning: "$secondarySoft",
    danger: "$dangerSoft",
    success: "$successSoft",
};

function useToneColor(): Record<Tone, string | undefined> {
    const c = useIconColor();
    return { primary: c.primary, warning: c.secondary, danger: c.danger, success: c.success };
}

// --- Page header ------------------------------------------------------------

interface AdminPageHeaderProps {
    icon: LucideIcon;
    tone?: Tone;
    title: string;
    subtitle?: string;
    meta?: string;
    actions?: ReactNode;
}

export function AdminPageHeader({
    icon: Icon,
    tone = "primary",
    title,
    subtitle,
    meta,
    actions,
}: AdminPageHeaderProps) {
    const iconColor = useToneColor()[tone];
    return (
        <XStack
            tag="header"
            flexWrap="wrap"
            alignItems="flex-start"
            justifyContent="space-between"
            gap="$lg"
            padding="$xl"
            borderRadius="$lg"
            backgroundColor="$background"
            {...shadows.small}
        >
            <XStack alignItems="center" gap="$md" flex={1} minWidth={240}>
                <Stack
                    width={44}
                    height={44}
                    borderRadius="$md"
                    alignItems="center"
                    justifyContent="center"
                    backgroundColor={TILE_BG[tone] as never}
                >
                    <Icon size={22} color={iconColor} />
                </Stack>
                <YStack gap="$xs" flex={1} minWidth={0}>
                    <Typography variant="title3" tag="h1">
                        {title}
                    </Typography>
                    {subtitle ? (
                        <Typography variant="smallRegular" muted width="100%">
                            {subtitle}
                        </Typography>
                    ) : null}
                    {meta ? (
                        <Typography variant="tinyRegular" muted>
                            {meta}
                        </Typography>
                    ) : null}
                </YStack>
            </XStack>
            {actions ? (
                <XStack flexWrap="wrap" gap="$sm" alignItems="center">
                    {actions}
                </XStack>
            ) : null}
        </XStack>
    );
}

// --- Filter pills -----------------------------------------------------------

export interface FilterPillOption {
    value: string;
    label: string;
    icon?: LucideIcon;
    count?: number;
}

interface FilterPillsProps {
    options: FilterPillOption[];
    value: string;
    onChange: (value: string) => void;
    ariaLabel?: string;
}

export function FilterPills({ options, value, onChange, ariaLabel }: FilterPillsProps) {
    const c = useIconColor();
    return (
        <XStack tag="div" role="group" aria-label={ariaLabel} flexWrap="wrap" gap="$sm">
            {options.map((option) => {
                const active = option.value === value;
                const Icon = option.icon;
                return (
                    <XStack
                        key={option.value}
                        tag="button"
                        role="button"
                        aria-pressed={active}
                        onPress={() => onChange(option.value)}
                        alignItems="center"
                        gap="$xs"
                        paddingHorizontal="$md"
                        paddingVertical="$xs"
                        borderRadius="$full"
                        borderWidth={1}
                        borderColor={active ? "$primary" : "$borderColor"}
                        backgroundColor={active ? "$primary" : "$backgroundTransparent"}
                        cursor="pointer"
                        hoverStyle={{ backgroundColor: active ? "$primary" : "$backgroundHover" }}
                    >
                        {Icon ? <Icon size={14} color={active ? c.inverse : c.muted} /> : null}
                        <Typography variant="smallSemibold" color={active ? "$primaryText" : "$colorMuted"}>
                            {option.label}
                        </Typography>
                        {typeof option.count === "number" ? (
                            <Typography variant="tinyBold" color={active ? "$primaryText" : "$colorMuted"}>
                                {option.count}
                            </Typography>
                        ) : null}
                    </XStack>
                );
            })}
        </XStack>
    );
}

// --- Status pill ------------------------------------------------------------

export type PillTone = "primary" | "info" | "warning" | "danger" | "success" | "neutral";

const PILL_BG: Record<PillTone, string> = {
    primary: "$primarySoft",
    info: "$primarySoft",
    warning: "$secondarySoft",
    danger: "$dangerSoft",
    success: "$successSoft",
    neutral: "$backgroundHover",
};

const PILL_FG: Record<PillTone, string> = {
    primary: "$primaryTextSoft",
    info: "$primaryTextSoft",
    warning: "$secondaryTextSoft",
    danger: "$dangerTextSoft",
    success: "$success",
    neutral: "$colorMuted",
};

export function StatusPill({ tone = "neutral", children }: { tone?: PillTone; children: ReactNode }) {
    return (
        <XStack
            alignSelf="flex-start"
            alignItems="center"
            paddingHorizontal="$sm"
            paddingVertical={2}
            borderRadius="$full"
            backgroundColor={PILL_BG[tone] as never}
        >
            <Typography variant="tinyBold" color={PILL_FG[tone] as never}>
                {children}
            </Typography>
        </XStack>
    );
}

// --- Pill button / link -----------------------------------------------------

const ANCHOR_RESET: React.CSSProperties = { textDecoration: "none", display: "inline-flex" };

interface PillButtonProps {
    children: ReactNode;
    icon?: LucideIcon;
    onPress?: () => void;
    to?: string;
    href?: string;
    variant?: "solid" | "outline";
    tone?: "primary" | "danger";
    disabled?: boolean;
    spinning?: boolean;
}

export function PillButton({
    children,
    icon: Icon,
    onPress,
    to,
    href,
    variant = "outline",
    tone = "primary",
    disabled,
    spinning,
}: PillButtonProps) {
    const c = useIconColor();
    const solid = variant === "solid";
    const bg = solid ? (tone === "danger" ? "$danger" : "$primary") : "$backgroundTransparent";
    const textColor = solid ? "$primaryText" : tone === "danger" ? "$danger" : "$color";
    const iconColor = solid ? c.inverse : tone === "danger" ? c.danger : c.color;

    const inner = (
        <XStack
            alignItems="center"
            gap="$xs"
            paddingHorizontal="$lg"
            paddingVertical="$sm"
            borderRadius="$full"
            borderWidth={solid ? 0 : 1}
            borderColor="$borderColor"
            backgroundColor={bg as never}
            opacity={disabled ? 0.5 : 1}
            cursor={disabled ? "not-allowed" : "pointer"}
            hoverStyle={disabled ? {} : solid ? { opacity: 0.9 } : { backgroundColor: "$backgroundHover" }}
        >
            {Icon ? <Icon size={16} color={iconColor} className={spinning ? "animate-spin" : undefined} /> : null}
            <Typography variant="regularSemibold" color={textColor}>
                {children}
            </Typography>
        </XStack>
    );

    if (to) {
        return (
            <RouterLink to={to} style={ANCHOR_RESET}>
                {inner}
            </RouterLink>
        );
    }
    if (href) {
        return (
            <a href={href} target="_blank" rel="noreferrer" style={ANCHOR_RESET}>
                {inner}
            </a>
        );
    }
    return (
        <Stack
            tag="button"
            role="button"
            disabled={disabled}
            onPress={disabled ? undefined : onPress}
            borderWidth={0}
            backgroundColor="$backgroundTransparent"
            padding={0}
        >
            {inner}
        </Stack>
    );
}

// --- Data table -------------------------------------------------------------

export interface Column<Row> {
    key: string;
    header: ReactNode;
    /** Fixed pixel width; when set the column neither grows nor shrinks. */
    width?: number;
    /** Flex-grow weight for fluid columns (ignored when `width` is set). */
    flex?: number;
    align?: "left" | "right" | "center";
    render: (row: Row) => ReactNode;
}

interface DataTableProps<Row> {
    columns: Column<Row>[];
    rows: Row[];
    rowKey: (row: Row) => string | number;
    isLoading?: boolean;
    emptyText?: string;
    loadingText?: string;
    /** Minimum content width before the table scrolls horizontally. */
    minWidth?: number;
}

const SCROLL_X: React.CSSProperties = { width: "100%", overflowX: "auto", overflowY: "hidden" };

function Cell({ column, children }: { column: Column<unknown>; children: ReactNode }) {
    const align = column.align ?? "left";
    return (
        <Stack
            width={column.width}
            flexGrow={column.width ? 0 : (column.flex ?? 1)}
            flexShrink={column.width ? 0 : 1}
            flexBasis={column.width ? column.width : 0}
            minWidth={column.width ?? 100}
            paddingHorizontal="$md"
            paddingVertical="$sm"
            justifyContent="center"
            alignItems={align === "right" ? "flex-end" : align === "center" ? "center" : "flex-start"}
        >
            {children}
        </Stack>
    );
}

export function DataTable<Row>({
    columns,
    rows,
    rowKey,
    isLoading,
    emptyText,
    loadingText,
    minWidth = 720,
}: DataTableProps<Row>) {
    const cols = columns as Column<unknown>[];
    return (
        <YStack
            borderRadius="$lg"
            borderWidth={1}
            borderColor="$borderColor"
            backgroundColor="$background"
            overflow="hidden"
            {...shadows.small}
        >
            <div style={SCROLL_X}>
                <YStack minWidth={minWidth}>
                    {/* Header */}
                    <XStack backgroundColor="$backgroundHover" borderBottomWidth={1} borderColor="$borderColor">
                        {cols.map((column) => (
                            <Cell key={column.key} column={column}>
                                <Typography
                                    variant="tinyBold"
                                    color="$colorMuted"
                                    style={{ textTransform: "uppercase", letterSpacing: 0.4 }}
                                >
                                    {column.header}
                                </Typography>
                            </Cell>
                        ))}
                    </XStack>

                    {/* Body */}
                    {isLoading ? (
                        <XStack paddingVertical="$xxl" justifyContent="center">
                            <Typography variant="smallRegular" muted>
                                {loadingText ?? "…"}
                            </Typography>
                        </XStack>
                    ) : rows.length > 0 ? (
                        rows.map((row, index) => (
                            <XStack
                                key={rowKey(row)}
                                borderTopWidth={index === 0 ? 0 : 1}
                                borderColor="$borderColor"
                                hoverStyle={{ backgroundColor: "$backgroundHover" }}
                                alignItems="stretch"
                            >
                                {columns.map((column) => (
                                    <Cell key={column.key} column={column as Column<unknown>}>
                                        {column.render(row)}
                                    </Cell>
                                ))}
                            </XStack>
                        ))
                    ) : (
                        <XStack paddingVertical="$xxl" justifyContent="center">
                            <Typography variant="smallRegular" muted>
                                {emptyText ?? "—"}
                            </Typography>
                        </XStack>
                    )}
                </YStack>
            </div>
        </YStack>
    );
}
