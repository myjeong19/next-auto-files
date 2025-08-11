# next-auto-files

Automatic file generator for Next.js App Router applications. Watch directories and generate template files based on naming patterns.

## Installation

```bash
# Using npm
npm install --save-dev next-auto-files

# Using yarn
yarn add --dev next-auto-files

# Global installation
npm install -g next-auto-files
```

## Usage

### Running the tool

From your project root directory, run:

```bash
# If installed globally
next-auto-files

# If installed locally
npx next-auto-files
```

You can also add it as a script in your package.json:

```json
{
  "scripts": {
    "dev:watch": "next-auto-files"
  }
}
```

Then run it with `npm run dev:watch`.

### Folder Naming Patterns

Create folders with the following naming patterns to automatically generate template files:

1. **[name].default**: Creates all default files (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`)

   ```
   # Example: Creating a folder named settings.default
   # Result: Creates all default files in the settings folder
   ```

2. **[name].page**: For page components (generates `page.tsx` file)

   ```
   # Example: Creating a folder named blog.page
   # Result: Creates blog/page.tsx file
   ```

3. **[name].layout**: For layout components (generates `layout.tsx` file)

   ```
   # Example: Creating a folder named dashboard.layout
   # Result: Creates dashboard/layout.tsx file
   ```

4. **[name].error**: For error components (generates `error.tsx` file)

   ```
   # Example: Creating a folder named profile.error
   # Result: Creates profile/error.tsx file
   ```

5. **[name].loading**: For loading components (generates `loading.tsx` file)

   ```
   # Example: Creating a folder named products.loading
   # Result: Creates products/loading.tsx file
   ```

Note: You can also use `:` instead of `.` as a separator (e.g., `blog:page`).

## Configuration

A `next-auto-files.config.json` file is automatically created in your project root. You can modify this file to change the following settings:

```json
{
  "watchDir": "app",
  "ignorePatterns": ["**/node_modules/**", "**/.git/**", "**/dist/**", "**/build/**"]
}
```

- **watchDir**: The directory to watch for changes (default: `app`)
- **ignorePatterns**: Glob patterns to exclude from watching

## Features

- 🚀 **Automatic file generation** based on folder naming patterns
- 📁 **Smart directory watching** with configurable patterns
- 🔄 **Real-time monitoring** of file system changes
- 🛡️ **Safe operation** - never overwrites existing files
- ⚡ **Minimal setup** - works out of the box
- 🎯 **TypeScript support** with clean templates

## Notes

- Folders without specific patterns will be kept as is without any files being generated
- The tool watches the `app` directory by default. Edit the config file to watch a different directory
- Existing files will not be overwritten
- Files are generated with clean, minimal boilerplate code
- Directory names are automatically converted to PascalCase for component names

## Technical Stack

- TypeScript
- Node.js
- chokidar (file system watcher)

## License

MIT
