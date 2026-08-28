/**
 * App-wide brand + chrome content shared across views (header, announcement
 * bar, footer, auth shell). View-specific copy lives in each view's own content
 * module.
 */

/** A navigation or call-to-action target. */
export interface LinkItem {
    label: string;
    /** React Router path, hash anchor, `tel:` or `mailto:` URL. */
    href: string;
    /** Open in a new tab (external destinations). */
    external?: boolean;
}

export interface FooterColumn {
    heading: string;
    links: LinkItem[];
}

export const brand = {
    name: "Fundacja Peryskop",
    shortName: "Peryskop",
} as const;

/** Utility/announcement bar. */
export const announcement = {
    message: "W kryzysie? Inne formy pomocy (telefoniczne) - bezpłatne i anonimowe 24/7",
    contacts: [
        { label: "112 (pogotowie)", href: "tel:112" },
        { label: "116 123 (telefon zaufania)", href: "tel:116123" },
    ] satisfies LinkItem[],
} as const;

const footerColumns: FooterColumn[] = [
    {
        heading: "Nawigacja",
        links: [
            { label: "O nas", href: "/#about-us" },
            { label: "Artykuły", href: "/articles" },
            { label: "Wesprzyj nas", href: "/donations" },
        ],
    },
    {
        heading: "Pomoc",
        links: [
            { label: "112 (pogotowie)", href: "tel:112" },
            { label: "116 123 (telefon zaufania)", href: "tel:116123" },
            { label: "Regulamin", href: "/tos" },
            { label: "Polityka prywatności", href: "/tos" },
        ],
    },
    {
        heading: "Kontakt",
        links: [
            {
                label: "kontakt@fundacjaperyskop.org",
                href: "mailto:kontakt@fundacjaperyskop.org",
                external: true,
            },
        ],
    },
];

const footerSocials: LinkItem[] = [
    { label: "Facebook", href: "https://www.facebook.com/groups/1340769720143310", external: true },
    { label: "LinkedIn", href: "https://www.linkedin.com/company/fundacja-peryskop", external: true },
];

export const footer = {
    mission:
        "Tworzymy bezpieczną przestrzeń, w której każdy może uzyskać anonimowe wsparcie psychologiczne w formie czatu.",
    columns: footerColumns,
    socials: footerSocials,
    copyright: `© ${new Date().getFullYear()} ${brand.name}`,
};
