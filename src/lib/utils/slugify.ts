export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replaceAll(/[^\w\s-]/g, "")
    .trim()
    .replaceAll(/[\s_-]+/g, "-")
    .replaceAll(/^-+|-+$/g, "");
}
