import { ScrollText, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import ChatSidebarPanel from "../ChatSidebarPanel";

interface Props {
    onClose: () => void;
}

const HelpRulesSidebar = ({ onClose }: Props) => {
    const { t } = useTranslation();

    const rules = [
        t("chat.help_rules_items.1"),
        t("chat.help_rules_items.2"),
        t("chat.help_rules_items.3"),
        t("chat.help_rules_items.4"),
        t("chat.help_rules_items.5"),
        t("chat.help_rules_items.6"),
        t("chat.help_rules_items.7"),
        t("chat.help_rules_items.8"),
        t("chat.help_rules_items.9"),
        t("chat.help_rules_items.10"),
        t("chat.help_rules_items.11"),
        t("chat.help_rules_items.12"),
    ];

    return (
        <ChatSidebarPanel onClose={onClose}>
            <div className="border-border/50 flex h-16 items-center justify-between border-b px-4">
                <div className="flex items-center gap-2.5">
                    <ScrollText className="text-primary-brand size-5" />
                    <h3 className="text-foreground text-sm font-semibold">{t("chat.help_rules")}</h3>
                </div>
                <button
                    onClick={onClose}
                    className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-1.5 transition-colors"
                    aria-label={t("common.close", { defaultValue: "Close" })}
                >
                    <X className="size-4" />
                </button>
            </div>

            <div className="flex-1 overflow-auto p-4">
                <div className="rounded-xl">
                    <ol className="text-muted-foreground list-inside list-decimal space-y-3 text-sm leading-relaxed">
                        {rules.map((rule) => (
                            <li key={rule}>{rule}</li>
                        ))}
                    </ol>
                </div>
            </div>
        </ChatSidebarPanel>
    );
};

export default HelpRulesSidebar;
