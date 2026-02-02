# Quick Start Guide

Get started with Angular Project Automator in minutes!

## 📦 Installation

### Option 1: Global Installation (Recommended)

```bash
npm install -g @jatinmourya/ng-init
```

### Option 2: Use with npx (No installation needed)

```bash
npx @jatinmourya/ng-init
```

## 🚀 Create Your First Project

### Step 1: Run the CLI

```bash
ng-init
```

### Step 2: Follow the Interactive Prompts

The CLI will guide you through:

1. **System Check** - Reviews your Node.js, npm, and Angular CLI versions
2. **Angular Version Selection** (3-step process):
   - Select major version (e.g., Angular 17, 18, 19)
   - Select minor version (e.g., 17.0.x, 17.1.x)
   - Select patch version (e.g., 17.1.0, 17.1.1)
3. **Compatibility Check** - Ensures your Node.js version is compatible
4. **Project Configuration** - Name your project and choose location
5. **Template Selection** - Pick a pre-configured template or customize
6. **Library Search** - Add additional npm packages (with auto version resolution)
7. **Additional Features** - Git, documentation, linting, etc.
8. **Save Profile** - Optionally save your configuration for reuse

### Step 3: Start Developing

```bash
cd your-project-name
ng serve
```

Open [http://localhost:4200](http://localhost:4200) in your browser!

## 🎯 Common Use Cases

### Use Case 1: Enterprise Project with NgRx and Material

```bash
ng-init
# Select Angular 17
# Choose "Enterprise" template
# Add any additional libraries
# Enable Git, README, ESLint
# Save as "enterprise-template" profile
```

### Use Case 2: Quick PWA Setup

```bash
ng-init
# Select latest Angular
# Choose "PWA Ready" template
# Skip additional libraries
# Enable Git and README
```

### Use Case 3: Reuse Saved Profile

```bash
ng-init
# Say "Yes" to use saved profile
# Select your profile
# Confirm and create
```

## 🔧 System Requirements

### Required
- **Node.js**: v18.0.0 or higher
- **npm**: Comes with Node.js

### Recommended
- **nvm**: For automatic Node version management
  - Windows: [nvm-windows](https://github.com/coreybutler/nvm-windows)
  - macOS/Linux: [nvm](https://github.com/nvm-sh/nvm)

## ⚡ Quick Commands

```bash
# Create new project
ng-init

# Check system versions
ng-init check

# List saved profiles
ng-init profile list

# Show profile details
ng-init profile show my-profile

# Export profile
ng-init profile export my-profile ./profile.json

# Import profile
ng-init profile import ./profile.json

# Show examples
ng-init examples
```

## 📚 What Gets Created?

When you create a project, you get:

### Basic Setup
- ✅ Angular project with selected version
- ✅ All dependencies installed
- ✅ TypeScript configuration
- ✅ Development server ready

### With Templates
- ✅ Pre-configured routing
- ✅ Stylesheet setup (CSS/SCSS)
- ✅ Template-specific libraries
- ✅ Best practices built-in

### With Features Enabled
- ✅ Git repository initialized
- ✅ Project folder structure
- ✅ README.md with documentation
- ✅ ESLint and Prettier configured
- ✅ Pre-commit hooks with Husky

## 🎨 Available Templates

1. **Basic SPA** - Minimal setup with routing
2. **Enterprise** - NgRx, Material, ESLint, strict mode
3. **PWA Ready** - Service workers and offline support
4. **Material Design** - Angular Material components
5. **Testing Ready** - Jest and Testing Library
6. **Standalone** - Modern standalone components

## 📦 Library Bundles

- **UI Framework** - Material + CDK + Flex Layout
- **State Management** - NgRx complete suite
- **Forms** - Form utilities and validators
- **Testing** - Jest + Testing Library + Spectator
- **Performance** - Universal + optimization
- **Authentication** - Firebase integration
- **Utilities** - Lodash, date-fns, RxJS
- **HTTP & API** - HTTP client and tools

## Dynamic Version Resolution (v1.1.0)

The CLI automatically resolves compatible library versions:
- ✅ Checks peer dependencies from npm registry
- ✅ Matches major versions for `@angular/*` packages
- ✅ Matches major versions for `@ngrx/*` packages
- ✅ Displays adjusted versions during installation
- ✅ Shows warnings for potentially incompatible packages

## 🐛 Troubleshooting

### "Node version incompatible"
The CLI will automatically guide you to:
- Install compatible Node version with nvm
- Or install Node.js directly on Windows

### "Angular CLI not found"
The CLI uses `npx @angular/cli` so you don't need Angular CLI globally installed.

### "npm registry timeout"
- Check your internet connection
- Try again or use a VPN if behind firewall

### "Permission denied" (Linux/macOS)
```bash
sudo npm install -g @jatinmourya/ng-init
```

## 💡 Pro Tips

### Tip 1: Save Time with Profiles
Create profiles for your common project setups:
- Team standard configuration
- Personal preference
- Different project types

### Tip 2: Use Interactive Search
The interactive library search:
- Shows package popularity
- Validates packages in real-time
- Displays download statistics
- Ensures you get the right package

### Tip 3: Enable Pre-commit Hooks
Always enable Husky hooks to:
- Auto-format code before commit
- Run linting checks
- Maintain code quality

### Tip 4: Generate Documentation
Enable README and CHANGELOG generation to:
- Start with good documentation
- Follow best practices
- Save time on setup

## 🔗 Next Steps

After creating your project:

1. **Explore the structure**
   ```bash
   cd your-project
   tree src/  # or ls -R src/
   ```

2. **Run development server**
   ```bash
   ng serve
   ```

3. **Generate components**
   ```bash
   ng generate component my-component
   ng generate service my-service
   ```

4. **Build for production**
   ```bash
   ng build --configuration production
   ```

5. **Run tests**
   ```bash
   ng test
   ```

## 📖 Learn More

- [Full README](./README.md) - Complete documentation
- [Project Documentation](./PROJECT_DOCUMENTATION.md) - Architecture details
- [Contributing Guide](./CONTRIBUTING.md) - How to contribute
- [Changelog](./CHANGELOG.md) - Version history

## 🆘 Need Help?

- GitHub Issues: Report bugs or request features
- Examples: Run `ng-init examples`
- Documentation: Check README.md

---

**Ready to build amazing Angular apps? Let's go! 🚀**
