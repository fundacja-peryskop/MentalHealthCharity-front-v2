import { Button, Stack, Typography, XStack } from "@fundacja-peryskop/ui";
import { Phone, UserRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useIconColor } from "../../../layout/useIconColor";
import { dial } from "../../content";
import type { SupportContact } from "../../types";

interface Props {
    contact: SupportContact;
}

const ContactCard = ({ contact }: Props) => {
    const { t } = useTranslation();
    const c = useIconColor();

    return (
        <XStack
            tag="li"
            flexWrap="wrap"
            alignItems="center"
            justifyContent="space-between"
            gap="$md"
            padding="$lg"
            borderRadius="$md"
            borderWidth={1}
            borderColor="$borderColor"
            backgroundColor="$background"
        >
            <XStack alignItems="center" gap="$md" flex={1} minWidth={160}>
                <Stack
                    width={40}
                    height={40}
                    flexShrink={0}
                    borderRadius="$full"
                    alignItems="center"
                    justifyContent="center"
                    backgroundColor="$primarySoft"
                    aria-hidden
                >
                    <UserRound size={20} color={c.primary} />
                </Stack>
                <Typography variant="regularSemibold" tag="span">
                    {contact.name}
                </Typography>
            </XStack>
            <Button
                variant="primary"
                outlined
                aria-label={t("emergency.contacts.call", { name: contact.name })}
                onPress={() => dial(contact.phone)}
            >
                <Phone size={16} color={c.primary} aria-hidden />
                <Typography variant="regularSemibold" color="$primary">
                    {contact.phone}
                </Typography>
            </Button>
        </XStack>
    );
};

export default ContactCard;
