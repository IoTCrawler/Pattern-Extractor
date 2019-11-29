export function compareDates(d1: Date, d2: Date): number {
    return d1.getTime() === d2.getTime() ? 0 : (d1 > d2 ? 1 : -1);
}