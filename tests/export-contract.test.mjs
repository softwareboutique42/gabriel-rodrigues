import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const exportSupportPath = resolve(process.cwd(), 'src/scripts/canvas/export-support.ts');
const rendererPath = resolve(process.cwd(), 'src/scripts/canvas/renderer.ts');
const encodersPath = resolve(process.cwd(), 'src/scripts/canvas/export-encoders.ts');

const exportSupportSource = readFileSync(exportSupportPath, 'utf8');
const rendererSource = readFileSync(rendererPath, 'utf8');
const encodersSource = readFileSync(encodersPath, 'utf8');

test('FR-3.6 default export profile is 1920x1080 at 30fps for 12 seconds and 360 frames', () => {
  assert.match(exportSupportSource, /DEFAULT_EXPORT_PROFILE/);
  assert.match(exportSupportSource, /width:\s*1920/);
  assert.match(exportSupportSource, /height:\s*1080/);
  assert.match(exportSupportSource, /fps:\s*30/);
  assert.match(exportSupportSource, /durationSeconds:\s*12/);
  assert.match(exportSupportSource, /totalFrames:\s*360/);
});

test('FR-3.9 capability detection handles missing MediaRecorder or captureStream support', () => {
  assert.match(exportSupportSource, /typeof MediaRecorder === 'undefined'/);
  assert.match(exportSupportSource, /HTMLCanvasElement\.prototype\.captureStream/);
  assert.match(exportSupportSource, /MediaRecorder\.isTypeSupported/);
});

test('FR-3.3 renderer exposes deterministic export frame controls', () => {
  assert.match(rendererSource, /exportMode\?: boolean/);
  assert.match(rendererSource, /setExportFrame\(elapsed: number\)/);
  assert.match(rendererSource, /renderFrame\(elapsed: number, delta: number\)/);
  assert.match(rendererSource, /this\.manualElapsed/);
});

test('FR-3.4 renderer supports preserveDrawingBuffer in export init options', () => {
  assert.match(rendererSource, /preserveDrawingBuffer/);
});

test('encoder boundary defines start appendFrame finish and cancel contracts', () => {
  assert.match(encodersSource, /interface ExportEncoder/);
  assert.match(encodersSource, /start\(init: ExportEncoderInit\): Promise<void>/);
  assert.match(encodersSource, /appendFrame\(frameIndex: number, elapsed: number\): Promise<void>/);
  assert.match(encodersSource, /finish\(\): Promise<EncodedVideoArtifact>/);
  assert.match(encodersSource, /cancel\(\): Promise<void>/);
});

test('NFR-7 export support remains browser-only', () => {
  assert.match(exportSupportSource, /supportsBrowserOnlyExport/);
  assert.match(exportSupportSource, /typeof window !== 'undefined'/);
  assert.match(exportSupportSource, /typeof document !== 'undefined'/);
});
