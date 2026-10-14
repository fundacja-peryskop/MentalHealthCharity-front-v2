import getChatName from "../../helpers/getChatName";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import resolveAssetUrl from "@/modules/shared/helpers/resolveAssetUrl";
import { cn } from "@/lib/utils";
import {
    ArrowRightCircle,
    ChevronDown,
    Copy,
    LockKeyhole,
    MousePointerClick,
    MessageSquare,
    Pencil,
    Play,
    Plus,
    RefreshCwOff,
    Route,
    RotateCw,
    ShieldCheck,
    Trash2,
    User as UserIcon,
    Users,
} from "lucide-react";
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { User } from "../../../auth/types";
import ActionMenu from "../../../shared/components/ActionMenu";
import formatDate from "../../../shared/helpers/formatDate";
import { Pagination } from "../../../shared/types";
import { Roles, translatedRoles } from "../../../users/constants";
import { Chat } from "../../types";

interface Props {
    data?: Pagination<Chat>;
    onEditChat: (chat: Chat) => void;
    onToggleChat: (chat: Chat) => void;
    onAddParticipant: (chat: Chat) => void;
    onRemoveParticipant: (chat: Chat, participant: User, autoRematch?: boolean) => void;
    onLoadMore: () => void;
}

const getInitial = (user: User) => (user.full_name || user.email || "?").charAt(0).toUpperCase();

const getSpecialChatLabelKey = (chatType: Chat["chat_type"]) => {
    switch (chatType) {
        case "SUPERVISION":
            return "chat.type_supervision";
        case "GROUP":
            return "chat.type_group";
        case "DIRECT":
            return "chat.type_special_direct";
        case "SUPPORT":
            return "chat.special_chat";
    }
};

const getSpecialChatDefaultLabel = (chatType: Chat["chat_type"]) => {
    switch (chatType) {
        case "SUPERVISION":
            return "Superwizyjny";
        case "GROUP":
            return "Grupowy";
        case "DIRECT":
            return "Specjalny 1:1";
        case "SUPPORT":
            return "Specjalny";
    }
};

const getSpecialChatBadgeVariant = (chatType: Chat["chat_type"]) => {
    switch (chatType) {
        case "SUPERVISION":
            return "warning" as const;
        case "GROUP":
            return "info" as const;
        case "DIRECT":
            return "outline" as const;
        case "SUPPORT":
            return "outline" as const;
    }
};

const InfoIcon = ({ children, label }: { children: ReactNode; label: string }) => (
    <Tooltip>
        <TooltipTrigger
            className="border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground inline-flex size-8 items-center justify-center rounded-lg border transition-colors"
            aria-label={label}
        >
            {children}
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
    </Tooltip>
);

const ChatManager = ({ data, onEditChat, onToggleChat, onAddParticipant, onRemoveParticipant, onLoadMore }: Props) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const sentinelRef = useRef<HTMLDivElement>(null);
    const [expandedChatIds, setExpandedChatIds] = useState<Set<number>>(() => new Set());

    const handleCopy = useCallback(
        (text: string) => {
            navigator.clipboard.writeText(text);
            toast.success(t("common.copied_to_clipboard"));
        },
        [t]
    );

    const toggleExpanded = useCallback((chatId: number) => {
        setExpandedChatIds((current) => {
            const next = new Set(current);
            if (next.has(chatId)) {
                next.delete(chatId);
            } else {
                next.add(chatId);
            }
            return next;
        });
    }, []);

    const loadedCountLabel = useMemo(() => {
        if (!data) return "";

        return t("chat.loaded_chats_summary", {
            defaultValue: "Pokazano {{loaded}} z {{total}}",
            loaded: data.items.length,
            total: data.total,
        });
    }, [data, t]);

    useEffect(() => {
        if (!data || !sentinelRef.current) return;
        if (data.items.length >= data.total) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) onLoadMore();
            },
            { rootMargin: "200px" }
        );
        observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [data, onLoadMore]);

    if (!data) {
        return (
            <div className="flex flex-col gap-3 py-5">
                {Array.from({ length: 5 }, (_, i) => (
                    <div key={i} className="bg-card border-border/50 rounded-xl border p-4">
                        <div className="flex items-center gap-4">
                            <Skeleton className="size-10 rounded-lg" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-5 w-64 max-w-full" />
                                <Skeleton className="h-4 w-96 max-w-full" />
                            </div>
                            <Skeleton className="h-9 w-24 rounded-lg" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (data.items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="bg-muted/50 mb-4 flex size-16 items-center justify-center rounded-full">
                    <MessageSquare className="text-muted-foreground size-7" />
                </div>
                <p className="text-muted-foreground text-lg font-medium">
                    {t("chat.no_chats_found", { defaultValue: "Nie znaleziono czatów" })}
                </p>
            </div>
        );
    }

    return (
        <TooltipProvider>
            <div className="flex flex-col gap-3 py-5">
                <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-2 px-1 text-sm">
                    <span className="flex items-center gap-2">
                        <Users className="size-4" />
                        {loadedCountLabel}
                    </span>
                </div>

                {data.items.map((chat) => {
                    const isExpanded = expandedChatIds.has(chat.id);
                    const visibleParticipants = chat.participants.slice(0, 3);
                    const hiddenParticipantsCount = Math.max(chat.participants.length - visibleParticipants.length, 0);
                    const isClosed = !chat.is_active || chat.status === "CLOSED";
                    const specialChatLabel = t(getSpecialChatLabelKey(chat.chat_type), {
                        defaultValue: getSpecialChatDefaultLabel(chat.chat_type),
                    });

                    const statusLabel = isClosed
                        ? t("common.closed", { defaultValue: "Zamknięty" })
                        : t("common.active", { defaultValue: "Aktywny" });

                    const leadingIcon = isClosed ? (
                        <LockKeyhole className="text-muted-foreground size-5" />
                    ) : chat.chat_type === "SUPERVISION" ? (
                        <ShieldCheck className="text-warning-brand size-5" />
                    ) : chat.chat_type === "GROUP" ? (
                        <Users className="text-info-brand size-5" />
                    ) : chat.chat_type === "DIRECT" ? (
                        <UserIcon className="text-muted-foreground size-5" />
                    ) : (
                        <MessageSquare className="text-primary-brand size-5" />
                    );

                    const leadingIconClassName = isClosed
                        ? "bg-muted"
                        : chat.chat_type === "SUPERVISION"
                          ? "bg-warning-brand/10"
                          : chat.chat_type === "GROUP"
                            ? "bg-info-brand/10"
                            : chat.chat_type === "DIRECT"
                              ? "bg-muted"
                              : "bg-primary-brand/10";

                    const matchingSourceLabel =
                        chat.matching_source === "MANUAL"
                            ? t("matching.manual_pairing_created", { defaultValue: "Czat utworzony ręcznie" })
                            : chat.matching_source === "AUTO"
                              ? t("matching.auto_pairing_created", { defaultValue: "Czat utworzony automatycznie" })
                              : null;
                    const matchingSourceIcon =
                        chat.matching_source === "MANUAL" ? (
                            <MousePointerClick className="size-4" />
                        ) : chat.matching_source === "AUTO" ? (
                            <Route className="size-4" />
                        ) : null;

                    return (
                        <article
                            key={chat.id}
                            className="bg-card border-border/50 hover:border-border overflow-hidden rounded-xl border shadow-sm transition-colors"
                        >
                            <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                                <div className="flex min-w-0 gap-3">
                                    <div
                                        className={cn(
                                            "flex size-10 shrink-0 items-center justify-center rounded-lg",
                                            leadingIconClassName
                                        )}
                                    >
                                        {leadingIcon}
                                    </div>

                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="text-foreground max-w-full text-base font-semibold break-words">
                                                {getChatName(chat)}
                                            </h3>
                                            {chat.is_special_chat && (
                                                <Badge variant={getSpecialChatBadgeVariant(chat.chat_type)}>
                                                    {specialChatLabel}
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                                            <span>
                                                {t("common.created_at", {
                                                    defaultValue: "Utworzono {{date}}",
                                                    date: formatDate(chat.creation_date),
                                                })}
                                            </span>
                                            {chat.closed_at && (
                                                <span>
                                                    {t("chat.closed_at", {
                                                        defaultValue: "Zamknięto {{date}}",
                                                        date: formatDate(chat.closed_at),
                                                    })}
                                                </span>
                                            )}
                                        </div>

                                        <div className="mt-3 flex flex-wrap items-center gap-2">
                                            <Badge variant={isClosed ? "outline" : "success"}>{statusLabel}</Badge>
                                            {matchingSourceLabel && matchingSourceIcon && (
                                                <InfoIcon label={matchingSourceLabel}>{matchingSourceIcon}</InfoIcon>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                                    <div className="flex items-center -space-x-2 pr-2">
                                        {visibleParticipants.map((participant) => (
                                            <Avatar
                                                key={participant.id}
                                                className="border-card bg-muted size-8 rounded-lg border-2"
                                            >
                                                <AvatarImage
                                                    src={resolveAssetUrl(participant.chat_avatar_url)}
                                                    alt={participant.full_name || participant.email}
                                                />
                                                <AvatarFallback className="rounded-lg text-xs">
                                                    {getInitial(participant)}
                                                </AvatarFallback>
                                            </Avatar>
                                        ))}
                                        {hiddenParticipantsCount > 0 && (
                                            <span className="border-card bg-muted text-muted-foreground flex size-8 items-center justify-center rounded-lg border-2 text-xs font-medium">
                                                +{hiddenParticipantsCount}
                                            </span>
                                        )}
                                    </div>

                                    <Button variant="outline" size="sm" onClick={() => toggleExpanded(chat.id)}>
                                        <ChevronDown
                                            className={cn(
                                                "size-4 transition-transform",
                                                isExpanded ? "rotate-180" : "rotate-0"
                                            )}
                                        />
                                        {isExpanded
                                            ? t("common.hide", { defaultValue: "Ukryj" })
                                            : t("common.details", { defaultValue: "Szczegóły" })}
                                    </Button>

                                    <Button size="sm" render={<Link to={`/chat/${chat.id}`} />}>
                                        <ArrowRightCircle className="size-4" />
                                        {t("chat.go_to_chat", { defaultValue: "Otwórz" })}
                                    </Button>

                                    <ActionMenu
                                        actions={[
                                            {
                                                id: "edit",
                                                label: t("common.edit"),
                                                onClick: () => onEditChat(chat),
                                                icon: <Pencil className="size-4" />,
                                            },
                                            {
                                                id: "add_participant",
                                                label: t("chat.add_participant"),
                                                onClick: () => onAddParticipant(chat),
                                                icon: <Plus className="size-4" />,
                                            },
                                            {
                                                id: "disable",
                                                variant: "divider",
                                                label: chat.is_active
                                                    ? t("chat.close_chat", { defaultValue: "Zamknij czat" })
                                                    : t("common.enable"),
                                                onClick: () => onToggleChat(chat),
                                                icon: chat.is_active ? (
                                                    <LockKeyhole className="text-warning-brand size-4" />
                                                ) : (
                                                    <Play className="text-success-brand size-4" />
                                                ),
                                            },
                                        ]}
                                    />
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="border-border/50 bg-muted/20 border-t px-4 py-4">
                                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                        <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium tracking-wider uppercase">
                                            <Users className="size-3.5" />
                                            {t("chat.participants", { defaultValue: "Uczestnicy" })} (
                                            {chat.participants.length})
                                        </p>
                                        <Button variant="ghost" size="sm" onClick={() => onAddParticipant(chat)}>
                                            <Plus className="size-4" />
                                            {t("chat.add_participant")}
                                        </Button>
                                    </div>

                                    {chat.participants.length > 0 ? (
                                        <div className="grid gap-2 lg:grid-cols-2">
                                            {chat.participants.map((participant) => (
                                                <div
                                                    key={participant.id}
                                                    className="bg-background border-border/50 flex min-w-0 items-center gap-3 rounded-lg border p-3"
                                                >
                                                    <Avatar className="size-9 rounded-lg">
                                                        <AvatarImage
                                                            src={resolveAssetUrl(participant.chat_avatar_url)}
                                                            alt={participant.full_name || participant.email}
                                                        />
                                                        <AvatarFallback className="rounded-lg text-xs">
                                                            {getInitial(participant)}
                                                        </AvatarFallback>
                                                    </Avatar>

                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <p className="text-foreground min-w-0 text-sm font-medium break-words">
                                                                {participant.full_name || participant.email}
                                                            </p>
                                                            <Badge variant="outline" className="text-xs">
                                                                {translatedRoles[participant.user_role]}
                                                            </Badge>
                                                        </div>
                                                        <button
                                                            onClick={() => handleCopy(participant.email)}
                                                            className="text-muted-foreground mt-1 flex max-w-full items-center gap-1 border-none bg-transparent p-0 text-left text-xs hover:underline"
                                                        >
                                                            <span className="break-all">{participant.email}</span>
                                                            <Copy className="size-3 shrink-0" />
                                                        </button>
                                                    </div>

                                                    <ActionMenu
                                                        actions={[
                                                            {
                                                                id: "go_to_profile",
                                                                label: t("common.go_to_profile"),
                                                                href: `/profile/${participant.id}`,
                                                                icon: <UserIcon className="size-4" />,
                                                            },
                                                            {
                                                                id: "edit_user",
                                                                label: t("common.edit"),
                                                                onClick: () =>
                                                                    navigate(
                                                                        `/admin/users?search=${participant.email}`
                                                                    ),
                                                                icon: <Pencil className="size-4" />,
                                                            },
                                                            ...(participant.user_role === Roles.VOLUNTEER
                                                                ? [
                                                                      {
                                                                          id: "remove_auto_rematch",
                                                                          label: t(
                                                                              "chat.remove_volunteer_for_auto_rematch",
                                                                              {
                                                                                  defaultValue:
                                                                                      "Usuń wolontariusza i uruchom automatyczny rematch",
                                                                              }
                                                                          ),
                                                                          variant: "divider" as const,
                                                                          onClick: () =>
                                                                              onRemoveParticipant(
                                                                                  chat,
                                                                                  participant,
                                                                                  true
                                                                              ),
                                                                          icon: (
                                                                              <RotateCw className="text-success-brand size-4" />
                                                                          ),
                                                                      },
                                                                      {
                                                                          id: "remove_manual_rematch",
                                                                          label: t(
                                                                              "chat.remove_volunteer_for_manual_rematch",
                                                                              {
                                                                                  defaultValue:
                                                                                      "Usuń wolontariusza i przenieś do ręcznego rematchu",
                                                                              }
                                                                          ),
                                                                          variant: "divider" as const,
                                                                          onClick: () =>
                                                                              onRemoveParticipant(
                                                                                  chat,
                                                                                  participant,
                                                                                  false
                                                                              ),
                                                                          icon: (
                                                                              <RefreshCwOff className="text-warning-brand size-4" />
                                                                          ),
                                                                      },
                                                                  ]
                                                                : [
                                                                      {
                                                                          id: "remove",
                                                                          label: t("chat.remove_from_chat"),
                                                                          variant: "divider" as const,
                                                                          onClick: () =>
                                                                              onRemoveParticipant(chat, participant),
                                                                          icon: (
                                                                              <Trash2 className="text-destructive size-4" />
                                                                          ),
                                                                      },
                                                                  ]),
                                                        ]}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground text-sm">
                                            {t("chat.no_participants", { defaultValue: "Brak uczestników." })}
                                        </p>
                                    )}
                                </div>
                            )}
                        </article>
                    );
                })}

                {data.items.length < data.total && (
                    <div ref={sentinelRef} className="flex justify-center py-6">
                        <Skeleton className="h-8 w-32 rounded-full" />
                    </div>
                )}
            </div>
        </TooltipProvider>
    );
};

export default ChatManager;
