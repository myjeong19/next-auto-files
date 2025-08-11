#!/usr/bin/env node

import { loadConfig, createDefaultConfigIfNotExists, getAbsolutePath } from './config';
import { TemplateService } from './services/template-service';
import { DirectoryService } from './services/directory-service';
import { WatcherService } from './services/watcher-service';

function main(): void {
  createDefaultConfigIfNotExists();
  const config = loadConfig();
  const absoluteWatchDir = getAbsolutePath(config.watchDir);

  const templateService = new TemplateService(config.watchDir);
  const directoryService = new DirectoryService(templateService);
  const watcherService = new WatcherService(config, directoryService);

  watcherService.start(absoluteWatchDir);
}

main();
