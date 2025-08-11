export interface TemplateResult {
  templates: Record<string, string>;
  newDirectoryPath?: string;
}

export interface TemplateVariables {
  name: string;
  Name: string;
  path: string;
  [key: string]: string;
}

export interface PatternParseResult {
  baseName: string;
  fileType: string;
  isValid: boolean;
}

export interface DirectoryProcessResult {
  success: boolean;
  error?: string;
  processedPath?: string;
}
