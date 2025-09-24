/**
 * Encounter Balancing System for FOURE VTT Level Generator
 *
 * Balances tactical combat encounters by placing appropriate monsters,
 * considering terrain features, difficulty levels, and tactical positioning.
 */

import { TerrainUtils } from '../types/terrain.js';
import { EnvironmentalStoryteller } from './environmental-storyteller.js';
import { TerrainGenerator } from './terrain-generator.js';

/**
 * Monster stat block for balancing
 */
export interface MonsterStats {
  readonly id: string;
  readonly name: string;
  readonly level: number;
  readonly role: 'minion' | 'standard' | 'elite' | 'solo';
  readonly team: 'A' | 'B';
  readonly position: { x: number; y: number };
  readonly armorClass: number;
  readonly hitPoints: number;
  readonly abilities: {
    readonly strength: number;
    readonly dexterity: number;
    readonly constitution: number;
    readonly intelligence: number;
    readonly wisdom: number;
    readonly charisma: number;
  };
  readonly defenses: {
    readonly reflex: number;
    readonly will: number;
    readonly fortitude: number;
  };
  readonly initiative: number;
  readonly speed: number;
  readonly ai: {
    readonly behavior: 'aggressive' | 'defensive' | 'ambush' | 'patrol' | 'guard';
    readonly preferredRange?: 'melee' | 'ranged' | 'mixed';
    readonly tactical?: string[];
  };
  readonly tags: string[];
}

/**
 * Encounter difficulty configuration
 */
export interface EncounterDifficulty {
  readonly level: number;
  readonly maxPlayers: number;
  readonly minMonsters: number;
  readonly maxMonsters: number;
  readonly xpBudget: number;
  readonly roleDistribution: {
    readonly minions: number; // 1 XP each
    readonly standards: number; // 100 XP each
    readonly elites: number; // 200 XP each
    readonly solos: number; // 500 XP each
  };
}

/**
 * Tactical positioning analysis
 */
interface TacticalPosition {
  readonly position: { x: number; y: number };
  readonly tacticalValue: number;
  readonly terrainType: string;
  readonly cover: number;
  readonly elevation?: number;
  readonly flanking: number;
  readonly mobility: number;
}

/**
 * Encounter Balancing Engine
 */
export class EncounterBalancer {
  private storyteller: EnvironmentalStoryteller;
  private difficulty: EncounterDifficulty;

  constructor(storyteller: EnvironmentalStoryteller, difficultyLevel: number = 1) {
    this.storyteller = storyteller;
    this.difficulty = this.getDifficultyConfig(difficultyLevel);
  }

  /**
   * Generate balanced encounter for the map
   */
  generateEncounter(
    terrain: string[][],
    playerCount: number = 4
  ): {
    monsters: MonsterStats[];
    objectives: string[];
    tacticalNotes: string[];
  } {
    const monsters: MonsterStats[] = [];
    const xpRemaining = this.calculateXPBudget(playerCount);

    // Generate monster composition
    const composition = this.generateMonsterComposition(xpRemaining);

    // Place monsters in tactically interesting positions
    const monsterPositions = this.findTacticalPositions(terrain, composition);

    // Create monster stats
    let monsterIndex = 0;
    for (const [role, count] of Object.entries(composition)) {
      for (let i = 0; i < count; i++) {
        if (monsterIndex < monsterPositions.length) {
          const position = monsterPositions[monsterIndex];
          const monster = this.createMonster(role as keyof typeof composition, position, monsterIndex);
          monsters.push(monster);
          monsterIndex++;
        }
      }
    }

    // Generate objectives and tactical notes
    const objectives = this.generateObjectives(terrain, monsters);
    const tacticalNotes = this.generateTacticalNotes(terrain, monsters);

    return { monsters, objectives, tacticalNotes };
  }

  /**
   * Get difficulty configuration for a level
   */
  private getDifficultyConfig(level: number): EncounterDifficulty {
    const baseXP = level * 100;

    return {
      level,
      maxPlayers: 6,
      minMonsters: Math.max(2, level),
      maxMonsters: Math.max(4, level * 2),
      xpBudget: baseXP * 4, // 4 players default
      roleDistribution: {
        minions: Math.floor(baseXP / 25), // Minions cost 1/4 of a standard
        standards: Math.floor(baseXP / 100),
        elites: Math.floor(baseXP / 200),
        solos: level >= 3 ? 1 : 0
      }
    };
  }

  /**
   * Calculate XP budget based on player count
   */
  private calculateXPBudget(playerCount: number): number {
    const baseBudget = this.difficulty.xpBudget;
    const playerMultiplier = playerCount / 4; // Normalized to 4 players
    return Math.floor(baseBudget * playerMultiplier);
  }

  /**
   * Generate balanced monster composition
   */
  private generateMonsterComposition(xpBudget: number): Record<string, number> {
    const composition: Record<string, number> = {
      minions: 0,
      standards: 0,
      elites: 0,
      solos: 0
    };

    let remainingXP = xpBudget;

    // Try to place elites first (most interesting tactically)
    while (remainingXP >= 200 && composition.elites < this.difficulty.roleDistribution.elites) {
      composition.elites++;
      remainingXP -= 200;
    }

    // Place standards
    while (remainingXP >= 100 && composition.standards < this.difficulty.roleDistribution.standards) {
      composition.standards++;
      remainingXP -= 100;
    }

    // Fill with minions
    while (remainingXP >= 25 && composition.minions < this.difficulty.roleDistribution.minions) {
      composition.minions++;
      remainingXP -= 25;
    }

    // Add a solo if appropriate
    if (remainingXP >= 500 && this.difficulty.roleDistribution.solos > 0) {
      composition.solos++;
      remainingXP -= 500;
    }

    return composition;
  }

  /**
   * Find tactically interesting positions for monsters
   */
  private findTacticalPositions(terrain: string[][], composition: Record<string, number>): TacticalPosition[] {
    const positions: TacticalPosition[] = [];
    const totalMonsters = Object.values(composition).reduce((sum, count) => sum + count, 0);

    // Find all suitable positions
    const allPositions = this.analyzeAllPositions(terrain);

    // Sort by tactical value (descending)
    allPositions.sort((a, b) => b.tacticalValue - a.tacticalValue);

    // Select best positions
    for (let i = 0; i < Math.min(totalMonsters, allPositions.length); i++) {
      positions.push(allPositions[i]);
    }

    return positions;
  }

  /**
   * Analyze all positions for tactical value
   */
  private analyzeAllPositions(terrain: string[][]): TacticalPosition[] {
    const positions: TacticalPosition[] = [];

    for (let y = 0; y < terrain.length; y++) {
      for (let x = 0; x < terrain[0].length; x++) {
        if (this.isSuitableForMonster(terrain, x, y)) {
          const tacticalValue = this.calculateTacticalValue(terrain, x, y);
          positions.push({
            position: { x, y },
            tacticalValue,
            terrainType: terrain[y][x],
            cover: this.calculateCover(terrain, x, y),
            flanking: this.calculateFlanking(terrain, x, y),
            mobility: this.calculateMobility(terrain, x, y)
          });
        }
      }
    }

    return positions;
  }

  /**
   * Check if position is suitable for monster placement
   */
  private isSuitableForMonster(terrain: string[][], x: number, y: number): boolean {
    const terrainType = terrain[y][x];

    // Must be traversable
    if (TerrainUtils.blocksMovement(terrainType)) {
      return false;
    }

    // Avoid obvious trap locations and environmental hazards
    if (['pit', 'lava', 'water'].includes(terrainType)) {
      return false;
    }

    // Check surroundings for tactical viability
    return this.hasTacticalViability(terrain, x, y);
  }

  /**
   * Check if position has tactical viability
   */
  private hasTacticalViability(terrain: string[][], x: number, y: number): boolean {
    let viableNeighbors = 0;

    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;

        const nx = x + dx;
        const ny = y + dy;

        if (nx >= 0 && nx < terrain[0].length && ny >= 0 && ny < terrain.length) {
          const neighborTerrain = terrain[ny][nx];

          if (!TerrainUtils.blocksMovement(neighborTerrain)) {
            viableNeighbors++;
          }
        }
      }
    }

    // Need at least 2 viable neighbors for movement
    return viableNeighbors >= 2;
  }

  /**
   * Calculate tactical value of a position
   */
  private calculateTacticalValue(terrain: string[][], x: number, y: number): number {
    let value = 0;

    // Base value from terrain
    value += this.getTerrainTacticalValue(terrain[y][x]);

    // Cover bonus
    value += this.calculateCover(terrain, x, y) * 10;

    // Flanking opportunities
    value += this.calculateFlanking(terrain, x, y) * 5;

    // Mobility bonus
    value += this.calculateMobility(terrain, x, y) * 3;

    // Elevation bonus (if implemented)
    value += (this.getElevation(terrain, x, y) || 0) * 2;

    return value;
  }

  /**
   * Get tactical value of terrain type
   */
  private getTerrainTacticalValue(terrainType: string): number {
    switch (terrainType) {
      case 'difficult':
        return 8; // Good for ambushes
      case 'ruins':
        return 10; // Excellent cover
      case 'mushrooms':
        return 7; // Concealment
      case 'crystal':
        return 5; // Special positioning
      case 'altar':
        return 12; // Objective control
      case 'empty':
        return 3; // Basic positioning
      default:
        return 1;
    }
  }

  /**
   * Calculate cover value at position
   */
  private calculateCover(terrain: string[][], x: number, y: number): number {
    let cover = 0;

    // Check adjacent terrain for cover
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;

        const nx = x + dx;
        const ny = y + dy;

        if (nx >= 0 && nx < terrain[0].length && ny >= 0 && ny < terrain.length) {
          const neighborTerrain = terrain[ny][nx];

          if (TerrainUtils.blocksLineOfSight(neighborTerrain)) {
            cover += 1;
          } else if (['ruins', 'mushrooms', 'difficult'].includes(neighborTerrain)) {
            cover += 0.5;
          }
        }
      }
    }

    return cover;
  }

  /**
   * Calculate flanking opportunities
   */
  private calculateFlanking(terrain: string[][], x: number, y: number): number {
    let flanking = 0;

    // Look for open approaches
    const directions = [
      [-1, 0], [1, 0], [0, -1], [0, 1], // Cardinal
      [-1, -1], [-1, 1], [1, -1], [1, 1]  // Diagonal
    ];

    directions.forEach(([dx, dy]) => {
      const nx = x + dx;
      const ny = y + dy;

      if (nx >= 0 && nx < terrain[0].length && ny >= 0 && ny < terrain.length) {
        const neighborTerrain = terrain[ny][nx];

        if (!TerrainUtils.blocksMovement(neighborTerrain)) {
          // Check if there's a clear path around
          const approachCount = this.countApproachableDirections(terrain, nx, ny);
          if (approachCount >= 3) {
            flanking += 1;
          }
        }
      }
    });

    return flanking;
  }

  /**
   * Count approachable directions from a position
   */
  private countApproachableDirections(terrain: string[][], x: number, y: number): number {
    let count = 0;

    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    directions.forEach(([dx, dy]) => {
      const nx = x + dx;
      const ny = y + dy;

      if (nx >= 0 && nx < terrain[0].length && ny >= 0 && ny < terrain.length) {
        const neighborTerrain = terrain[ny][nx];

        if (!TerrainUtils.blocksMovement(neighborTerrain)) {
          count++;
        }
      }
    });

    return count;
  }

  /**
   * Calculate mobility score
   */
  private calculateMobility(terrain: string[][], x: number, y: number): number {
    let mobility = 0;

    // Check movement options
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    directions.forEach(([dx, dy]) => {
      const nx = x + dx;
      const ny = y + dy;

      if (nx >= 0 && nx < terrain[0].length && ny >= 0 && ny < terrain.length) {
        const neighborTerrain = terrain[ny][nx];
        const movementCost = TerrainUtils.getMovementCost(neighborTerrain);

        if (!TerrainUtils.blocksMovement(neighborTerrain)) {
          // Lower cost = better mobility
          mobility += Math.max(0, 3 - movementCost);
        }
      }
    });

    return mobility;
  }

  /**
   * Get elevation (placeholder for future elevation system)
   */
  private getElevation(terrain: string[][], x: number, y: number): number | undefined {
    // Placeholder - could be implemented with additional terrain properties
    return undefined;
  }

  /**
   * Create monster with appropriate stats for role
   */
  private createMonster(role: string, position: TacticalPosition, index: number): MonsterStats {
    const baseStats = this.getBaseStatsForRole(role);
    const theme = this.storyteller['theme']; // Access private field

    return {
      ...baseStats,
      id: `${role}-${index}`,
      position: position.position,
      ai: {
        behavior: this.getAIBehaviorForRole(role),
        preferredRange: this.getPreferredRangeForRole(role),
        tactical: this.getTacticalPreferences(position)
      },
      tags: this.getTagsForTheme(theme)
    };
  }

  /**
   * Get base stats for monster role
   */
  private getBaseStatsForRole(role: string): Omit<MonsterStats, 'id' | 'position' | 'ai' | 'tags'> {
    const level = this.difficulty.level;

    switch (role) {
      case 'minions':
        return {
          name: 'Minion',
          level,
          role: 'minion',
          team: 'B',
          armorClass: 12 + level,
          hitPoints: 1,
          abilities: {
            strength: 10 + level,
            dexterity: 10 + level,
            constitution: 10 + level,
            intelligence: 8,
            wisdom: 8,
            charisma: 8
          },
          defenses: {
            reflex: 10 + level,
            will: 10 + level,
            fortitude: 10 + level
          },
          initiative: level,
          speed: 6
        };

      case 'standards':
        return {
          name: 'Standard Monster',
          level,
          role: 'standard',
          team: 'B',
          armorClass: 14 + level,
          hitPoints: 30 + (level * 10),
          abilities: {
            strength: 14 + level,
            dexterity: 12 + level,
            constitution: 12 + level,
            intelligence: 10,
            wisdom: 10,
            charisma: 10
          },
          defenses: {
            reflex: 12 + level,
            will: 12 + level,
            fortitude: 14 + level
          },
          initiative: 2 + level,
          speed: 6
        };

      case 'elites':
        return {
          name: 'Elite Monster',
          level,
          role: 'elite',
          team: 'B',
          armorClass: 16 + level,
          hitPoints: 60 + (level * 20),
          abilities: {
            strength: 16 + level,
            dexterity: 14 + level,
            constitution: 14 + level,
            intelligence: 12,
            wisdom: 12,
            charisma: 12
          },
          defenses: {
            reflex: 14 + level,
            will: 14 + level,
            fortitude: 16 + level
          },
          initiative: 3 + level,
          speed: 6
        };

      case 'solos':
        return {
          name: 'Solo Boss',
          level,
          role: 'solo',
          team: 'B',
          armorClass: 18 + level,
          hitPoints: 150 + (level * 50),
          abilities: {
            strength: 18 + level,
            dexterity: 16 + level,
            constitution: 16 + level,
            intelligence: 14,
            wisdom: 14,
            charisma: 14
          },
          defenses: {
            reflex: 16 + level,
            will: 16 + level,
            fortitude: 18 + level
          },
          initiative: 4 + level,
          speed: 7
        };

      default:
        return this.getBaseStatsForRole('standards');
    }
  }

  /**
   * Get AI behavior for role
   */
  private getAIBehaviorForRole(role: string): 'aggressive' | 'defensive' | 'ambush' | 'patrol' | 'guard' {
    switch (role) {
      case 'minions':
        return 'aggressive';
      case 'standards':
        return 'aggressive';
      case 'elites':
        return 'defensive';
      case 'solos':
        return 'defensive';
      default:
        return 'aggressive';
    }
  }

  /**
   * Get preferred range for role
   */
  private getPreferredRangeForRole(role: string): 'melee' | 'ranged' | 'mixed' | undefined {
    switch (role) {
      case 'minions':
        return 'melee';
      case 'standards':
        return Math.random() < 0.5 ? 'melee' : 'ranged';
      case 'elites':
        return 'mixed';
      case 'solos':
        return 'mixed';
      default:
        return undefined;
    }
  }

  /**
   * Get tactical preferences based on position
   */
  private getTacticalPreferences(position: TacticalPosition): string[] {
    const preferences: string[] = [];

    if (position.cover > 2) {
      preferences.push('use_cover');
    }

    if (position.flanking > 3) {
      preferences.push('flank');
    }

    if (position.mobility > 4) {
      preferences.push('mobile');
    }

    return preferences;
  }

  /**
   * Get theme-appropriate tags
   */
  private getTagsForTheme(theme: string): string[] {
    const baseTags = ['monster'];

    switch (theme) {
      case 'dungeon':
        return [...baseTags, 'undead', 'cave_dweller'];
      case 'wilderness':
        return [...baseTags, 'beast', 'wild'];
      case 'underground':
        return [...baseTags, 'elemental', 'crystal'];
      case 'urban':
        return [...baseTags, 'humanoid', 'civilized'];
      case 'mystical':
        return [...baseTags, 'magical', 'summoned'];
      default:
        return baseTags;
    }
  }

  /**
   * Generate encounter objectives
   */
  private generateObjectives(terrain: string[][], monsters: MonsterStats[]): string[] {
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
   * Generate tactical notes for players
   */
  private generateTacticalNotes(terrain: string[][], monsters: MonsterStats[]): string[] {
    const notes: string[] = [];

    // Analyze monster positioning
    const meleeMonsters = monsters.filter(m => m.ai.preferredRange === 'melee').length;
    const rangedMonsters = monsters.filter(m => m.ai.preferredRange === 'ranged').length;

    if (rangedMonsters > meleeMonsters) {
      notes.push('Multiple ranged attackers - close distance quickly');
    }

    if (meleeMonsters > rangedMonsters) {
      notes.push('Melee-focused enemies - use ranged attacks and area effects');
    }

    // Terrain analysis
    const hasDifficultTerrain = terrain.some(row => row.some(cell => cell === 'difficult'));
    if (hasDifficultTerrain) {
      notes.push('Difficult terrain will slow movement - plan positioning carefully');
    }

    const hasHazards = terrain.some(row => row.some(cell => ['pit', 'lava'].includes(cell)));
    if (hasHazards) {
      notes.push('Environmental hazards present - avoid dangerous terrain');
    }

    // Monster behavior analysis
    const aggressiveMonsters = monsters.filter(m => m.ai.behavior === 'aggressive').length;
    if (aggressiveMonsters > monsters.length / 2) {
      notes.push('Enemies are aggressive - they will charge into combat');
    }

    const defensiveMonsters = monsters.filter(m => m.ai.behavior === 'defensive').length;
    if (defensiveMonsters > 0) {
      notes.push('Some enemies are defensive - they may try to hold positions');
    }

    return notes;
  }
}
