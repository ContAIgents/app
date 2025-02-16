# Contaigents CLI

A modular AI Content Ecosystem CLI tool.

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

## Installation

### Local Development

1. Clone the repository and navigate to the CLI directory:
```bash
cd cli
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. Create a global symlink:
```bash
npm link
```

Now you can use `ai-content` command globally from anywhere in your terminal.

### Using npx

You can run the CLI directly using npx:
```bash
npx contaigents
```

### Global Installation

To install the package globally:
```bash
npm install -g contaigents
```

## Usage

After installation, you can use the CLI in the following ways:

```bash
# Using the linked command
ai-content

# Using npx
npx contaigents

# If installed globally
contaigents
```

## Development

To start development server:
```bash
npm run dev
```

To build the project:
```bash
npm run build
```

To start the built version:
```bash
npm start
```

## Configuration

The CLI looks for configuration files in the `.ai-content` directory of your project. You can customize agent behaviors by modifying the configuration files.

Example configuration can be found in `.ai-content/writer-config.json`.

## License

ISC