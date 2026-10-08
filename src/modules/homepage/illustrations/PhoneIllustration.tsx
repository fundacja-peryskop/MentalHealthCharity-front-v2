import phone from "@/assets/static/homepage/phone.svg";
import { IllustrationImage, type IllustrationImageProps } from "./IllustrationImage";

type Props = Omit<IllustrationImageProps, "src" | "alt"> & { alt?: string };

/**
 * §8 - phone/device illustration for the "Chcę pomagać" pitch card. Anchored in
 * the card's bottom-right corner, tilted slightly clockwise.
 */
export function PhoneIllustration({ alt = "", ...props }: Props) {
    return <IllustrationImage src={phone} alt={alt} {...props} />;
}
