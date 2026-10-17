import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
export async function installLifecycle(
  pause: () => void,
  resume: () => void,
  back: () => void,
): Promise<void> {
  document.addEventListener('visibilitychange', () => (document.hidden ? pause() : resume()));
  window.addEventListener('pagehide', pause);
  if (Capacitor.isNativePlatform()) {
    await App.addListener('appStateChange', ({ isActive }) => (isActive ? resume() : pause()));
    await App.addListener('backButton', back);
  }
}
export async function exitGame(): Promise<void> {
  if (Capacitor.isNativePlatform()) await App.exitApp();
}
