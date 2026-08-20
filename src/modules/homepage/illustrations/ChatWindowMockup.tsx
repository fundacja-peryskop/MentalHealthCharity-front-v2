import chatWindow from "@/assets/static/homepage/two_people_in_frame.png";
import { IllustrationImage, type IllustrationImageProps } from "./IllustrationImage";

type Props = Omit<IllustrationImageProps, "src" | "alt"> & { alt?: string };

/**
 * §8 — stylized chat-window mockup. Used in the "Potrzebuję pomocy" pitch card
 * and in the how-it-works "chat" steps.
 */
export function ChatWindowMockup({ alt = "", ...props }: Props) {
    return <IllustrationImage src={chatWindow} alt={alt} {...props} />;
}
