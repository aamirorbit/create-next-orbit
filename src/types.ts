export interface CliArgs {
  projectName: string;
  components?: string;
  dryRun: boolean;
  noInstall: boolean;
  useConfig: boolean;
  all: boolean;
  command?: 'create' | 'add-all';
}

export interface OrbitConfig {
  components: string[];
  tailwind: boolean;
  shadcnVersion: string;
}

export interface ComponentOption {
  name: string;
  value: string;
  description: string;
}

export interface CommandResult {
  success: boolean;
  command: string;
  output?: string;
  error?: string;
} 