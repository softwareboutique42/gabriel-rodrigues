import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const { ANALYTICS_EVENT_NAMES, emitAnalyticsEvent, clearPersistedAnalyticsEvents } =
  await import('../src/scripts/analytics/events.ts');

const controllerPath = resolve(process.cwd(), 'src/scripts/slots/controller.ts');
const enProjectsPath = resolve(process.cwd(), 'src/pages/en/projects/index.astro');
const ptProjectsPath = resolve(process.cwd(), 'src/pages/pt/projects/index.astro');

const controllerSource = readFileSync(controllerPath, 'utf8');
const enProjectsSource = readFileSync(enProjectsPath, 'utf8');
const ptProjectsSource = readFileSync(ptProjectsPath, 'utf8');

const PII_KEYS = ['email', 'name', 'phone', 'user', 'ip', 'token'];

function assertNoPiiPayload(payload) {
  for (const key of Object.keys(payload)) {
    assert.equal(
      PII_KEYS.some((pii) => key.toLowerCase().includes(pii)),
      false,
      `PII-like key detected: ${key}`,
    );
  }
}

test('ANL-10: analytics event names are deterministic and stable', () => {
  assert.deepEqual(ANALYTICS_EVENT_NAMES, {
    PROJECTS_CTA_CLICK: 'projects_cta_click',
    SLOTS_SPIN_ATTEMPT: 'slots_spin_attempt',
    SLOTS_SPIN_RESOLVED: 'slots_spin_resolved',
    SLOTS_SPIN_BLOCKED: 'slots_spin_blocked',
  });
});

test('ANL-12: emitted analytics payload remains categorical and PII-free', () => {
  clearPersistedAnalyticsEvents();

  const event = emitAnalyticsEvent({
    name: ANALYTICS_EVENT_NAMES.SLOTS_SPIN_RESOLVED,
    route: '/en/slots/',
    locale: 'en',
    surface: 'slots',
    payload: {
      spin_index: 1,
      outcome: 'loss',
      payout: 0,
    },
    ts: 1,
  });

  assert.equal(event.name, 'slots_spin_resolved');
  assert.equal(event.route, '/en/slots/');
  assert.equal(event.locale, 'en');
  assert.equal(event.surface, 'slots');
  assert.equal(event.ts, 1);
  assert.deepEqual(event.payload, {
    spin_index: 1,
    outcome: 'loss',
    payout: 0,
  });

  assertNoPiiPayload(event.payload);
});

test('ANL-11: slots controller emits attempt/resolved/blocked analytics from authority-safe boundaries', () => {
  assert.match(
    controllerSource,
    /emitAnalyticsEvent\(\{\s*name:\s*ANALYTICS_EVENT_NAMES\.SLOTS_SPIN_ATTEMPT/s,
  );
  assert.match(
    controllerSource,
    /emitAnalyticsEvent\(\{\s*name:\s*ANALYTICS_EVENT_NAMES\.SLOTS_SPIN_RESOLVED/s,
  );
  assert.match(
    controllerSource,
    /emitAnalyticsEvent\(\{\s*name:\s*ANALYTICS_EVENT_NAMES\.SLOTS_SPIN_BLOCKED/s,
  );
  assert.match(controllerSource, /blocked_reason/);
  assert.match(controllerSource, /spin_index/);
  assert.match(controllerSource, /route\s*=\s*`\/\$\{locale\}\/slots\//);
});

test('ANL-10: EN/PT projects routes expose parity-safe CTA instrumentation hooks', () => {
  assert.match(enProjectsSource, /data-projects-analytics-target="canvas"/);
  assert.match(enProjectsSource, /data-projects-analytics-target="slots"/);
  assert.match(enProjectsSource, /data-projects-analytics-locale="en"/);
  assert.match(enProjectsSource, /data-projects-analytics-route="\/en\/projects\/"/);
  assert.match(enProjectsSource, /ANALYTICS_EVENT_NAMES\.PROJECTS_CTA_CLICK/);

  assert.match(ptProjectsSource, /data-projects-analytics-target="canvas"/);
  assert.match(ptProjectsSource, /data-projects-analytics-target="slots"/);
  assert.match(ptProjectsSource, /data-projects-analytics-locale="pt"/);
  assert.match(ptProjectsSource, /data-projects-analytics-route="\/pt\/projects\/"/);
  assert.match(ptProjectsSource, /ANALYTICS_EVENT_NAMES\.PROJECTS_CTA_CLICK/);
});
