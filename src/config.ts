import * as path from 'path';
import * as fs from 'fs';

/**
 * Application configuration interface
 */
export interface Config {
  /** Directory to watch for changes */
  watchDir: string;
  /** Patterns to ignore when watching */
  ignorePatterns: string[];
}

/** Default configuration values */
const defaultConfig: Config = {
  watchDir: path.join(process.cwd(), 'src', 'app'),
  ignorePatterns: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/build/**'],
};

/** Path to the configuration file */
const CONFIG_FILE_PATH = path.join(process.cwd(), 'next-auto-file.config.json');

/**
 * Loads configuration from file or returns default config
 * @returns The loaded configuration
 */
export function loadConfig(): Config {
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const configFile = fs.readFileSync(CONFIG_FILE_PATH, 'utf-8');
      const userConfig = JSON.parse(configFile);

      // Override with environment variables if provided
      const envWatchDir = process.env.WATCH_DIR;
      if (envWatchDir) {
        userConfig.watchDir = envWatchDir;
      }

      return { ...defaultConfig, ...userConfig };
    }
  } catch (error) {
    console.error('Failed to load config file:', error);
  }

  return defaultConfig;
}

/**
 * Saves configuration to file
 * @param config Configuration to save
 */
export function saveConfig(config: Config): void {
  try {
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(config, null, 2), 'utf-8');
    console.log(`Config saved: ${CONFIG_FILE_PATH}`);
  } catch (error) {
    console.error('Failed to save config:', error);
  }
}

/**
 * Creates default configuration file if it doesn't exist
 */
export function createDefaultConfigIfNotExists(): void {
  if (!fs.existsSync(CONFIG_FILE_PATH)) {
    saveConfig(defaultConfig);
    console.log(`Default config file created: ${CONFIG_FILE_PATH}`);
  }
}
