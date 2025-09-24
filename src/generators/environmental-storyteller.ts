/**
 * Environmental Storytelling System for FOURE VTT Level Generator
 *
 * Creates narrative-rich environments with interactive elements, environmental effects,
 * and thematic consistency that tell stories through level design.
 */

import { TerrainGenerator } from './terrain-generator.js';
import { TERRAIN_PALETTES } from '../types/terrain.js';

/**
 * Environmental effect configuration
 */
export interface EnvironmentalEffect {
  readonly id: string;
  readonly name: string;
  readonly type: 'lighting' | 'zone' | 'global' | 'aura';
  readonly area: Position[] | 'global';
  readonly effects: {
    readonly brightness?: 'bright' | 'dim' | 'dark';
    readonly concealment?: 'none' | 'partial' | 'total';
    readonly movementCost?: number;
    readonly damage?: number;
    readonly healing?: number;
    readonly statusEffects?: string[];
  };
  readonly description: string;
  readonly theme: string;
}

/**
 * Interactive object configuration
 */
export interface InteractiveObject {
  readonly id: string;
  readonly name: string;
  readonly position: Position;
  readonly terrainType: string;
  readonly interactions: string[];
  readonly description: string;
  readonly theme: string;
}

/**
 * Narrative element configuration
 */
export interface NarrativeElement {
  readonly id: string;
  readonly type: 'story' | 'hint' | 'warning' | 'objective';
  readonly position: Position;
  readonly radius: number;
  readonly message: string;
  readonly conditions?: string[];
  readonly theme: string;
}

/**
 * Position interface
 */
interface Position {
  readonly x: number;
  readonly y: number;
}

/**
 * Environmental Storytelling Engine
 */
export class EnvironmentalStoryteller {
  private generator: TerrainGenerator;
  private theme: keyof typeof TERRAIN_PALETTES;

  constructor(generator: TerrainGenerator, theme: keyof typeof TERRAIN_PALETTES) {
    this.generator = generator;
    this.theme = theme;
  }

  /**
   * Generate environmental effects for the map
   */
  generateEnvironmentalEffects(terrain: string[][]): EnvironmentalEffect[] {
    const effects: EnvironmentalEffect[] = [];

    switch (this.theme) {
      case 'dungeon':
        effects.push(...this.generateDungeonEffects(terrain));
        break;
      case 'wilderness':
        effects.push(...this.generateWildernessEffects(terrain));
        break;
      case 'underground':
        effects.push(...this.generateUndergroundEffects(terrain));
        break;
      case 'urban':
        effects.push(...this.generateUrbanEffects(terrain));
        break;
      case 'mystical':
        effects.push(...this.generateMysticalEffects(terrain));
        break;
    }

    return effects;
  }

  /**
   * Generate interactive objects for the map
   */
  generateInteractiveObjects(terrain: string[][]): InteractiveObject[] {
    const objects: InteractiveObject[] = [];

    switch (this.theme) {
      case 'dungeon':
        objects.push(...this.generateDungeonObjects(terrain));
        break;
      case 'wilderness':
        objects.push(...this.generateWildernessObjects(terrain));
        break;
      case 'underground':
        objects.push(...this.generateUndergroundObjects(terrain));
        break;
      case 'urban':
        objects.push(...this.generateUrbanObjects(terrain));
        break;
      case 'mystical':
        objects.push(...this.generateMysticalObjects(terrain));
        break;
    }

    return objects;
  }

  /**
   * Generate narrative elements for the map
   */
  generateNarrativeElements(terrain: string[][]): NarrativeElement[] {
    const elements: NarrativeElement[] = [];

    switch (this.theme) {
      case 'dungeon':
        elements.push(...this.generateDungeonNarratives(terrain));
        break;
      case 'wilderness':
        elements.push(...this.generateWildernessNarratives(terrain));
        break;
      case 'underground':
        elements.push(...this.generateUndergroundNarratives(terrain));
        break;
      case 'urban':
        elements.push(...this.generateUrbanNarratives(terrain));
        break;
      case 'mystical':
        elements.push(...this.generateMysticalNarratives(terrain));
        break;
    }

    return elements;
  }

  /**
   * Dungeon-themed environmental effects
   */
  private generateDungeonEffects(terrain: string[][]): EnvironmentalEffect[] {
    const effects: EnvironmentalEffect[] = [];
    const width = terrain[0].length;
    const height = terrain.length;

    // Cave darkness effect
    effects.push({
      id: 'cave-darkness',
      name: 'Cave Darkness',
      type: 'lighting',
      area: 'global',
      effects: {
        brightness: 'dim',
        concealment: 'partial'
      },
      description: 'The cave is shrouded in perpetual dimness, providing partial concealment',
      theme: 'dungeon'
    });

    // Trap areas
    const trapPositions = this.findSuitableTrapLocations(terrain, 3);
    trapPositions.forEach((pos, index) => {
      effects.push({
        id: `trap-area-${index}`,
        name: 'Suspicious Floor',
        type: 'zone',
        area: [pos],
        effects: {
          statusEffects: ['vulnerable']
        },
        description: 'The floor here looks unstable...',
        theme: 'dungeon'
      });
    });

    // Magical aura
    const magicalPositions = this.findSuitableAuraLocations(terrain, 2);
    magicalPositions.forEach((pos, index) => {
      effects.push({
        id: `magical-aura-${index}`,
        name: 'Magical Residue',
        type: 'aura',
        area: [pos],
        effects: {
          healing: 5
        },
        description: 'Faint magical energy lingers in the air',
        theme: 'dungeon'
      });
    });

    return effects;
  }

  /**
   * Wilderness-themed environmental effects
   */
  private generateWildernessEffects(terrain: string[][]): EnvironmentalEffect[] {
    const effects: EnvironmentalEffect[] = [];

    // Forest canopy
    effects.push({
      id: 'forest-canopy',
      name: 'Forest Canopy',
      type: 'global',
      area: 'global',
      effects: {
        concealment: 'partial',
        movementCost: 1
      },
      description: 'Thick foliage overhead provides cover but slows movement',
      theme: 'wilderness'
    });

    // Weather effects (rain)
    effects.push({
      id: 'rain-slick',
      name: 'Rain-slicked Ground',
      type: 'global',
      area: 'global',
      effects: {
        statusEffects: ['slippery']
      },
      description: 'Recent rain makes the ground treacherous',
      theme: 'wilderness'
    });

    return effects;
  }

  /**
   * Underground-themed environmental effects
   */
  private generateUndergroundEffects(terrain: string[][]): EnvironmentalEffect[] {
    const effects: EnvironmentalEffect[] = [];

    // Crystal resonance
    effects.push({
      id: 'crystal-resonance',
      name: 'Crystal Resonance',
      type: 'aura',
      area: this.findCrystalLocations(terrain).slice(0, 3),
      effects: {
        brightness: 'bright',
        healing: 3
      },
      description: 'Crystals hum with healing energy',
      theme: 'underground'
    });

    // Underground chill
    effects.push({
      id: 'underground-chill',
      name: 'Perpetual Chill',
      type: 'global',
      area: 'global',
      effects: {
        statusEffects: ['chilled']
      },
      description: 'The deep earth maintains a constant chill',
      theme: 'underground'
    });

    return effects;
  }

  /**
   * Urban-themed environmental effects
   */
  private generateUrbanEffects(terrain: string[][]): EnvironmentalEffect[] {
    const effects: EnvironmentalEffect[] = [];

    // Rubble field
    effects.push({
      id: 'rubble-field',
      name: 'Rubble Field',
      type: 'zone',
      area: this.findRubbleAreas(terrain),
      effects: {
        movementCost: 2,
        concealment: 'partial'
      },
      description: 'Collapsed buildings provide cover but hinder movement',
      theme: 'urban'
    });

    // Street lighting
    effects.push({
      id: 'street-lights',
      name: 'Street Lighting',
      type: 'lighting',
      area: 'global',
      effects: {
        brightness: 'dim'
      },
      description: 'Faint street lights cast eerie shadows',
      theme: 'urban'
    });

    return effects;
  }

  /**
   * Mystical-themed environmental effects
   */
  private generateMysticalEffects(terrain: string[][]): EnvironmentalEffect[] {
    const effects: EnvironmentalEffect[] = [];

    // Ley line energy
    effects.push({
      id: 'ley-line',
      name: 'Ley Line Energy',
      type: 'zone',
      area: this.findLeyLinePath(terrain),
      effects: {
        brightness: 'bright',
        healing: 5,
        statusEffects: ['energized']
      },
      description: 'Powerful magical energy flows through ancient ley lines',
      theme: 'mystical'
    });

    // Mystical fog
    effects.push({
      id: 'mystical-fog',
      name: 'Mystical Fog',
      type: 'global',
      area: 'global',
      effects: {
        concealment: 'partial',
        statusEffects: ['confused']
      },
      description: 'Thick fog infused with magical properties disorients travelers',
      theme: 'mystical'
    });

    return effects;
  }

  /**
   * Dungeon-themed interactive objects
   */
  private generateDungeonObjects(terrain: string[][]): InteractiveObject[] {
    const objects: InteractiveObject[] = [];

    // Treasure chests
    const chestPositions = this.findSuitableObjectLocations(terrain, 'empty', 3);
    chestPositions.forEach((pos, index) => {
      objects.push({
        id: `chest-${index}`,
        name: 'Treasure Chest',
        position: pos,
        terrainType: 'empty',
        interactions: ['open', 'lockpick', 'search'],
        description: 'A sturdy wooden chest, possibly containing valuables',
        theme: 'dungeon'
      });
    });

    // Pressure plates
    const platePositions = this.findSuitableObjectLocations(terrain, 'empty', 2);
    platePositions.forEach((pos, index) => {
      objects.push({
        id: `pressure-plate-${index}`,
        name: 'Pressure Plate',
        position: pos,
        terrainType: 'empty',
        interactions: ['step', 'examine'],
        description: 'A suspicious-looking stone plate set into the floor',
        theme: 'dungeon'
      });
    });

    return objects;
  }

  /**
   * Wilderness-themed interactive objects
   */
  private generateWildernessObjects(terrain: string[][]): InteractiveObject[] {
    const objects: InteractiveObject[] = [];

    // Campfire
    objects.push({
      id: 'campfire',
      name: 'Abandoned Campfire',
      position: this.findCentralLocation(terrain),
      terrainType: 'empty',
      interactions: ['examine', 'use', 'rest'],
      description: 'A recently used campfire with embers still glowing',
      theme: 'wilderness'
    });

    // Hunting trap
    const trapPositions = this.findSuitableObjectLocations(terrain, 'difficult', 2);
    trapPositions.forEach((pos, index) => {
      objects.push({
        id: `hunting-trap-${index}`,
        name: 'Hunting Trap',
        position: pos,
        terrainType: 'difficult',
        interactions: ['examine', 'disarm', 'trigger'],
        description: 'A cleverly concealed trap for small game',
        theme: 'wilderness'
      });
    });

    return objects;
  }

  /**
   * Underground-themed interactive objects
   */
  private generateUndergroundObjects(terrain: string[][]): InteractiveObject[] {
    const objects: InteractiveObject[] = [];

    // Crystal formation
    const crystalPositions = this.findCrystalLocations(terrain);
    crystalPositions.forEach((pos, index) => {
      objects.push({
        id: `crystal-${index}`,
        name: 'Crystal Formation',
        position: pos,
        terrainType: 'crystal',
        interactions: ['mine', 'examine', 'channel'],
        description: 'A beautiful crystal formation pulsing with inner light',
        theme: 'underground'
      });
    });

    return objects;
  }

  /**
   * Urban-themed interactive objects
   */
  private generateUrbanObjects(terrain: string[][]): InteractiveObject[] {
    const objects: InteractiveObject[] = [];

    // Market stall
    objects.push({
      id: 'market-stall',
      name: 'Abandoned Market Stall',
      position: this.findCentralLocation(terrain),
      terrainType: 'empty',
      interactions: ['search', 'examine', 'use'],
      description: 'A weathered market stall with some goods still remaining',
      theme: 'urban'
    });

    // Sewer grate
    const gratePositions = this.findSuitableObjectLocations(terrain, 'empty', 1);
    gratePositions.forEach((pos, index) => {
      objects.push({
        id: `sewer-grate-${index}`,
        name: 'Sewer Grate',
        position: pos,
        terrainType: 'empty',
        interactions: ['lift', 'examine', 'enter'],
        description: 'A heavy iron grate covering access to the sewers below',
        theme: 'urban'
      });
    });

    return objects;
  }

  /**
   * Mystical-themed interactive objects
   */
  private generateMysticalObjects(terrain: string[][]): InteractiveObject[] {
    const objects: InteractiveObject[] = [];

    // Portal
    objects.push({
      id: 'mystic-portal',
      name: 'Mystic Portal',
      position: this.findCentralLocation(terrain),
      terrainType: 'portal',
      interactions: ['enter', 'examine', 'stabilize'],
      description: 'A swirling vortex of pure magical energy',
      theme: 'mystical'
    });

    // Rune circle
    const runePositions = this.findSuitableObjectLocations(terrain, 'empty', 3);
    runePositions.forEach((pos, index) => {
      objects.push({
        id: `rune-circle-${index}`,
        name: 'Ancient Rune Circle',
        position: pos,
        terrainType: 'empty',
        interactions: ['activate', 'study', 'disrupt'],
        description: 'A circle of glowing runes etched into the stone floor',
        theme: 'mystical'
      });
    });

    return objects;
  }

  /**
   * Generate narrative elements for different themes
   */
  private generateDungeonNarratives(terrain: string[][]): NarrativeElement[] {
    return [
      {
        id: 'ancient-warning',
        type: 'warning',
        position: this.findNarrativeLocation(terrain, 'central'),
        radius: 3,
        message: 'Turn back, mortal. The depths hunger for souls.',
        theme: 'dungeon'
      },
      {
        id: 'treasure-hint',
        type: 'hint',
        position: this.findNarrativeLocation(terrain, 'peripheral'),
        radius: 2,
        message: 'Riches await those brave enough to seek them.',
        theme: 'dungeon'
      }
    ];
  }

  private generateWildernessNarratives(terrain: string[][]): NarrativeElement[] {
    return [
      {
        id: 'wilderness-warning',
        type: 'warning',
        position: this.findNarrativeLocation(terrain, 'edge'),
        radius: 4,
        message: 'Danger lurks in the shadows of the ancient forest.',
        theme: 'wilderness'
      }
    ];
  }

  private generateUndergroundNarratives(terrain: string[][]): NarrativeElement[] {
    return [
      {
        id: 'crystal-prophecy',
        type: 'story',
        position: this.findCrystalLocations(terrain)[0] || this.findCentralLocation(terrain),
        radius: 5,
        message: 'When the crystals sing, the mountain shall awaken.',
        theme: 'underground'
      }
    ];
  }

  private generateUrbanNarratives(terrain: string[][]): NarrativeElement[] {
    return [
      {
        id: 'city-mystery',
        type: 'story',
        position: this.findCentralLocation(terrain),
        radius: 3,
        message: 'The city remembers what the people have forgotten.',
        theme: 'urban'
      }
    ];
  }

  private generateMysticalNarratives(terrain: string[][]): NarrativeElement[] {
    return [
      {
        id: 'magical-convergence',
        type: 'story',
        position: this.findCentralLocation(terrain),
        radius: 6,
        message: 'Here the threads of fate are woven by ancient hands.',
        theme: 'mystical'
      }
    ];
  }

  // Utility methods for finding suitable locations
  private findSuitableTrapLocations(terrain: string[][], count: number): Position[] {
    const positions: Position[] = [];

    for (let y = 1; y < terrain.length - 1; y++) {
      for (let x = 1; x < terrain[0].length - 1; x++) {
        if (terrain[y][x] === 'empty' && positions.length < count) {
          positions.push({ x, y });
        }
      }
    }

    return positions;
  }

  private findSuitableAuraLocations(terrain: string[][], count: number): Position[] {
    return this.findSuitableObjectLocations(terrain, 'empty', count);
  }

  private findSuitableObjectLocations(terrain: string[][], requiredTerrain: string, count: number): Position[] {
    const positions: Position[] = [];

    for (let y = 1; y < terrain.length - 1; y++) {
      for (let x = 1; x < terrain[0].length - 1; x++) {
        if (terrain[y][x] === requiredTerrain && positions.length < count) {
          positions.push({ x, y });
        }
      }
    }

    return positions;
  }

  private findCrystalLocations(terrain: string[][]): Position[] {
    const positions: Position[] = [];

    for (let y = 0; y < terrain.length; y++) {
      for (let x = 0; x < terrain[0].length; x++) {
        if (terrain[y][x] === 'crystal') {
          positions.push({ x, y });
        }
      }
    }

    return positions;
  }

  private findRubbleAreas(terrain: string[][]): Position[] {
    const positions: Position[] = [];

    for (let y = 0; y < terrain.length; y++) {
      for (let x = 0; x < terrain[0].length; x++) {
        if (terrain[y][x] === 'rubble') {
          positions.push({ x, y });
        }
      }
    }

    return positions;
  }

  private findLeyLinePath(terrain: string[][]): Position[] {
    // Create a diagonal path across the map
    const positions: Position[] = [];
    const width = terrain[0].length;
    const height = terrain.length;

    for (let i = 0; i < Math.min(width, height); i++) {
      positions.push({ x: i, y: i });
    }

    return positions;
  }

  private findCentralLocation(terrain: string[][]): Position {
    return {
      x: Math.floor(terrain[0].length / 2),
      y: Math.floor(terrain.length / 2)
    };
  }

  private findNarrativeLocation(terrain: string[][], preference: 'central' | 'peripheral' | 'edge'): Position {
    const width = terrain[0].length;
    const height = terrain.length;

    switch (preference) {
      case 'central':
        return this.findCentralLocation(terrain);
      case 'edge':
        return {
          x: Math.floor(Math.random() * width),
          y: Math.random() < 0.5 ? 1 : height - 2
        };
      case 'peripheral':
        return {
          x: Math.random() < 0.5 ? 2 : width - 3,
          y: Math.floor(Math.random() * height)
        };
      default:
        return this.findCentralLocation(terrain);
    }
  }
}
