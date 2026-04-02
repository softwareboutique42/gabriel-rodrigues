export type ExportPath = 'webm-mediarecorder' | 'mp4-webcodecs' | 'html-fallback';

export type ExportFormat = 'webm' | 'mp4';
export type ExportAspectRatio = '16:9' | '1:1' | '9:16';
export type ExportQuality = '1080p' | '720p';

export type ExportSettings = {
  format: ExportFormat;
  aspectRatio: ExportAspectRatio;
  quality: ExportQuality;
};

export type ExportProfile = {
  width: number;
  height: number;
  fps: number;
  durationSeconds: number;
  totalFrames: number;
};

export type ExportCapabilities = {
  canCaptureCanvas: boolean;
  canEncodeWebM: boolean;
  canEncodeMp4: boolean;
  mediaRecorderSupported: boolean;
  webCodecsSupported: boolean;
};

export const DEFAULT_EXPORT_PROFILE: ExportProfile = {
  width: 1920,
  height: 1080,
  fps: 30,
  durationSeconds: 12,
  totalFrames: 360,
};

export const DEFAULT_EXPORT_SETTINGS: ExportSettings = {
  format: 'webm',
  aspectRatio: '16:9',
  quality: '1080p',
};

const DIMENSION_MAP: Record<
  ExportQuality,
  Record<ExportAspectRatio, { width: number; height: number }>
> = {
  '1080p': {
    '16:9': { width: 1920, height: 1080 },
    '1:1': { width: 1080, height: 1080 },
    '9:16': { width: 1080, height: 1920 },
  },
  '720p': {
    '16:9': { width: 1280, height: 720 },
    '1:1': { width: 720, height: 720 },
    '9:16': { width: 720, height: 1280 },
  },
};

export const EXPORT_WARMUP_MS = 100;

const WEBM_TYPES = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];

function supportsMimeType(mimeType: string): boolean {
  if (typeof MediaRecorder === 'undefined') return false;
  if (typeof MediaRecorder.isTypeSupported !== 'function') return false;
  return MediaRecorder.isTypeSupported(mimeType);
}

export function detectExportCapabilities(): ExportCapabilities {
  const mediaRecorderSupported = typeof MediaRecorder !== 'undefined';
  const canCaptureCanvas =
    typeof HTMLCanvasElement !== 'undefined' &&
    typeof HTMLCanvasElement.prototype.captureStream === 'function';
  const webCodecsSupported =
    typeof VideoEncoder !== 'undefined' && typeof VideoFrame !== 'undefined';

  const canEncodeWebM =
    mediaRecorderSupported && canCaptureCanvas && WEBM_TYPES.some(supportsMimeType);
  const canEncodeMp4 = canCaptureCanvas && webCodecsSupported;

  return {
    canCaptureCanvas,
    canEncodeWebM,
    canEncodeMp4,
    mediaRecorderSupported,
    webCodecsSupported,
  };
}

export function selectBestExportPath(capabilities: ExportCapabilities): ExportPath {
  if (capabilities.canEncodeMp4) return 'mp4-webcodecs';
  if (capabilities.canEncodeWebM) return 'webm-mediarecorder';
  return 'html-fallback';
}

export function resolveExportProfile(settings: ExportSettings): ExportProfile {
  const dimensions = DIMENSION_MAP[settings.quality][settings.aspectRatio];
  return {
    width: dimensions.width,
    height: dimensions.height,
    fps: DEFAULT_EXPORT_PROFILE.fps,
    durationSeconds: DEFAULT_EXPORT_PROFILE.durationSeconds,
    totalFrames: DEFAULT_EXPORT_PROFILE.totalFrames,
  };
}

export function selectExportPathForFormat(
  capabilities: ExportCapabilities,
  format: ExportFormat,
): ExportPath {
  if (format === 'mp4') {
    if (capabilities.canEncodeMp4) return 'mp4-webcodecs';
    if (capabilities.canEncodeWebM) return 'webm-mediarecorder';
    return 'html-fallback';
  }

  if (capabilities.canEncodeWebM) return 'webm-mediarecorder';
  if (capabilities.canEncodeMp4) return 'mp4-webcodecs';
  return 'html-fallback';
}

export function supportsBrowserOnlyExport(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}
