export interface SlotsAtlasManifest {
  atlasId: string;
  frameKeys: readonly string[];
}

export interface SlotsAtlasRegistry {
  atlasId: string;
  isReady: () => boolean;
  hasFrame: (frameKey: string) => boolean;
  missingFrames: () => readonly string[];
}

export interface SlotsAtlasSnapshot {
  atlasId: string;
  ready: boolean;
  missing: readonly string[];
}

function dedupe(values: readonly string[]): string[] {
  return [...new Set(values)];
}

export function createSlotsAtlasRegistry(
  manifest: SlotsAtlasManifest,
  requiredFrames: readonly string[],
): SlotsAtlasRegistry {
  const frameSet = new Set(manifest.frameKeys);
  const missing = dedupe(requiredFrames.filter((frameKey) => !frameSet.has(frameKey)));

  return {
    atlasId: manifest.atlasId,
    isReady() {
      return missing.length === 0;
    },
    hasFrame(frameKey) {
      return frameSet.has(frameKey);
    },
    missingFrames() {
      return [...missing];
    },
  };
}

export function snapshotSlotsAtlasRegistry(registry: SlotsAtlasRegistry): SlotsAtlasSnapshot {
  return {
    atlasId: registry.atlasId,
    ready: registry.isReady(),
    missing: registry.missingFrames(),
  };
}
