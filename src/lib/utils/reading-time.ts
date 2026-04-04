const WORDS_PER_MINUTE = 220;

export function calculateReadingTime(markdown: string): number {
  const normalized = markdown
    .replaceAll(/```[\s\S]*?```/g, " ")
    .replaceAll(/`[^`]*`/g, " ")
    .replaceAll(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replaceAll(/\[[^\]]*]\([^)]*\)/g, " ")
    .replaceAll(/[>#*_~-]/g, " ")
    .replaceAll(/\s+/g, " ")
    .trim();

  if (!normalized) {
    return 1;
  }

  return Math.max(1, Math.ceil(normalized.split(" ").length / WORDS_PER_MINUTE));
}
