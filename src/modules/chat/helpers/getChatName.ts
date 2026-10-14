import i18n from "../../../locales/i18n";
import { Chat } from "../types";

export default function getChatName(chat: Pick<Chat, "name" | "id">): string {
    return chat.name?.trim() || i18n.t("chat.unnamed", { id: chat.id });
}
