import * as chokidar from 'chokidar';
import { Config } from '../config';
import { DirectoryService } from './directory-service';
import { fileExistsSafe } from '../utils/file-utils';
import { WATCHER_CONFIG } from '../constants';

export class WatcherService {
  private watcher?: chokidar.FSWatcher;

  constructor(private config: Config, private directoryService: DirectoryService) {}

  start(watchPath: string): void {
    if (!this.validateWatchPath(watchPath)) {
      return;
    }

    this.watcher = this.createWatcher(watchPath);
    this.setupEventHandlers();
    this.setupProcessHandlers();

    console.log(`Directory monitoring started: ${watchPath}`);
  }

  async stop(): Promise<void> {
    if (this.watcher) {
      await this.watcher.close();
      console.log('Directory monitoring stopped');
    }
  }

  private validateWatchPath(watchPath: string): boolean {
    if (!fileExistsSafe(watchPath)) {
      console.error(`Watch directory does not exist: ${watchPath}`);
      console.log(`Please create the directory manually before running the application.`);
      process.exit(1);
    }
    return true;
  }

  private createWatcher(watchPath: string): chokidar.FSWatcher {
    return chokidar.watch(watchPath, {
      persistent: true,
      ignoreInitial: false,
      ignored: this.config.ignorePatterns,
      awaitWriteFinish: {
        stabilityThreshold: WATCHER_CONFIG.STABILITY_THRESHOLD_MS,
        pollInterval: WATCHER_CONFIG.POLL_INTERVAL_MS,
      },
    });
  }

  private setupEventHandlers(): void {
    if (!this.watcher) return;

    this.watcher.on('addDir', (directoryPath: string) => {
      if (directoryPath !== this.config.watchDir) {
        this.directoryService.processNewDirectory(directoryPath);
      }
    });

    this.watcher.on('error', (error: unknown) => {
      console.error('Error occurred during monitoring:', error);
    });
  }

  private setupProcessHandlers(): void {
    process.on('SIGINT', async () => {
      await this.stop();
      process.exit(0);
    });
  }
}
