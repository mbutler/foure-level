/**
 * Terrain Types and UTF-8 Symbol System for FOURE VTT Level Generator
 *
 * This module defines the complete terrain system with visual representations,
 * gameplay properties, and categorization for procedural generation.
 */

export interface TerrainConfig {
  readonly id: string;
  readonly name: string;
  readonly displayGlyph: string;
  readonly blocksMovement: boolean;
  readonly blocksLineOfSight: boolean;
  readonly movementCost: number;
  readonly description: string;
  readonly category: TerrainCategory;
  readonly colorCode?: string; // For future GUI support
}

export enum TerrainCategory {
  OPEN = 'open',
  OBSTRUCTING = 'obstructing',
  HAZARDOUS = 'hazardous',
  INTERACTIVE = 'interactive',
  ENVIRONMENTAL = 'environmental',
  STRUCTURAL = 'structural'
}

/**
 * Core Terrain Types
 * Each type has a unique UTF-8 symbol for visual representation
 */
export const TERRAIN_TYPES: Record<string, TerrainConfig> = {
  // Open Ground - Basic traversable terrain
  empty: {
    id: 'empty',
    name: 'Empty',
    displayGlyph: ' ',
    blocksMovement: false,
    blocksLineOfSight: false,
    movementCost: 1,
    description: 'Open ground',
    category: TerrainCategory.OPEN
  },

  // Structural Elements
  wall: {
    id: 'wall',
    name: 'Wall',
    displayGlyph: '#',
    blocksMovement: true,
    blocksLineOfSight: true,
    movementCost: 0,
    description: 'Solid stone wall',
    category: TerrainCategory.STRUCTURAL
  },

  // Hazardous Terrain
  pit: {
    id: 'pit',
    name: 'Pit',
    displayGlyph: '□',
    blocksMovement: true,
    blocksLineOfSight: false,
    movementCost: 2,
    description: 'Bottomless pit',
    category: TerrainCategory.HAZARDOUS
  },

  lava: {
    id: 'lava',
    name: 'Lava',
    displayGlyph: '≈',
    blocksMovement: true,
    blocksLineOfSight: false,
    movementCost: 0,
    description: 'Molten rock river',
    category: TerrainCategory.HAZARDOUS
  },

  // Difficult Terrain
  water: {
    id: 'water',
    name: 'Water',
    displayGlyph: '~',
    blocksMovement: false,
    blocksLineOfSight: false,
    movementCost: 2,
    description: 'Shallow water or marsh',
    category: TerrainCategory.OPEN
  },

  difficult: {
    id: 'difficult',
    name: 'Difficult Terrain',
    displayGlyph: '^',
    blocksMovement: false,
    blocksLineOfSight: false,
    movementCost: 2,
    description: 'Dense forest undergrowth',
    category: TerrainCategory.OPEN
  },

  // Environmental Features
  ruins: {
    id: 'ruins',
    name: 'Ancient Ruins',
    displayGlyph: '☗',
    blocksMovement: false,
    blocksLineOfSight: true,
    movementCost: 3,
    description: 'Crumbling stones of a forgotten age',
    category: TerrainCategory.ENVIRONMENTAL
  },

  mushrooms: {
    id: 'mushrooms',
    name: 'Giant Mushrooms',
    displayGlyph: '♠',
    blocksMovement: false,
    blocksLineOfSight: true,
    movementCost: 2,
    description: 'Towering fungi, bioluminescent at night',
    category: TerrainCategory.ENVIRONMENTAL
  },

  crystal: {
    id: 'crystal',
    name: 'Crystal Spire',
    displayGlyph: '✶',
    blocksMovement: true,
    blocksLineOfSight: false,
    movementCost: 0,
    description: 'Jagged glowing crystal spire',
    category: TerrainCategory.ENVIRONMENTAL
  },

  // Interactive Elements
  altar: {
    id: 'altar',
    name: 'Forgotten Altar',
    displayGlyph: '⚑',
    blocksMovement: false,
    blocksLineOfSight: false,
    movementCost: 1,
    description: 'A mysterious altar radiating old power',
    category: TerrainCategory.INTERACTIVE
  },

  // Wilderness Terrain
  trees: {
    id: 'trees',
    name: 'Dense Trees',
    displayGlyph: '♠',
    blocksMovement: false,
    blocksLineOfSight: true,
    movementCost: 2,
    description: 'Thick forest canopy',
    category: TerrainCategory.ENVIRONMENTAL
  },

  // Underground Features
  stalagmite: {
    id: 'stalagmite',
    name: 'Stalagmite',
    displayGlyph: '▲',
    blocksMovement: false,
    blocksLineOfSight: true,
    movementCost: 2,
    description: 'Limestone formation',
    category: TerrainCategory.ENVIRONMENTAL
  },

  // Special Features
  chasm: {
    id: 'chasm',
    name: 'Chasm',
    displayGlyph: '⌊⌋',
    blocksMovement: true,
    blocksLineOfSight: false,
    movementCost: 0,
    description: 'Deep fissure in the earth',
    category: TerrainCategory.HAZARDOUS
  },

  bridge: {
    id: 'bridge',
    name: 'Bridge',
    displayGlyph: '=',
    blocksMovement: false,
    blocksLineOfSight: false,
    movementCost: 1,
    description: 'Wooden bridge over chasm',
    category: TerrainCategory.STRUCTURAL
  },

  // Magical Elements
  portal: {
    id: 'portal',
    name: 'Mystic Portal',
    displayGlyph: '◎',
    blocksMovement: false,
    blocksLineOfSight: false,
    movementCost: 1,
    description: 'Swirling vortex of magic',
    category: TerrainCategory.INTERACTIVE
  },

  // Urban Elements
  rubble: {
    id: 'rubble',
    name: 'Rubble',
    displayGlyph: '※',
    blocksMovement: false,
    blocksLineOfSight: true,
    movementCost: 2,
    description: 'Collapsed building debris',
    category: TerrainCategory.OBSTRUCTING
  },

  // Ice/Snow Elements
  ice: {
    id: 'ice',
    name: 'Ice',
    displayGlyph: '⋄',
    blocksMovement: false,
    blocksLineOfSight: false,
    movementCost: 2,
    description: 'Slippery ice surface',
    category: TerrainCategory.HAZARDOUS
  }
};

/**
 * Theme-based terrain palettes for different environments
 */
export const TERRAIN_PALETTES = {
  dungeon: [
    'empty', 'wall', 'pit', 'water', 'difficult', 'ruins', 'crystal', 'altar'
  ],

  wilderness: [
    'empty', 'difficult', 'trees', 'water', 'pit', 'chasm', 'bridge', 'rubble'
  ],

  underground: [
    'empty', 'wall', 'stalagmite', 'water', 'difficult', 'crystal', 'portal', 'altar'
  ],

  urban: [
    'empty', 'wall', 'rubble', 'water', 'difficult', 'pit', 'bridge', 'portal'
  ],

  mystical: [
    'empty', 'crystal', 'portal', 'altar', 'ruins', 'mushrooms', 'water', 'difficult'
  ]
};

/**
 * Utility functions for terrain operations
 */
export class TerrainUtils {
  /**
   * Get terrain config by ID
   */
  static getTerrain(id: string): TerrainConfig | undefined {
    return TERRAIN_TYPES[id];
  }

  /**
   * Get all terrain types for a specific category
   */
  static getTerrainByCategory(category: TerrainCategory): TerrainConfig[] {
    return Object.values(TERRAIN_TYPES).filter(terrain => terrain.category === category);
  }

  /**
   * Get terrain types for a specific theme
   */
  static getTerrainForTheme(theme: keyof typeof TERRAIN_PALETTES): string[] {
    return TERRAIN_PALETTES[theme];
  }

  /**
   * Check if terrain blocks movement
   */
  static blocksMovement(terrainId: string): boolean {
    const terrain = this.getTerrain(terrainId);
    return terrain ? terrain.blocksMovement : true;
  }

  /**
   * Check if terrain blocks line of sight
   */
  static blocksLineOfSight(terrainId: string): boolean {
    const terrain = this.getTerrain(terrainId);
    return terrain ? terrain.blocksLineOfSight : true;
  }

  /**
   * Get movement cost for terrain
   */
  static getMovementCost(terrainId: string): number {
    const terrain = this.getTerrain(terrainId);
    return terrain ? terrain.movementCost : 0;
  }

  /**
   * Get display glyph for terrain
   */
  static getDisplayGlyph(terrainId: string): string {
    const terrain = this.getTerrain(terrainId);
    return terrain ? terrain.displayGlyph : '?';
  }

  /**
   * Validate terrain ID exists
   */
  static isValidTerrain(terrainId: string): boolean {
    return terrainId in TERRAIN_TYPES;
  }
}

/**
 * Map cell representation combining terrain with dynamic properties
 */
export interface MapCell {
  readonly terrain: string;
  readonly elevation?: number;
  readonly effects?: string[];
  readonly objects?: string[];
}

/**
 * Compact representation for map storage
 */
export interface CompactMapData {
  readonly dimensions: { width: number; height: number };
  readonly terrainLayer: string[][]; // 2D array of terrain IDs
  readonly metadata: {
    readonly theme: string;
    readonly seed: number;
    readonly version: string;
  };
}
