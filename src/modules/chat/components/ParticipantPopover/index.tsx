import { Avatar, Popover, type PopoverPlacement, Typography, XStack, YStack } from "@fundacja-peryskop/ui";
import { ShieldCheck } from "lucide-react";
import { ReactElement, useId } from "react";
import { useTranslation } from "react-i18next";
import { CopyButton, useIconColor } from "../../../layout";
import { User } from "../../../auth/types";
import { Permissions } from "../../../shared/constants";
import resolveAssetUrl from "../../../shared/helpers/resolveAssetUrl";
import usePermissions from "../../../shared/hooks/usePermissions";
import RoleBadge from "../../../users/components/RoleBadge";
import ParticipantDetailRow from "../ParticipantDetailRow";

/** Long, unbroken values (emails, UUIDs) must wrap instead of widening the popover. */
const BREAK_ANYWHERE = { overflowWrap: "anywhere" } as const;

interface Props {
    participant: User;
    /** Element that opens the popover (an avatar or a participant row). Must accept a ref and press handlers. */
    trigger: ReactElement;
    placement?: PopoverPlacement;
}

/**
 * A small card with a chat participant's details, opened from their avatar in
 * the message list or from the participants list in the chat details panel.
 *
 * Everyone sees the name, avatar, role and id. Contact and account details
 * (email, UUID, chat assignment, automation exclusion) are shown only to
 * people with `VIEW_PARTICIPANT_DETAILS` (admins, supervisors, redactors) -
 * chats are anonymous for mentees and volunteers.
 */
const ParticipantPopover = ({ participant, trigger, placement = "bottom-start" }: Props) => {
    const { t } = useTranslation();
    const { hasPermissions } = usePermissions();
    const icon = useIconColor();
    const nameId = useId();
    const canViewDetails = hasPermissions(Permissions.VIEW_PARTICIPANT_DETAILS);

    const yesNo = (value: boolean) => (
        <Typography variant="smallSemibold" color={value ? "$color" : "$colorMuted"}>
            {value ? t("common.yes") : t("common.no")}
        </Typography>
    );

    return (
        <Popover trigger={trigger} placement={placement} aria-labelledby={nameId}>
            <XStack gap="$md" alignItems="center">
                <Avatar size={48} src={resolveAssetUrl(participant.chat_avatar_url)} name={participant.full_name} />
                <YStack flex={1} minWidth={0} gap={2}>
                    <Typography id={nameId} tag="h3" variant="regularBold" style={BREAK_ANYWHERE}>
                        {participant.full_name}
                    </Typography>
                    {canViewDetails && participant.email ? (
                        <XStack alignItems="center" gap="$xs" minWidth={0}>
                            <Typography
                                variant="smallRegular"
                                color="$colorMuted"
                                flex={1}
                                minWidth={0}
                                style={BREAK_ANYWHERE}
                            >
                                {participant.email}
                            </Typography>
                            <CopyButton value={participant.email} label={t("chat.participant_details.copy_email")} />
                        </XStack>
                    ) : null}
                </YStack>
            </XStack>

            <YStack tag="dl" gap="$xs" margin={0}>
                <ParticipantDetailRow label={t("chat.participant_details.role")}>
                    <RoleBadge role={participant.user_role} size="sm" />
                </ParticipantDetailRow>
                <ParticipantDetailRow label={t("chat.participant_details.id")}>
                    <Typography variant="smallSemibold">{participant.id}</Typography>
                </ParticipantDetailRow>

                {canViewDetails ? (
                    <>
                        <ParticipantDetailRow label={t("chat.participant_details.assigned_to_chat")}>
                            {yesNo(participant.is_assigned_to_chat)}
                        </ParticipantDetailRow>
                        <ParticipantDetailRow label={t("chat.participant_details.excluded_from_automation")}>
                            {yesNo(participant.excluded_from_automation)}
                        </ParticipantDetailRow>
                        {participant.uuid ? (
                            <ParticipantDetailRow label={t("chat.participant_details.uuid")}>
                                <Typography variant="tinyRegular" style={BREAK_ANYWHERE}>
                                    {participant.uuid}
                                </Typography>
                                <CopyButton value={participant.uuid} label={t("chat.participant_details.copy_uuid")} />
                            </ParticipantDetailRow>
                        ) : null}
                    </>
                ) : null}
            </YStack>

            {canViewDetails ? (
                <XStack alignItems="center" gap="$xs" paddingTop="$sm" borderTopWidth={1} borderColor="$borderColor">
                    <ShieldCheck size={14} color={icon.muted} aria-hidden />
                    <Typography variant="tinyRegular" color="$colorMuted">
                        {t("chat.participant_details.staff_only")}
                    </Typography>
                </XStack>
            ) : null}
        </Popover>
    );
};

export default ParticipantPopover;
