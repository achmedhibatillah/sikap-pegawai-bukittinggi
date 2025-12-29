export function truncateText(text: string, max: number): string {
    if (!text) return ""
    if (text.length <= max) return text
    return text.slice(0, max) + "..."
}
