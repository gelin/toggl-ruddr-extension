# Toggl + Ruddr Chrome Extension

A Chrome extension that helps insert tracked hours from Toggl to Ruddr.

## Features

- Fetch time entries from Toggl Track
- Insert time entries into Ruddr time tracking forms
- Save settings for Toggl API token and workspace
- Map Toggl projects to Ruddr projects

## Development

This extension is built with:

- [Svelte](https://svelte.dev/) - A reactive JavaScript framework
- [TypeScript](https://www.typescriptlang.org/) - For type safety
- [svelte5-chrome-extension](https://github.com/trentbrew/svelte5-chrome-extension) - An example of Svelte and Vite configuration to build the Chrome Extension

### Prerequisites

- [Node.js](https://nodejs.org/) (v22.17.0 LTS)
- npm (comes with Node.js)
- [NVM](https://github.com/nvm-sh/nvm) (recommended for managing Node.js versions)

### Setup

1. Clone the repository
2. If you're using NVM, run:

```bash
nvm use
```

This will automatically use the Node.js version specified in the `.nvmrc` file.

3. Install dependencies:

```bash
npm install
```

### Build

To build the extension:

```bash
npm run build
```

This will:
- Compile the Svelte components
- Bundle the JavaScript files
- Copy static assets to the `extension` directory

The built extension will be in the `extension` directory.

### Development

For development with hot reloading:

```bash
npm run dev
```

### Testing in Chrome

1. Build the extension
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in the top right)
4. Click "Load unpacked" and select the `extension` directory
5. The extension should now be installed and visible in your extensions list
