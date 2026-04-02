import type { ExportProfile } from './export-support';

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

export class WebMExportEncoder implements ExportEncoder {
  private recorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private mimeType = 'video/webm';

  async start(init: ExportEncoderInit): Promise<void> {
    const stream = init.canvas.captureStream(init.profile.fps);
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

  async appendFrame(): Promise<void> {
    return Promise.resolve();
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
  }
}
