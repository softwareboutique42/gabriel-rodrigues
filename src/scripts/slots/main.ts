import { mountSlotsController } from './controller.ts';
import {
  mountSlotsAnimationRuntime,
  type SlotsAnimationRuntimeMount,
} from './animation/runtime.ts';

let controller: AbortController | null = null;
let runtime: SlotsAnimationRuntimeMount | null = null;

function normalizeThemeLabel(themeId: string): string {
  if (themeId === 'slots-neon-v1') return 'NEON V1';
  if (themeId === 'slots-core-v1') return 'CORE V1';
  return themeId
    .replace(/^slots-/, '')
    .replace(/-/g, ' ')
    .toUpperCase();
}

function mountSlotsMenu(root: HTMLElement, signal: AbortSignal): void {
  const menuToggle = root.querySelector<HTMLElement>('[data-slots-menu-toggle]');
  const menu = root.querySelector<HTMLElement>('[data-slots-menu]');

  const routesValue = root.querySelector<HTMLElement>('[data-slots-menu-routes]');
  const motionValue = root.querySelector<HTMLElement>('[data-slots-menu-motion]');
  const themeValue = root.querySelector<HTMLElement>('[data-slots-menu-theme]');

  const syncMenuValues = () => {
    if (routesValue) routesValue.textContent = 'EN / PT';
    if (motionValue) {
      motionValue.textContent = (
        root.dataset.slotsAnimIntensity ??
        root.dataset.slotsMotion ??
        'full'
      ).toUpperCase();
    }
    if (themeValue) {
      themeValue.textContent = normalizeThemeLabel(
        root.dataset.slotsAnimTheme ?? root.dataset.slotsTheme ?? 'slots-core-v1',
      );
    }
  };

  syncMenuValues();

  if (!menuToggle || !menu) return;

  const setOpen = (open: boolean) => {
    root.dataset.slotsMenuOpen = open ? 'true' : 'false';
    menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
  };

  setOpen(false);

  menuToggle.addEventListener(
    'click',
    () => {
      const open = root.dataset.slotsMenuOpen !== 'true';
      setOpen(open);
    },
    { signal },
  );

  document.addEventListener(
    'click',
    (event) => {
      if (root.dataset.slotsMenuOpen !== 'true') return;
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (!menu.contains(target) && !menuToggle.contains(target)) {
        setOpen(false);
      }
    },
    { signal, capture: true },
  );

  document.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    },
    { signal },
  );

  const observer = new MutationObserver(() => syncMenuValues());
  observer.observe(root, {
    attributes: true,
    attributeFilter: ['data-slots-anim-intensity', 'data-slots-anim-theme'],
  });
  signal.addEventListener('abort', () => observer.disconnect(), { once: true });
}

export function initSlotsShell(): void {
  // Abort previous listeners to prevent duplicates after SPA navigation.
  if (controller) controller.abort();
  if (runtime) runtime.dispose();
  controller = new AbortController();
  const { signal } = controller;

  const root = document.getElementById('slots-shell-root');
  if (!root) return;

  mountSlotsMenu(root, signal);

  const host = new URLSearchParams(window.location.search).get('host');
  const hostMode = host === 'casinocraftz' ? 'casinocraftz' : 'standalone';
  root.dataset.slotsHost = hostMode;

  let dampened = false;
  try {
    dampened = sessionStorage.getItem('ccz:dampened') === '1';
  } catch {
    // sessionStorage unavailable (private browsing) — default to undampened.
  }
  root.dataset.slotsAnimDampened = dampened ? 'true' : 'false';

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
        window.parent.postMessage(
          { type: 'ccz:spin-settled', version: 1, payload: { spinIndex: event.spinIndex } },
          '*',
        );
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
