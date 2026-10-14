import chair from "@/assets/static/homepage/chair.svg";
import { IllustrationImage, type IllustrationImageProps } from "./IllustrationImage";

type Props = Omit<IllustrationImageProps, "src" | "alt"> & { alt?: string };

/**
 * §8 - office chair illustration for the "Chcę pomagać" pitch card. Anchored in
 * the card's bottom-left corner, tilted slightly counter-clockwise.
 */
export function ChairIllustration({ alt = "", ...props }: Props) {
    return <IllustrationImage src={chair} alt={alt} {...props} />;
}
