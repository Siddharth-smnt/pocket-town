import type { CapacitorConfig } from '@capacitor/cli';
const config: CapacitorConfig = {
  appId: 'com.siddharthsmnt.pockettown.dev',
  appName: 'Pocket Town',
  webDir: 'dist',
  includePlugins: [
    '@capacitor/app',
    '@capacitor/preferences',
    ...(process.env.POCKET_TOWN_TEST_ADS === 'true' ? ['@capacitor-community/admob'] : []),
  ],
  android: { backgroundColor: '#f7f7f0' },
  plugins: {
    SystemBars: { insetsHandling: 'native', style: 'LIGHT', initialViewportFitValueHint: 'cover' },
  },
};
export default config;
