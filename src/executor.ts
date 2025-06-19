import { execa } from 'execa';
import chalk from 'chalk';
import { CommandResult } from './types.js';

export async function executeCommand(
  command: string,
  args: string[],
  cwd?: string,
  dryRun = false
): Promise<CommandResult> {
  const fullCommand = `${command} ${args.join(' ')}`;
  
  if (dryRun) {
    console.log(chalk.blue(`🔍 DRY RUN: ${fullCommand}`));
    return {
      success: true,
      command: fullCommand
    };
  }

  try {
    const result = await execa(command, args, {
      cwd,
      stdio: 'pipe',
      reject: false
    });

    if (result.exitCode !== 0) {
      return {
        success: false,
        command: fullCommand,
        error: result.stderr || `Command failed with exit code ${result.exitCode}`
      };
    }

    return {
      success: true,
      command: fullCommand,
      output: result.stdout
    };
  } catch (error) {
    return {
      success: false,
      command: fullCommand,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

export async function executeNpxCommand(
  packageName: string,
  args: string[],
  cwd?: string,
  dryRun = false
): Promise<CommandResult> {
  return executeCommand('npx', [packageName, ...args], cwd, dryRun);
}

export async function executeShadcnCommand(
  args: string[],
  cwd?: string,
  dryRun = false
): Promise<CommandResult> {
  // For shadcn commands, we need to handle interactive prompts differently
  const fullCommand = `npx shadcn@latest ${args.join(' ')}`;
  
  if (dryRun) {
    console.log(chalk.blue(`🔍 DRY RUN: ${fullCommand}`));
    return {
      success: true,
      command: fullCommand
    };
  }

  try {
    // For shadcn init, we need to provide default answers
    if (args[0] === 'init') {
      const result = await execa('npx', ['shadcn@latest', ...args], {
        cwd,
        stdio: ['pipe', 'pipe', 'pipe'],
        reject: false,
        input: '\n\n\n\n\n\n' // Default answers for init prompts
      });

      if (result.exitCode !== 0) {
        return {
          success: false,
          command: fullCommand,
          error: result.stderr || `Command failed with exit code ${result.exitCode}`
        };
      }

      return {
        success: true,
        command: fullCommand,
        output: result.stdout
      };
    }

    // For shadcn add, we need to provide default answers
    if (args[0] === 'add') {
      const result = await execa('npx', ['shadcn@latest', ...args], {
        cwd,
        stdio: ['pipe', 'pipe', 'pipe'],
        reject: false,
        input: '\n' // Default answer for add prompts
      });

      if (result.exitCode !== 0) {
        return {
          success: false,
          command: fullCommand,
          error: result.stderr || `Command failed with exit code ${result.exitCode}`
        };
      }

      return {
        success: true,
        command: fullCommand,
        output: result.stdout
      };
    }

    // Fallback to regular execution
    return executeNpxCommand('shadcn@latest', args, cwd, dryRun);
  } catch (error) {
    return {
      success: false,
      command: fullCommand,
      error: error instanceof Error ? error.message : String(error)
    };
  }
} 