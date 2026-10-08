import Linkify from "linkify-react";
import type { IntermediateRepresentation } from "linkifyjs";
import { Link } from "react-router-dom";
import { buildLeavingUrl, isTrustedUrl, parseSafeHttpUrl } from "../../../shared/helpers/externalLink";

interface Props {
    content: string;
    /** Own messages render on a dark bubble, so links need a lighter treatment. */
    isOwnMessage?: boolean;
}

/**
 * Renders a chat message body, turning detected URLs into safe, gated links.
 *
 * Security model:
 * - linkify-react tokenizes the text and produces React elements (never raw
 *   HTML), so message content can never inject markup.
 * - Only http(s) links become clickable; anything else stays plain text.
 * - External links point at the internal /leaving warning gate rather than the
 *   destination, so the user is warned before leaving the foundation.
 * - Links are not text-selectable (select-none) so users can't easily copy the
 *   raw URL and bypass the gate, and always open in a new tab so the live chat
 *   is never navigated away from.
 */
const MessageContent = ({ content, isOwnMessage = false }: Props) => {
    const linkClassName = isOwnMessage
        ? "font-medium underline underline-offset-2 [overflow-wrap:anywhere] hover:opacity-80 select-none"
        : "text-info-brand font-medium underline underline-offset-2 [overflow-wrap:anywhere] hover:opacity-80 select-none";

    const renderLink = ({ attributes, content: text }: IntermediateRepresentation) => {
        const url = parseSafeHttpUrl(String(attributes.href ?? ""));

        // Unsafe or unparseable scheme - show the original text, not a link.
        if (!url) return <>{text}</>;

        // Foundation / same-origin / allowlisted links skip the gate and open directly.
        if (isTrustedUrl(url)) {
            return (
                <a href={url.href} target="_blank" rel="noopener noreferrer" className={linkClassName}>
                    {text}
                </a>
            );
        }

        // External link: route through the interstitial warning gate, in a new tab
        // so the live chat conversation is never navigated away from.
        return (
            <Link to={buildLeavingUrl(url.href)} target="_blank" rel="noopener noreferrer" className={linkClassName}>
                {text}
            </Link>
        );
    };

    return (
        <p className="text-start text-[15px] leading-relaxed [overflow-wrap:anywhere] break-words">
            <Linkify
                as="span"
                options={{
                    defaultProtocol: "https",
                    // Only web URLs become clickable; leave emails as plain text.
                    render: {
                        url: renderLink,
                        email: ({ content: text }: IntermediateRepresentation) => <>{text}</>,
                    },
                }}
            >
                {content}
            </Linkify>
        </p>
    );
};

export default MessageContent;
