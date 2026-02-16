/**
 * Escape special characters in SQL LIKE/ILIKE patterns.
 * Prevents user input from being interpreted as wildcards.
 */
export function escapeLikePattern(input: string): string {
  return input.replace(/%/g, "\\%").replace(/_/g, "\\_");
}
