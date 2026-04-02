export type ExportPath = 'webm-mediarecorder' | 'mp4-webcodecs' | 'html-fallback';

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

export function supportsBrowserOnlyExport(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}
