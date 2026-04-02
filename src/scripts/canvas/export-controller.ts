import type { CompanyConfig } from './types';
import { CanvasRenderer } from './renderer';
import { createExportEncoder } from './export-encoders';
import {
  DEFAULT_EXPORT_SETTINGS,
  EXPORT_WARMUP_MS,
  detectExportCapabilities,
  resolveExportProfile,
  selectExportPathForFormat,
  type ExportPath,
  type ExportSettings,
} from './export-support';

export type ExportProgress = {
  frame: number;
  totalFrames: number;
  percent: number;
};

export type VideoExportOptions = {
  signal?: AbortSignal;
  onProgress?: (progress: ExportProgress) => void;
  preferredPath?: ExportPath;
  settings?: Partial<ExportSettings>;
};

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function startVideoExport(
  config: CompanyConfig,
  options: VideoExportOptions = {},
): Promise<{ blob: Blob; filename: string; mimeType: string }> {
  const settings: ExportSettings = {
    ...DEFAULT_EXPORT_SETTINGS,
    ...options.settings,
  };
  const profile = resolveExportProfile(settings);
  const selectedPath =
    options.preferredPath ?? selectExportPathForFormat(detectExportCapabilities(), settings.format);
  if (selectedPath === 'html-fallback') {
    throw new Error('Video export unsupported');
  }

  const canvas = document.createElement('canvas');
  canvas.width = profile.width;
  canvas.height = profile.height;

  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.left = '-99999px';
  wrapper.style.top = '-99999px';
  wrapper.style.width = `${profile.width}px`;
  wrapper.style.height = `${profile.height}px`;
  wrapper.style.pointerEvents = 'none';
  wrapper.style.opacity = '0';
  wrapper.appendChild(canvas);
  document.body.appendChild(wrapper);

  const renderer = new CanvasRenderer();
  const encoder = createExportEncoder(selectedPath);
  const frameDelta = 1 / profile.fps;

  try {
    renderer.init(canvas, config, {
      exportMode: true,
      preserveDrawingBuffer: true,
    });

    await wait(EXPORT_WARMUP_MS);

    if (options.signal?.aborted) {
      throw new Error('Export cancelled');
    }

    await encoder.start({
      canvas,
      profile,
      mimeType: selectedPath === 'mp4-webcodecs' ? 'video/mp4' : 'video/webm;codecs=vp9',
    });

    for (let frame = 0; frame < profile.totalFrames; frame++) {
      if (options.signal?.aborted) {
        throw new Error('Export cancelled');
      }

      const elapsed = frame * frameDelta;
      renderer.setExportFrame(elapsed);
      renderer.renderFrame(elapsed, frameDelta);
      await encoder.appendFrame(frame, elapsed);

      const percent = Math.round(((frame + 1) / profile.totalFrames) * 100);
      options.onProgress?.({
        frame: frame + 1,
        totalFrames: profile.totalFrames,
        percent,
      });
    }

    const result = await encoder.finish();
    const safeName = config.companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    return {
      blob: result.blob,
      mimeType: result.mimeType,
      filename: `${safeName || 'company'}-canvas.${selectedPath === 'mp4-webcodecs' ? 'mp4' : 'webm'}`,
    };
  } catch (error) {
    await encoder.cancel();
    throw error;
  } finally {
    renderer.dispose();
    document.body.removeChild(wrapper);
  }
}

export function downloadVideoBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
