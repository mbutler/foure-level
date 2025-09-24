/**
 * Terrain Generation Engine for FOURE VTT Level Generator
 *
 * Implements multiple algorithms for generating interesting tactical combat maps:
 * - BSP (Binary Space Partitioning) for room-based layouts
 * - Cellular Automata for organic cave systems
 * - Drunkard's Walk for maze-like corridors
 * - Template-based generation with procedural variation
 */

import { TerrainUtils, TerrainCategory, TERRAIN_TYPES, TERRAIN_PALETTES } from '../types/terrain.js';
import { MapCompression } from '../utils/map-compression.js';
import { CompressedMapData } from '../utils/map-compression.js';

/**
 * Configuration for terrain generation
 */
export interface GenerationConfig {
  readonly width: number;
  readonly height: number;
  readonly seed: number;
  readonly theme: keyof typeof TERRAIN_PALETTES;
  readonly algorithm: 'bsp' | 'cellular' | 'drunkard' | 'template' | 'mixed';
  readonly parameters: Record<string, number | string | boolean>;
}

/**
 * Rectangle for BSP algorithm
 */
interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Room structure for BSP generation
 */
interface Room {
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

/**
 * Main Terrain Generator Class
 */
export class TerrainGenerator {
  private config: GenerationConfig;
  private random: () => number;

  constructor(config: GenerationConfig) {
    this.config = config;
    // Simple seeded random number generator
    this.random = this.seededRandom(config.seed);
  }

  /**
   * Generate a complete terrain map using the specified algorithm
   */
  generate(): string[][] {
    switch (this.config.algorithm) {
      case 'bsp':
        return this.generateBSP();
      case 'cellular':
        return this.generateCellular();
      case 'drunkard':
        return this.generateDrunkardWalk();
      case 'template':
        return this.generateTemplate();
      case 'mixed':
        return this.generateMixed();
      default:
        return this.generateBSP(); // Default to BSP
    }
  }

  /**
   * BSP (Binary Space Partitioning) Algorithm
   * Creates room-based layouts with connecting corridors
   */
  private generateBSP(): string[][] {
    const { width, height } = this.config;
    const terrain: string[][] = Array(height).fill(null).map(() => Array(width).fill('empty'));

    const minRoomSize = this.config.parameters.minRoomSize as number || 4;
    const maxRooms = this.config.parameters.maxRooms as number || 8;
    const corridorWidth = this.config.parameters.corridorWidth as number || 1;

    // Initialize with difficult terrain (to match original samples)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
          terrain[y][x] = 'difficult';
        }
      }
    }

    // Generate rooms using BSP
    const rooms = this.generateRoomsBSP(1, 1, width - 2, height - 2, minRoomSize, maxRooms);

    // Create rooms
    rooms.forEach(room => {
      this.createRoom(terrain, room);
    });

    // Connect rooms with corridors
    this.connectRooms(terrain, rooms, corridorWidth);

    // Add interesting terrain features
    this.addBSPFeatures(terrain, rooms);

    return terrain;
  }

  /**
   * Generate rooms using Binary Space Partitioning
   */
  private generateRoomsBSP(x: number, y: number, w: number, h: number, minSize: number, maxRooms: number): Room[] {
    const rooms: Room[] = [];

    // Base case: if the space is too small or we've hit the room limit, create a room
    if (w < minSize * 2 || h < minSize * 2 || rooms.length >= maxRooms) {
      // Create a room that fills most of the available space
      const roomWidth = Math.max(minSize, Math.min(w - 2, Math.floor(this.random() * (w - minSize)) + minSize));
      const roomHeight = Math.max(minSize, Math.min(h - 2, Math.floor(this.random() * (h - minSize)) + minSize));
      const roomX = x + Math.floor(this.random() * (w - roomWidth - 1)) + 1;
      const roomY = y + Math.floor(this.random() * (h - roomHeight - 1)) + 1;

      const room: Room = {
        x: roomX,
        y: roomY,
        width: roomWidth,
        height: roomHeight,
        centerX: Math.floor(roomX + roomWidth / 2),
        centerY: Math.floor(roomY + roomHeight / 2)
      };

      // Ensure the room doesn't exceed bounds
      if (roomX + roomWidth > x + w) room.width = (x + w) - roomX - 1;
      if (roomY + roomHeight > y + h) room.height = (y + h) - roomY - 1;

      rooms.push(room);
      return rooms;
    }

    // Decide whether to split horizontally or vertically
    const splitHorizontal = this.random() < 0.5;

    if (splitHorizontal && h >= minSize * 2) {
      // Split horizontally
      const splitY = Math.floor(this.random() * (h - minSize * 2)) + minSize + y;
      const topHeight = splitY - y;
      const bottomHeight = h - topHeight;

      // Recursively generate rooms in each half
      const topRooms = this.generateRoomsBSP(x, y, w, topHeight, minSize, maxRooms - rooms.length);
      const bottomRooms = this.generateRoomsBSP(x, splitY, w, bottomHeight, minSize, maxRooms - rooms.length - topRooms.length);

      return [...topRooms, ...bottomRooms];
    } else if (w >= minSize * 2) {
      // Split vertically
      const splitX = Math.floor(this.random() * (w - minSize * 2)) + minSize + x;
      const leftWidth = splitX - x;
      const rightWidth = w - leftWidth;

      // Recursively generate rooms in each half
      const leftRooms = this.generateRoomsBSP(x, y, leftWidth, h, minSize, maxRooms - rooms.length);
      const rightRooms = this.generateRoomsBSP(splitX, y, rightWidth, h, minSize, maxRooms - rooms.length - leftRooms.length);

      return [...leftRooms, ...rightRooms];
    } else {
      // If we can't split, create a room here
      const roomWidth = Math.max(minSize, Math.min(w - 2, w - 1));
      const roomHeight = Math.max(minSize, Math.min(h - 2, h - 1));
      const roomX = x + 1;
      const roomY = y + 1;

      rooms.push({
        x: roomX,
        y: roomY,
        width: roomWidth,
        height: roomHeight,
        centerX: Math.floor(roomX + roomWidth / 2),
        centerY: Math.floor(roomY + roomHeight / 2)
      });

      return rooms;
    }
  }

  /**
   * Add interesting terrain features to BSP-generated maps
   */
  private addBSPFeatures(terrain: string[][], rooms: Room[]): void {
    const featureChance = 0.15; // 15% chance for interesting features

    // Add features inside rooms
    rooms.forEach(room => {
      const interiorWidth = room.width - 2; // Account for walls
      const interiorHeight = room.height - 2;

      if (interiorWidth < 2 || interiorHeight < 2) return;

      // Add some interesting terrain features in room interiors
      for (let y = room.y + 1; y < room.y + room.height - 1; y++) {
        for (let x = room.x + 1; x < room.x + room.width - 1; x++) {
          if (terrain[y][x] === 'empty' && this.random() < featureChance) {
            const features = this.getThemeFeatures();
            const feature = features[Math.floor(this.random() * features.length)];
            terrain[y][x] = feature;
          }
        }
      }
    });

    // Add some corridor features
    this.addCorridorFeatures(terrain);
  }

  /**
   * Add features to corridors
   */
  private addCorridorFeatures(terrain: string[][]): void {
    const corridorFeatures = ['pit', 'difficult', 'water'];

    for (let y = 1; y < terrain.length - 1; y++) {
      for (let x = 1; x < terrain[0].length - 1; x++) {
        if (terrain[y][x] === 'empty' && this.random() < 0.05) { // 5% chance
          // Check if this looks like a corridor (surrounded by difficult terrain)
          const neighbors = this.countNeighborsOfType(terrain, x, y, 'difficult');
          if (neighbors >= 4) { // At least 4 difficult terrain neighbors = likely corridor
            const feature = corridorFeatures[Math.floor(this.random() * corridorFeatures.length)];
            terrain[y][x] = feature;
          }
        }
      }
    }
  }

  /**
   * Count neighbors of a specific type
   */
  private countNeighborsOfType(terrain: string[][], x: number, y: number, type: string): number {
    let count = 0;

    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;

        const nx = x + dx;
        const ny = y + dy;

        if (nx >= 0 && nx < terrain[0].length && ny >= 0 && ny < terrain.length) {
          if (terrain[ny][nx] === type) {
            count++;
          }
        }
      }
    }

    return count;
  }

  /**
   * Create a room in the terrain
   */
  private createRoom(terrain: string[][], room: Room): void {
    // Create room boundaries (to match original samples)
    for (let y = room.y; y < room.y + room.height; y++) {
      for (let x = room.x; x < room.x + room.width; x++) {
        // Create difficult terrain around the room perimeter (to match original samples)
        if (x === room.x || x === room.x + room.width - 1 ||
            y === room.y || y === room.y + room.height - 1) {
          terrain[y][x] = 'difficult';
        } else {
          // Interior is empty
          terrain[y][x] = 'empty';
        }
      }
    }
  }

  /**
   * Connect rooms with corridors
   */
  private connectRooms(terrain: string[][], rooms: Room[], corridorWidth: number): void {
    for (let i = 0; i < rooms.length - 1; i++) {
      const currentRoom = rooms[i];
      const nextRoom = rooms[i + 1];

      // Create L-shaped corridor
      const startX = currentRoom.centerX;
      const startY = currentRoom.centerY;
      const endX = nextRoom.centerX;
      const endY = nextRoom.centerY;

      // Ensure we don't go outside bounds
      const safeStartX = Math.max(1, Math.min(terrain[0].length - 2, startX));
      const safeStartY = Math.max(1, Math.min(terrain.length - 2, startY));
      const safeEndX = Math.max(1, Math.min(terrain[0].length - 2, endX));
      const safeEndY = Math.max(1, Math.min(terrain.length - 2, endY));

      // Horizontal corridor first (from start to end X, at start Y)
      const horizontalStart = Math.min(safeStartX, safeEndX);
      const horizontalEnd = Math.max(safeStartX, safeEndX);

      for (let x = horizontalStart; x <= horizontalEnd; x++) {
        for (let cy = safeStartY - Math.floor(corridorWidth / 2); cy <= safeStartY + Math.floor(corridorWidth / 2); cy++) {
          if (cy >= 0 && cy < terrain.length && x >= 0 && x < terrain[0].length) {
            // Don't overwrite existing difficult terrain, create corridor through empty/difficult
            if (terrain[cy][x] === 'empty' || terrain[cy][x] === 'difficult') {
              terrain[cy][x] = 'empty';
            }
          }
        }
      }

      // Vertical corridor (from start to end Y, at end X)
      const verticalStart = Math.min(safeStartY, safeEndY);
      const verticalEnd = Math.max(safeStartY, safeEndY);

      for (let y = verticalStart; y <= verticalEnd; y++) {
        for (let cx = safeEndX - Math.floor(corridorWidth / 2); cx <= safeEndX + Math.floor(corridorWidth / 2); cx++) {
          if (cx >= 0 && cx < terrain[0].length && y >= 0 && y < terrain.length) {
            // Don't overwrite existing difficult terrain, create corridor through empty/difficult
            if (terrain[y][cx] === 'empty' || terrain[y][cx] === 'difficult') {
              terrain[y][cx] = 'empty';
            }
          }
        }
      }
    }
  }

  /**
   * Cellular Automata Algorithm
   * Creates organic cave-like structures
   */
  private generateCellular(): string[][] {
    const { width, height } = this.config;
    const terrain: string[][] = Array(height).fill(null).map(() => Array(width).fill('wall'));

    const initialFill = this.config.parameters.initialFill as number || 0.45;
    const iterations = this.config.parameters.iterations as number || 4;
    const birthLimit = this.config.parameters.birthLimit as number || 4;
    const deathLimit = this.config.parameters.deathLimit as number || 3;

    // Initialize with random fill
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (this.random() < initialFill) {
          terrain[y][x] = 'empty';
        }
      }
    }

    // Apply cellular automata rules
    for (let iter = 0; iter < iterations; iter++) {
      const newTerrain: string[][] = Array(height).fill(null).map(() => Array(width).fill('wall'));

      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const neighbors = this.countNeighbors(terrain, x, y);

          if (terrain[y][x] === 'empty') {
            // Death rule
            if (neighbors < deathLimit) {
              newTerrain[y][x] = 'wall';
            } else {
              newTerrain[y][x] = 'empty';
            }
          } else {
            // Birth rule
            if (neighbors > birthLimit) {
              newTerrain[y][x] = 'empty';
            } else {
              newTerrain[y][x] = 'wall';
            }
          }
        }
      }

      // Copy new terrain back
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          terrain[y][x] = newTerrain[y][x];
        }
      }
    }

    // Add some interesting features
    this.addCellularFeatures(terrain);

    return terrain;
  }

  /**
   * Count living neighbors for cellular automata
   */
  private countNeighbors(terrain: string[][], x: number, y: number): number {
    let count = 0;

    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;

        const nx = x + dx;
        const ny = y + dy;

        if (nx >= 0 && nx < terrain[0].length && ny >= 0 && ny < terrain.length) {
          if (terrain[ny][nx] === 'empty') {
            count++;
          }
        }
      }
    }

    return count;
  }

  /**
   * Add interesting features to cellular automata maps
   */
  private addCellularFeatures(terrain: string[][]): void {
    const featureChance = 0.1;

    for (let y = 1; y < terrain.length - 1; y++) {
      for (let x = 1; x < terrain[0].length - 1; x++) {
        if (terrain[y][x] === 'empty' && this.random() < featureChance) {
          // Add various features based on theme
          switch (this.config.theme) {
            case 'dungeon':
              if (this.random() < 0.3) terrain[y][x] = 'pit';
              else if (this.random() < 0.5) terrain[y][x] = 'water';
              else terrain[y][x] = 'difficult';
              break;
            case 'wilderness':
              terrain[y][x] = 'difficult';
              break;
            case 'underground':
              if (this.random() < 0.4) terrain[y][x] = 'crystal';
              else if (this.random() < 0.7) terrain[y][x] = 'water';
              break;
          }
        }
      }
    }
  }

  /**
   * Drunkard's Walk Algorithm
   * Creates maze-like corridors
   */
  private generateDrunkardWalk(): string[][] {
    const { width, height } = this.config;
    const terrain: string[][] = Array(height).fill(null).map(() => Array(width).fill('wall'));

    const steps = this.config.parameters.steps as number || 2000;
    const branchChance = this.config.parameters.branchChance as number || 0.1;

    // Start from center
    let x = Math.floor(width / 2);
    let y = Math.floor(height / 2);

    terrain[y][x] = 'empty';

    for (let step = 0; step < steps; step++) {
      // Move in random direction
      const direction = Math.floor(this.random() * 4);
      let newX = x;
      let newY = y;

      switch (direction) {
        case 0: newX++; break; // Right
        case 1: newX--; break; // Left
        case 2: newY++; break; // Down
        case 3: newY--; break; // Up
      }

      // Stay within bounds
      if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
        terrain[newY][newX] = 'empty';
        x = newX;
        y = newY;

        // Occasionally branch
        if (this.random() < branchChance) {
          const branchSteps = Math.floor(this.random() * 50) + 10;
          this.drunkardBranch(terrain, x, y, branchSteps);
        }
      }
    }

    return terrain;
  }

  /**
   * Create a branch from drunkard's walk
   */
  private drunkardBranch(terrain: string[][], x: number, y: number, steps: number): void {
    for (let step = 0; step < steps; step++) {
      const direction = Math.floor(this.random() * 4);
      let newX = x;
      let newY = y;

      switch (direction) {
        case 0: newX++; break;
        case 1: newX--; break;
        case 2: newY++; break;
        case 3: newY--; break;
      }

      if (newX >= 0 && newX < terrain[0].length && newY >= 0 && newY < terrain.length) {
        terrain[newY][newX] = 'empty';
        x = newX;
        y = newY;
      }
    }
  }

  /**
   * Template-based generation with procedural variation
   */
  private generateTemplate(): string[][] {
    // Start with a base template and add variations
    const baseTemplate = this.createBaseTemplate();
    return this.varyTemplate(baseTemplate);
  }

  /**
   * Create a base template layout
   */
  private createBaseTemplate(): string[][] {
    const { width, height } = this.config;
    const terrain: string[][] = Array(height).fill(null).map(() => Array(width).fill('empty'));

    // Create a simple room layout
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);

    // Main chamber
    for (let y = centerY - 3; y <= centerY + 3; y++) {
      for (let x = centerX - 4; x <= centerX + 4; x++) {
        if (x >= 0 && x < width && y >= 0 && y < height) {
          terrain[y][x] = 'empty';
        }
      }
    }

    // Add some walls for structure
    for (let x = 0; x < width; x++) {
      terrain[0][x] = 'wall';
      terrain[height - 1][x] = 'wall';
    }

    for (let y = 0; y < height; y++) {
      terrain[y][0] = 'wall';
      terrain[y][width - 1] = 'wall';
    }

    return terrain;
  }

  /**
   * Add procedural variations to a template
   */
  private varyTemplate(terrain: string[][]): string[][] {
    const variationChance = 0.2;

    for (let y = 1; y < terrain.length - 1; y++) {
      for (let x = 1; x < terrain[0].length - 1; x++) {
        if (terrain[y][x] === 'empty' && this.random() < variationChance) {
          // Add various terrain features based on theme
          const features = this.getThemeFeatures();
          const feature = features[Math.floor(this.random() * features.length)];
          terrain[y][x] = feature;
        }
      }
    }

    return terrain;
  }

  /**
   * Get terrain features appropriate for the current theme
   */
  private getThemeFeatures(): string[] {
    switch (this.config.theme) {
      case 'dungeon':
        return ['pit', 'water', 'difficult', 'altar'];
      case 'wilderness':
        return ['difficult', 'trees', 'water', 'pit'];
      case 'underground':
        return ['crystal', 'water', 'difficult', 'stalagmite'];
      case 'urban':
        return ['rubble', 'water', 'pit', 'difficult'];
      case 'mystical':
        return ['crystal', 'portal', 'altar', 'mushrooms'];
      default:
        return ['difficult', 'water'];
    }
  }

  /**
   * Mixed algorithm combining multiple techniques
   */
  private generateMixed(): string[][] {
    // Start with BSP for main structure
    let terrain = this.generateBSP();

    // Add cellular automata features in open areas
    terrain = this.addCellularFeaturesToBSP(terrain);

    return terrain;
  }

  /**
   * Add cellular automata features to BSP-generated maps
   */
  private addCellularFeaturesToBSP(terrain: string[][]): string[][] {
    const featureChance = 0.05;

    for (let y = 1; y < terrain.length - 1; y++) {
      for (let x = 1; x < terrain[0].length - 1; x++) {
        if (terrain[y][x] === 'empty' && this.random() < featureChance) {
          const features = this.getThemeFeatures();
          const feature = features[Math.floor(this.random() * features.length)];
          terrain[y][x] = feature;
        }
      }
    }

    return terrain;
  }

  /**
   * Seeded random number generator
   */
  private seededRandom(seed: number): () => number {
    let m = 2 ** 35 - 31;
    let a = 185852;
    let s = seed % m;

    return function () {
      return (s = (s * a) % m) / m;
    };
  }

  /**
   * Generate complete compressed map data
   */
  generateCompressedMap(): CompressedMapData {
    const terrainLayer = this.generate();
    return MapCompression.compressMap(terrainLayer, this.config.seed, this.config.theme);
  }
}
