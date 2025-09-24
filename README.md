# FOURE VTT Level Generator

A sophisticated procedural level generator for tactical combat maps, designed for D&D 4e style encounters with rich terrain, balanced encounters, and environmental storytelling.

## Features

- **Multiple Generation Algorithms**: BSP (rooms & corridors), Cellular Automata (organic caves), Drunkard's Walk (mazes), Template-based, and Mixed approaches
- **Rich Terrain System**: 15+ terrain types with UTF-8 visual representation, tactical properties, and gameplay effects
- **Environmental Storytelling**: Interactive objects, narrative elements, and environmental effects that create immersive encounters
- **Empty Monster Arrays**: Ready for manual monster placement - no fake monsters included
- **Exploration Objectives**: Terrain-based objectives for exploration and survival gameplay
- **Efficient Compression**: Run-length encoding and compact representations for storage and transmission
- **Theme Support**: Dungeon, Wilderness, Underground, Urban, and Mystical themes with appropriate content

## Quick Start

```typescript
import { LevelGenerator, LevelGeneratorUtils } from './src/generators/level-generator.js';

// Generate a quick dungeon level
const dungeon = LevelGeneratorUtils.generateDungeon(12345);
console.log(dungeon.name); // "Haunted Caverns #12345"

// Generate with custom parameters
const generator = new LevelGenerator(99999, 'mystical', 'mixed');
const level = generator.generateLevel(4, 3, 'Arcane Nexus');

// Export as JSON
const jsonData = generator.generateJSON(4, 3);
```

## Terrain Types

The generator supports 15+ terrain types with unique UTF-8 symbols:

- `empty` ( ) - Open ground
- `wall` (#) - Impassable barriers
- `pit` (□) - Hazardous terrain
- `lava` (≈) - Dangerous environmental hazard
- `water` (~) - Difficult movement
- `difficult` (^) - Rough terrain
- `ruins` (☗) - Ancient structures with cover
- `mushrooms` (♠) - Blocking organic growth
- `crystal` (✶) - Environmental features
- `altar` (⚑) - Interactive elements
- And more...

## Generation Algorithms

### BSP (Binary Space Partitioning)
Creates room-based layouts with connecting corridors - perfect for tactical combat.

### Cellular Automata
Generates organic cave-like structures using Conway's Game of Life rules.

### Drunkard's Walk
Creates maze-like corridors and winding paths.

### Template-based
Uses base templates with procedural variations for consistent layouts.

### Mixed
Combines multiple algorithms for complex, varied maps.

## Environmental Features

- **Interactive Objects**: Treasure chests, pressure plates, portals, rune circles
- **Environmental Effects**: Lighting, zones, auras with gameplay impacts
- **Narrative Elements**: Story hints, warnings, and objectives
- **Empty Monster Arrays**: Ready for manual monster placement - no fake monsters included
- **Exploration Objectives**: Terrain-based objectives for exploration and survival gameplay

## Manual Monster Placement

- Empty `startingActors` arrays ready for your custom monsters
- Terrain-based objectives for exploration and survival gameplay
- Environmental effects and interactive elements for rich encounters
- Full terrain configuration system for tactical positioning

## Compression

Maps are compressed using run-length encoding:
- 25x25 maps (625 cells) typically compress to ~80-90% efficiency
- Seed-based recreation for deterministic generation
- Compact string representations for storage/transmission

## Demo

Run the included demo to see the generator in action:

```bash
bun run src/examples/level-generator-demo.ts
```

This will generate and display multiple example maps with different themes and algorithms.

## Project Structure

```
src/
├── types/
│   └── terrain.ts          # Terrain type definitions and UTF-8 symbols
├── utils/
│   └── map-compression.ts  # Compression and serialization utilities
├── generators/
│   ├── terrain-generator.ts      # Core generation algorithms
│   ├── environmental-storyteller.ts  # Environmental elements
│   ├── encounter-balancer.ts     # Tactical encounter balancing
│   └── level-generator.ts        # Main orchestrator
└── examples/
    └── level-generator-demo.ts   # Demo and usage examples
```

## Usage Examples

### Basic Generation
```typescript
import { LevelGeneratorUtils } from './src/generators/level-generator.js';

// Quick dungeon
const dungeon = LevelGeneratorUtils.generateDungeon();

// Wilderness encounter
const wilderness = LevelGeneratorUtils.generateWilderness();

// Underground cave
const cave = LevelGeneratorUtils.generateUnderground();
```

### Custom Generation
```typescript
import { LevelGenerator } from './src/generators/level-generator.js';

const generator = new LevelGenerator(
  12345,           // Random seed
  'mystical',      // Theme
  'mixed'          // Algorithm
);

const level = generator.generateLevel(
  4,               // Player count
  2,               // Difficulty level
  'Custom Name'    // Optional name
);
```

### Export and Serialization
```typescript
// Export as JSON
const json = generator.generateJSON(4, 2);

// Get compressed data
const compressed = generator.generateCompressed();

// Convert to compact string
const compactString = MapCompression.toCompactString(compressed);
```

## Configuration

The generator accepts various parameters for customization:

- `minRoomSize`: Minimum room dimensions for BSP
- `maxRooms`: Maximum number of rooms
- `corridorWidth`: Width of connecting corridors
- `initialFill`: Initial fill ratio for cellular automata
- `iterations`: Number of cellular automata iterations
- `birthLimit`/`deathLimit`: Cellular automata rules
- `steps`: Number of steps for drunkard's walk
- `branchChance`: Branching probability for drunkard's walk

## Output Format

Generated levels include:
- Complete 25x25 terrain map
- Balanced monster encounters with stats
- Environmental effects and interactive objects
- Player spawn points
- Objectives and tactical notes
- Compressed metadata for recreation

The output is compatible with the existing FOURE VTT JSON format and can be used directly in games.

## Contributing

The level generator follows the project's coding standards and is built with TypeScript for type safety. All components are modular and can be extended or modified independently.

## License

This level generator is part of the FOURE VTT project and follows the same open-source license.
