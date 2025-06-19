# create-next-orbit

A production-ready Node.js CLI tool to bootstrap Next.js projects with shadcn/ui components.

## Features

- 🚀 **Quick Setup**: Bootstrap Next.js projects with TypeScript and Tailwind CSS
- 🎨 **Component Selection**: Interactive or flag-driven shadcn/ui component installation
- ⚙️ **Configuration**: Generate and reuse project configurations
- 🔍 **Dry Run**: Preview commands without execution
- 🎯 **Error Handling**: Robust error handling with clear messaging
- 📦 **Production Ready**: TypeScript, ESLint, Prettier, and comprehensive testing

## Installation

```bash
npx create-next-orbit <project-name> [options]
```

## Usage

### Create New Project

```bash
# Create a new Next.js project with interactive component selection
npx create-next-orbit my-app

# Create with specific components
npx create-next-orbit my-app --components="button,card,input,form"

# Install ALL components (full UI library)
npx create-next-orbit my-app --all

# Dry run to preview commands
npx create-next-orbit my-app --dry-run

# Skip dependency installation
npx create-next-orbit my-app --no-install
```

### Add Components to Existing Project

```bash
# Navigate to your existing Next.js project
cd my-existing-project

# Install ALL shadcn/ui components
npx create-next-orbit add-all

# Dry run to see what would be installed
npx create-next-orbit add-all --dry-run
```

### Options

| Flag | Description |
|------|-------------|
| `--components="list"` | Comma-separated list of shadcn/ui components to install |
| `--all` | Install ALL available shadcn/ui components |
| `--dry-run` | Print commands without executing them |
| `--no-install` | Skip `npm install` after project creation |
| `--use-config` | Use existing `orbit.config.json` for component selection |

### Available Components

The CLI supports all officially available shadcn/ui components from the [official documentation](https://ui.shadcn.com/docs/installation/next):

- **Layout & Navigation**: Accordion, Breadcrumb, Collapsible, Navigation Menu, Pagination, Resizable, Sidebar, Tabs
- **Forms & Inputs**: Button, Calendar, Checkbox, Form, Input, Input OTP, Label, Radio Group, Select, Slider, Switch, Textarea, Toggle, Toggle Group
- **Data Display**: Avatar, Badge, Card, Chart, Progress, Skeleton, Table
- **Feedback & Notifications**: Alert, Alert Dialog, Dialog, Drawer, Hover Card, Popover, Sheet, Sonner, Tooltip
- **Media & Content**: Aspect Ratio, Carousel, Command, Context Menu, Dropdown Menu, Menubar, Separator

## Configuration

The CLI generates an `orbit.config.json` file in your project root:

```json
{
  "components": ["button", "card", "input"],
  "tailwind": true,
  "shadcnVersion": "latest"
}
```

You can reuse this configuration with the `--use-config` flag:

```bash
npx create-next-orbit my-new-app --use-config
```

## How It Works

The CLI follows the official shadcn/ui installation process:

1. **Creates Next.js project** with TypeScript and Tailwind CSS
2. **Initializes shadcn/ui** using `npx shadcn@latest init`
3. **Installs selected components** using `npx shadcn@latest add <component>`
4. **Generates configuration** for future use

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

### Project Structure

```
create-next-orbit/
├── src/
│   ├── index.ts          # Main CLI entry point
│   ├── types.ts          # TypeScript type definitions
│   ├── constants.ts      # Constants and component list
│   ├── utils.ts          # Utility functions
│   ├── executor.ts       # Command execution logic
│   ├── prompts.ts        # Interactive prompts
│   └── tests/            # Test files
├── bin/                  # Compiled binary
├── dist/                 # Compiled distribution
└── package.json
```

### Scripts

- `npm run build` - Build TypeScript to JavaScript
- `npm run build:bin` - Build executable binary
- `npm run dev` - Watch mode for development
- `npm test` - Run tests with Vitest
- `npm run lint` - Lint with ESLint
- `npm run format` - Format with Prettier

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions, please open an issue on GitHub. 