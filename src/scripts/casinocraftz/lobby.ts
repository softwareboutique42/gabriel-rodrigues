import { depositEssence, loadWallet, saveWallet } from './wallet.ts';

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

  // Deposit modal open/close
  root.querySelector('[data-ccz-deposit-trigger]')?.addEventListener('click', () => {
    if (modal instanceof HTMLElement) modal.removeAttribute('hidden');
    const firstAmount = modal?.querySelector<HTMLButtonElement>('[data-ccz-deposit-amount]');
    firstAmount?.focus();
  });

  root.querySelector('[data-ccz-deposit-close]')?.addEventListener('click', () => {
    if (modal instanceof HTMLElement) modal.setAttribute('hidden', '');
  });

  // Close modal on backdrop click
  modal?.addEventListener('click', (e) => {
    if (e.target === modal && modal instanceof HTMLElement) {
      modal.setAttribute('hidden', '');
    }
  });

  // Close modal on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal instanceof HTMLElement && !modal.hasAttribute('hidden')) {
      modal.setAttribute('hidden', '');
    }
  });

  // Amount selection
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

  // Select first amount by default
  const defaultBtn = amountButtons[0];
  if (defaultBtn instanceof HTMLElement) {
    selectedAmount = Number(defaultBtn.dataset.cczDepositAmount) || 100;
    defaultBtn.classList.add('ccz-deposit-amount--selected');
  }

  // Confirm deposit
  root.querySelector('[data-ccz-deposit-confirm]')?.addEventListener('click', () => {
    wallet = depositEssence(wallet, selectedAmount);
    saveWallet(wallet);
    renderBalance();
    if (modal instanceof HTMLElement) modal.setAttribute('hidden', '');
  });

  // Sync balance when wallet is updated from another module (e.g., after returning from slots)
  window.addEventListener('ccz:wallet-updated', (e) => {
    const detail = (e as CustomEvent<{ balance: number }>).detail;
    if (typeof detail?.balance === 'number') {
      wallet = { balance: detail.balance };
      renderBalance();
    }
  });

  // Cross-tab sync via storage event
  window.addEventListener('storage', (e) => {
    if (e.key === 'ccz-wallet') {
      wallet = loadWallet();
      renderBalance();
    }
  });
  mountMissionLog();
  mountAnalyzerDrawer();

  renderBalance();
}

export function mountMissionLog(): void {
  const root = document.querySelector('[data-casinocraftz-shell-root]');
  if (!(root instanceof HTMLElement)) return;

  const toggle = root.querySelector('[data-ccz-mission-log-toggle]');
  const content = root.querySelector('[data-ccz-mission-log-content]');

  if (!(toggle instanceof HTMLElement) || !(content instanceof HTMLElement)) return;

  const storageKey = 'ccz-mission-log-open';

  function updateLabelAndState(): void {
    const isOpen = !content.hasAttribute('hidden');
    const label = isOpen ? toggle.dataset.labelClose : toggle.dataset.labelOpen;
    if (label) toggle.textContent = label;
  }

  // Restore state from sessionStorage
  const saved = sessionStorage.getItem(storageKey);
  if (saved === 'true') {
    content.removeAttribute('hidden');
  }

  updateLabelAndState();

  toggle.addEventListener('click', () => {
    if (content.hasAttribute('hidden')) {
      content.removeAttribute('hidden');
      sessionStorage.setItem(storageKey, 'true');
    } else {
      content.setAttribute('hidden', '');
      sessionStorage.setItem(storageKey, 'false');
    }
    updateLabelAndState();
  });
}

export function mountAnalyzerDrawer(): void {
  const root = document.querySelector('[data-casinocraftz-shell-root]');
  if (!(root instanceof HTMLElement)) return;

  const toggle = root.querySelector('[data-ccz-analyzer-toggle]');
  const drawer = root.querySelector('[data-ccz-analyzer-drawer]');

  if (!(toggle instanceof HTMLElement) || !(drawer instanceof HTMLElement)) return;

  const storageKey = 'ccz-analyzer-open';

  function updateLabelAndState(): void {
    const isOpen = !drawer.hasAttribute('hidden');
    const label = isOpen ? toggle.dataset.labelClose : toggle.dataset.labelOpen;
    if (label) toggle.textContent = label;
  }

  // On desktop, always show (CSS handles it)
  // On mobile, restore state from sessionStorage (default: hidden)
  const isDesktop = window.innerWidth >= 640;
  if (!isDesktop) {
    const saved = sessionStorage.getItem(storageKey);
    if (saved === 'true') {
      drawer.removeAttribute('hidden');
    }
  }

  updateLabelAndState();

  toggle.addEventListener('click', () => {
    if (drawer.hasAttribute('hidden')) {
      drawer.removeAttribute('hidden');
      sessionStorage.setItem(storageKey, 'true');
    } else {
      drawer.setAttribute('hidden', '');
      sessionStorage.setItem(storageKey, 'false');
    }
    updateLabelAndState();
  });

  // Handle window resize: show drawer on desktop, respect sessionStorage on mobile
  window.addEventListener('resize', () => {
    const nowDesktop = window.innerWidth >= 640;
    if (nowDesktop && drawer.hasAttribute('hidden')) {
      drawer.removeAttribute('hidden');
    }
  });
}
