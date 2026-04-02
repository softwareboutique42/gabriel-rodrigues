import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const exportSupportPath = resolve(process.cwd(), 'src/scripts/canvas/export-support.ts');
const rendererPath = resolve(process.cwd(), 'src/scripts/canvas/renderer.ts');
const encodersPath = resolve(process.cwd(), 'src/scripts/canvas/export-encoders.ts');
const exportControllerPath = resolve(process.cwd(), 'src/scripts/canvas/export-controller.ts');
const workerStripePath = resolve(process.cwd(), 'workers/company-api/src/stripe.ts');
const workerIndexPath = resolve(process.cwd(), 'workers/company-api/src/index.ts');
const mainPath = resolve(process.cwd(), 'src/scripts/canvas/main.ts');
const packageJsonPath = resolve(process.cwd(), 'package.json');

const exportSupportSource = readFileSync(exportSupportPath, 'utf8');
const rendererSource = readFileSync(rendererPath, 'utf8');
const encodersSource = readFileSync(encodersPath, 'utf8');
const exportControllerSource = readFileSync(exportControllerPath, 'utf8');
const workerStripeSource = readFileSync(workerStripePath, 'utf8');
const workerIndexSource = readFileSync(workerIndexPath, 'utf8');
const mainSource = readFileSync(mainPath, 'utf8');
const packageJsonSource = readFileSync(packageJsonPath, 'utf8');

test('FR-3.6 default export profile is 1920x1080 at 30fps for 12 seconds and 360 frames', () => {
  assert.match(exportSupportSource, /DEFAULT_EXPORT_PROFILE/);
  assert.match(exportSupportSource, /width:\s*1920/);
  assert.match(exportSupportSource, /height:\s*1080/);
  assert.match(exportSupportSource, /fps:\s*30/);
  assert.match(exportSupportSource, /durationSeconds:\s*12/);
  assert.match(exportSupportSource, /totalFrames:\s*360/);
});

test('NFR benchmark profile constants remain locked for timing and size gates', () => {
  assert.match(exportSupportSource, /width:\s*1920/);
  assert.match(exportSupportSource, /height:\s*1080/);
  assert.match(exportSupportSource, /fps:\s*30/);
  assert.match(exportSupportSource, /durationSeconds:\s*12/);
});

test('FR-4.1 export settings defaults are declared for format aspect ratio and quality', () => {
  assert.match(exportSupportSource, /type ExportFormat = 'webm' \| 'mp4'/);
  assert.match(exportSupportSource, /type ExportAspectRatio = '16:9' \| '1:1' \| '9:16'/);
  assert.match(exportSupportSource, /type ExportQuality = '1080p' \| '720p'/);
  assert.match(exportSupportSource, /DEFAULT_EXPORT_SETTINGS/);
  assert.match(exportSupportSource, /format:\s*'webm'/);
  assert.match(exportSupportSource, /aspectRatio:\s*'16:9'/);
  assert.match(exportSupportSource, /quality:\s*'1080p'/);
});

test('FR-4.4 export profile resolver maps aspect ratios and quality to concrete dimensions', () => {
  assert.match(exportSupportSource, /resolveExportProfile\(settings: ExportSettings\)/);
  assert.match(exportSupportSource, /'16:9': \{ width: 1920, height: 1080 \}/);
  assert.match(exportSupportSource, /'1:1': \{ width: 1080, height: 1080 \}/);
  assert.match(exportSupportSource, /'9:16': \{ width: 1080, height: 1920 \}/);
  assert.match(exportSupportSource, /'16:9': \{ width: 1280, height: 720 \}/);
  assert.match(exportSupportSource, /'1:1': \{ width: 720, height: 720 \}/);
  assert.match(exportSupportSource, /'9:16': \{ width: 720, height: 1280 \}/);
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

test('FR-3.2 checkout/download flow supports optional export_type metadata pass-through', () => {
  assert.match(workerStripeSource, /exportType\?: 'video' \| 'html'/);
  assert.match(workerStripeSource, /metadata\[export_type\]/);
  assert.match(workerStripeSource, /session\.metadata\.export_type/);
  assert.match(workerIndexSource, /exportType\?: 'video' \| 'html'/);
  assert.match(workerIndexSource, /exportType: body\.exportType/);
});

test('FR-3.7 export controller enforces 100ms warm-up before encoder start', () => {
  assert.match(exportSupportSource, /EXPORT_WARMUP_MS\s*=\s*100/);
  assert.match(exportControllerSource, /await wait\(EXPORT_WARMUP_MS\)/);
});

test('FR-3.5 export controller uses dedicated offscreen canvas and renderer', () => {
  assert.match(exportControllerSource, /const canvas = document\.createElement\('canvas'\)/);
  assert.match(exportControllerSource, /const wrapper = document\.createElement\('div'\)/);
  assert.match(exportControllerSource, /const renderer = new CanvasRenderer\(\)/);
  assert.match(exportControllerSource, /const profile = resolveExportProfile\(settings\)/);
  assert.match(exportControllerSource, /canvas\.width = profile\.width/);
  assert.match(exportControllerSource, /canvas\.height = profile\.height/);
  assert.match(exportControllerSource, /exportMode: true/);
  assert.match(exportControllerSource, /preserveDrawingBuffer: true/);
});

test('FR-3.8 progress callback is emitted during deterministic frame capture', () => {
  assert.match(exportControllerSource, /onProgress\?: \(progress: ExportProgress\) => void/);
  assert.match(exportControllerSource, /options\.onProgress\?\.\(/);
  assert.match(exportControllerSource, /totalFrames: profile\.totalFrames/);
});

test('main payment return path invokes video export when capabilities allow', () => {
  assert.match(mainSource, /detectExportCapabilities\(/);
  assert.match(mainSource, /selectExportPathForFormat\(/);
  assert.match(mainSource, /startVideoExport\(/);
  assert.match(mainSource, /exportType: 'video'/);
});

test('FR-4.1 modal selections persist across checkout redirect and feed export settings', () => {
  assert.match(mainSource, /EXPORT_SETTINGS_STORAGE_KEY/);
  assert.match(mainSource, /savePendingExportSettings\(/);
  assert.match(mainSource, /loadPendingExportSettings\(/);
  assert.match(mainSource, /settings: selectedSettings/);
  assert.match(mainSource, /getElementById\('canvas-export-modal'\)/);
});

test('FR-3.10 MP4 path is capability-gated and uses mp4-muxer encoder', () => {
  assert.match(packageJsonSource, /"mp4-muxer"/);
  assert.match(exportSupportSource, /if \(capabilities\.canEncodeMp4\) return 'mp4-webcodecs'/);
  assert.match(encodersSource, /export class WebCodecsMp4Encoder/);
  assert.match(encodersSource, /new Muxer\(/);
  assert.match(encodersSource, /new VideoEncoder\(/);
});

test('FR-3.10 VideoFrame resources are closed after encode submission', () => {
  assert.match(encodersSource, /const frame = new VideoFrame/);
  assert.match(encodersSource, /this\.encoder\.encode\(frame\)/);
  assert.match(encodersSource, /frame\.close\(\)/);
  assert.match(encodersSource, /bitmap\.close\(\)/);
});
