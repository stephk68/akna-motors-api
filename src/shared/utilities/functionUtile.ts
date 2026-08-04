export function sanitizeString(str: string): string {
  return str ? str.trim() : '';
}

export function parseCsvParam(param?: string): string[] {
  if (!param) return [];
  return param
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}
