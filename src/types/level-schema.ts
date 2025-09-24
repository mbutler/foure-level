/**
 * Level Schema Definition for FOURE VTT Level Generator
 *
 * Complete JSON Schema definition for level files with validation rules
 * and documentation for game engine integration.
 */

/**
 * Complete JSON Schema for FOURE VTT Level Files
 */
export const LEVEL_SCHEMA = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://foure-vtt.github.io/level-schema.json",
  "title": "FOURE VTT Level",
  "description": "A procedurally generated tactical combat level for FOURE VTT",
  "type": "object",

  "required": [
    "id", "name", "description", "version", "author",
    "recommendedLevel", "estimatedDuration", "difficulty", "theme",
    "tags", "startingActors", "playerSpawnPoints", "environmentalEffects",
    "objectives", "settings", "metadata", "map"
  ],

  "properties": {
    "id": {
      "type": "string",
      "description": "Unique level identifier (must match filename pattern)",
      "pattern": "^[a-z0-9-]+$",
      "examples": ["bandit-hideout", "goblin-caves", "ancient-tombs"]
    },

    "name": {
      "type": "string",
      "description": "Display name for the level",
      "minLength": 1,
      "maxLength": 100,
      "examples": ["Bandit Hideout", "Goblin Caves"]
    },

    "description": {
      "type": "string",
      "description": "Descriptive text about the level",
      "minLength": 10,
      "maxLength": 500,
      "examples": ["A mysterious dungeon complex with hidden dangers"]
    },

    "version": {
      "type": "string",
      "description": "Version number in semantic versioning format",
      "pattern": "^\\d+\\.\\d+\\.\\d+$",
      "examples": ["1.0.0"]
    },

    "author": {
      "type": "string",
      "description": "Creator or generator name",
      "examples": ["FOURE Level Generator", "FOURE Team"]
    },

    "recommendedLevel": {
      "type": "integer",
      "description": "Recommended player character level",
      "minimum": 1,
      "maximum": 30,
      "examples": [1, 2, 3, 5]
    },

    "estimatedDuration": {
      "type": "integer",
      "description": "Expected play time in minutes",
      "minimum": 15,
      "maximum": 300,
      "examples": [75, 90, 120]
    },

    "difficulty": {
      "type": "string",
      "enum": ["easy", "medium", "hard", "epic"],
      "description": "Difficulty level",
      "examples": ["easy", "medium"]
    },

    "theme": {
      "type": "string",
      "enum": ["dungeon", "wilderness", "underground", "urban", "mystical"],
      "description": "Level theme/environment type",
      "examples": ["dungeon", "wilderness"]
    },

    "tags": {
      "type": "array",
      "description": "Category tags for level classification",
      "items": {
        "type": "string"
      },
      "minItems": 1,
      "examples": [["generated", "dungeon", "cave", "exploration"]]
    },

    "startingActors": {
      "type": "array",
      "description": "Monster placement array (can be empty for manual placement)",
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "name": { "type": "string" },
          "position": { "type": "object", "properties": { "x": { "type": "integer" }, "y": { "type": "integer" } } },
          "team": { "type": "string" },
          "role": { "type": "string" },
          "level": { "type": "integer" },
          "armorClass": { "type": "integer" },
          "hitPoints": { "type": "integer" },
          "abilities": { "type": "object" },
          "ai": { "type": "object" }
        }
      },
      "examples": [[]] // Empty array for manual placement
    },

    "playerSpawnPoints": {
      "type": "array",
      "description": "Player character starting positions",
      "items": {
        "type": "object",
        "properties": {
          "x": { "type": "integer", "minimum": 0 },
          "y": { "type": "integer", "minimum": 0 }
        },
        "required": ["x", "y"]
      },
      "minItems": 1,
      "examples": [[{"x": 2, "y": 2}, {"x": 3, "y": 2}]]
    },

    "environmentalEffects": {
      "type": "array",
      "description": "Environmental effects and zones",
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "name": { "type": "string" },
          "type": { "type": "string" },
          "area": { "oneOf": [{ "type": "string" }, { "type": "array" }] },
          "effects": { "type": "object" }
        }
      },
      "examples": [[{
        "id": "cave-darkness",
        "name": "Cave Darkness",
        "type": "lighting",
        "area": "global",
        "effects": { "concealment": "partial" }
      }]]
    },

    "objectives": {
      "type": "array",
      "description": "Victory conditions and objectives",
      "items": { "type": "string" },
      "minItems": 1,
      "examples": [["Explore the area", "Survive the environment", "Avoid hazards"]]
    },

    "settings": {
      "type": "object",
      "description": "Game engine settings",
      "required": ["allowRespawn", "timeLimit", "maxPlayers"],
      "properties": {
        "allowRespawn": { "type": "boolean" },
        "timeLimit": { "type": "integer", "minimum": 30, "maximum": 300 },
        "maxPlayers": { "type": "integer", "minimum": 1, "maximum": 8 }
      }
    },

    "metadata": {
      "type": "object",
      "description": "Generation metadata",
      "required": ["seed", "algorithm", "compressedSize", "generationTime"],
      "properties": {
        "seed": { "type": "integer", "minimum": 0 },
        "algorithm": { "type": "string" },
        "compressedSize": { "type": "number", "minimum": 0, "maximum": 100 },
        "generationTime": { "type": "number", "minimum": 0 }
      }
    },

    "map": {
      "type": "object",
      "description": "Map data and configurations",
      "required": ["dimensions", "terrain", "terrainConfigs"],
      "properties": {
        "dimensions": {
          "type": "object",
          "properties": {
            "width": { "type": "integer", "minimum": 1 },
            "height": { "type": "integer", "minimum": 1 }
          },
          "required": ["width", "height"]
        },

        "terrain": {
          "type": "array",
          "items": {
            "type": "array",
            "items": { "type": "string" }
          },
          "description": "2D terrain grid"
        },

        "terrainConfigs": {
          "type": "object",
          "description": "Terrain type configurations",
          "patternProperties": {
            "^.*$": {
              "type": "object",
              "required": ["id", "name", "blocksMovement", "blocksLineOfSight", "movementCost", "displayGlyph", "description"],
              "properties": {
                "id": { "type": "string" },
                "name": { "type": "string" },
                "blocksMovement": { "type": "boolean" },
                "blocksLineOfSight": { "type": "boolean" },
                "movementCost": { "type": "integer", "minimum": 0 },
                "displayGlyph": { "type": "string", "minLength": 1, "maxLength": 3 },
                "description": { "type": "string" }
              }
            }
          }
        },

        "positions": {
          "type": "object",
          "description": "Additional positioning data (currently unused)"
        }
      }
    }
  },

  "additionalProperties": false
};

/**
 * Validation rules summary for documentation
 */
export const VALIDATION_RULES = {
  "critical": [
    "All required fields must be present",
    "ID must match filename pattern",
    "All data types must be correct",
    "Map dimensions must match terrain array size",
    "Terrain configurations must exist for all used terrain types"
  ],

  "structure": [
    "Map must have proper dimensions",
    "Terrain must be a 25x25 array",
    "All terrain types must have configurations",
    "Spawn points must be within map bounds",
    "Settings must have valid ranges"
  ],

  "quality": [
    "Version must follow semantic versioning (X.Y.Z)",
    "Recommended level should be between 1-30",
    "Duration should be between 15-300 minutes",
    "At least one spawn point required",
    "Objectives should be meaningful"
  ]
};

/**
 * Example of a valid level structure
 */
export const VALID_LEVEL_EXAMPLE = {
  "id": "bandit-hideout",
  "name": "Bandit Hideout",
  "description": "A mysterious dungeon complex with hidden dangers",
  "version": "1.0.0",
  "author": "FOURE Level Generator",
  "recommendedLevel": 1,
  "estimatedDuration": 75,
  "difficulty": "easy",
  "theme": "dungeon",
  "tags": ["generated", "dungeon", "cave", "exploration"],
  "startingActors": [], // Empty for manual placement
  "playerSpawnPoints": [{"x": 2, "y": 2}],
  "environmentalEffects": [{"id": "cave-darkness", "type": "lighting"}],
  "objectives": ["Explore the area", "Survive the environment"],
  "settings": {"allowRespawn": false, "timeLimit": 90, "maxPlayers": 6},
  "metadata": {"seed": 12345, "algorithm": "bsp", "compressedSize": 67.2, "generationTime": 6},
  "map": {
    "dimensions": {"width": 25, "height": 25},
    "terrain": [["wall", "wall", ...]], // 25x25 array
    "terrainConfigs": {
      "wall": {"id": "wall", "name": "Wall", "blocksMovement": true, "blocksLineOfSight": true, "movementCost": 0, "displayGlyph": "#", "description": "Solid stone wall"},
      "empty": {"id": "empty", "name": "Empty", "blocksMovement": false, "blocksLineOfSight": false, "movementCost": 1, "displayGlyph": " ", "description": "Open ground"}
    }
  }
};
