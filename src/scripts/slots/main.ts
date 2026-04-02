import { mountSlotsController } from './controller.ts';
import {
  mountSlotsAnimationRuntime,
  type SlotsAnimationRuntimeMount,
} from './animation/runtime.ts';

let controller: AbortController | null = null;
let runtime: SlotsAnimationRuntimeMount | null = null;

export function initSlotsShell(): void {
  // Abort previous listeners to prevent duplicates after SPA navigation.
  if (controller) controller.abort();
  if (runtime) runtime.dispose();
  controller = new AbortController();
  const { signal } = controller;

  const root = document.getElementById('slots-shell-root');
  if (!root) return;

  const status = document.getElementById('slots-shell-status');
  if (status) {
    status.setAttribute('data-lifecycle', 'active');
  }

  const mountedController = mountSlotsController(root, signal);
  runtime = mountSlotsAnimationRuntime(root, mountedController.visualEvents, signal);

  document.addEventListener(
    'astro:before-swap',
    () => {
      runtime?.dispose();
      controller?.abort();
    },
    { once: true, signal },
  );
}
