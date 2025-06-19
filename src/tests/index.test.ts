import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseArgs, normalizeComponentName, parseComponentsString, validateProjectName } from '../utils.js';

// Mock process.argv
const mockArgv = (args: string[]) => {
  vi.stubGlobal('process', {
    ...process,
    argv: ['node', 'create-next-orbit', ...args]
  });
};

describe('CLI Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('parseArgs', () => {
    it('should parse project name correctly', () => {
      mockArgv(['my-project']);
      const args = parseArgs();
      expect(args.projectName).toBe('my-project');
      expect(args.command).toBe('create');
      expect(args.dryRun).toBe(false);
      expect(args.noInstall).toBe(false);
      expect(args.all).toBe(false);
    });

    it('should parse add-all command', () => {
      mockArgv(['add-all']);
      const args = parseArgs();
      expect(args.command).toBe('add-all');
      expect(args.projectName).toBe('');
    });

    it('should parse add-all command with flags', () => {
      mockArgv(['add-all', '--dry-run']);
      const args = parseArgs();
      expect(args.command).toBe('add-all');
      expect(args.dryRun).toBe(true);
    });

    it('should parse --dry-run flag', () => {
      mockArgv(['my-project', '--dry-run']);
      const args = parseArgs();
      expect(args.dryRun).toBe(true);
    });

    it('should parse --no-install flag', () => {
      mockArgv(['my-project', '--no-install']);
      const args = parseArgs();
      expect(args.noInstall).toBe(true);
    });

    it('should parse --components flag', () => {
      mockArgv(['my-project', '--components="button,card,input"']);
      const args = parseArgs();
      expect(args.components).toBe('button,card,input');
    });

    it('should parse --use-config flag', () => {
      mockArgv(['my-project', '--use-config']);
      const args = parseArgs();
      expect(args.useConfig).toBe(true);
    });

    it('should parse --all flag', () => {
      mockArgv(['my-project', '--all']);
      const args = parseArgs();
      expect(args.all).toBe(true);
    });
  });

  describe('normalizeComponentName', () => {
    it('should convert spaces to hyphens', () => {
      expect(normalizeComponentName('Alert Dialog')).toBe('alert-dialog');
    });

    it('should convert to lowercase', () => {
      expect(normalizeComponentName('BUTTON')).toBe('button');
    });

    it('should remove special characters', () => {
      expect(normalizeComponentName('Button!@#')).toBe('button');
    });

    it('should handle multiple spaces', () => {
      expect(normalizeComponentName('Navigation  Menu')).toBe('navigation-menu');
    });
  });

  describe('parseComponentsString', () => {
    it('should parse comma-separated components', () => {
      const result = parseComponentsString('button,card,input');
      expect(result).toEqual(['button', 'card', 'input']);
    });

    it('should handle spaces around commas', () => {
      const result = parseComponentsString('button , card , input');
      expect(result).toEqual(['button', 'card', 'input']);
    });

    it('should normalize component names', () => {
      const result = parseComponentsString('Alert Dialog,Button,Input Field');
      expect(result).toEqual(['alert-dialog', 'button', 'input-field']);
    });

    it('should filter empty components', () => {
      const result = parseComponentsString('button,,card,');
      expect(result).toEqual(['button', 'card']);
    });
  });

  describe('validateProjectName', () => {
    it('should accept valid project names', () => {
      expect(validateProjectName('my-project')).toBe(true);
      expect(validateProjectName('myproject')).toBe(true);
      expect(validateProjectName('my-project-123')).toBe(true);
    });

    it('should reject invalid project names', () => {
      expect(validateProjectName('')).toBe(false);
      expect(validateProjectName('My-Project')).toBe(false);
      expect(validateProjectName('my_project')).toBe(false);
      expect(validateProjectName('-my-project')).toBe(false);
      expect(validateProjectName('my-project-')).toBe(false);
    });
  });
}); 