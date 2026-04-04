const WALLET_KEY = 'ccz-wallet';
const DEFAULT_BALANCE = 100;

export interface WalletState {
  balance: number;
}

export function loadWallet(): WalletState {
  try {
    const raw = localStorage.getItem(WALLET_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      if (
        parsed !== null &&
        typeof parsed === 'object' &&
        'balance' in parsed &&
        typeof (parsed as Record<string, unknown>)['balance'] === 'number'
      ) {
        return { balance: (parsed as { balance: number }).balance };
      }
    }
  } catch {
    // ignore parse errors — return default
  }
  return { balance: DEFAULT_BALANCE };
}

export function saveWallet(state: WalletState): void {
  localStorage.setItem(WALLET_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent('ccz:wallet-updated', { detail: state }));
}

export function depositEssence(state: WalletState, amount: number): WalletState {
  return { balance: state.balance + amount };
}

export function spendEssenceWallet(state: WalletState, amount: number): WalletState {
  if (state.balance < amount) {
    throw new Error('Insufficient essence');
  }
  return { balance: state.balance - amount };
}
