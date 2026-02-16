/**
 * PostgreSQL LIKE/ILIKE 패턴에서 특수문자를 이스케이프합니다.
 * %, _, \ 문자를 백슬래시로 이스케이프하여 리터럴 문자로 처리합니다.
 */
export function escapeLikePattern(input: string): string {
  return input
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_");
}
