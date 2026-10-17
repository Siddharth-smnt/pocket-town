import { describe, expect, it } from 'vitest';
import { freshGame } from '../src/game/rules';
import { decodeSave } from '../src/persistence/schema';
import {
  BACKUP_KEY,
  LEGACY_KEY,
  SAVE_KEY,
  SaveStore,
  type KeyValueStore,
  type SaveStatus,
} from '../src/persistence/store';
function memory(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  const store: KeyValueStore = {
    get: async (key) => data.get(key) ?? null,
    set: async (key, value) => {
      data.set(key, value);
    },
  };
  return { data, store };
}
describe('versioned storage', () => {
  it('migrates the original prototype format while preserving earned town progress', async () => {
    const state = freshGame();
    state.bricks = 12;
    state.built = ['bakery'];
    const { store } = memory({
      [LEGACY_KEY]: JSON.stringify({ ...state, version: 1, ignored: 'extra' }),
    });
    const loaded = await new SaveStore(store).load();
    expect(loaded.reason).toBe('migrated');
    expect(loaded.state).toEqual(state);
  });
  it.each([
    { bricks: -1 },
    { score: 1.5 },
    { best: Infinity },
    { built: ['park'] },
    { sound: 'yes' },
    {
      tray: [
        {
          color: 'blue',
          shape: [
            [0, 0],
            [0, 0],
          ],
        },
        null,
        null,
      ],
    },
    {
      tray: [
        {
          color: 'blue',
          shape: [
            [0, 0],
            [2, 2],
          ],
        },
        null,
        null,
      ],
    },
    { tray: [null, null, null] },
    { board: [] },
  ])('rejects malformed or impossible state %j', (patch) => {
    expect(decodeSave(JSON.stringify({ ...freshGame(), ...patch })).kind).toBe('invalid');
  });
  it('recovers a valid backup without overwriting it with corrupt primary data', async () => {
    const state = freshGame();
    state.bricks = 8;
    const raw = JSON.stringify(state);
    const { store, data } = memory({ [SAVE_KEY]: '{broken', [BACKUP_KEY]: raw });
    const saves = new SaveStore(store),
      loaded = await saves.load();
    expect(loaded.reason).toBe('recovered');
    await saves.save(loaded.state);
    expect(data.get(BACKUP_KEY)).toBe(raw);
    expect(decodeSave(data.get(SAVE_KEY)!).kind).toBe('valid');
  });
  it('serializes rapid writes and retains the previous successful snapshot as backup', async () => {
    const { store, data } = memory();
    const saves = new SaveStore(store);
    await saves.load();
    const first = freshGame();
    first.bricks = 3;
    const second = { ...first, bricks: 7 };
    await Promise.all([saves.save(first), saves.save(second)]);
    expect(JSON.parse(data.get(SAVE_KEY)!).bricks).toBe(7);
    expect(JSON.parse(data.get(BACKUP_KEY)!).bricks).toBe(3);
  });
  it('protects future-version data from an older app', async () => {
    const raw = JSON.stringify({ ...freshGame(), version: 3 });
    const { store, data } = memory({ [SAVE_KEY]: raw });
    const saves = new SaveStore(store);
    expect((await saves.load()).reason).toBe('future');
    await saves.save(freshGame());
    expect(data.get(SAVE_KEY)).toBe(raw);
  });
  it('does not overwrite data after a failed read', async () => {
    let writes = 0;
    const saves = new SaveStore({
      get: async () => {
        throw new Error('denied');
      },
      set: async () => {
        writes++;
      },
    });
    expect((await saves.load()).reason).toBe('unavailable');
    await saves.save(freshGame());
    expect(writes).toBe(0);
  });
  it('reports failed writes and can recover on a subsequent save', async () => {
    const statuses: SaveStatus[] = [];
    const { store } = memory();
    let fail = true;
    const saves = new SaveStore(
      {
        ...store,
        set: async (key, value) => {
          if (fail) throw new Error('full');
          await store.set(key, value);
        },
      },
      (status) => statuses.push(status),
    );
    await saves.load();
    await saves.save(freshGame());
    expect(statuses.at(-1)).toBe('failed');
    fail = false;
    await saves.save(freshGame());
    expect(statuses.at(-1)).toBe('saved');
  });
});
