# FOURE VTT Coding Standards

## Table of Contents
1. [General Principles](#general-principles)
2. [Project Structure](#project-structure)
3. [Naming Conventions](#naming-conventions)
4. [Module System](#module-system)
5. [Code Style](#code-style)
6. [TypeScript Guidelines](#typescript-guidelines)
7. [API Design](#api-design)
8. [Error Handling](#error-handling)
9. [Testing Standards](#testing-standards)
10. [Documentation](#documentation)
11. [Performance Guidelines](#performance-guidelines)
12. [Security Guidelines](#security-guidelines)

## General Principles

### 1. Consistency Over Cleverness
- Use consistent patterns throughout the codebase
- Prefer explicit over implicit
- Choose readability over brevity
- Follow established conventions

### 2. Single Responsibility Principle
- Each module/class/function should have one clear purpose
- Keep functions small and focused
- Separate concerns clearly

### 3. Immutability First
- Prefer immutable data structures
- Use `const` by default, `let` only when necessary
- Never use `var`
- Return new objects instead of mutating existing ones

### 4. Fail Fast
- Validate inputs early
- Use TypeScript for compile-time safety
- Throw meaningful errors with context

## Project Structure

### Directory Naming
```
src/
├── components/          # Reusable UI components
├── features/           # Feature-specific modules
├── services/           # Business logic services
├── utils/              # Pure utility functions
├── types/              # TypeScript type definitions
├── constants/          # Application constants
├── hooks/              # React hooks (client only)
├── api/                # API client code (client only)
├── server/             # Server-specific code (server only)
└── tests/              # Test files
```

### File Naming
- **Files**: `kebab-case.js` or `PascalCase.js` for components
- **Directories**: `kebab-case`
- **Constants**: `UPPER_SNAKE_CASE`
- **Classes**: `PascalCase`
- **Functions/Variables**: `camelCase`
- **Private members**: `_camelCase` (leading underscore)

## Naming Conventions

### Variables and Functions
```javascript
// ✅ Good
const userCount = 0;
const isGameActive = true;
const calculateDamage = (attacker, target) => { /* ... */ };
const getCurrentActor = () => { /* ... */ };

// ❌ Bad
const usercount = 0;
const game_active = true;
const calcDmg = (a, t) => { /* ... */ };
const getActor = () => { /* ... */ };
```

### Classes and Interfaces
```javascript
// ✅ Good
class GameEngine { }
class DiceRollService { }
interface GameState { }
interface ActorData { }

// ❌ Bad
class gameEngine { }
class dice_roll_service { }
interface gamestate { }
```

### Constants
```javascript
// ✅ Good
const MAX_ACTORS = 10;
const DEFAULT_BOARD_SIZE = 25;
const ACTION_TYPES = {
  STANDARD: 'standard',
  MOVE: 'move',
  MINOR: 'minor'
};

// ❌ Bad
const maxActors = 10;
const defaultBoardSize = 25;
const actionTypes = { /* ... */ };
```

### Files and Modules
```javascript
// ✅ Good
// game-engine.js
// dice-roll-service.js
// targeting-controller.js

// ❌ Bad
// GameEngine.js
// diceRollService.js
// targeting_controller.js
```

## Module System

### Import/Export Standards
```javascript
// ✅ Good - Named exports preferred
export const calculateDamage = (attacker, target) => { /* ... */ };
export const validateMove = (actor, position) => { /* ... */ };

// ✅ Good - Default export for main class
export default class GameEngine { /* ... */ }

// ✅ Good - Import order: external, internal, relative
import { nanoid } from 'nanoid';
import { LoggingService } from '../services/logging-service.js';
import { calculateDamage } from './combat-utils.js';

// ❌ Bad - Mixed import styles
const { nanoid } = require('nanoid');
import { LoggingService } from '../services/logging-service.js';
```

### Module Organization
```javascript
// ✅ Good - Clear module structure
// dice-roll-service.js
import { LoggingService } from './logging-service.js';
import { validateDiceSpec } from '../utils/validation.js';

export class DiceRollService {
  constructor(loggingService) {
    this.loggingService = loggingService;
  }

  async rollDice(spec) {
    // Implementation
  }
}

// Default export for main class
export default DiceRollService;
```

## Code Style

### Function Declarations
```javascript
// ✅ Good - Arrow functions for callbacks, regular functions for main logic
export const processGameState = (gameState) => {
  return gameState.actors.map(actor => ({
    ...actor,
    isActive: actor.id === gameState.currentActor
  }));
};

// ✅ Good - Async/await over promises
export const loadGameSession = async (sessionId) => {
  try {
    const response = await fetch(`/api/games/${sessionId}`);
    return await response.json();
  } catch (error) {
    throw new Error(`Failed to load session ${sessionId}: ${error.message}`);
  }
};

// ❌ Bad - Inconsistent function styles
function processGameState(gameState) {
  return gameState.actors.map(function(actor) {
    return {
      ...actor,
      isActive: actor.id === gameState.currentActor
    };
  });
}
```

### Object and Array Handling
```javascript
// ✅ Good - Destructuring and spread
const { actors, board, turn } = gameState;
const updatedActors = { ...actors, [actorId]: newActor };
const newPositions = [...positions, newPosition];

// ✅ Good - Array methods
const activeActors = actors.filter(actor => actor.hp.current > 0);
const actorNames = actors.map(actor => actor.name);
const totalDamage = attacks.reduce((sum, attack) => sum + attack.damage, 0);

// ❌ Bad - Mutation
actors.push(newActor);
positions[positions.length] = newPosition;
```

### Conditional Logic
```javascript
// ✅ Good - Early returns
export const validateActor = (actor) => {
  if (!actor) {
    throw new Error('Actor is required');
  }
  
  if (!actor.id) {
    throw new Error('Actor must have an ID');
  }
  
  if (actor.hp.current < 0) {
    throw new Error('Actor HP cannot be negative');
  }
  
  return true;
};

// ✅ Good - Ternary for simple conditions
const status = isActive ? 'active' : 'inactive';
const message = error ? `Error: ${error.message}` : 'Success';

// ❌ Bad - Deep nesting
export const validateActor = (actor) => {
  if (actor) {
    if (actor.id) {
      if (actor.hp.current >= 0) {
        return true;
      } else {
        throw new Error('Actor HP cannot be negative');
      }
    } else {
      throw new Error('Actor must have an ID');
    }
  } else {
    throw new Error('Actor is required');
  }
};
```

## TypeScript Guidelines

### Type Definitions
```typescript
// ✅ Good - Clear, specific types
interface GameState {
  readonly actors: Record<string, Actor>;
  readonly board: Board;
  readonly turn: TurnState;
  readonly round: number;
}

interface Actor {
  readonly id: string;
  readonly name: string;
  readonly position: Position;
  readonly hp: HitPoints;
  readonly team: 'A' | 'B';
}

// ✅ Good - Union types for enums
type ActionType = 'standard' | 'move' | 'minor' | 'free';
type PowerType = 'at-will' | 'encounter' | 'daily' | 'utility';

// ✅ Good - Generic types
interface ApiResponse<T> {
  readonly success: boolean;
  readonly data: T;
  readonly error?: string;
}
```

### Function Signatures
```typescript
// ✅ Good - Explicit parameter and return types
export const calculateDamage = (
  attacker: Actor,
  target: Actor,
  power: Power
): DamageResult => {
  // Implementation
};

// ✅ Good - Optional parameters with defaults
export const createActor = (
  name: string,
  position: Position,
  options: Partial<ActorOptions> = {}
): Actor => {
  // Implementation
};

// ❌ Bad - Implicit any types
export const calculateDamage = (attacker, target, power) => {
  // Implementation
};
```

## API Design

### REST Endpoints
```javascript
// ✅ Good - Consistent URL structure
// GET    /api/games
// POST   /api/games
// GET    /api/games/:id
// PUT    /api/games/:id
// DELETE /api/games/:id

// GET    /api/games/:id/actors
// POST   /api/games/:id/actors
// PUT    /api/games/:id/actors/:actorId
// DELETE /api/games/:id/actors/:actorId

// ✅ Good - Consistent response format
const successResponse = {
  success: true,
  data: result,
  timestamp: new Date().toISOString()
};

const errorResponse = {
  success: false,
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Invalid actor data',
    details: validationErrors
  },
  timestamp: new Date().toISOString()
};
```

### WebSocket Events
```javascript
// ✅ Good - Consistent event naming
// game:state-changed
// game:actor-moved
// game:turn-changed
// game:log-added
// dice:roll-requested
// dice:roll-completed

// ✅ Good - Structured event data
const eventData = {
  type: 'game:actor-moved',
  sessionId: 'session_123',
  data: {
    actorId: 'actor_456',
    from: { x: 5, y: 5 },
    to: { x: 6, y: 5 }
  },
  timestamp: Date.now()
};
```

## Error Handling

### Error Types
```javascript
// ✅ Good - Custom error classes
export class ValidationError extends Error {
  constructor(message, field, value) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
  }
}

export class GameStateError extends Error {
  constructor(message, gameState) {
    super(message);
    this.name = 'GameStateError';
    this.gameState = gameState;
  }
}

// ✅ Good - Error handling with context
export const validateActor = (actor) => {
  if (!actor?.id) {
    throw new ValidationError('Actor ID is required', 'id', actor?.id);
  }
  
  if (actor.hp?.current < 0) {
    throw new ValidationError('HP cannot be negative', 'hp.current', actor.hp.current);
  }
};
```

### Async Error Handling
```javascript
// ✅ Good - Proper async error handling
export const loadGameSession = async (sessionId) => {
  try {
    const response = await fetch(`/api/games/${sessionId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Failed to load session ${sessionId}:`, error);
    throw new GameStateError(`Failed to load session: ${error.message}`, { sessionId });
  }
};
```

## Testing Standards

### Test Structure
```javascript
// ✅ Good - Clear test organization
import { test, expect, describe, beforeEach } from 'bun:test';
import { GameEngine } from '../src/engine/game-engine.js';
import { createTestActor } from './fixtures/actors.js';

describe('GameEngine', () => {
  let gameEngine;
  
  beforeEach(() => {
    gameEngine = new GameEngine(42);
  });
  
  describe('actor management', () => {
    test('should add actor to game state', () => {
      const actor = createTestActor('test-actor');
      gameEngine.addActor(actor);
      
      const gameState = gameEngine.getGameState();
      expect(gameState.actors['test-actor']).toBeDefined();
      expect(gameState.actors['test-actor'].name).toBe('Test Actor');
    });
    
    test('should throw error for invalid actor', () => {
      expect(() => {
        gameEngine.addActor(null);
      }).toThrow('Actor is required');
    });
  });
});
```

### Test Naming
```javascript
// ✅ Good - Descriptive test names
test('should calculate damage correctly for melee attack')
test('should throw validation error for negative HP')
test('should advance turn when current actor ends turn')
test('should reset actions at start of new turn')

// ❌ Bad - Vague test names
test('damage calculation')
test('validation')
test('turn management')
```

## Documentation

### JSDoc Comments
```javascript
/**
 * Calculates damage for an attack between two actors
 * @param {Actor} attacker - The actor performing the attack
 * @param {Actor} target - The actor being attacked
 * @param {Power} power - The power being used
 * @param {Object} options - Additional options
 * @param {boolean} options.critical - Whether the attack is a critical hit
 * @returns {DamageResult} The calculated damage result
 * @throws {ValidationError} When attacker or target is invalid
 * @example
 * const damage = calculateDamage(attacker, target, power, { critical: true });
 */
export const calculateDamage = (attacker, target, power, options = {}) => {
  // Implementation
};
```

### README Structure
```markdown
# Module Name

Brief description of what this module does.

## Installation
```bash
bun install
```

## Usage
```javascript
import { ModuleName } from './module-name.js';

const instance = new ModuleName();
```

## API Reference
### Methods
- `methodName(params)` - Description

## Examples
[Code examples]

## Contributing
[Contributing guidelines]
```

## Performance Guidelines

### Memory Management
```javascript
// ✅ Good - Clean up resources
export class GameSession {
  constructor() {
    this.cleanup = [];
  }
  
  addCleanup(fn) {
    this.cleanup.push(fn);
  }
  
  destroy() {
    this.cleanup.forEach(fn => fn());
    this.cleanup = [];
  }
}

// ✅ Good - Avoid memory leaks
export const createEventHandler = (callback) => {
  const handler = (event) => {
    callback(event);
  };
  
  // Return cleanup function
  return () => {
    document.removeEventListener('click', handler);
  };
};
```

### Efficient Data Structures
```javascript
// ✅ Good - Use appropriate data structures
const actorPositions = new Map(); // O(1) lookup
const activeEffects = new Set(); // O(1) membership test

// ✅ Good - Batch operations
const patches = [
  { type: 'set', path: 'actors.A1.hp.current', value: 25 },
  { type: 'set', path: 'actors.A1.position', value: { x: 5, y: 5 } }
];
applyPatches(gameState, patches);
```

## Security Guidelines

### Input Validation
```javascript
// ✅ Good - Validate all inputs
export const validateActorData = (data) => {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Actor data must be an object');
  }
  
  if (!data.id || typeof data.id !== 'string') {
    throw new ValidationError('Actor ID must be a non-empty string');
  }
  
  if (data.hp && (typeof data.hp.current !== 'number' || data.hp.current < 0)) {
    throw new ValidationError('HP must be a non-negative number');
  }
  
  return true;
};
```

### Sanitization
```javascript
// ✅ Good - Sanitize user input
export const sanitizeActorName = (name) => {
  if (typeof name !== 'string') {
    return 'Unknown';
  }
  
  return name
    .trim()
    .slice(0, 50) // Limit length
    .replace(/[<>]/g, ''); // Remove potential HTML
};
```

## Code Review Checklist

### Before Submitting
- [ ] Code follows naming conventions
- [ ] Functions are small and focused
- [ ] Error handling is comprehensive
- [ ] Tests cover new functionality
- [ ] Documentation is updated
- [ ] No console.log statements in production code
- [ ] No TODO comments without issues
- [ ] TypeScript types are properly defined
- [ ] Performance implications considered
- [ ] Security implications reviewed

### Review Criteria
- [ ] Code is readable and maintainable
- [ ] Logic is correct and efficient
- [ ] Error cases are handled
- [ ] Tests are meaningful and pass
- [ ] Documentation is accurate
- [ ] No code duplication
- [ ] Consistent with existing patterns

## Tools and Automation

### ESLint Configuration
```javascript
// .eslintrc.js
export default {
  extends: ['@eslint/js/recommended'],
  env: {
    browser: true,
    es2022: true,
    bun: true
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'no-var': 'error',
    'prefer-const': 'error',
    'no-console': 'warn',
    'no-unused-vars': 'error',
    'prefer-arrow-callback': 'error',
    'arrow-spacing': 'error',
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never']
  }
};
```

### Prettier Configuration
```javascript
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

### Package.json Scripts
```json
{
  "scripts": {
    "lint": "eslint src/ tests/",
    "lint:fix": "eslint src/ tests/ --fix",
    "format": "prettier --write src/ tests/",
    "type-check": "tsc --noEmit",
    "test": "bun test",
    "test:watch": "bun test --watch",
    "test:coverage": "bun test --coverage",
    "build": "bun build src/main.js --outdir dist",
    "dev": "bun --hot src/main.js"
  }
}
```

---

## Enforcement

These standards should be enforced through:
1. **ESLint** configuration for code style
2. **Prettier** for formatting
3. **TypeScript** for type safety
4. **Husky** pre-commit hooks
5. **CI/CD** pipeline checks
6. **Code review** process

Remember: **Consistency is more important than perfection**. Choose standards and stick to them throughout the project.
