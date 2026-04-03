export const ANALYTICS_EVENT_NAMES = {
  PROJECTS_CTA_CLICK: 'projects_cta_click',
  SLOTS_SPIN_ATTEMPT: 'slots_spin_attempt',
  SLOTS_SPIN_RESOLVED: 'slots_spin_resolved',
  SLOTS_SPIN_BLOCKED: 'slots_spin_blocked',
} as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENT_NAMES)[keyof typeof ANALYTICS_EVENT_NAMES];

export interface AnalyticsEvent {
  name: AnalyticsEventName;
  route: string;
  locale: 'en' | 'pt';
  surface: 'projects' | 'slots';
  payload: Record<string, string | number | boolean>;
  ts: number;
}

type BrowserWindow = Window & {
  __ccAnalyticsEvents?: AnalyticsEvent[];
};

const STORAGE_KEY = 'cc.analytics.events';

function isBrowserWindow(value: unknown): value is BrowserWindow {
  return typeof window !== 'undefined' && value === window;
}

function toEvent(event: Omit<AnalyticsEvent, 'ts'> & { ts?: number }): AnalyticsEvent {
  return {
    ...event,
    ts: event.ts ?? Date.now(),
  };
}

function persistEvent(win: BrowserWindow, event: AnalyticsEvent): void {
  try {
    const raw = win.sessionStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as AnalyticsEvent[]) : [];
    parsed.push(event);
    win.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(parsed.slice(-50)));
  } catch {
    // Ignore storage quota/security errors; runtime behavior must remain unaffected.
  }
}

export function readPersistedAnalyticsEvents(): AnalyticsEvent[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as AnalyticsEvent[]) : [];
  } catch {
    return [];
  }
}

export function clearPersistedAnalyticsEvents(): void {
  if (typeof window === 'undefined') return;

  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage quota/security errors; runtime behavior must remain unaffected.
  }
}

export function emitAnalyticsEvent(
  event: Omit<AnalyticsEvent, 'ts'> & { ts?: number },
): AnalyticsEvent {
  const normalized = toEvent(event);

  if (typeof window === 'undefined' || !isBrowserWindow(window)) {
    return normalized;
  }

  const win = window;
  const bucket = win.__ccAnalyticsEvents ?? [];
  bucket.push(normalized);
  win.__ccAnalyticsEvents = bucket.slice(-50);

  persistEvent(win, normalized);
  win.dispatchEvent(new CustomEvent('cc:analytics', { detail: normalized }));

  return normalized;
}
