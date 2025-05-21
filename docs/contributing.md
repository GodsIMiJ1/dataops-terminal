# Contributing to R3B3L 4F

Thank you for your interest in contributing to R3B3L 4F! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Issue Reporting](#issue-reporting)
- [Feature Requests](#feature-requests)
- [Community](#community)

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- Be respectful and inclusive
- Focus on constructive criticism
- Avoid personal attacks
- Maintain a harassment-free environment
- Respect differing viewpoints and experiences

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn package manager
- Git

### Setting Up the Development Environment

1. Fork the repository on GitHub

2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/R3B3L-4F.git
   cd R3B3L-4F
   ```

3. Add the original repository as an upstream remote:
   ```bash
   git remote add upstream https://github.com/GodsIMiJ1/R3B3L-4F.git
   ```

4. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

5. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```

6. Add your OpenAI API key to the `.env` file:
   ```
   VITE_OPENAI_API_KEY=your-openai-api-key-here
   ```

7. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Development Workflow

1. Create a new branch for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-you-are-fixing
   ```

2. Make your changes, following the [Coding Standards](#coding-standards)

3. Commit your changes with clear, descriptive commit messages:
   ```bash
   git commit -m "Add feature: description of your feature"
   ```

4. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

5. Create a Pull Request from your fork to the main repository

## Pull Request Process

1. Ensure your PR addresses a specific issue or feature
2. Update documentation to reflect any changes
3. Include screenshots or examples if UI changes are made
4. Make sure all tests pass
5. Request review from maintainers
6. Address any feedback from code reviews
7. Once approved, a maintainer will merge your PR

## Coding Standards

### General Guidelines

- Follow the existing code style
- Write clear, self-documenting code
- Keep functions small and focused
- Use meaningful variable and function names
- Comment complex logic, but prefer readable code over excessive comments

### TypeScript Guidelines

- Use TypeScript for all new code
- Define proper interfaces and types
- Avoid using `any` type when possible
- Use proper access modifiers (public, private, protected)
- Follow functional programming principles where appropriate

### React Guidelines

- Use functional components with hooks
- Keep components small and focused
- Use proper prop types
- Follow the container/presentational component pattern
- Use React context for state that needs to be shared across components

### CSS/Styling Guidelines

- Use Tailwind CSS for styling
- Follow the existing design system
- Ensure responsive design works on all screen sizes
- Maintain the cyberpunk aesthetic

## Testing

### Running Tests

```bash
npm run test
# or
yarn test
```

### Writing Tests

- Write tests for all new features
- Ensure existing tests pass
- Follow the existing testing patterns
- Test edge cases and error conditions
- Mock external dependencies

## Documentation

### Code Documentation

- Document all public functions, classes, and interfaces
- Use JSDoc-style comments for documentation
- Explain complex algorithms or business logic
- Include examples where helpful

### User Documentation

- Update user documentation for new features
- Ensure documentation is clear and accessible
- Include screenshots or examples where helpful
- Keep the documentation in sync with the code

## Issue Reporting

### Bug Reports

When reporting a bug, please include:

1. A clear, descriptive title
2. Steps to reproduce the issue
3. Expected behavior
4. Actual behavior
5. Screenshots if applicable
6. Environment information (browser, OS, etc.)
7. Any relevant logs or error messages

### Security Vulnerabilities

For security vulnerabilities, please do not create a public issue. Instead, email the maintainers directly.

## Feature Requests

When requesting a feature, please include:

1. A clear, descriptive title
2. A detailed description of the feature
3. The problem it solves
4. Any alternatives you've considered
5. Mockups or examples if applicable

## Community

### Communication Channels

- GitHub Issues: For bug reports and feature requests
- GitHub Discussions: For general questions and discussions
- Pull Requests: For code contributions

### Getting Help

If you need help with contributing:

1. Check the documentation
2. Look for similar issues or discussions
3. Ask in GitHub Discussions
4. Reach out to the maintainers

## Project Structure

Understanding the project structure will help you contribute effectively:

```
/
├── public/                 # Static assets
├── src/
│   ├── components/         # UI components
│   │   ├── terminal/       # Terminal components
│   │   ├── chat/           # Chat components
│   │   └── ui/             # UI components
│   ├── hooks/              # Custom React hooks
│   ├── services/           # Business logic services
│   ├── styles/             # Global styles
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── App.tsx             # Main application component
│   └── main.tsx            # Application entry point
├── docs/                   # Documentation
├── scripts/                # Utility scripts
├── scrolls/                # Mission scrolls
└── server/                 # Optional backend server
```

## License

By contributing to R3B3L 4F, you agree that your contributions will be licensed under the project's MIT License.
