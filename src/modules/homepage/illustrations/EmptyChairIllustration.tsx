import chair from "@/assets/static/homepage/chair.png";
import device from "@/assets/static/homepage/iphone-svg.png";
import { XStack } from "@fundacja-peryskop/ui";
import { IllustrationImage, type IllustrationImageProps } from "./IllustrationImage";

type Props = Omit<IllustrationImageProps, "src" | "alt"> & { alt?: string };

/**
 * §8 — "empty office chair + device" illustration for the "Chcę pomagać" pitch
 * card. Composes the chair with a smaller device mockup tucked beside it.
 */
export function EmptyChairIllustration({ alt = "", ...props }: Props) {
    return (
        <XStack alignItems="flex-end" justifyContent="center" gap="$sm" {...props}>
            <IllustrationImage src={chair} alt={alt} flex={1} maxWidth={180} />
            <IllustrationImage src={device} alt="" width={64} />
        </XStack>
    );
}
