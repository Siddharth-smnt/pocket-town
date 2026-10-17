import { freshGame } from '../game/rules';
import type { GameState } from '../game/types';
import { decodeSave } from './schema';
export const SAVE_KEY = 'pocket-town-v2';
export const BACKUP_KEY = 'pocket-town-v2-backup';
export const LEGACY_KEY = 'pocket-town-v1';
export interface KeyValueStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
}
export type SaveStatus = 'saved' | 'saving' | 'failed' | 'readonly';
export interface LoadResult {
  state: GameState;
  reason: 'new' | 'loaded' | 'migrated' | 'recovered' | 'reset' | 'unavailable' | 'future';
}

/** Serial writes prevent rapid moves and lifecycle saves from finishing out of order. */
export class SaveStore {
  private pending: Promise<void> = Promise.resolve();
  private lastGood: string | null = null;
  private readOnly = false;
  constructor(
    private readonly storage: KeyValueStore,
    private readonly status: (status: SaveStatus) => void = () => {},
  ) {}
  async load(): Promise<LoadResult> {
    try {
      const primary = await this.storage.get(SAVE_KEY);
      const decoded = decodeSave(primary);
      if (decoded.kind === 'future') {
        this.readOnly = true;
        this.status('readonly');
        return { state: freshGame(), reason: 'future' };
      }
      if (decoded.kind === 'valid') {
        this.lastGood = JSON.stringify(decoded.state);
        return { state: decoded.state, reason: decoded.migrated ? 'migrated' : 'loaded' };
      }
      const backup = decodeSave(await this.storage.get(BACKUP_KEY));
      if (backup.kind === 'future') {
        this.readOnly = true;
        this.status('readonly');
        return { state: freshGame(), reason: 'future' };
      }
      if (backup.kind === 'valid') {
        this.lastGood = JSON.stringify(backup.state);
        return { state: backup.state, reason: 'recovered' };
      }
      const legacyRaw = await this.storage.get(LEGACY_KEY);
      const legacy = decodeSave(legacyRaw);
      if (primary === null && legacy.kind === 'valid') {
        this.lastGood = JSON.stringify(legacy.state);
        return { state: legacy.state, reason: 'migrated' };
      }
      return {
        state: freshGame(),
        reason: primary === null && legacyRaw === null ? 'new' : 'reset',
      };
    } catch {
      // A failed read must not destroy an existing save we could not inspect.
      this.readOnly = true;
      this.status('failed');
      return { state: freshGame(), reason: 'unavailable' };
    }
  }
  save(state: GameState): Promise<void> {
    if (this.readOnly) return this.pending;
    const raw = JSON.stringify(state);
    this.status('saving');
    this.pending = this.pending
      .then(async () => {
        if (this.lastGood !== null) await this.storage.set(BACKUP_KEY, this.lastGood);
        await this.storage.set(SAVE_KEY, raw);
        this.lastGood = raw;
        this.status('saved');
      })
      .catch(() => {
        this.status('failed');
      });
    return this.pending;
  }
  flush(): Promise<void> {
    return this.pending;
  }
}
