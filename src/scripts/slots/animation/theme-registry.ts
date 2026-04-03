export interface SlotsThemeDefinition {
  id: string;
  label: string;
  atlasId: string;
}

export interface SlotsThemeSnapshot {
  id: string;
  label: string;
  atlasId: string;
}

export interface SlotsThemeRegistry {
  defaultThemeId: string;
  getTheme: (themeId: string) => SlotsThemeDefinition | undefined;
  resolveTheme: (themeId?: string | null) => SlotsThemeDefinition;
  listThemeIds: () => string[];
}

export const DEFAULT_SLOTS_THEMES: readonly SlotsThemeDefinition[] = Object.freeze([
  {
    id: 'slots-core-v1',
    label: 'Core',
    atlasId: 'slots-core-v1',
  },
  {
    id: 'slots-neon-v1',
    label: 'Neon',
    atlasId: 'slots-neon-v1',
  },
]);

export function createSlotsThemeRegistry(
  themes: readonly SlotsThemeDefinition[],
  defaultThemeId: string,
): SlotsThemeRegistry {
  const byId = new Map(themes.map((theme) => [theme.id, Object.freeze({ ...theme })]));
  const defaultTheme = byId.get(defaultThemeId);

  if (!defaultTheme) {
    throw new Error(`Missing default theme: ${defaultThemeId}`);
  }

  return {
    defaultThemeId,
    getTheme(themeId) {
      return byId.get(themeId);
    },
    resolveTheme(themeId) {
      if (!themeId) return defaultTheme;
      return byId.get(themeId) ?? defaultTheme;
    },
    listThemeIds() {
      return [...byId.keys()];
    },
  };
}

export function snapshotSlotsTheme(theme: SlotsThemeDefinition): SlotsThemeSnapshot {
  return {
    id: theme.id,
    label: theme.label,
    atlasId: theme.atlasId,
  };
}
