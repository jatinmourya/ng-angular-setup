/**
 * Project Templates
 */
export const PROJECT_TEMPLATES = {
    basic: {
        name: 'Basic SPA',
        description: 'Minimal setup with routing',
        options: {
            routing: true,
            style: 'css',
            strict: false,
            standalone: false
        },
        packages: []
    },
    enterprise: {
        name: 'Enterprise',
        description: 'NgRx, Angular Material, strict mode, ESLint',
        options: {
            routing: true,
            style: 'scss',
            strict: true,
            standalone: false
        },
        packages: [
            '@angular/material',
            '@angular/cdk',
            '@ngrx/store',
            '@ngrx/effects',
            '@ngrx/entity',
            '@ngrx/store-devtools',
            'eslint'
        ],
        devPackages: [
            '@typescript-eslint/eslint-plugin',
            '@typescript-eslint/parser'
        ]
    },
    pwa: {
        name: 'PWA Ready',
        description: 'Service workers, manifest, offline support',
        options: {
            routing: true,
            style: 'scss',
            strict: true,
            standalone: false
        },
        packages: [
            '@angular/pwa',
            '@angular/service-worker'
        ]
    },
    material: {
        name: 'Material Design',
        description: 'Angular Material UI components',
        options: {
            routing: true,
            style: 'scss',
            strict: false,
            standalone: false
        },
        packages: [
            '@angular/material',
            '@angular/cdk'
        ]
    },
    testing: {
        name: 'Testing Ready',
        description: 'Jest, Testing Library, Spectator',
        options: {
            routing: true,
            style: 'scss',
            strict: true,
            standalone: false
        },
        packages: [
            '@testing-library/angular',
            '@ngneat/spectator'
        ],
        devPackages: [
            'jest',
            '@types/jest',
            'jest-preset-angular'
        ]
    },
    standalone: {
        name: 'Standalone Components',
        description: 'Modern Angular with standalone components',
        options: {
            routing: true,
            style: 'scss',
            strict: true,
            standalone: true
        },
        packages: []
    }
};

/**
 * Library Bundles
 */
export const LIBRARY_BUNDLES = {
    uiFramework: {
        name: 'UI Framework Bundle',
        description: 'Angular Material + CDK',
        packages: [
            { name: '@angular/material', version: 'latest' },
            { name: '@angular/cdk', version: 'latest' }
        ]
    },
    stateManagement: {
        name: 'State Management Bundle',
        description: 'NgRx + Entity + Effects + DevTools',
        packages: [
            { name: '@ngrx/store', version: 'latest' },
            { name: '@ngrx/effects', version: 'latest' },
            { name: '@ngrx/entity', version: 'latest' },
            { name: '@ngrx/store-devtools', version: 'latest' }
        ]
    },
    forms: {
        name: 'Form & Validation Bundle',
        description: 'Reactive Forms utilities and validators',
        packages: [
            { name: 'ngx-mask', version: 'latest' },
            { name: '@angular/forms', version: 'latest' }
        ]
    },
    testing: {
        name: 'Testing Bundle',
        description: 'Jest + Testing Library + Spectator',
        packages: [],
        devPackages: [
            { name: 'jest', version: 'latest' },
            { name: '@types/jest', version: 'latest' },
            { name: 'jest-preset-angular', version: 'latest' },
            { name: '@testing-library/angular', version: 'latest' },
            { name: '@ngneat/spectator', version: 'latest' }
        ]
    },
    performance: {
        name: 'Performance Bundle',
        description: 'Angular Universal + optimization tools',
        packages: [
            { name: '@nguniversal/express-engine', version: 'latest' }
        ]
    },
    authentication: {
        name: 'Authentication Bundle',
        description: 'Auth utilities and Firebase',
        packages: [
            { name: '@angular/fire', version: 'latest' },
            { name: 'firebase', version: 'latest' }
        ]
    },
    utilities: {
        name: 'Utilities Bundle',
        description: 'Common utility libraries',
        packages: [
            { name: 'lodash', version: 'latest' },
            { name: 'date-fns', version: 'latest' },
            { name: 'rxjs', version: 'latest' }
        ]
    },
    http: {
        name: 'HTTP & API Bundle',
        description: 'HTTP client and API tools',
        packages: [
            { name: '@angular/common', version: 'latest' },
            { name: 'axios', version: 'latest' }
        ]
    }
};

/**
 * Configuration Presets
 */
export const CONFIG_PRESETS = {
    typescript: {
        name: 'TypeScript Strict Mode',
        files: {
            'tsconfig.json': (existing) => ({
                ...existing,
                compilerOptions: {
                    ...existing.compilerOptions,
                    strict: true,
                    noImplicitAny: true,
                    noImplicitReturns: true,
                    noFallthroughCasesInSwitch: true,
                    strictNullChecks: true
                }
            })
        }
    },
    eslint: {
        name: 'ESLint + Prettier',
        packages: ['eslint', 'prettier', 'eslint-config-prettier', 'eslint-plugin-prettier'],
        files: {
            '.eslintrc.json': {
                extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
                parser: '@typescript-eslint/parser',
                plugins: ['@typescript-eslint', 'prettier'],
                rules: {
                    'prettier/prettier': 'error'
                }
            },
            '.prettierrc': {
                semi: true,
                singleQuote: true,
                trailingComma: 'es5',
                printWidth: 100,
                tabWidth: 2
            }
        }
    },
    husky: {
        name: 'Husky Pre-commit Hooks',
        devPackages: ['husky', 'lint-staged'],
        scripts: {
            'prepare': 'husky install',
            'pre-commit': 'lint-staged'
        },
        files: {
            '.husky/pre-commit': '#!/bin/sh\n. "$(dirname "$0")/_/husky.sh"\n\nnpx lint-staged',
            'lint-staged.config.js': `module.exports = {
  '*.{js,ts}': ['eslint --fix', 'prettier --write'],
  '*.{json,md}': ['prettier --write']
};`
        }
    }
};

/**
 * Project Structure
 */
export const PROJECT_STRUCTURE = {
    standard: {
        name: 'Standard Structure',
        folders: [
            'src/app/core',
            'src/app/core/services',
            'src/app/core/guards',
            'src/app/core/interceptors',
            'src/app/shared',
            'src/app/shared/components',
            'src/app/shared/directives',
            'src/app/shared/pipes',
            'src/app/features',
            'src/app/models',
            'src/assets/images',
            'src/assets/styles',
            'src/environments'
        ],
        files: {
            'src/app/core/README.md': '# Core Module\n\nSingleton services, guards, and interceptors go here.',
            'src/app/shared/README.md': '# Shared Module\n\nReusable components, directives, and pipes go here.',
            'src/app/features/README.md': '# Features\n\nFeature modules go here.',
            'src/app/models/README.md': '# Models\n\nTypeScript interfaces and types go here.'
        }
    },
    domain: {
        name: 'Domain-Driven Structure',
        folders: [
            'src/app/core',
            'src/app/shared',
            'src/app/domains',
            'src/app/infrastructure'
        ]
    }
};

/**
 * Git Configuration
 */
export const GIT_CONFIG = {
    gitignore: `# See http://help.github.com/ignore-files/ for more about ignoring files.

# Compiled output
/dist
/tmp
/out-tsc
/bazel-out

# Node
/node_modules
npm-debug.log
yarn-error.log

# IDEs and editors
.idea/
.project
.classpath
.c9/
*.launch
.settings/
*.sublime-workspace

# Visual Studio Code
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json
.history/*

# Miscellaneous
/.angular/cache
.sass-cache/
/connect.lock
/coverage
/libpeerconnection.log
testem.log
/typings

# System files
.DS_Store
Thumbs.db

# Environment
.env
.env.local
`,
    initialCommitMessage: 'Initial commit: Angular project setup'
};

/**
 * Documentation Templates
 */
export const DOC_TEMPLATES = {
    readme: (projectName, description) => `# ${projectName}

${description || 'An Angular application'}

## Description

This project was generated with Angular CLI.

## Development server

Run \`ng serve\` for a dev server. Navigate to \`http://localhost:4200/\`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run \`ng generate component component-name\` to generate a new component. You can also use \`ng generate directive|pipe|service|class|guard|interface|enum|module\`.

## Build

Run \`ng build\` to build the project. The build artifacts will be stored in the \`dist/\` directory.

## Running unit tests

Run \`ng test\` to execute the unit tests via your test runner.

## Running end-to-end tests

Run \`ng e2e\` to execute the end-to-end tests via a platform of your choice.

## Further help

To get more help on the Angular CLI use \`ng help\` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## Project Structure

\`\`\`
src/
├── app/
│   ├── core/           # Singleton services, guards
│   ├── shared/         # Common components, pipes, directives
│   ├── features/       # Feature modules
│   ├── models/         # TypeScript interfaces/types
│   └── services/       # Business logic services
\`\`\`

## Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add some amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
`,
    changelog: `# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Initial project setup

### Changed

### Fixed

### Removed
`
};
