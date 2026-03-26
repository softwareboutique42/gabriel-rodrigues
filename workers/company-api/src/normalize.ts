export function normalizeCompanyName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

export function cacheKey(name: string, version: string = 'v1'): string {
  return `${version}:${normalizeCompanyName(name)}`;
}
