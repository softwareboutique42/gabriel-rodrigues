export type SlotsMotionIntensity = 'full' | 'reduced' | 'minimal';

export interface SlotsMotionPolicySnapshot {
  requestedIntensity: SlotsMotionIntensity;
  effectiveIntensity: SlotsMotionIntensity;
  reducedMotion: boolean;
  source: 'query' | 'dataset' | 'default';
}

const QUERY_PARAM = 'slotsMotion';

function parseIntensity(value: string | null | undefined): SlotsMotionIntensity | null {
  if (!value) return null;

  const normalized = value.trim().toLowerCase();
  if (normalized === 'full' || normalized === 'reduced' || normalized === 'minimal') {
    return normalized;
  }

  return null;
}

function resolveRequestedIntensity(
  root: HTMLElement,
  search: string,
): {
  intensity: SlotsMotionIntensity;
  source: SlotsMotionPolicySnapshot['source'];
} {
  const query = new URLSearchParams(search);
  const queryValue = parseIntensity(query.get(QUERY_PARAM));
  if (queryValue) {
    return {
      intensity: queryValue,
      source: 'query',
    };
  }

  const datasetValue = parseIntensity(root.dataset.slotsMotion);
  if (datasetValue) {
    return {
      intensity: datasetValue,
      source: 'dataset',
    };
  }

  return {
    intensity: 'full',
    source: 'default',
  };
}

export function resolveSlotsMotionPolicy(
  root: HTMLElement,
  search: string,
  prefersReducedMotion: boolean,
): SlotsMotionPolicySnapshot {
  const requested = resolveRequestedIntensity(root, search);

  if (!prefersReducedMotion) {
    return {
      requestedIntensity: requested.intensity,
      effectiveIntensity: requested.intensity,
      reducedMotion: false,
      source: requested.source,
    };
  }

  return {
    requestedIntensity: requested.intensity,
    effectiveIntensity: requested.intensity === 'full' ? 'reduced' : 'minimal',
    reducedMotion: true,
    source: requested.source,
  };
}
