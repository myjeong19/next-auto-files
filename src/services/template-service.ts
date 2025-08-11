import * as path from 'path';
import { defaultTemplates, processTemplate, toPascalCase } from '../templates';
import { FILE_TYPE_EXTENSIONS } from '../constants';
import { TemplateResult, TemplateVariables } from '../types';
import { parsePattern } from '../utils/pattern-utils';
import { renameDirectorySafe } from '../utils/file-utils';
import { getAbsolutePath } from '../config';

export class TemplateService {
  constructor(private watchDir: string) {}

  getTemplatesForDirectory(directoryPath: string): Record<string, string> {
    const dirName = path.basename(directoryPath);

    if (this.hasPattern(dirName)) {
      const result = this.getTemplatesFromPattern(dirName, directoryPath);
      return result.templates;
    }

    return {};
  }

  private hasPattern(dirName: string): boolean {
    return dirName.includes('.') || dirName.includes(':');
  }

  getTemplatesFromPattern(patternDirName: string, directoryPath: string): TemplateResult {
    const parseResult = parsePattern(patternDirName);

    if (!parseResult.isValid) {
      return { templates: {} };
    }

    const { baseName, fileType } = parseResult;
    const templates = this.generateTemplatesForFileType(fileType);
    const newDirectoryPath = this.renameDirectoryIfNeeded(directoryPath, baseName);

    return {
      templates,
      newDirectoryPath: newDirectoryPath || undefined,
    };
  }

  private generateTemplatesForFileType(fileType: string): Record<string, string> {
    const templates: Record<string, string> = {};

    if (!FILE_TYPE_EXTENSIONS[fileType]) {
      return templates;
    }

    const fileTypes = FILE_TYPE_EXTENSIONS[fileType];

    if (fileType === 'default') {
      console.log(`Default pattern detected, creating all standard files`);
      Object.entries(defaultTemplates).forEach(([fileName, content]) => {
        templates[fileName] = content;
      });
    } else {
      fileTypes.forEach((fileName: string) => {
        if (defaultTemplates[fileName]) {
          templates[fileName] = defaultTemplates[fileName];
        }
      });
    }

    return templates;
  }

  private renameDirectoryIfNeeded(directoryPath: string, baseName: string): string | null {
    const parentDir = path.dirname(directoryPath);
    const newDirPath = path.join(parentDir, baseName);

    if (renameDirectorySafe(directoryPath, newDirPath)) {
      return newDirPath;
    }

    return null;
  }

  createTemplateVariables(dirName: string, directoryPath: string): TemplateVariables {
    return {
      name: dirName,
      Name: toPascalCase(dirName),
      path: this.normalizePathForTemplate(directoryPath),
    };
  }

  private normalizePathForTemplate(directoryPath: string): string {
    const absoluteWatchDir = getAbsolutePath(this.watchDir);
    return directoryPath.replace(absoluteWatchDir, '').replace(/\\/g, '/');
  }

  processTemplate(template: string, variables: TemplateVariables): string {
    return processTemplate(template, variables);
  }
}
