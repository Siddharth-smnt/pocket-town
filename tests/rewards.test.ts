import { describe, expect, it } from 'vitest';
import { RewardService } from '../src/platform/rewards';
describe('reward eligibility', () => {
  it('does not invoke a gateway or grant when disabled', async () => {
    let bricks = 0;
    expect(
      await new RewardService(null).show(() => {
        bricks += 3;
      }),
    ).toBe('unavailable');
    expect(bricks).toBe(0);
  });
  it('requires a completed reward event, ignores duplicates and rejects late callbacks', async () => {
    let bricks = 0;
    let late = () => {};
    const service = new RewardService({
      play: async (reward) => {
        late = reward;
        reward();
        reward();
      },
    });
    expect(
      await service.show(() => {
        bricks += 3;
      }),
    ).toBe('rewarded');
    late();
    expect(bricks).toBe(3);
  });
  it('grants nothing for dismissal or a load/show failure', async () => {
    let bricks = 0;
    const grant = () => {
      bricks += 3;
    };
    expect(await new RewardService({ play: async () => {} }).show(grant)).toBe('closed');
    expect(
      await new RewardService({
        play: async () => {
          throw new Error('offline');
        },
      }).show(grant),
    ).toBe('failed');
    expect(bricks).toBe(0);
  });
  it('rejects concurrent requests so listeners cannot reward two presentations', async () => {
    let close = () => {};
    const service = new RewardService({
      play: () =>
        new Promise<void>((resolve) => {
          close = resolve;
        }),
    });
    const first = service.show(() => {});
    expect(await service.show(() => {})).toBe('busy');
    close();
    expect(await first).toBe('closed');
  });
  it('keeps an earned reward if an SDK error arrives after completion', async () => {
    let earned = 0;
    const service = new RewardService({
      play: async (reward) => {
        reward();
        throw new Error('dismiss error');
      },
    });
    expect(
      await service.show(() => {
        earned++;
      }),
    ).toBe('rewarded');
    expect(earned).toBe(1);
  });
});
