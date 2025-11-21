import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.syserv.agenda',
  appName: 'SyServ Agenda',
  webDir: 'www',

  // Configuración para Android
  android: {
    allowMixedContent: true,
    androidScheme: 'https'  // Requerido para SQLite (investigación 2025)
  },

  // Configuración para iOS
  ios: {
    contentInset: 'automatic'
  },

  // Configuración del plugin SQLite
  plugins: {
    CapacitorSQLite: {
      iosDatabaseLocation: 'Library/CapacitorDatabase',
      androidIsEncryption: false,
      androidBiometric: {
        biometricAuth: false
      }
    }
  }
};

export default config;
