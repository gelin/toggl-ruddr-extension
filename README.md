# Toggl + Ruddr Chrome Extension

A Chrome extension that helps insert tracked hours from Toggl to Ruddr.

## Features

- Fetch time entries from Toggl Track
- Insert time entries into Ruddr time tracking forms
- Save settings for Toggl API token and workspace
- TODO: Map Toggl projects to Ruddr projects

## Quick Start

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in the top right)
3. Click "Load unpacked" and select the `extension` directory
4. The extension should now be installed and visible in your extensions list

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

```bash
nvm use
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

For development with hot reloading (applicable only for the extension popup):

```bash
npm run dev
```
