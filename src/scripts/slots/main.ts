import { mountTutorial } from '../casinocraftz/tutorial/main.ts';
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
  const menuToggles = root.querySelectorAll<HTMLElement>('[data-slots-menu-toggle]');
  const menuToggle = menuToggles[0] ?? null;
  const menu = root.querySelector<HTMLElement>('[data-slots-menu]');
  const drawerScroll = root.querySelector<HTMLElement>('.slots-shell__drawer-scroll');
  const menuBackdrop = root.querySelector<HTMLElement>('[data-slots-menu-backdrop]');
  const menuIcon = root.querySelector<HTMLElement>('[data-slots-menu-icon]');

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

  const getFocusableInMenu = (): HTMLElement[] => {
    if (!menu) return [];
    return Array.from(
      menu.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((el) => !el.hasAttribute('disabled'));
  };

  syncMenuValues();

  if (!menuToggle || !menu) return;

  const setOpen = (open: boolean, shouldFocusToggle = false) => {
    root.dataset.slotsMenuOpen = open ? 'true' : 'false';
    menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (menuBackdrop) menuBackdrop.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.classList.toggle('slots-drawer-open', open);
    if (menuIcon) menuIcon.textContent = open ? 'x' : '+';

    try {
      sessionStorage.setItem('ccz:slots-drawer-open', open ? 'true' : 'false');
    } catch {
      // sessionStorage unavailable (private browsing) — keep transient state only.
    }

    if (open) {
      menu.scrollTop = 0;
      if (drawerScroll) drawerScroll.scrollTop = 0;
      menu.focus();
    } else if (shouldFocusToggle) {
      menuToggle.focus();
    }
  };

  let initialOpen = false;
  try {
    initialOpen = sessionStorage.getItem('ccz:slots-drawer-open') === 'true';
  } catch {
    // sessionStorage unavailable.
  }
  setOpen(initialOpen);

  menuToggles.forEach((toggle) => {
    toggle.addEventListener(
      'click',
      () => {
        const open = root.dataset.slotsMenuOpen !== 'true';
        setOpen(open);
      },
      { signal },
    );
  });

  if (menuBackdrop) {
    menuBackdrop.addEventListener(
      'click',
      () => {
        if (root.dataset.slotsMenuOpen === 'true') setOpen(false, true);
      },
      { signal },
    );
  }

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
      if (event.key === 'Escape' && root.dataset.slotsMenuOpen === 'true') {
        event.preventDefault();
        setOpen(false, true);
        return;
      }

      if (event.key !== 'Tab' || root.dataset.slotsMenuOpen !== 'true') {
        return;
      }

      const focusable = getFocusableInMenu();
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (!menu.contains(active)) {
        event.preventDefault();
        first.focus();
        return;
      }

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
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

  const lang = window.location.pathname.startsWith('/pt/') ? 'pt' : 'en';
  mountTutorial({ lang });

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
      try {
        sessionStorage.removeItem('ccz:slots-drawer-open');
      } catch {
        // sessionStorage unavailable.
      }
    },
    { once: true, signal },
  );
}
