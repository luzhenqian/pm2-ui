# Contributing to PM2 UI

Thank you for considering contributing to PM2 UI! We welcome contributions from the community.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

* **Use a clear and descriptive title**
* **Describe the exact steps to reproduce the problem**
* **Provide specific examples** - Include code snippets, screenshots, or logs
* **Describe the behavior you observed** and what you expected to see
* **Include environment details** - OS, Node.js version, PM2 version, browser

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

* **Use a clear and descriptive title**
* **Provide a detailed description** of the suggested enhancement
* **Explain why this enhancement would be useful**
* **Include mockups or examples** if applicable

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Follow the coding standards** described below
3. **Write meaningful commit messages**
4. **Add tests** for new features
5. **Update documentation** as needed
6. **Ensure all tests pass** before submitting

#### Pull Request Process

1. Update the README.md with details of changes if needed
2. Ensure your code follows the project's style guidelines
3. Make sure all tests pass (`npm test`)
4. Update documentation for any new features or changes
5. Request review from maintainers

## Development Setup

### Prerequisites

* Node.js >= 16.0.0
* npm >= 7.0.0
* PM2 installed globally

### Initial Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/pm2-ui.git
cd pm2-ui

# Install dependencies
npm run install:all

# Copy configuration files
cp config.json.example config.json
cp server/.env.example server/.env

# Start development servers
npm run dev
```

### Project Structure

```
pm2-ui/
├── server/                      # NestJS backend
│   ├── src/
│   │   ├── main.ts             # Application entry point
│   │   ├── app.module.ts       # Root module
│   │   ├── auth/               # Authentication & authorization domain
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/
│   │   │   ├── guards/
│   │   │   ├── decorators/
│   │   │   └── dto/
│   │   ├── process/            # PM2 process management domain
│   │   │   ├── process.module.ts
│   │   │   ├── process.controller.ts
│   │   │   ├── process.service.ts
│   │   │   └── dto/
│   │   ├── logs/               # Log viewing & streaming domain
│   │   │   ├── logs.module.ts
│   │   │   ├── logs.service.ts
│   │   │   └── dto/
│   │   ├── websocket/          # Real-time communication domain
│   │   │   ├── websocket.module.ts
│   │   │   └── websocket.gateway.ts
│   │   ├── common/             # Shared code (interfaces, decorators, etc.)
│   │   └── config/             # Configuration files
│   └── test/
├── client/                      # React frontend
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/         # Reusable UI components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── services/           # API client services
│   │   └── types/              # TypeScript type definitions
│   └── test/
└── .github/                     # GitHub workflows & templates
```

### Module Organization (Server)

**Business modules are organized directly under `src/` (not nested in a `modules/` directory).**

Each business domain directory follows this structure:

```
src/
├── {domain}/                    # Business domain (e.g., auth, process, logs)
│   ├── {domain}.module.ts      # NestJS module definition
│   ├── {domain}.controller.ts  # HTTP REST endpoints
│   ├── {domain}.service.ts     # Business logic & data access
│   ├── {domain}.gateway.ts     # WebSocket gateway (optional)
│   ├── dto/                    # Data Transfer Objects
│   │   ├── create-{entity}.dto.ts
│   │   ├── update-{entity}.dto.ts
│   │   └── {entity}-response.dto.ts
│   ├── entities/               # Database entities (optional)
│   ├── guards/                 # Domain-specific guards (optional)
│   ├── decorators/             # Domain-specific decorators (optional)
│   └── strategies/             # Auth strategies, etc. (optional)
```

**Key Principles:**
- **Flat structure**: Business domains are top-level directories under `src/`
- **Self-contained**: Each domain contains all its related code (controllers, services, DTOs, guards, etc.)
- **High cohesion**: Related business logic stays together
- **Low coupling**: Modules depend on each other minimally; use dependency injection
- **Shared code**: Common utilities, interfaces, and decorators go in `common/`
- **Clear boundaries**: Each domain has a clear responsibility and API

## Coding Standards

### TypeScript

* Use TypeScript for all new code
* Enable strict mode
* Avoid `any` types when possible
* Use interfaces for complex types
* Document complex functions with JSDoc comments

### Code Style

* Follow the existing code style
* Use ESLint and Prettier (configs provided)
* Run `npm run lint` before committing
* Use meaningful variable and function names
* Keep functions small and focused

### Testing

* Write unit tests for new features
* Aim for high code coverage
* Test edge cases and error handling
* Run `npm test` before submitting PR

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): subject

body

footer
```

Types:
* `feat`: New feature
* `fix`: Bug fix
* `docs`: Documentation changes
* `style`: Code style changes (formatting, etc)
* `refactor`: Code refactoring
* `test`: Adding or updating tests
* `chore`: Maintenance tasks

Examples:
```
feat(logs): add regex search support

Add ability to search logs using regular expressions.
Includes new UI controls and backend filtering logic.

Closes #123
```

```
fix(websocket): handle connection errors gracefully

Previously, connection errors would crash the server.
Now errors are caught and logged properly.
```

### Git Workflow

1. Create a feature branch from `main`
   ```bash
   git checkout -b feat/my-new-feature
   ```

2. Make your changes and commit
   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

3. Keep your branch up to date
   ```bash
   git fetch origin
   git rebase origin/main
   ```

4. Push to your fork
   ```bash
   git push origin feat/my-new-feature
   ```

5. Open a Pull Request

## Running Tests

```bash
# Run all tests
npm test

# Run server tests only
npm run test:server

# Run client tests only
npm run test:client

# Run with coverage
npm run test:coverage
```

## Building for Production

```bash
# Build both server and client
npm run build

# Test production build
npm start
```

## Documentation

* Update README.md for user-facing changes
* Add JSDoc comments for public APIs
* Update inline comments for complex logic
* Include examples for new features

## Questions?

Feel free to open an issue for questions or reach out to the maintainers.

## License

By contributing to PM2 UI, you agree that your contributions will be licensed under the MIT License.