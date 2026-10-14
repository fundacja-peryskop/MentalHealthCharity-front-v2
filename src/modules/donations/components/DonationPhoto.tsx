import { Stack } from "@fundacja-peryskop/ui";

interface Props {
    /** Bundled image URL (imported `.webp`). */
    src: string;
    /** Localised, descriptive alt text. */
    alt: string;
    /**
     * CSS `aspect-ratio` for the framed photo (width / height). Portrait by
     * default so the tall source photos are shown at a controlled height rather
     * than running very long in a column.
     */
    ratio?: string;
    /** Caps the rendered width so a photo never outgrows its column. */
    maxWidth?: number;
}

/**
 * A single framed donations photo: rounded, softly bordered and shadowed, with
 * the image cropped to a fixed aspect ratio (`object-fit: cover`) so photos line
 * up tidily regardless of their intrinsic dimensions. Decorative-but-meaningful,
 * so it always carries real alt text and loads lazily.
 */
export function DonationPhoto({ src, alt, ratio = "4 / 5", maxWidth }: Props) {
    return (
        <Stack
            width="100%"
            maxWidth={maxWidth}
            alignSelf="center"
            borderRadius="$lg"
            overflow="hidden"
            borderWidth={1}
            borderColor="$borderColor"
            backgroundColor="$backgroundHover"
            style={{ aspectRatio: ratio, boxShadow: "0 12px 32px rgba(9, 10, 10, 0.10)" }}
        >
            <img
                src={src}
                alt={alt}
                loading="lazy"
                decoding="async"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
        </Stack>
    );
}
