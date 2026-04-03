import type { SlotsThemeDefinition, SlotsThemeRegistry } from './theme-registry.ts';

export function readRequestedThemeId(root: HTMLElement, locationSearch = ''): string | null {
  const queryTheme = new URLSearchParams(locationSearch).get('slotsTheme');
  if (queryTheme) return queryTheme;

  const datasetTheme = root.dataset.slotsTheme;
  return datasetTheme ?? null;
}

export function resolveSlotsThemeSelection(
  root: HTMLElement,
  registry: SlotsThemeRegistry,
  locationSearch = '',
): SlotsThemeDefinition {
  const requestedThemeId = readRequestedThemeId(root, locationSearch);
  return registry.resolveTheme(requestedThemeId);
}
