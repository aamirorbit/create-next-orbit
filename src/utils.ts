import { CliArgs, OrbitConfig } from './types.js';
import { CONFIG_FILE_NAME } from './constants.js';
import fs from 'fs/promises';
import path from 'path';

export function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  const parsed: CliArgs = {
    projectName: '',
    dryRun: false,
    noInstall: false,
    useConfig: false,
    all: false
  };

  // Check if first argument is a command
  if (args[0] === 'add-all') {
    parsed.command = 'add-all';
    args.shift(); // Remove the command from args
  } else {
    parsed.command = 'create';
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg.startsWith('--')) {
      const [flag, value] = arg.split('=');
      
      switch (flag) {
        case '--components':
          parsed.components = value?.replace(/"/g, '') || '';
          break;
        case '--dry-run':
          parsed.dryRun = true;
          break;
        case '--no-install':
          parsed.noInstall = true;
          break;
        case '--use-config':
          parsed.useConfig = true;
          break;
        case '--all':
          parsed.all = true;
          break;
      }
    } else if (!parsed.projectName) {
      parsed.projectName = arg;
    }
  }

  return parsed;
}

export function normalizeComponentName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export function parseComponentsString(componentsStr: string): string[] {
  return componentsStr
    .split(',')
    .map(comp => comp.trim())
    .filter(comp => comp.length > 0)
    .map(normalizeComponentName);
}

export async function readConfig(projectPath: string): Promise<OrbitConfig | null> {
  try {
    const configPath = path.join(projectPath, CONFIG_FILE_NAME);
    const configData = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(configData) as OrbitConfig;
  } catch {
    return null;
  }
}

export async function writeConfig(projectPath: string, config: OrbitConfig): Promise<void> {
  const configPath = path.join(projectPath, CONFIG_FILE_NAME);
  await fs.writeFile(configPath, JSON.stringify(config, null, 2));
}

export async function directoryExists(path: string): Promise<boolean> {
  try {
    const stat = await fs.stat(path);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

export function validateProjectName(name: string): boolean {
  // Basic validation for npm package names
  const npmNameRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
  return npmNameRegex.test(name) && name.length > 0;
}

export async function isNextJsProject(cwd: string): Promise<boolean> {
  try {
    const packageJsonPath = path.join(cwd, 'package.json');
    const packageJson = await fs.readFile(packageJsonPath, 'utf-8');
    const pkg = JSON.parse(packageJson);
    return pkg.dependencies?.next || pkg.devDependencies?.next;
  } catch {
    return false;
  }
}

export async function isShadcnInitialized(cwd: string): Promise<boolean> {
  try {
    const componentsPath = path.join(cwd, 'components.json');
    await fs.access(componentsPath);
    return true;
  } catch {
    return false;
  }
} 