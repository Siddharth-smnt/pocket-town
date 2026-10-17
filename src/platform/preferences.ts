import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { LEGACY_KEY, type KeyValueStore } from '../persistence/store';
export const preferencesStorage: KeyValueStore = {
  async get(key) {
    const { value } = await Preferences.get({ key });
    // The original web demo stored this key outside Preferences' web namespace.
    if (value === null && key === LEGACY_KEY && !Capacitor.isNativePlatform())
      return localStorage.getItem(key);
    return value;
  },
  async set(key, value) {
    await Preferences.set({ key, value });
  },
};
