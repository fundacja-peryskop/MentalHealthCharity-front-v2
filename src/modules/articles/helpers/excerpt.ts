/** Strip Markdown syntax so an article body can be shown as a plain-text excerpt. */
export function toExcerpt(markdown: string, length = 120): string {
    const plain = markdown
        .replace(/[#*_~`>[\]()!|-]/g, "")
        .replace(/\n+/g, " ")
        .trim();
    return plain.length > length ? `${plain.slice(0, length)}…` : plain;
}
