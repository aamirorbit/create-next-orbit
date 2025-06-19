#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import { CliArgs, OrbitConfig } from './types.js';
import { parseArgs, normalizeComponentName, parseComponentsString, writeConfig, directoryExists, validateProjectName, isNextJsProject, isShadcnInitialized } from './utils.js';
import { executeNpxCommand, executeCommand, executeShadcnCommand } from './executor.js';
import { promptForComponents } from './prompts.js';
import { CONFIG_FILE_NAME, DEFAULT_SHADCN_VERSION, SHADCN_COMPONENTS } from './constants.js';

async function addAllComponents(dryRun = false): Promise<void> {
  const cwd = process.cwd();
  
  // Check if this is a Next.js project
  if (!(await isNextJsProject(cwd))) {
    console.error(chalk.red('❌ Error: This is not a Next.js project'));
    console.log(chalk.yellow('Please run this command from a Next.js project directory'));
    process.exit(1);
  }

  // Check if shadcn/ui is initialized
  if (!(await isShadcnInitialized(cwd))) {
    console.log(chalk.blue('🔧 Initializing shadcn/ui...'));
    const initSpinner = ora('Initializing shadcn/ui...').start();
    const initResult = await executeShadcnCommand(['init'], cwd, dryRun);

    if (!initResult.success) {
      initSpinner.fail('Failed to initialize shadcn/ui');
      console.error(chalk.red(`❌ ${initResult.error}`));
      process.exit(1);
    }
    initSpinner.succeed('shadcn/ui initialized successfully');
  }

  // Install all components
  const selectedComponents = SHADCN_COMPONENTS.map(component => component.value);
  console.log(chalk.blue(`🎯 Installing all ${selectedComponents.length} components...`));

  const componentSpinner = ora(`Installing ${selectedComponents.length} components...`).start();
  
  for (const component of selectedComponents) {
    const componentResult = await executeShadcnCommand(['add', component], cwd, dryRun);

    if (!componentResult.success) {
      componentSpinner.fail(`Failed to install component: ${component}`);
      console.error(chalk.red(`❌ ${componentResult.error}`));
      console.log(chalk.yellow(`⚠️  Skipping ${component} and continuing...`));
    }
  }
  
  componentSpinner.succeed(`Installed ${selectedComponents.length} components`);

  // Generate configuration file
  const config: OrbitConfig = {
    components: selectedComponents,
    tailwind: true,
    shadcnVersion: DEFAULT_SHADCN_VERSION
  };

  if (!dryRun) {
    await writeConfig(cwd, config);
  }

  // Success message
  console.log('\n' + chalk.green('✅ All components installed successfully!'));
  console.log(chalk.blue(`\nConfiguration saved to: ${CONFIG_FILE_NAME}`));
}

async function main(): Promise<void> {
  try {
    const args = parseArgs();
    
    // Handle add-all command
    if (args.command === 'add-all') {
      await addAllComponents(args.dryRun);
      return;
    }

    // Original create project logic
    if (!args.projectName) {
      console.error(chalk.red('❌ Error: Project name is required'));
      console.log(chalk.yellow('Usage: npx create-next-orbit <project-name> [options]'));
      console.log(chalk.yellow('       npx create-next-orbit add-all [options]'));
      process.exit(1);
    }

    if (!validateProjectName(args.projectName)) {
      console.error(chalk.red('❌ Error: Invalid project name'));
      console.log(chalk.yellow('Project name must be a valid npm package name (lowercase, hyphens only)'));
      process.exit(1);
    }

    const projectPath = path.resolve(args.projectName);

    // Check if directory already exists
    if (await directoryExists(projectPath)) {
      console.error(chalk.red(`❌ Error: Directory "${args.projectName}" already exists`));
      process.exit(1);
    }

    console.log(chalk.blue(`🚀 Creating Next.js project: ${args.projectName}`));

    // Step 1: Create Next.js project
    const createSpinner = ora('Creating Next.js project...').start();
    const createResult = await executeNpxCommand(
      'create-next-app@latest',
      [args.projectName, '--typescript', '--tailwind', '--yes'],
      undefined,
      args.dryRun
    );

    if (!createResult.success) {
      createSpinner.fail('Failed to create Next.js project');
      console.error(chalk.red(`❌ ${createResult.error}`));
      process.exit(1);
    }
    createSpinner.succeed('Next.js project created successfully');

    // Step 2: Install dependencies (if not --no-install)
    if (!args.noInstall && !args.dryRun) {
      const installSpinner = ora('Installing dependencies...').start();
      const installResult = await executeCommand('npm', ['install'], projectPath, args.dryRun);
      
      if (!installResult.success) {
        installSpinner.fail('Failed to install dependencies');
        console.error(chalk.red(`❌ ${installResult.error}`));
        process.exit(1);
      }
      installSpinner.succeed('Dependencies installed successfully');
    }

    // Step 3: Initialize shadcn/ui
    const initSpinner = ora('Initializing shadcn/ui...').start();
    const initResult = await executeShadcnCommand(
      ['init'],
      projectPath,
      args.dryRun
    );

    if (!initResult.success) {
      initSpinner.fail('Failed to initialize shadcn/ui');
      console.error(chalk.red(`❌ ${initResult.error}`));
      process.exit(1);
    }
    initSpinner.succeed('shadcn/ui initialized successfully');

    // Step 4: Select components
    let selectedComponents: string[] = [];
    
    if (args.all) {
      // Install all components
      selectedComponents = SHADCN_COMPONENTS.map(component => component.value);
      console.log(chalk.blue(`🎯 Installing all ${selectedComponents.length} components...`));
    } else if (args.components) {
      selectedComponents = parseComponentsString(args.components);
    } else {
      selectedComponents = await promptForComponents();
    }

    if (selectedComponents.length === 0) {
      console.log(chalk.yellow('⚠️  No components selected. Skipping component installation.'));
    } else {
      // Step 5: Install selected components
      const componentSpinner = ora(`Installing ${selectedComponents.length} components...`).start();
      
      for (const component of selectedComponents) {
        const componentResult = await executeShadcnCommand(
          ['add', component],
          projectPath,
          args.dryRun
        );

        if (!componentResult.success) {
          componentSpinner.fail(`Failed to install component: ${component}`);
          console.error(chalk.red(`❌ ${componentResult.error}`));
          // Continue with other components instead of exiting
          console.log(chalk.yellow(`⚠️  Skipping ${component} and continuing...`));
        }
      }
      
      componentSpinner.succeed(`Installed ${selectedComponents.length} components`);
    }

    // Step 6: Generate configuration file
    const config: OrbitConfig = {
      components: selectedComponents,
      tailwind: true,
      shadcnVersion: DEFAULT_SHADCN_VERSION
    };

    if (!args.dryRun) {
      await writeConfig(projectPath, config);
    }

    // Success message
    console.log('\n' + chalk.green('✅ Project created successfully!'));
    console.log(chalk.blue('\nNext steps:'));
    console.log(chalk.white(`  cd ${args.projectName}`));
    console.log(chalk.white('  npm run dev'));
    
    if (selectedComponents.length > 0) {
      console.log(chalk.blue('\nInstalled components:'));
      if (args.all) {
        console.log(chalk.white(`  - All ${selectedComponents.length} components installed`));
      } else {
        selectedComponents.forEach(component => {
          console.log(chalk.white(`  - ${component}`));
        });
      }
    }

    console.log(chalk.blue(`\nConfiguration saved to: ${CONFIG_FILE_NAME}`));

  } catch (error) {
    console.error(chalk.red('❌ Unexpected error:'));
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('❌ Unhandled Rejection at:'), promise);
  console.error(chalk.red('Reason:'), reason);
  process.exit(1);
});

main();