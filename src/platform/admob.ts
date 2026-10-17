import { Capacitor, type PluginListenerHandle } from '@capacitor/core';
import { RewardService, type RewardGateway } from './rewards';

// Google's Android demo rewarded unit. No production IDs are accepted by this adapter.
export const TEST_REWARDED_ID = 'ca-app-pub-3940256099942544/5224354917';
class AdMobTestGateway implements RewardGateway {
  private healthy = true;
  async play(onReward: () => void): Promise<void> {
    if (!this.healthy) throw new Error('Restart the app before another ad test.');
    const { AdMob, RewardAdPluginEvents, MaxAdContentRating } =
      await import('@capacitor-community/admob');
    const handles: PluginListenerHandle[] = [];
    let timer: ReturnType<typeof setTimeout> | undefined;
    let showing = false;
    let expire: (reason: Error) => void = () => {};
    const timeout = new Promise<never>((_, reject) => {
      expire = reject;
    });
    timer = setTimeout(() => {
      this.healthy = false;
      expire(new Error('Test ad timed out.'));
    }, 120_000);
    try {
      const operation = async () => {
        // These conservative settings are for development tests, not audience/consent approval.
        await AdMob.initialize({
          initializeForTesting: true,
          tagForChildDirectedTreatment: true,
          tagForUnderAgeOfConsent: true,
          maxAdContentRating: MaxAdContentRating.General,
        });
        if (!this.healthy) return;
        await AdMob.prepareRewardVideoAd({ adId: TEST_REWARDED_ID, isTesting: true, npa: true });
        if (!this.healthy) return;
        let finish: () => void = () => {};
        let fail: (error: unknown) => void = () => {};
        const closed = new Promise<void>((resolve, reject) => {
          finish = resolve;
          fail = reject;
        });
        handles.push(
          await AdMob.addListener(RewardAdPluginEvents.Rewarded, () => {
            if (showing) onReward();
          }),
        );
        handles.push(
          await AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
            showing = false;
            finish();
          }),
        );
        handles.push(
          await AdMob.addListener(RewardAdPluginEvents.FailedToShow, (error) => {
            showing = false;
            fail(error);
          }),
        );
        if (!this.healthy) return;
        showing = true;
        // The show promise can resolve before dismissal. Only the Rewarded event grants bricks.
        void AdMob.showRewardVideoAd().catch(fail);
        await closed;
      };
      await Promise.race([operation(), timeout]);
    } finally {
      showing = false;
      clearTimeout(timer);
      await Promise.allSettled(handles.map((handle) => handle.remove()));
    }
  }
}
export function createRewardService(): RewardService {
  const enabled =
    import.meta.env.VITE_ENABLE_TEST_ADS === 'true' && Capacitor.getPlatform() === 'android';
  return new RewardService(enabled ? new AdMobTestGateway() : null);
}
