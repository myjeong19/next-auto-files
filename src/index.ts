import * as chokidar from 'chokidar';
import * as fs from 'fs';
import * as path from 'path';
import { loadConfig, createDefaultConfigIfNotExists } from './config';
import { defaultTemplates, processTemplate, toPascalCase } from './templates';

// Initialize configuration
createDefaultConfigIfNotExists();
const config = loadConfig();

// Track processed directories to avoid duplicate processing
const processedDirectories = new Set<string>();

// File type extensions for folder name patterns
const FILE_TYPE_EXTENSIONS: Record<string, string[]> = {
  page: ['page.tsx'],
  layout: ['layout.tsx'],
  error: ['error.tsx'],
  loading: ['loading.tsx'],
  default: ['page.tsx', 'layout.tsx', 'loading.tsx', 'error.tsx'],
};

// Return type for template processing
interface TemplateResult {
  templates: Record<string, string>;
  newDirectoryPath?: string;
}

/**
 * Get appropriate templates based on directory name and patterns
 */
function getTemplatesForDirectory(directoryPath: string): Record<string, string> {
  const dirName = path.basename(directoryPath);

  // Check if the directory name follows pattern format (name.type)
  if (dirName.includes('.') || dirName.includes(':')) {
    const result = getTemplatesFromPattern(dirName, directoryPath);
    return result.templates;
  }

  // No templates for non-pattern directories
  return {};
}

/**
 * Process a directory name with a pattern (e.g., "profile.page" or "profile:layout")
 */
function getTemplatesFromPattern(patternDirName: string, directoryPath: string): TemplateResult {
  let baseName: string;
  let fileType: string;

  // Support both '.' and ':' as separators
  if (patternDirName.includes('.')) {
    [baseName, fileType] = patternDirName.split('.');
  } else if (patternDirName.includes(':')) {
    [baseName, fileType] = patternDirName.split(':');
  } else {
    return { templates: {} };
  }

  // Unsupported pattern detection
  if (
    baseName === 'page' ||
    baseName === 'layout' ||
    baseName === 'loading' ||
    baseName === 'error'
  ) {
    console.log(
      `Unsupported pattern: ${patternDirName}. Pattern should be fileName.type or fileName:type`
    );
    return { templates: {} };
  }

  let templates: Record<string, string> = {};

  // Filter files based on pattern
  if (fileType && FILE_TYPE_EXTENSIONS[fileType]) {
    const fileTypes = FILE_TYPE_EXTENSIONS[fileType];

    // Special handling for "default" pattern - create all standard files
    if (fileType === 'default') {
      console.log(`Default pattern detected, creating all standard files`);
      // Add all default templates
      Object.entries(defaultTemplates).forEach(([fileName, content]) => {
        templates[fileName] = content;
      });
    } else {
      // Filter by file type
      fileTypes.forEach((fileName: string) => {
        // Use default template if available
        if (defaultTemplates[fileName]) {
          templates[fileName] = defaultTemplates[fileName];
        }
      });
    }
  }

  // Rename directory (remove pattern suffix)
  const parentDir = path.dirname(directoryPath);
  const newDirPath = path.join(parentDir, baseName);

  if (directoryPath !== newDirPath && !fileExistsSafe(newDirPath)) {
    try {
      fs.renameSync(directoryPath, newDirPath);
      console.log(`Renamed directory: ${directoryPath} -> ${newDirPath}`);
      return { templates, newDirectoryPath: newDirPath };
    } catch (error) {
      console.error(`Failed to rename directory: ${directoryPath}`, error);
    }
  }

  return { templates };
}

/**
 * Create template files for a newly detected directory
 */
function createFilesForDirectory(directoryPath: string): void {
  console.log(`New directory detected: ${directoryPath}`);

  // Skip if already processed or invalid
  if (processedDirectories.has(directoryPath) || !isValidDirectory(directoryPath)) {
    console.log(`Skipping already processed or invalid directory: ${directoryPath}`);
    return;
  }

  // Mark as processed immediately to avoid duplicate processing
  processedDirectories.add(directoryPath);

  const dirName = path.basename(directoryPath);

  // Check if this is a pattern directory
  if (dirName.includes('.') || dirName.includes(':')) {
    // Handle pattern directories
    handlePatternDirectory(directoryPath, dirName);
  } else {
    // Handle regular directories
    handleRegularDirectory(directoryPath, dirName);
  }
}

/**
 * Handle pattern directories with special naming (e.g., profile.page)
 */
function handlePatternDirectory(directoryPath: string, dirName: string): void {
  const result = getTemplatesFromPattern(dirName, directoryPath);

  console.log(`Pattern detected: ${dirName}`);
  console.log(`Templates keys: ${Object.keys(result.templates)}`);
  console.log(`Templates count: ${Object.keys(result.templates).length}`);

  let targetPath = directoryPath;

  // If directory was renamed, use the new path
  if (result.newDirectoryPath) {
    targetPath = result.newDirectoryPath;
    console.log(`Using new path for file creation: ${targetPath}`);

    // Also mark the new path as processed to avoid duplicate processing
    processedDirectories.add(targetPath);
  }

  // Create only the pattern-specific files
  Object.entries(result.templates).forEach(([fileName, content]) => {
    const filePath = path.join(targetPath, fileName);
    console.log(`Creating file: ${filePath}`);

    if (!fileExistsSafe(filePath)) {
      createFile(filePath, content, path.basename(targetPath), targetPath);
    } else {
      console.log(`File already exists: ${filePath}`);
    }
  });
}

/**
 * Handle regular directories without special patterns
 */
function handleRegularDirectory(directoryPath: string, dirName: string): void {
  console.log(`Regular directory detected: ${directoryPath}`);
  console.log(`Keeping the directory structure as is`);

  // Keep directory as is, don't modify or create any files
  // This allows for manual creation of folders without auto-generation
}

/**
 * Check if a path is a valid directory
 */
function isValidDirectory(directoryPath: string): boolean {
  return fileExistsSafe(directoryPath) && fs.statSync(directoryPath).isDirectory();
}

/**
 * Check if a file exists safely
 */
function fileExistsSafe(filePath: string): boolean {
  try {
    // Use fs.stat to bypass cache
    fs.statSync(filePath);
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Create a file with processed template content
 */
function createFile(
  filePath: string,
  content: string,
  dirName: string,
  directoryPath: string
): void {
  try {
    const processedContent = processTemplate(content, {
      name: dirName,
      Name: toPascalCase(dirName),
      path: normalizePathForTemplate(directoryPath),
    });

    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fileExistsSafe(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }

    // Write file
    fs.writeFileSync(filePath, processedContent);
    console.log(`File created: ${filePath}`);
  } catch (error) {
    console.error(`Failed to create file: ${filePath}`, error);
  }
}

/**
 * Normalize a path for use in templates
 */
function normalizePathForTemplate(directoryPath: string): string {
  return directoryPath.replace(config.watchDir, '').replace(/\\/g, '/');
}

/**
 * Initialize the directory watcher
 */
function initWatcher(): void {
  // Check if watch directory exists instead of creating it
  if (!fileExistsSafe(config.watchDir)) {
    console.error(`Watch directory does not exist: ${config.watchDir}`);
    console.log(`Please create the directory manually before running the app.`);
    process.exit(1);
  }

  const watcher = createWatcher();

  console.log(`Started watching directory: ${config.watchDir}`);

  setupWatcherEvents(watcher);
  setupProcessEvents(watcher);
}

/**
 * Ensure the watch directory exists (function kept for reference but not used)
 */
function ensureWatchDirectory(): void {
  // Keep this function for reference but don't use it
  // The check is now done in initWatcher
}

/**
 * Create a file system watcher
 */
function createWatcher(): chokidar.FSWatcher {
  return chokidar.watch(config.watchDir, {
    persistent: true,
    ignoreInitial: false,
    ignored: config.ignorePatterns,
    awaitWriteFinish: {
      stabilityThreshold: 2000,
      pollInterval: 100,
    },
  });
}

/**
 * Set up watcher event handlers
 */
function setupWatcherEvents(watcher: chokidar.FSWatcher): void {
  watcher.on('addDir', directoryPath => {
    if (directoryPath !== config.watchDir) {
      createFilesForDirectory(directoryPath);
    }
  });

  watcher.on('error', error => {
    console.error('Error occurred during watching:', error);
  });
}

/**
 * Set up process event handlers
 */
function setupProcessEvents(watcher: chokidar.FSWatcher): void {
  process.on('SIGINT', () => {
    watcher.close().then(() => {
      console.log('Watching ended');
      process.exit(0);
    });
  });
}

// Start the watcher
initWatcher();
