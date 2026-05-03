export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private startTime = 0;
  private tickInterval: ReturnType<typeof setInterval> | null = null;

  onTick: ((elapsedMs: number) => void) | null = null;

  async start(): Promise<void> {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.chunks = [];
    this.mediaRecorder = new MediaRecorder(stream);
    this.mediaRecorder.ondataavailable = e => {
      if (e.data.size > 0) this.chunks.push(e.data);
    };
    this.mediaRecorder.start();
    this.startTime = Date.now();
    this.tickInterval = setInterval(() => {
      this.onTick?.(Date.now() - this.startTime);
    }, 100);
  }

  stop(): Promise<{ blob: Blob; durationMs: number }> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) { reject(new Error('Not recording')); return; }
      const durationMs = Date.now() - this.startTime;
      if (this.tickInterval) {
        clearInterval(this.tickInterval);
        this.tickInterval = null;
      }
      this.mediaRecorder.onstop = () => {
        const mimeType = this.mediaRecorder?.mimeType ?? 'audio/webm';
        const blob = new Blob(this.chunks, { type: mimeType });
        this.mediaRecorder?.stream.getTracks().forEach(t => t.stop());
        resolve({ blob, durationMs });
      };
      this.mediaRecorder.stop();
    });
  }

  get isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }
}
