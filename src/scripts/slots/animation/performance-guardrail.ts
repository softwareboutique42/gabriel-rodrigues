import type { SlotsMotionIntensity } from './motion-policy.ts';

export interface SlotsPerformanceSnapshot {
  status: 'ok' | 'degraded';
  intensityOverride: SlotsMotionIntensity | null;
  lastSampleMs: number | null;
}

export interface SlotsPerformanceGuardrailModel {
  onSample: (durationMs: number) => void;
  snapshot: () => SlotsPerformanceSnapshot;
}

export interface SlotsPerformanceGuardrailOptions {
  warnThresholdMs?: number;
  criticalThresholdMs?: number;
  recoverSamples?: number;
}

export function createSlotsPerformanceGuardrailModel(
  options: SlotsPerformanceGuardrailOptions = {},
): SlotsPerformanceGuardrailModel {
  const warnThresholdMs = options.warnThresholdMs ?? 8;
  const criticalThresholdMs = options.criticalThresholdMs ?? 14;
  const recoverSamples = options.recoverSamples ?? 5;

  let snapshot: SlotsPerformanceSnapshot = {
    status: 'ok',
    intensityOverride: null,
    lastSampleMs: null,
  };

  let consecutiveHealthySamples = 0;

  return {
    onSample(durationMs) {
      if (!Number.isFinite(durationMs) || durationMs < 0) return;

      snapshot = {
        ...snapshot,
        lastSampleMs: durationMs,
      };

      if (durationMs >= criticalThresholdMs) {
        consecutiveHealthySamples = 0;
        snapshot = {
          status: 'degraded',
          intensityOverride: 'minimal',
          lastSampleMs: durationMs,
        };
        return;
      }

      if (durationMs >= warnThresholdMs) {
        consecutiveHealthySamples = 0;
        snapshot = {
          status: 'degraded',
          intensityOverride: snapshot.intensityOverride === 'minimal' ? 'minimal' : 'reduced',
          lastSampleMs: durationMs,
        };
        return;
      }

      consecutiveHealthySamples += 1;
      if (consecutiveHealthySamples < recoverSamples) {
        return;
      }

      snapshot = {
        status: 'ok',
        intensityOverride: null,
        lastSampleMs: durationMs,
      };
    },
    snapshot() {
      return { ...snapshot };
    },
  };
}
