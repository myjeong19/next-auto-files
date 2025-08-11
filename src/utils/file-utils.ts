import * as fs from 'fs';
import * as path from 'path';

export function fileExistsSafe(filePath: string): boolean {
  try {
    fs.statSync(filePath);
    return true;
  } catch (err) {
    return false;
  }
}

export function isValidDirectory(directoryPath: string): boolean {
  return fileExistsSafe(directoryPath) && fs.statSync(directoryPath).isDirectory();
}

export function ensureDirectoryExists(dirPath: string): void {
  if (!fileExistsSafe(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Directory created: ${dirPath}`);
  }
}

export function createFileSafe(filePath: string, content: string): boolean {
  try {
    const dir = path.dirname(filePath);
    ensureDirectoryExists(dir);

    fs.writeFileSync(filePath, content);
    console.log(`File created: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Failed to create file: ${filePath}`, error);
    return false;
  }
}

export function renameDirectorySafe(oldPath: string, newPath: string): boolean {
  if (oldPath === newPath || fileExistsSafe(newPath)) {
    return false;
  }

  try {
    fs.renameSync(oldPath, newPath);
    console.log(`Directory renamed: ${oldPath} -> ${newPath}`);
    return true;
  } catch (error) {
    console.error(`Failed to rename directory: ${oldPath}`, error);
    return false;
  }
}
