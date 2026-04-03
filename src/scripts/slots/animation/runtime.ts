import { createSlotsAtlasRegistry, snapshotSlotsAtlasRegistry } from './atlas-registry.ts';
import { createIdleMotionModel } from './idle-motion.ts';
import { createOutcomeFeedbackModel } from './outcome-feedback.ts';
import { createReelTimelineModel } from './reel-timeline.ts';
import { REQUIRED_SYMBOL_FRAME_KEYS, snapshotSymbolFrameMap } from './symbol-frame-map.ts';
import { createIdleSymbolStates, createSymbolStatesModel } from './symbol-states.ts';
import {
  createSlotsThemeRegistry,
  DEFAULT_SLOTS_THEMES,
  snapshotSlotsTheme,
} from './theme-registry.ts';
import { resolveSlotsThemeSelection } from './theme-selection.ts';
import type { SlotsVisualEvent, SlotsVisualEventStore } from './events.ts';

export interface SlotsAnimationRuntimeMount {
  dispose: () => void;
}

const runtimes = new WeakMap<HTMLElement, SlotsAnimationRuntimeMount>();

const THEME_REGISTRY = createSlotsThemeRegistry(DEFAULT_SLOTS_THEMES, 'slots-core-v1');

const DEFAULT_SYMBOL_STATES = JSON.stringify(createIdleSymbolStates());

function getDefaultThemeId(): string {
  return THEME_REGISTRY.defaultThemeId;
}

function getDefaultThemeAtlasId(): string {
  return THEME_REGISTRY.resolveTheme(getDefaultThemeId()).atlasId;
}

function createAtlasRegistryForTheme(themeAtlasId: string) {
  return createSlotsAtlasRegistry(
    {
      atlasId: themeAtlasId,
      frameKeys: REQUIRED_SYMBOL_FRAME_KEYS,
    },
    REQUIRED_SYMBOL_FRAME_KEYS,
  );
}

function getLocationSearch(): string {
  if (typeof window === 'undefined') return '';
  return window.location.search;
}

function writeThemeSnapshot(root: HTMLElement, themeId: string): void {
  root.dataset.slotsAnimTheme = themeId;
}

function writeSymbolStatesSnapshot(
  root: HTMLElement,
  symbolStates: ReturnType<typeof createSymbolStatesModel>,
): void {
  const symbolSnapshot = symbolStates.snapshot();
  root.dataset.slotsAnimSymbolStates = JSON.stringify(symbolSnapshot.symbols);

  if (symbolSnapshot.spinIndex === null) {
    deleteDatasetKey(root, 'slotsAnimSymbolStateSpinIndex');
  } else {
    root.dataset.slotsAnimSymbolStateSpinIndex = String(symbolSnapshot.spinIndex);
  }
}

function writeSymbolMapSnapshot(root: HTMLElement): void {
  root.dataset.slotsAnimSymbolMap = JSON.stringify(snapshotSymbolFrameMap());
}

function writeAtlasSnapshot(
  root: HTMLElement,
  atlasRegistry: ReturnType<typeof createSlotsAtlasRegistry>,
): void {
  const atlasSnapshot = snapshotSlotsAtlasRegistry(atlasRegistry);
  root.dataset.slotsAnimAtlas = atlasSnapshot.ready ? 'ready' : 'missing';
  root.dataset.slotsAnimAtlasId = atlasSnapshot.atlasId;

  if (atlasSnapshot.missing.length === 0) {
    deleteDatasetKey(root, 'slotsAnimAtlasMissing');
  } else {
    root.dataset.slotsAnimAtlasMissing = atlasSnapshot.missing.join(',');
  }
}

function writeBaseSnapshots(
  root: HTMLElement,
  atlasRegistry: ReturnType<typeof createSlotsAtlasRegistry>,
  symbolStates: ReturnType<typeof createSymbolStatesModel>,
  themeId: string,
): void {
  writeThemeSnapshot(root, themeId);
  writeAtlasSnapshot(root, atlasRegistry);
  writeSymbolStatesSnapshot(root, symbolStates);
  writeSymbolMapSnapshot(root);
}

function resetRuntimeDatasets(root: HTMLElement): void {
  deleteDatasetKey(root, 'slotsAnimSpinIndex');
  deleteDatasetKey(root, 'slotsAnimResolvedSpinIndex');
  deleteDatasetKey(root, 'slotsAnimBlockedReason');
  deleteDatasetKey(root, 'slotsAnimAtlasMissing');
  deleteDatasetKey(root, 'slotsAnimSymbolStateSpinIndex');
  root.dataset.slotsAnimState = 'idle';
  root.dataset.slotsAnimOutcome = 'idle';
  root.dataset.slotsAnimIdle = 'idle-pulse';
  root.dataset.slotsAnimAtlas = 'ready';
  root.dataset.slotsAnimAtlasId = getDefaultThemeAtlasId();
  root.dataset.slotsAnimTheme = getDefaultThemeId();
  root.dataset.slotsAnimSymbolStates = DEFAULT_SYMBOL_STATES;
  writeSymbolMapSnapshot(root);
  root.dataset.slotsAnimSeq = '0';
}

function writeRuntimeSnapshots(
  root: HTMLElement,
  atlasRegistry: ReturnType<typeof createSlotsAtlasRegistry>,
  symbolStates: ReturnType<typeof createSymbolStatesModel>,
  themeId: string,
  idleMotion: ReturnType<typeof createIdleMotionModel>,
  timeline: ReturnType<typeof createReelTimelineModel>,
  feedback: ReturnType<typeof createOutcomeFeedbackModel>,
  sequence: number,
) {
  writeBaseSnapshots(root, atlasRegistry, symbolStates, themeId);
  const idleSnapshot = idleMotion.snapshot();
  const timelineSnapshot = timeline.snapshot();
  const feedbackSnapshot = feedback.snapshot();

  root.dataset.slotsAnimIdle = idleSnapshot.state;
  root.dataset.slotsAnimState = timelineSnapshot.phase;
  root.dataset.slotsAnimOutcome = feedbackSnapshot.status;
  root.dataset.slotsAnimSeq = String(sequence);

  if (timelineSnapshot.activeSpinIndex === null) {
    deleteDatasetKey(root, 'slotsAnimSpinIndex');
  } else {
    root.dataset.slotsAnimSpinIndex = String(timelineSnapshot.activeSpinIndex);
  }

  if (timelineSnapshot.lastResolvedSpinIndex === null) {
    deleteDatasetKey(root, 'slotsAnimResolvedSpinIndex');
  } else {
    root.dataset.slotsAnimResolvedSpinIndex = String(timelineSnapshot.lastResolvedSpinIndex);
  }

  if (timelineSnapshot.blockedReason === null) {
    deleteDatasetKey(root, 'slotsAnimBlockedReason');
  } else {
    root.dataset.slotsAnimBlockedReason = timelineSnapshot.blockedReason;
  }
}

function createThemeRuntimeBindings(root: HTMLElement) {
  const theme = resolveSlotsThemeSelection(root, THEME_REGISTRY, getLocationSearch());
  const atlasRegistry = createAtlasRegistryForTheme(theme.atlasId);

  return {
    themeSnapshot: snapshotSlotsTheme(theme),
    atlasRegistry,
  };
}

function createRuntimeModels() {
  return {
    symbolStates: createSymbolStatesModel(),
    idleMotion: createIdleMotionModel(),
    timeline: createReelTimelineModel(),
    feedback: createOutcomeFeedbackModel(),
  };
}

function applyVisualEventToModels(
  models: ReturnType<typeof createRuntimeModels>,
  event: Readonly<SlotsVisualEvent>,
) {
  models.symbolStates.onVisualEvent(event);
  models.timeline.onVisualEvent(event);
  models.feedback.onVisualEvent(event);
  models.idleMotion.onVisualEvent(event);
}

function scheduleSustainAdvance(
  models: ReturnType<typeof createRuntimeModels>,
  spinIndex: number,
  callback: () => void,
) {
  queueMicrotask(() => {
    models.timeline.advanceToSustain(spinIndex);
    callback();
  });
}

function deleteDatasetKey(root: HTMLElement, key: string): void {
  delete root.dataset[key as keyof DOMStringMap];
}

function writeSnapshots(
  root: HTMLElement,
  atlasRegistry: ReturnType<typeof createSlotsAtlasRegistry>,
  symbolStates: ReturnType<typeof createSymbolStatesModel>,
  themeId: string,
  idleMotion: ReturnType<typeof createIdleMotionModel>,
  timeline: ReturnType<typeof createReelTimelineModel>,
  feedback: ReturnType<typeof createOutcomeFeedbackModel>,
  sequence: number,
): void {
  writeRuntimeSnapshots(
    root,
    atlasRegistry,
    symbolStates,
    themeId,
    idleMotion,
    timeline,
    feedback,
    sequence,
  );
}

export function mountSlotsAnimationRuntime(
  root: HTMLElement,
  visualEvents: SlotsVisualEventStore,
  signal?: AbortSignal,
): SlotsAnimationRuntimeMount {
  runtimes.get(root)?.dispose();

  const { atlasRegistry, themeSnapshot } = createThemeRuntimeBindings(root);
  const models = createRuntimeModels();
  let sequence = 0;
  let disposed = false;

  const unsubscribe = visualEvents.subscribe((event) => {
    if (disposed) return;

    applyVisualEventToModels(models, event);
    sequence += 1;
    writeSnapshots(
      root,
      atlasRegistry,
      models.symbolStates,
      themeSnapshot.id,
      models.idleMotion,
      models.timeline,
      models.feedback,
      sequence,
    );

    if (event.type === 'spin-accepted') {
      scheduleSustainAdvance(models, event.spinIndex, () => {
        if (disposed) return;
        writeSnapshots(
          root,
          atlasRegistry,
          models.symbolStates,
          themeSnapshot.id,
          models.idleMotion,
          models.timeline,
          models.feedback,
          sequence,
        );
      });
    }
  });

  writeSnapshots(
    root,
    atlasRegistry,
    models.symbolStates,
    themeSnapshot.id,
    models.idleMotion,
    models.timeline,
    models.feedback,
    sequence,
  );

  const runtime: SlotsAnimationRuntimeMount = {
    dispose() {
      if (disposed) return;
      disposed = true;
      unsubscribe();
      resetRuntimeDatasets(root);
      runtimes.delete(root);
    },
  };

  if (signal) {
    signal.addEventListener('abort', () => runtime.dispose(), { once: true });
  }

  runtimes.set(root, runtime);
  return runtime;
}
