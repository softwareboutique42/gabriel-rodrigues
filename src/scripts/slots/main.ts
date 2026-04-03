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

  const host = new URLSearchParams(window.location.search).get('host');
  const hostMode = host === 'casinocraftz' ? 'casinocraftz' : 'standalone';
  root.dataset.slotsHost = hostMode;

  const houseEdgeLesson = root.querySelector('[data-slots-lesson="house-edge"]');
  if (houseEdgeLesson instanceof HTMLElement) {
    const isEmbeddedHost = hostMode === 'casinocraftz';
    houseEdgeLesson.classList.toggle('hidden', !isEmbeddedHost);
    houseEdgeLesson.setAttribute('aria-hidden', isEmbeddedHost ? 'false' : 'true');
  }

  const status = document.getElementById('slots-shell-status');
  if (status) {
    status.setAttribute('data-lifecycle', 'active');
  }

  const mountedController = mountSlotsController(root, signal);
  runtime = mountSlotsAnimationRuntime(root, mountedController.visualEvents, signal);

  if (hostMode === 'casinocraftz') {
    const unsubscribe = mountedController.visualEvents.subscribe((event) => {
      if (event.type !== 'spin-resolved') {
        return;
      }

      try {
        window.parent.postMessage({ type: 'ccz:spin-settled', spinIndex: event.spinIndex }, '*');
      } catch {
        // Cross-origin message failures should not crash runtime.
      }
    });

    signal.addEventListener('abort', () => unsubscribe(), { once: true });
  }

  document.addEventListener(
    'astro:before-swap',
    () => {
      runtime?.dispose();
      controller?.abort();
    },
    { once: true, signal },
  );
}
