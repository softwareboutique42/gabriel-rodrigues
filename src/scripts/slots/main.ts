let controller: AbortController | null = null;

export function initSlotsShell(): void {
  // Abort previous listeners to prevent duplicates after SPA navigation.
  if (controller) controller.abort();
  controller = new AbortController();
  const { signal } = controller;

  const root = document.getElementById('slots-shell-root');
  if (!root) return;

  const status = document.getElementById('slots-shell-status');
  if (status) {
    status.setAttribute('data-lifecycle', 'active');
  }

  document.addEventListener(
    'astro:before-swap',
    () => {
      controller?.abort();
    },
    { once: true, signal },
  );
}
