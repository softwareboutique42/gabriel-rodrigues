import { createOutcomeFeedbackModel } from './outcome-feedback.ts';
import { createReelTimelineModel } from './reel-timeline.ts';
import type { SlotsVisualEventStore } from './events.ts';

export interface SlotsAnimationRuntimeMount {
  dispose: () => void;
}

const runtimes = new WeakMap<HTMLElement, SlotsAnimationRuntimeMount>();

function deleteDatasetKey(root: HTMLElement, key: string): void {
  delete root.dataset[key as keyof DOMStringMap];
}

function writeSnapshots(
  root: HTMLElement,
  timeline: ReturnType<typeof createReelTimelineModel>,
  feedback: ReturnType<typeof createOutcomeFeedbackModel>,
  sequence: number,
): void {
  const timelineSnapshot = timeline.snapshot();
  const feedbackSnapshot = feedback.snapshot();

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

export function mountSlotsAnimationRuntime(
  root: HTMLElement,
  visualEvents: SlotsVisualEventStore,
  signal?: AbortSignal,
): SlotsAnimationRuntimeMount {
  runtimes.get(root)?.dispose();

  const timeline = createReelTimelineModel();
  const feedback = createOutcomeFeedbackModel();
  let sequence = 0;
  let disposed = false;

  const unsubscribe = visualEvents.subscribe((event) => {
    if (disposed) return;

    timeline.onVisualEvent(event);
    feedback.onVisualEvent(event);
    sequence += 1;
    writeSnapshots(root, timeline, feedback, sequence);

    if (event.type === 'spin-accepted') {
      queueMicrotask(() => {
        if (disposed) return;
        timeline.advanceToSustain(event.spinIndex);
        writeSnapshots(root, timeline, feedback, sequence);
      });
    }
  });

  writeSnapshots(root, timeline, feedback, sequence);

  const runtime: SlotsAnimationRuntimeMount = {
    dispose() {
      if (disposed) return;
      disposed = true;
      unsubscribe();
      deleteDatasetKey(root, 'slotsAnimSpinIndex');
      deleteDatasetKey(root, 'slotsAnimResolvedSpinIndex');
      deleteDatasetKey(root, 'slotsAnimBlockedReason');
      root.dataset.slotsAnimState = 'idle';
      root.dataset.slotsAnimOutcome = 'idle';
      root.dataset.slotsAnimSeq = '0';
      runtimes.delete(root);
    },
  };

  if (signal) {
    signal.addEventListener('abort', () => runtime.dispose(), { once: true });
  }

  runtimes.set(root, runtime);
  return runtime;
}
