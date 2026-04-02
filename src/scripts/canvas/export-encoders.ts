import type { ExportProfile } from './export-support';
import type { ExportPath } from './export-support';
import { ArrayBufferTarget, Muxer } from 'mp4-muxer';

export type ExportEncoderInit = {
  canvas: HTMLCanvasElement;
  profile: ExportProfile;
  mimeType?: string;
};

export type EncodedVideoArtifact = {
  blob: Blob;
  mimeType: string;
};

export interface ExportEncoder {
  start(init: ExportEncoderInit): Promise<void>;
  appendFrame(frameIndex: number, elapsed: number): Promise<void>;
  finish(): Promise<EncodedVideoArtifact>;
  cancel(): Promise<void>;
}

export function createExportEncoder(path: ExportPath): ExportEncoder {
  if (path === 'mp4-webcodecs') return new WebCodecsMp4Encoder();
  return new WebMExportEncoder();
}

export class WebMExportEncoder implements ExportEncoder {
  private recorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private mimeType = 'video/webm';
  private captureTrack: CanvasCaptureMediaStreamTrack | null = null;

  async start(init: ExportEncoderInit): Promise<void> {
    const stream = init.canvas.captureStream(init.profile.fps);
    this.captureTrack =
      (stream.getVideoTracks()[0] as CanvasCaptureMediaStreamTrack | undefined) ?? null;
    this.mimeType = init.mimeType ?? 'video/webm;codecs=vp9';

    this.recorder = new MediaRecorder(stream, { mimeType: this.mimeType });
    this.chunks = [];

    this.recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) this.chunks.push(event.data);
    };

    await new Promise<void>((resolve, reject) => {
      if (!this.recorder) {
        reject(new Error('MediaRecorder unavailable'));
        return;
      }

      this.recorder.onstart = () => resolve();
      this.recorder.onerror = () => reject(new Error('Failed to start WebM recording'));
      this.recorder.start();
    });
  }

  async appendFrame(_frameIndex: number, _elapsed: number): Promise<void> {
    this.captureTrack?.requestFrame?.();
    await Promise.resolve();
  }

  async finish(): Promise<EncodedVideoArtifact> {
    await new Promise<void>((resolve) => {
      if (!this.recorder) {
        resolve();
        return;
      }

      this.recorder.onstop = () => resolve();
      if (this.recorder.state !== 'inactive') {
        this.recorder.stop();
      } else {
        resolve();
      }
    });

    return {
      blob: new Blob(this.chunks, { type: this.mimeType }),
      mimeType: this.mimeType,
    };
  }

  async cancel(): Promise<void> {
    if (this.recorder && this.recorder.state !== 'inactive') {
      this.recorder.stop();
    }
    this.chunks = [];
    this.captureTrack = null;
  }
}

export class WebCodecsMp4Encoder implements ExportEncoder {
  private encoder: VideoEncoder | null = null;
  private muxer: Muxer<ArrayBufferTarget> | null = null;
  private target: ArrayBufferTarget | null = null;
  private profile: ExportProfile | null = null;
  private canvas: HTMLCanvasElement | null = null;

  async start(init: ExportEncoderInit): Promise<void> {
    this.profile = init.profile;
    this.canvas = init.canvas;
    this.target = new ArrayBufferTarget();
    this.muxer = new Muxer({
      target: this.target,
      video: {
        codec: 'avc',
        width: init.profile.width,
        height: init.profile.height,
      },
      firstTimestampBehavior: 'offset',
      fastStart: 'in-memory',
    });

    this.encoder = new VideoEncoder({
      output: (chunk, metadata) => {
        this.muxer?.addVideoChunk(chunk, metadata);
      },
      error: (error) => {
        throw error;
      },
    });

    this.encoder.configure({
      codec: 'avc1.42001f',
      width: init.profile.width,
      height: init.profile.height,
      framerate: init.profile.fps,
      bitrate: 6_000_000,
    });
  }

  async appendFrame(_frameIndex: number, elapsed: number): Promise<void> {
    if (!this.encoder || !this.profile) {
      throw new Error('MP4 encoder not initialized');
    }

    if (!this.canvas) throw new Error('Export canvas not found');

    const bitmap = await createImageBitmap(this.canvas);
    const timestampUs = Math.floor(elapsed * 1_000_000);
    const frame = new VideoFrame(bitmap, { timestamp: timestampUs });
    bitmap.close();

    this.encoder.encode(frame);
    frame.close();
  }

  async finish(): Promise<EncodedVideoArtifact> {
    await this.encoder?.flush();
    this.muxer?.finalize();

    const buffer = this.target?.buffer ?? new ArrayBuffer(0);
    return {
      blob: new Blob([buffer], { type: 'video/mp4' }),
      mimeType: 'video/mp4',
    };
  }

  async cancel(): Promise<void> {
    this.encoder?.close();
    this.encoder = null;
    this.muxer = null;
    this.target = null;
    this.profile = null;
    this.canvas = null;
  }
}
