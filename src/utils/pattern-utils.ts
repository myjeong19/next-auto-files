import { PATTERN_SEPARATORS, RESERVED_PATTERN_NAMES } from '../constants';
import { PatternParseResult } from '../types';

export function hasPattern(dirName: string): boolean {
  return PATTERN_SEPARATORS.some(separator => dirName.includes(separator));
}

export function parsePattern(patternDirName: string): PatternParseResult {
  const separator = PATTERN_SEPARATORS.find(sep => patternDirName.includes(sep));

  if (!separator) {
    return { baseName: '', fileType: '', isValid: false };
  }

  const [baseName, fileType] = patternDirName.split(separator);

  const isReservedName = RESERVED_PATTERN_NAMES.includes(baseName as any);
  if (isReservedName) {
    console.log(
      `Unsupported pattern: ${patternDirName}. Pattern should follow fileName.type or fileName:type format.`
    );
    return { baseName, fileType, isValid: false };
  }

  return { baseName, fileType, isValid: true };
}

export function extractBaseName(patternDirName: string): string {
  const parseResult = parsePattern(patternDirName);
  return parseResult.isValid ? parseResult.baseName : patternDirName;
}
