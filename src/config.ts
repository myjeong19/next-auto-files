import * as path from 'path';
import * as fs from 'fs';

export interface Config {
  watchDir: string;
  ignorePatterns: string[];
}

const defaultConfig: Config = {
  watchDir: 'app',
  ignorePatterns: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/build/**'],
};

const CONFIG_FILE_PATH = path.join(process.cwd(), 'next-auto-files.config.json');

export function getAbsolutePath(relativePath: string): string {
  if (path.isAbsolute(relativePath)) {
    return relativePath;
  }
  return path.join(process.cwd(), relativePath);
}

export function loadConfig(): Config {
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const configFile = fs.readFileSync(CONFIG_FILE_PATH, 'utf-8');
      const userConfig = JSON.parse(configFile);

      const envWatchDir = process.env.WATCH_DIR;
      if (envWatchDir) {
        userConfig.watchDir = envWatchDir;
      }

      return { ...defaultConfig, ...userConfig };
    }
  } catch (error) {
    console.error('Configuration file loading failed:', error);
  }

  return defaultConfig;
}

export function saveConfig(config: Config): void {
  try {
    const configToSave = { ...config };

    if (path.isAbsolute(configToSave.watchDir)) {
      try {
        const relativePath = path.relative(process.cwd(), configToSave.watchDir);
        if (!relativePath.startsWith('..') && !path.isAbsolute(relativePath)) {
          configToSave.watchDir = relativePath;
        }
      } catch (err) {
        console.warn('Unable to convert watchDir to relative path');
      }
    }

    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(configToSave, null, 2), 'utf-8');
    console.log(`Configuration saved successfully: ${CONFIG_FILE_PATH}`);
  } catch (error) {
    console.error('Configuration save operation failed:', error);
  }
}

export function createDefaultConfigIfNotExists(): void {
  if (!fs.existsSync(CONFIG_FILE_PATH)) {
    saveConfig(defaultConfig);
    console.log(`Default configuration file initialized: ${CONFIG_FILE_PATH}`);
  }
}
