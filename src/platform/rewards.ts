export interface RewardGateway {
  play(onReward: () => void): Promise<void>;
}
export type RewardOutcome = 'rewarded' | 'closed' | 'unavailable' | 'busy' | 'failed';
/** Treat callbacks as untrusted repetitions: one reward per active presentation. */
export class RewardService {
  private active = false;
  constructor(private readonly gateway: RewardGateway | null) {}
  get available(): boolean {
    return this.gateway !== null;
  }
  async show(grant: () => void): Promise<RewardOutcome> {
    if (!this.gateway) return 'unavailable';
    if (this.active) return 'busy';
    this.active = true;
    let rewarded = false,
      listening = true;
    try {
      await this.gateway.play(() => {
        if (!listening || rewarded) return;
        rewarded = true;
        grant();
      });
      return rewarded ? 'rewarded' : 'closed';
    } catch {
      return rewarded ? 'rewarded' : 'failed';
    } finally {
      listening = false;
      this.active = false;
    }
  }
}
