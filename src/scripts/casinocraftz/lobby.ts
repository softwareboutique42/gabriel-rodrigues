import { depositEssence, loadWallet, saveWallet } from './wallet.ts';

const MISSION_LOG_KEY = 'ccz-mission-log-open';
const ANALYZER_KEY = 'ccz-analyzer-open';
const DAMPENER_KEY = 'ccz:dampened';

export function mountLobby(): void {
  const root = document.querySelector('[data-casinocraftz-shell-root]');
  if (!(root instanceof HTMLElement)) return;

  let wallet = loadWallet();
  const balanceEl = root.querySelector('[data-ccz-lobby-balance]');
  const modal = root.querySelector('[data-ccz-deposit-modal]');

  function renderBalance(): void {
    if (balanceEl instanceof HTMLElement) {
      balanceEl.textContent = String(wallet.balance);
    }
  }

  root.querySelector('[data-ccz-deposit-trigger]')?.addEventListener('click', () => {
    if (modal instanceof HTMLElement) modal.removeAttribute('hidden');
    const firstAmount = modal?.querySelector<HTMLButtonElement>('[data-ccz-deposit-amount]');
    firstAmount?.focus();
  });

  root.querySelector('[data-ccz-deposit-close]')?.addEventListener('click', () => {
    if (modal instanceof HTMLElement) modal.setAttribute('hidden', '');
  });

  modal?.addEventListener('click', (e) => {
    if (e.target === modal && modal instanceof HTMLElement) {
      modal.setAttribute('hidden', '');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal instanceof HTMLElement && !modal.hasAttribute('hidden')) {
      modal.setAttribute('hidden', '');
    }
  });

  let selectedAmount = 100;
  const amountButtons = root.querySelectorAll<HTMLButtonElement>('[data-ccz-deposit-amount]');

  function highlightAmount(selected: HTMLElement): void {
    amountButtons.forEach((btn) => btn.classList.remove('ccz-deposit-amount--selected'));
    selected.classList.add('ccz-deposit-amount--selected');
  }

  amountButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const amount = Number(btn.dataset.cczDepositAmount);
      if (Number.isFinite(amount) && amount > 0) {
        selectedAmount = amount;
        highlightAmount(btn);
      }
    });
  });

  const defaultBtn = amountButtons[0];
  if (defaultBtn instanceof HTMLElement) {
    selectedAmount = Number(defaultBtn.dataset.cczDepositAmount) || 100;
    defaultBtn.classList.add('ccz-deposit-amount--selected');
  }

  root.querySelector('[data-ccz-deposit-confirm]')?.addEventListener('click', () => {
    wallet = depositEssence(wallet, selectedAmount);
    saveWallet(wallet);
    renderBalance();
    if (modal instanceof HTMLElement) modal.setAttribute('hidden', '');
  });

  window.addEventListener('ccz:wallet-updated', (e) => {
    const detail = (e as CustomEvent<{ balance: number }>).detail;
    if (typeof detail?.balance === 'number') {
      wallet = { balance: detail.balance };
      renderBalance();
    }
  });

  window.addEventListener('storage', (e) => {
    if (e.key === 'ccz-wallet') {
      wallet = loadWallet();
      renderBalance();
    }
  });

  mountMissionLog(root);
  mountAnalyzerDrawer(root);
  mountChamberVisualSystem(root);

  renderBalance();
}

function mountMissionLog(root: HTMLElement): void {
  const toggle = root.querySelector('[data-ccz-mission-log-toggle]');
  const content = root.querySelector('[data-ccz-mission-log-content]');
  if (!(toggle instanceof HTMLElement) || !(content instanceof HTMLElement)) return;

  const saved = sessionStorage.getItem(MISSION_LOG_KEY);
  if (saved === 'true') {
    content.removeAttribute('hidden');
  }

  const sync = () => {
    const isOpen = !content.hasAttribute('hidden');
    const label = isOpen ? toggle.dataset.labelClose : toggle.dataset.labelOpen;
    if (label) toggle.textContent = label;
  };

  sync();

  toggle.addEventListener('click', () => {
    if (content.hasAttribute('hidden')) {
      content.removeAttribute('hidden');
      sessionStorage.setItem(MISSION_LOG_KEY, 'true');
    } else {
      content.setAttribute('hidden', '');
      sessionStorage.setItem(MISSION_LOG_KEY, 'false');
    }
    sync();
  });
}

function mountAnalyzerDrawer(root: HTMLElement): void {
  const toggle = root.querySelector('[data-ccz-analyzer-toggle]');
  const drawer = root.querySelector('[data-ccz-analyzer-drawer]');
  if (!(toggle instanceof HTMLElement) || !(drawer instanceof HTMLElement)) return;

  const sync = () => {
    const isOpen = !drawer.hasAttribute('hidden');
    const label = isOpen ? toggle.dataset.labelClose : toggle.dataset.labelOpen;
    if (label) toggle.textContent = label;
  };

  if (window.innerWidth < 640 && sessionStorage.getItem(ANALYZER_KEY) === 'true') {
    drawer.removeAttribute('hidden');
  }

  sync();

  toggle.addEventListener('click', () => {
    if (drawer.hasAttribute('hidden')) {
      drawer.removeAttribute('hidden');
      sessionStorage.setItem(ANALYZER_KEY, 'true');
    } else {
      drawer.setAttribute('hidden', '');
      sessionStorage.setItem(ANALYZER_KEY, 'false');
    }
    sync();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 640 && drawer.hasAttribute('hidden')) {
      drawer.removeAttribute('hidden');
      sync();
    }
  });
}

function mountChamberVisualSystem(root: HTMLElement): void {
  const signalEls = root.querySelectorAll<HTMLElement>('[data-ccz-telemetry-signal]');
  const edgeEls = root.querySelectorAll<HTMLElement>('[data-ccz-telemetry-edge]');
  const pulseEls = root.querySelectorAll<HTMLElement>('[data-ccz-telemetry-pulse]');
  if (signalEls.length === 0) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const signalFrames = ['▁▂▃▂', '▂▄▅▄', '▃▅▆▅', '▄▆▇▆'];
  let tick = 0;

  const applyDampenerVisualState = () => {
    const dampened = sessionStorage.getItem(DAMPENER_KEY) === '1';
    root.dataset.cczVibrance = dampened ? 'suppressed' : 'enabled';
  };

  const updateTelemetry = () => {
    tick += 1;
    const dampened = root.dataset.cczVibrance === 'suppressed';
    const pulseBase = dampened ? 26 : 34;
    const edgeBase = dampened ? 6.2 : 5.6;

    edgeEls.forEach((el, idx) => {
      const value = (edgeBase + ((tick + idx) % 3) * 0.3).toFixed(1);
      el.textContent = `${value}%`;
    });

    signalEls.forEach((el, idx) => {
      const frame = signalFrames[(tick + idx) % signalFrames.length];
      el.textContent = reducedMotion.matches ? 'stable' : frame;
    });

    pulseEls.forEach((el, idx) => {
      const value = pulseBase + ((tick + idx) % 5) * 7;
      el.textContent = `${value} ipm`;
    });
  };

  applyDampenerVisualState();
  updateTelemetry();

  window.addEventListener('storage', (e) => {
    if (e.key === DAMPENER_KEY) {
      applyDampenerVisualState();
      updateTelemetry();
    }
  });

  window.addEventListener('ccz:dampener-state', () => {
    applyDampenerVisualState();
    updateTelemetry();
  });

  reducedMotion.addEventListener('change', () => {
    updateTelemetry();
  });

  window.setInterval(updateTelemetry, 2500);
}
