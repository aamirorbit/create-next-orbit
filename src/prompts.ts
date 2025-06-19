import inquirer from 'inquirer';
import { SHADCN_COMPONENTS } from './constants.js';

export async function promptForComponents(): Promise<string[]> {
  const { selectedComponents } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedComponents',
      message: 'Select shadcn/ui components to install:',
      choices: [
        {
          name: '🚀 Install All Components (Recommended for full UI library)',
          value: 'all',
          checked: false
        },
        new inquirer.Separator(),
        ...SHADCN_COMPONENTS.map(component => ({
          name: `${component.name} - ${component.description}`,
          value: component.value,
          checked: false
        }))
      ],
      pageSize: 10,
      loop: false
    }
  ]);

  // If "all" is selected, return all component values
  if (selectedComponents.includes('all')) {
    return SHADCN_COMPONENTS.map(component => component.value);
  }

  return selectedComponents || [];
}

export async function confirmAction(message: string): Promise<boolean> {
  const { confirmed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmed',
      message,
      default: true
    }
  ]);

  return confirmed;
} 