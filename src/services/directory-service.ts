import * as path from 'path';
import { TemplateService } from './template-service';
import { DirectoryProcessResult } from '../types';
import { isValidDirectory, createFileSafe } from '../utils/file-utils';
import { hasPattern } from '../utils/pattern-utils';

export class DirectoryService {
  private processedDirectories = new Set<string>();

  constructor(private templateService: TemplateService) {}

  processNewDirectory(directoryPath: string): DirectoryProcessResult {
    console.log(`Directory detected: ${directoryPath}`);

    if (this.isAlreadyProcessed(directoryPath) || !isValidDirectory(directoryPath)) {
      console.log(`Skipping already processed or invalid directory: ${directoryPath}`);
      return { success: false, error: 'Already processed or invalid directory' };
    }

    this.markAsProcessed(directoryPath);
    const dirName = path.basename(directoryPath);

    if (hasPattern(dirName)) {
      return this.handlePatternDirectory(directoryPath, dirName);
    } else {
      return this.handleRegularDirectory(directoryPath, dirName);
    }
  }

  private isAlreadyProcessed(directoryPath: string): boolean {
    return this.processedDirectories.has(directoryPath);
  }

  private markAsProcessed(directoryPath: string): void {
    this.processedDirectories.add(directoryPath);
  }

  private handlePatternDirectory(directoryPath: string, dirName: string): DirectoryProcessResult {
    const result = this.templateService.getTemplatesFromPattern(dirName, directoryPath);

    console.log(`Pattern detected: ${dirName}`);
    console.log(`Template keys: ${Object.keys(result.templates)}`);
    console.log(`Template count: ${Object.keys(result.templates).length}`);

    let targetPath = directoryPath;

    if (result.newDirectoryPath) {
      targetPath = result.newDirectoryPath;
      console.log(`Using new path for file creation: ${targetPath}`);
      this.markAsProcessed(targetPath);
    }

    const success = this.createTemplateFiles(targetPath, result.templates);

    return {
      success,
      processedPath: targetPath,
    };
  }

  private handleRegularDirectory(directoryPath: string, dirName: string): DirectoryProcessResult {
    console.log(`Regular directory detected: ${directoryPath}`);
    console.log(`Directory structure will be maintained as is`);

    return { success: true, processedPath: directoryPath };
  }

  private createTemplateFiles(targetPath: string, templates: Record<string, string>): boolean {
    const dirName = path.basename(targetPath);
    const variables = this.templateService.createTemplateVariables(dirName, targetPath);

    let allSuccessful = true;

    Object.entries(templates).forEach(([fileName, content]) => {
      const filePath = path.join(targetPath, fileName);
      console.log(`Creating file: ${filePath}`);

      const processedContent = this.templateService.processTemplate(content, variables);
      const success = createFileSafe(filePath, processedContent);

      if (!success) {
        allSuccessful = false;
      }
    });

    return allSuccessful;
  }
}
