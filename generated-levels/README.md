# FOURE VTT Generated Levels

This folder contains procedurally generated tactical combat levels for the FOURE VTT game engine.

## 📁 File Structure

```
generated-levels/
├── *.json              # Individual level files
├── levels-index.json   # Auto-generated index of all levels
└── README.md          # This file
```

## 🎮 Using Levels with Your Game Engine

### Loading a Level

```typescript
import { readFileSync } from 'node:fs';

// Load level data
const levelData = JSON.parse(readFileSync('bandit-hideout-12345.json', 'utf8'));

// Access components
const map = levelData.map;              // Terrain and configurations
const monsters = levelData.startingActors; // Enemy placement
const spawnPoints = levelData.playerSpawnPoints; // Player starting positions
const effects = levelData.environmentalEffects; // Environmental effects
const objectives = levelData.objectives; // Victory conditions
```

### Map Structure

Each level includes:

**🗺️ Terrain Data:**
```typescript
{
  map: {
    dimensions: { width: 25, height: 25 },
    terrain: [
      ["wall", "wall", "wall", ...],  // 25x25 terrain grid
      ["wall", "empty", "empty", ...],
      // ... 23 more rows
    ],
    terrainConfigs: {  // Terrain type definitions
      "wall": {
        "id": "wall",
        "name": "Wall",
        "blocksMovement": true,
        "blocksLineOfSight": true,
        "movementCost": 0,
        "displayGlyph": "#",
        "description": "Solid stone wall"
      },
      "empty": {
        "id": "empty",
        "name": "Empty",
        "blocksMovement": false,
        "blocksLineOfSight": false,
        "movementCost": 1,
        "displayGlyph": " ",
        "description": "Open ground"
      },
      // ... more terrain types
    }
  }
}
```

**⚔️ Monster Data:**
```typescript
{
  startingActors: []  // Empty array - add your own monsters!
}
```

**Adding Monsters Manually:**
```typescript
// After loading the level, add your own monsters
const levelData = JSON.parse(readFileSync('bandit-hideout-12345.json', 'utf8'));

// Add your monsters to the startingActors array
levelData.startingActors = [
  {
    "id": "my-monster-1",
    "name": "Custom Monster",
    "level": 1,
    "role": "standard",
    "team": "B",
    "position": { "x": 5, "y": 10 },
    "armorClass": 14,
    "hitPoints": 30,
    "abilities": { /* Your stats */ },
    "ai": {
      "behavior": "aggressive",
      "preferredRange": "melee"
    }
  }
  // ... add more monsters as needed
];
```

**🎯 Gameplay Elements:**
```typescript
{
  playerSpawnPoints: [
    { "x": 2, "y": 2 },
    { "x": 3, "y": 2 },
    { "x": 2, "y": 3 },
    { "x": 3, "y": 3 }
  ],
  environmentalEffects: [
    {
      "id": "cave-darkness",
      "name": "Cave Darkness",
      "type": "lighting",
      "effects": { "concealment": "partial" }
    }
  ],
  objectives: ["Explore the area", "Survive the environment", "Avoid environmental hazards"],
  settings: {
    "timeLimit": 90,
    "maxPlayers": 6,
    "allowRespawn": false
  }
}
```

## 📊 Level Index

The `levels-index.json` file contains metadata for all available levels:

```typescript
{
  "levels": [
    {
      "id": "bandit-hideout",
      "name": "Bandit Hideout",
      "description": "A mysterious dungeon complex...",
      "recommendedLevel": 1,
      "estimatedDuration": 75,
      "difficulty": "easy",
      "theme": "dungeon",
      "tags": ["generated", "dungeon", "combat"],
      "author": "FOURE Level Generator",
      "version": "1.0.0"
    }
    // ... more levels
  ],
  "totalLevels": 17,
  "themes": ["dungeon", "wilderness", "underground", "urban", "mystical"],
  "difficulties": ["easy", "medium", "hard"]
}
```

## 🔧 Terrain Types

Available terrain types with their properties:

- **wall** (#) - Impassable barriers
- **empty** ( ) - Open movement
- **difficult** (^) - Rough terrain (2x movement cost)
- **pit** (□) - Hazardous terrain
- **water** (~) - Difficult movement
- **lava** (≈) - Dangerous environmental hazard
- **altar** (⚑) - Interactive objects
- **crystal** (✶) - Special environmental features

## 🎨 Themes

- **dungeon** - Traditional fantasy dungeons
- **wilderness** - Outdoor encounters
- **underground** - Cave and mining environments
- **urban** - City and building layouts
- **mystical** - Magical and arcane settings

## ⚖️ Difficulties

- **easy** - Beginner-friendly encounters
- **medium** - Balanced challenge
- **hard** - Experienced players
- **epic** - Maximum difficulty

## 🚀 Quick Start

1. Load a JSON file using your preferred JSON parser
2. Create a 25x25 map grid from `map.terrain`
3. Load terrain configurations from `map.terrainConfigs`
4. Place monsters from `startingActors` at their positions
5. Set player spawn points from `playerSpawnPoints`
6. Apply environmental effects from `environmentalEffects`
7. Use objectives and settings for gameplay

## 📝 Generation Info

- **Generator Version**: 1.0.0
- **Format Version**: 1.0.0
- **Generated**: Auto-updated with each regeneration
- **Algorithms**: BSP, Cellular Automata, Drunkard's Walk, Mixed

Ready to import into your FOURE VTT game engine! 🎮⚔️🗺️
