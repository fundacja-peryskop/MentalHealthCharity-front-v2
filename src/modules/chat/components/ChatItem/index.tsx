import getChatName from "../../helpers/getChatName";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Chat } from "../../types";

interface Props {
    chat: Chat;
    selected: boolean;
    readed?: boolean;
    onClick?: () => void;
}

const ChatItem = ({ chat, selected, readed, onClick }: Props) => {
    const showUnreadIndicator = chat.unread_count > 0 && !readed;
    const { is_active } = chat;

    return (
        <Link
            to={`/chat/${chat.id}`}
            onClick={onClick}
            aria-current={selected ? "true" : undefined}
            className={cn(
                "flex items-center gap-3 px-3 py-3 no-underline transition-colors",
                is_active ? "opacity-100" : "opacity-60",
                selected
                    ? "bg-primary-brand/8 border-primary-brand border-l-2"
                    : "hover:bg-muted/50 border-l-2 border-transparent"
            )}
        >
            <div
                className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-full",
                    is_active ? "bg-primary-brand/15 text-primary-brand" : "bg-muted text-muted-foreground"
                )}
            >
                <span className="text-sm font-bold">{getChatName(chat).charAt(0).toUpperCase()}</span>
            </div>
            <div className="min-w-0 flex-1">
                <p
                    className={cn(
                        "inline-flex max-w-full items-center gap-1.5 truncate text-sm leading-tight",
                        showUnreadIndicator ? "text-foreground font-bold" : "text-foreground font-semibold",
                        !is_active && "text-muted-foreground"
                    )}
                >
                    {getChatName(chat)}
                </p>
                {chat.last_message && (
                    <p className="text-muted-foreground max-w-full truncate text-xs">
                        {chat.last_message.sender.full_name}: {chat.last_message.content}
                    </p>
                )}
            </div>
            {showUnreadIndicator && (
                <span className="bg-primary-brand flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white">
                    {chat.unread_count}
                </span>
            )}
        </Link>
    );
};

export default ChatItem;
