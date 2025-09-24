/**
 * Main Level Generator for FOURE VTT
 *
 * Orchestrates all components to create complete, balanced tactical combat maps
 * with terrain, environmental effects, interactive objects, and monster encounters.
 */

import { TerrainGenerator, GenerationConfig } from './terrain-generator.js';
import { EnvironmentalStoryteller } from './environmental-storyteller.js';
import { EncounterBalancer, MonsterStats } from './encounter-balancer.js';
import { MapCompression } from '../utils/map-compression.js';
import { TERRAIN_PALETTES, TERRAIN_TYPES, TerrainUtils } from '../types/terrain.js';
import { CompressedMapData } from '../utils/map-compression.js';

/**
 * Complete generated level data
 */
export interface GeneratedLevel {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly version: string;
  readonly author: string;
  readonly recommendedLevel: number;
  readonly estimatedDuration: number;

  readonly map: {
    readonly dimensions: { width: number; height: number };
    readonly terrain: string[][];
    readonly positions: Record<string, any>;
    readonly terrainConfigs: any;
  };

  readonly startingActors: MonsterStats[];
  readonly playerSpawnPoints: Array<{ x: number; y: number }>;
  readonly environmentalEffects: any[];
  readonly objectives: string[];
  readonly tags: string[];
  readonly difficulty: string;
  readonly theme: string;

  readonly settings: {
    readonly allowRespawn: boolean;
    readonly timeLimit: number;
    readonly maxPlayers: number;
  };

  readonly metadata: {
    readonly seed: number;
    readonly algorithm: string;
    readonly compressedSize: number;
    readonly generationTime: number;
  };
}

/**
 * Main Level Generator Class
 */
export class LevelGenerator {
  private config: GenerationConfig;

  constructor(
    seed: number = Math.floor(Math.random() * 1000000),
    theme: keyof typeof TERRAIN_PALETTES = 'dungeon',
    algorithm: 'bsp' | 'cellular' | 'drunkard' | 'template' | 'mixed' = 'mixed'
  ) {
    this.config = {
      width: 25,
      height: 25,
      seed,
      theme,
      algorithm,
      parameters: {
        minRoomSize: 4,
        maxRooms: 8,
        corridorWidth: 1,
        initialFill: 0.45,
        iterations: 4,
        birthLimit: 4,
        deathLimit: 3,
        steps: 2000,
        branchChance: 0.1
      }
    };
  }

  /**
   * Generate a complete level with all components
   */
  generateLevel(
    playerCount: number = 4,
    difficultyLevel: number = 1,
    name?: string,
    expectedId?: string
  ): GeneratedLevel {
    const startTime = Date.now();

    // Generate terrain
    const terrainGenerator = new TerrainGenerator(this.config);
    const terrain = terrainGenerator.generate();

    // Generate environmental elements
    const storyteller = new EnvironmentalStoryteller(terrainGenerator, this.config.theme);
    const environmentalEffects = storyteller.generateEnvironmentalEffects(terrain);
    const interactiveObjects = storyteller.generateInteractiveObjects(terrain);
    const narrativeElements = storyteller.generateNarrativeElements(terrain);

    // Compress the map
    const compressedData = terrainGenerator.generateCompressedMap();
    const compressionStats = MapCompression.getCompressionStats(terrain);

    const generationTime = Date.now() - startTime;

    // Generate level metadata
    const levelName = name || this.generateLevelName();
    const description = this.generateLevelDescription();

    return {
      id: expectedId || `level-${this.config.seed}`,
      name: levelName,
      description,
      version: '1.0.0',
      author: 'FOURE Team',
      recommendedLevel: difficultyLevel,
      estimatedDuration: 60 + (difficultyLevel * 15),

      map: {
        dimensions: { width: this.config.width, height: this.config.height },
        terrain,
        positions: {},
        terrainConfigs: this.generateTerrainConfigs(terrain)
      },

      startingActors: [], // Empty array for manual monster placement
      playerSpawnPoints: this.generatePlayerSpawnPoints(terrain),
      environmentalEffects,
      objectives: this.generateObjectives(terrain, []),
      tags: this.generateLevelTags(),
      difficulty: this.getDifficultyName(difficultyLevel),
      theme: this.config.theme
    };
  }

  /**
   * Generate terrain configurations based on terrain types used in the map
   */
  private generateTerrainConfigs(terrain: string[][]): Record<string, any> {
    const usedTerrainTypes = new Set<string>();

    // Find all terrain types used in the map
    for (let y = 0; y < terrain.length; y++) {
      for (let x = 0; x < terrain[0].length; x++) {
        usedTerrainTypes.add(terrain[y][x]);
      }
    }

    // Create configuration object for each used terrain type
    const terrainConfigs: Record<string, any> = {};

    usedTerrainTypes.forEach(terrainType => {
      const config = TERRAIN_TYPES[terrainType];
      if (config) {
        terrainConfigs[terrainType] = {
          id: config.id,
          name: config.name,
          blocksMovement: config.blocksMovement,
          blocksLineOfSight: config.blocksLineOfSight,
          movementCost: config.movementCost,
          displayGlyph: config.displayGlyph,
          description: config.description
        };
      } else {
        // Fallback for unknown terrain types
        terrainConfigs[terrainType] = {
          id: terrainType,
          name: terrainType.charAt(0).toUpperCase() + terrainType.slice(1),
          blocksMovement: false,
          blocksLineOfSight: false,
          movementCost: 1,
          displayGlyph: terrainType.charAt(0),
          description: `Generated terrain type: ${terrainType}`
        };
      }
    });

    return terrainConfigs;
  }

  /**
   * Generate encounter objectives based on terrain and monsters
   */
  private generateObjectives(terrain: string[][], monsters: any[]): string[] {
    const objectives: string[] = [];

    // Primary objective - will be set by game engine when monsters are added
    if (monsters.length > 0) {
      objectives.push(`Defeat ${monsters.length} hostile creatures`);

      // Secondary objectives based on monster roles
      const elites = monsters.filter(m => m.role === 'elite').length;
      if (elites > 0) {
        objectives.push(`Eliminate the elite threats first`);
      }

      const solos = monsters.filter(m => m.role === 'solo').length;
      if (solos > 0) {
        objectives.push(`Focus fire on the boss creature`);
      }
    } else {
      // No monsters - exploration objectives
      objectives.push(`Explore the area`);
      objectives.push(`Survive the environment`);
    }

    // Terrain-based objectives
    const hasCover = terrain.some(row => row.some(cell => ['ruins', 'mushrooms'].includes(cell)));
    if (hasCover) {
      objectives.push(`Use terrain for cover and tactical positioning`);
    }

    const hasHazards = terrain.some(row => row.some(cell => ['pit', 'lava', 'water'].includes(cell)));
    if (hasHazards) {
      objectives.push(`Avoid environmental hazards`);
    }

    const hasInteractive = terrain.some(row => row.some(cell => ['altar', 'crystal', 'portal'].includes(cell)));
    if (hasInteractive) {
      objectives.push(`Interact with environmental features`);
    }

    return objectives;
  }

  /**
   * Generate level name based on theme and seed
   */
  private generateLevelName(): string {
    const themeNames = {
      dungeon: 'Caverns',
      wilderness: 'Wilds',
      underground: 'Depths',
      urban: 'District',
      mystical: 'Sanctum'
    };

    const adjectives = [
      'Forgotten', 'Ancient', 'Haunted', 'Sacred', 'Cursed',
      'Mysterious', 'Dark', 'Hidden', 'Lost', 'Forbidden'
    ];

    const themeName = themeNames[this.config.theme] || 'Realm';
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];

    return `${adjective} ${themeName} #${this.config.seed}`;
  }

  /**
   * Generate level description
   */
  private generateLevelDescription(): string {
    const descriptions = {
      dungeon: [
        'A dark cave system teeming with underground creatures.',
        'Ancient caverns that have claimed many adventurers.',
        'A mysterious dungeon complex with hidden dangers.'
      ],
      wilderness: [
        'Dense forest wilderness with natural hazards.',
        'Untamed wilds where nature reigns supreme.',
        'A dangerous forest filled with wild creatures.'
      ],
      underground: [
        'Deep underground caverns with crystal formations.',
        'Subterranean depths hiding ancient secrets.',
        'Crystal-lit caves with mysterious properties.'
      ],
      urban: [
        'Abandoned city streets with lurking dangers.',
        'Urban decay where shadows come alive.',
        'Forgotten district reclaimed by darkness.'
      ],
      mystical: [
        'A realm where magic bends reality.',
        'Mystical sanctum pulsing with arcane energy.',
        'Magical convergence of ancient powers.'
      ]
    };

    const themeDescriptions = descriptions[this.config.theme] || descriptions.dungeon;
    return themeDescriptions[Math.floor(Math.random() * themeDescriptions.length)];
  }

  /**
   * Generate player spawn points
   */
  private generatePlayerSpawnPoints(terrain: string[][]): Array<{ x: number; y: number }> {
    const spawnPoints: Array<{ x: number; y: number }> = [];
    const margin = 2;

    // Find open areas near the edges for spawn points
    for (let x = margin; x < this.config.width - margin; x += 3) {
      // Top edge
      if (this.isValidSpawnLocation(terrain, x, margin)) {
        spawnPoints.push({ x, y: margin });
      }

      // Bottom edge
      if (this.isValidSpawnLocation(terrain, x, this.config.height - margin - 1)) {
        spawnPoints.push({ x, y: this.config.height - margin - 1 });
      }
    }

    // Left and right edges
    for (let y = margin; y < this.config.height - margin; y += 3) {
      // Left edge
      if (this.isValidSpawnLocation(terrain, margin, y)) {
        spawnPoints.push({ x: margin, y });
      }

      // Right edge
      if (this.isValidSpawnLocation(terrain, this.config.width - margin - 1, y)) {
        spawnPoints.push({ x: this.config.width - margin - 1, y });
      }
    }

    // Ensure we have at least 4 spawn points
    while (spawnPoints.length < 4) {
      const x = margin + Math.floor(Math.random() * (this.config.width - margin * 2));
      const y = margin + Math.floor(Math.random() * (this.config.height - margin * 2));

      if (this.isValidSpawnLocation(terrain, x, y)) {
        spawnPoints.push({ x, y });
      }
    }

    return spawnPoints.slice(0, 6); // Max 6 spawn points
  }

  /**
   * Check if location is valid for player spawn
   */
  private isValidSpawnLocation(terrain: string[][], x: number, y: number): boolean {
    if (x < 0 || x >= this.config.width || y < 0 || y >= this.config.height) {
      return false;
    }

    const centerTerrain = terrain[y][x];

    // Must be empty or easy terrain
    if (centerTerrain !== 'empty') {
      return false;
    }

    // Check surrounding area
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx;
        const ny = y + dy;

        if (nx >= 0 && nx < this.config.width && ny >= 0 && ny < this.config.height) {
          const neighborTerrain = terrain[ny][nx];

          // Avoid walls, pits, lava, etc.
          if (['wall', 'pit', 'lava', 'crystal', 'altar'].includes(neighborTerrain)) {
            return false;
          }
        }
      }
    }

    return true;
  }

  /**
   * Generate level tags
   */
  private generateLevelTags(): string[] {
    const baseTags = ['generated', this.config.theme];

    const themeTags = {
      dungeon: ['cave', 'underground', 'exploration'],
      wilderness: ['forest', 'outdoor', 'nature'],
      underground: ['crystal', 'deep', 'mining'],
      urban: ['city', 'buildings', 'streets'],
      mystical: ['magic', 'arcane', 'ritual']
    };

    return [...baseTags, ...(themeTags[this.config.theme] || [])];
  }

  /**
   * Get difficulty name
   */
  private getDifficultyName(level: number): string {
    if (level <= 1) return 'easy';
    if (level <= 3) return 'medium';
    if (level <= 5) return 'hard';
    return 'legendary';
  }

  /**
   * Generate a level and export as JSON
   */
  generateJSON(playerCount: number = 4, difficultyLevel: number = 1): string {
    const level = this.generateLevel(playerCount, difficultyLevel);
    return JSON.stringify(level, null, 2);
  }

  /**
   * Generate compressed level data
   */
  generateCompressed(): CompressedMapData {
    const terrainGenerator = new TerrainGenerator(this.config);
    return terrainGenerator.generateCompressedMap();
  }
}

/**
 * Quick generation functions for common use cases
 */
export const LevelGeneratorUtils = {
  /**
   * Generate a quick dungeon level
   */
  generateDungeon(seed?: number): GeneratedLevel {
    const generator = new LevelGenerator(seed, 'dungeon', 'bsp');
    return generator.generateLevel();
  },

  /**
   * Generate a wilderness encounter
   */
  generateWilderness(seed?: number): GeneratedLevel {
    const generator = new LevelGenerator(seed, 'wilderness', 'mixed');
    return generator.generateLevel();
  },

  /**
   * Generate an underground crystal cave
   */
  generateUnderground(seed?: number): GeneratedLevel {
    const generator = new LevelGenerator(seed, 'underground', 'cellular');
    return generator.generateLevel();
  },

  /**
   * Generate an urban encounter
   */
  generateUrban(seed?: number): GeneratedLevel {
    const generator = new LevelGenerator(seed, 'urban', 'template');
    return generator.generateLevel();
  },

  /**
   * Generate a mystical sanctum
   */
  generateMystical(seed?: number): GeneratedLevel {
    const generator = new LevelGenerator(seed, 'mystical', 'mixed');
    return generator.generateLevel();
  }
};
