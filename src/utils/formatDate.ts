export function formatDateTime(isoString: string): string {
    if (!isoString) return '';
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return isoString; // fallback if parsing fails
    return d.toLocaleString();
}