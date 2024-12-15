import { Category } from "@/types/category";

// Implementa o algoritmo de Levenshtein Distance para encontrar similaridade entre strings
export function levenshteinDistance(a: string, b: string): number {
  const matrix = Array(b.length + 1)
    .fill(null)
    .map(() => Array(a.length + 1).fill(null));

  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + substitutionCost // substitution
      );
    }
  }

  return matrix[b.length][a.length];
}

export function findSimilarCategory(
  input: string,
  categories: Category[],
  threshold = 0.7
): Category | undefined {
  const normalizedInput = input.toLowerCase().trim();

  let bestMatch: Category | undefined;
  let bestScore = Infinity;

  for (const category of categories) {
    const normalizedName = category.name.toLowerCase();
    const distance = levenshteinDistance(normalizedInput, normalizedName);
    const maxLength = Math.max(normalizedInput.length, normalizedName.length);
    const similarity = 1 - distance / maxLength;

    if (similarity > threshold && distance < bestScore) {
      bestScore = distance;
      bestMatch = category;
    }
  }

  return bestMatch;
}
