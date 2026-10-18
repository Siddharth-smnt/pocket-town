import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const sdk = vi.hoisted(() => ({
  listeners: new Map<string, () => void>(),
  initialize: vi.fn(async () => {}),
  prepareRewardVideoAd: vi.fn(async () => {}),
  showRewardVideoAd: vi.fn(async () => ({ amount: 1, type: 'test' })),
  removed: [] as string[],
}));
vi.mock('@capacitor/core', () => ({ Capacitor: { getPlatform: () => 'android' } }));
vi.mock('@capacitor-community/admob', () => ({
  MaxAdContentRating: { General: 'General' },
  RewardAdPluginEvents: { Rewarded: 'reward', Dismissed: 'dismiss', FailedToShow: 'failed' },
  AdMob: {
    initialize: sdk.initialize,
    prepareRewardVideoAd: sdk.prepareRewardVideoAd,
    showRewardVideoAd: sdk.showRewardVideoAd,
    addListener: async (name: string, callback: () => void) => {
      sdk.listeners.set(name, callback);
      return {
        remove: async () => {
          sdk.listeners.delete(name);
          sdk.removed.push(name);
        },
      };
    },
  },
}));
import { createRewardService, TEST_REWARDED_ID } from '../src/platform/admob';

describe('native test-ad adapter with a simulated SDK', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_ENABLE_TEST_ADS', 'true');
    sdk.listeners.clear();
    sdk.removed.length = 0;
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });
  it('uses the official test unit and waits for a reward event, not show-promise resolution', async () => {
    let bricks = 0;
    const result = createRewardService().show(() => {
      bricks += 3;
    });
    await vi.waitFor(() => expect(sdk.showRewardVideoAd).toHaveBeenCalledOnce());
    expect(sdk.prepareRewardVideoAd).toHaveBeenCalledWith({
      adId: TEST_REWARDED_ID,
      isTesting: true,
      npa: true,
    });
    expect(bricks).toBe(0);
    sdk.listeners.get('reward')!();
    sdk.listeners.get('reward')!();
    sdk.listeners.get('dismiss')!();
    expect(await result).toBe('rewarded');
    expect(bricks).toBe(3);
    expect(sdk.listeners.size).toBe(0);
    expect(sdk.removed).toHaveLength(3);
  });
  it('cleans listeners after early dismissal without granting', async () => {
    const grant = vi.fn(),
      result = createRewardService().show(grant);
    await vi.waitFor(() => expect(sdk.showRewardVideoAd).toHaveBeenCalledOnce());
    sdk.listeners.get('dismiss')!();
    expect(await result).toBe('closed');
    expect(grant).not.toHaveBeenCalled();
    expect(sdk.listeners.size).toBe(0);
  });
  it('handles preparation failure and stays playable', async () => {
    sdk.prepareRewardVideoAd.mockRejectedValueOnce(new Error('offline'));
    const grant = vi.fn();
    expect(await createRewardService().show(grant)).toBe('failed');
    expect(grant).not.toHaveBeenCalled();
    expect(sdk.listeners.size).toBe(0);
  });
  it('times out an unfinished presentation and blocks another native request', async () => {
    vi.useFakeTimers();
    const service = createRewardService(),
      grant = vi.fn(),
      result = service.show(grant);
    await vi.waitFor(() => expect(sdk.showRewardVideoAd).toHaveBeenCalledOnce());
    await vi.advanceTimersByTimeAsync(120_000);
    expect(await result).toBe('failed');
    expect(sdk.listeners.size).toBe(0);
    expect(await service.show(grant)).toBe('failed');
    expect(sdk.showRewardVideoAd).toHaveBeenCalledOnce();
    expect(grant).not.toHaveBeenCalled();
  });
});
