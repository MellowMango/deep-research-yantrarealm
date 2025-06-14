# YantraRealm Development Guide

## Commands
```bash
# Run application
npm run start        # Run main app (src/run.ts)
npm run server       # Run server (src/server.ts)
npm run tsx <file>   # Execute TypeScript file with env vars loaded

# Testing
node --test src/ai/text-splitter.test.ts  # Run single test
node --test src/**/*.test.ts              # Run all tests

# Code quality
npm run format       # Format code with Prettier
```

## Code Style Guidelines
- **TypeScript**: Strict typing, ES2022 target, ESM modules
- **Formatting**: 2-space indent, single quotes, semicolons, trailing commas
- **Imports**: Follow order: Node.js built-ins, third-party, local modules
- **Naming**: camelCase for variables/functions, PascalCase for classes/interfaces
- **Error handling**: Explicit error messages, null checks with optional chaining
- **Testing**: Node's built-in test runner with describe/it blocks and assertions