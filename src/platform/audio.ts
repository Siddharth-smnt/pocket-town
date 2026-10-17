export type Tone = 'place' | 'clear' | 'build';
export class GameAudio {
  private context: AudioContext | null = null;
  play(kind: Tone, enabled: boolean): void {
    if (!enabled || document.hidden) return;
    try {
      this.context ??= new AudioContext();
      if (this.context.state === 'suspended') void this.context.resume().catch(() => {});
      const notes =
        kind === 'build' ? [523, 659, 784, 1047] : kind === 'clear' ? [440, 554, 659] : [330];
      notes.forEach((frequency, i) => {
        const context = this.context!;
        const osc = context.createOscillator(),
          gain = context.createGain(),
          start = context.currentTime + i * 0.09;
        osc.type = 'sine';
        osc.frequency.value = frequency;
        osc.connect(gain);
        gain.connect(context.destination);
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.06, start + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.21);
        osc.start(start);
        osc.stop(start + 0.23);
        osc.onended = () => {
          osc.disconnect();
          gain.disconnect();
        };
      });
    } catch {
      /* Audio is optional; unsupported devices still have a complete game. */
    }
  }
  pause(): void {
    if (this.context?.state === 'running') void this.context.suspend().catch(() => {});
  }
}
