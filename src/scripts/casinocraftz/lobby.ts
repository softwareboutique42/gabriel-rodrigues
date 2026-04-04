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

  renderBalance();
}
