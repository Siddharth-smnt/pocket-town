import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

export async function buildLabel(): Promise<string> {
  if (!Capacitor.isNativePlatform()) return `Version ${__APP_VERSION__}`;
  try {
    const info = await App.getInfo();
    return info.version === __APP_VERSION__
      ? `Version ${info.version} · build ${info.build}`
      : `App ${info.version} · screen version ${__APP_VERSION__}`;
  } catch {
    return `Screen version ${__APP_VERSION__}`;
  }
}
