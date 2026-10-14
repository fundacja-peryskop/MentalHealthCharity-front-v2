import { Stack, type GetProps } from "@fundacja-peryskop/ui";

type StackProps = GetProps<typeof Stack>;

export interface IllustrationImageProps extends Omit<StackProps, "children"> {
    src: string;
    /**
     * Descriptive alternative text. Pass an empty string to mark the image
     * decorative (`alt=""` + `aria-hidden`) when a nearby heading already
     * conveys the meaning.
     */
    alt: string;
}

/**
 * Shared wrapper for the homepage's static illustration assets. Renders a
 * responsive `<img>` (`width: 100%`, intrinsic aspect ratio preserved) inside a
 * Tamagui frame so callers can position/size it with layout props. Each named
 * illustration composes this so an asset can be swapped in one place.
 */
export function IllustrationImage({ src, alt, ...frameProps }: IllustrationImageProps) {
    const decorative = alt === "";

    return (
        <Stack {...frameProps}>
            <img
                src={src}
                alt={alt}
                aria-hidden={decorative || undefined}
                style={{ width: "100%", height: "auto", display: "block" }}
            />
        </Stack>
    );
}
