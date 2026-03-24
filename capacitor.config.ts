import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.miki.kidsapp',
  appName: 'מיקי לומדת',
  webDir: 'dist',
  android: {
    allowMixedContent: false,
    webContentsDebuggingEnabled: true
  },
  plugins: {
    App: {
      handleBackButton: true
    }
  }
};

export default config;
