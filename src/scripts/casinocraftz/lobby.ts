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

  mountInfoButtons(root);

  renderBalance();
}

function mountInfoButtons(root: HTMLElement): void {
  const toggles = root.querySelectorAll<HTMLButtonElement>('[data-ccz-info-toggle]');
  toggles.forEach((btn) => {
    const targetId = btn.dataset.cczInfoToggle;
    if (!targetId) return;
    const popover = root.querySelector<HTMLElement>(`#${targetId}[data-ccz-info-popover]`);
    if (!popover) return;
    btn.addEventListener('click', () => {
      if (popover.hasAttribute('hidden')) {
        popover.removeAttribute('hidden');
      } else {
        popover.setAttribute('hidden', '');
      }
    });
  });
}
