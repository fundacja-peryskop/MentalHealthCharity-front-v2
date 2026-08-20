import personWithBubbles from "@/assets/static/homepage/asking_person.png";
import { IllustrationImage, type IllustrationImageProps } from "./IllustrationImage";

type Props = Omit<IllustrationImageProps, "src" | "alt"> & { alt?: string };

/**
 * §8 — "person surrounded by speech bubbles and question marks" illustration.
 * Used in the "Potrzebuję pomocy" pitch card and reused in how-it-works step 1.
 */
export function PersonWithBubblesIllustration({ alt = "", ...props }: Props) {
    return <IllustrationImage src={personWithBubbles} alt={alt} {...props} />;
}
