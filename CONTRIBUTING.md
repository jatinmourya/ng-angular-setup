# Contributing to Angular Project Automator

Thank you for your interest in contributing to Angular Project Automator! This document provides guidelines and instructions for contributing.

## 🌟 How to Contribute

### Reporting Bugs

If you find a bug, please create an issue on GitHub with the following information:

- **Description**: Clear description of the bug
- **Steps to Reproduce**: Step-by-step instructions
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Environment**: OS, Node.js version, npm version
- **Screenshots**: If applicable

### Suggesting Features

We welcome feature suggestions! Please create an issue with:

- **Feature Description**: Clear description of the feature
- **Use Case**: Why this feature would be useful
- **Proposed Implementation**: If you have ideas on how to implement it
- **Examples**: Similar features in other tools

### Pull Requests

1. **Fork the Repository**
   ```bash
   git clone https://github.com/your-username/angular-project-automator.git
   cd angular-project-automator
   ```

2. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Your Changes**
   - Write clean, readable code
   - Follow existing code style
   - Add comments for complex logic
   - Update documentation if needed

4. **Test Your Changes**
   ```bash
   npm link
   ng-auto
   ```

5. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "Add: feature description"
   ```

   Commit message format:
   - `Add:` for new features
   - `Fix:` for bug fixes
   - `Update:` for updates to existing features
   - `Docs:` for documentation changes
   - `Refactor:` for code refactoring

6. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your branch
   - Fill in the PR template

## 📝 Code Style Guidelines

### JavaScript/Node.js

- Use ES6+ syntax
- Use `import`/`export` for modules
- Use `async`/`await` for asynchronous operations
- Use meaningful variable and function names
- Add JSDoc comments for functions
- Keep functions small and focused

### Example:

```javascript
/**
 * Get package details from npm registry
 * @param {string} packageName - The name of the package
 * @returns {Promise<Object|null>} Package details or null if not found
 */
export async function getPackageDetails(packageName) {
    try {
        const response = await axios.get(`${NPM_REGISTRY_URL}/${packageName}`);
        return response.data;
    } catch (error) {
        return null;
    }
}
```

### File Organization

- Place utilities in `src/utils/`
- Place templates in `src/templates/`
- Place command handlers in `src/commands/` (if applicable)
- Keep related functionality together

## 🧪 Testing

Before submitting a PR:

1. Test the main flow:
   ```bash
   ng-auto
   ```

2. Test all commands:
   ```bash
   ng-auto check
   ng-auto profile list
   ng-auto examples
   ```

3. Test edge cases:
   - Invalid inputs
   - Network errors
   - Missing dependencies

## 📚 Documentation

- Update README.md if you add features
- Update PROJECT_DOCUMENTATION.md for architectural changes
- Add inline comments for complex code
- Update examples if behavior changes

## 🎯 Areas We Need Help With

- **Templates**: More project templates
- **Bundles**: Additional library bundles
- **Testing**: Unit tests and integration tests
- **Documentation**: Better examples and guides
- **Platform Support**: Better support for Linux/macOS
- **Performance**: Optimization and caching
- **UI/UX**: Better interactive prompts

## 🔍 Code Review Process

1. PRs will be reviewed by maintainers
2. Feedback will be provided as comments
3. Make requested changes
4. Once approved, PR will be merged

## 📋 Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/angular-project-automator.git
   cd angular-project-automator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Link for local testing**
   ```bash
   npm link
   ```

4. **Test the CLI**
   ```bash
   ng-auto
   ```

5. **Unlink when done**
   ```bash
   npm unlink -g angular-project-automator
   ```

## 🐛 Debugging

Add debug logs:
```javascript
console.log(chalk.yellow('[DEBUG]'), 'Your debug message', variable);
```

Run with verbose output to see all logs.

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 💬 Questions?

- Create an issue for questions
- Join discussions in GitHub Discussions
- Contact maintainers directly for sensitive issues

## 🙏 Thank You!

Your contributions make this project better for everyone. Thank you for taking the time to contribute!

---

**Happy Contributing! 🚀**
