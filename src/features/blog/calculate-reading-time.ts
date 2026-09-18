export function calculateReadingTime(text: string): number {
  const normalizedText = text.trim();
  if (!normalizedText) return 1;

  const wordCount = normalizedText.split(/\s+/u).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}
