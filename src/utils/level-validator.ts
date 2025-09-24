/**
 * Level Structure Validator for FOURE VTT Level Generator
 *
 * Comprehensive validation system that ensures JSON files meet all requirements
 * before being written to disk, with detailed error reporting.
 */

import { TERRAIN_TYPES } from '../types/terrain.js';
import { LevelObjective } from '../types/level-schema.js';

/**
 * Validation error interface
 */
export interface ValidationError {
  readonly field: string;
  readonly message: string;
  readonly value?: any;
  readonly expected?: string;
  readonly severity: 'error' | 'warning';
}

/**
 * Complete level validation schema
 */
export interface LevelValidationSchema {
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
    readonly terrainConfigs: Record<string, any>;
  };
  readonly startingActors: any[];
  readonly playerSpawnPoints: Array<{ x: number; y: number }>;
  readonly environmentalEffects: any[];
  readonly objectives: LevelObjective[];
  readonly tags: string[];
  readonly difficulty: string;
  readonly theme: string;
  readonly settings?: {
    readonly allowRespawn: boolean;
    readonly timeLimit: number;
    readonly maxPlayers: number;
  };
  readonly metadata?: {
    readonly seed: number;
    readonly algorithm: string;
    readonly compressedSize: number;
    readonly generationTime: number;
  };
}

/**
 * Level Structure Validator Class
 */
export class LevelValidator {
  private errors: ValidationError[] = [];
  private warnings: ValidationError[] = [];

  /**
   * Validate a complete level structure
   */
  validateLevel(levelData: any, filename: string): { isValid: boolean; errors: ValidationError[] } {
    this.errors = [];
    this.warnings = [];

    // Validate filename ↔ ID consistency
    this.validateIdConsistency(levelData, filename);

    // Validate top-level structure
    this.validateTopLevelFields(levelData);

    // Validate map structure
    this.validateMapStructure(levelData.map);

    // Validate terrain configurations
    this.validateTerrainConfigs(levelData.map?.terrainConfigs);

    // Validate arrays and collections
    this.validateArrays(levelData);

    // Validate nested objects
    this.validateNestedObjects(levelData);

    // Validate data types
    this.validateDataTypes(levelData);

    // Validate logical consistency
    this.validateLogicalConsistency(levelData);

    const allIssues = [...this.errors, ...this.warnings];
    return {
      isValid: this.errors.length === 0,
      errors: allIssues
    };
  }

  /**
   * Validate filename ↔ ID consistency
   */
  private validateIdConsistency(levelData: any, filename: string): void {
    if (!levelData.id) {
      this.addError('id', 'Level ID is required');
      return;
    }

    // Extract expected ID from filename (e.g., "bandit-hideout-12345.json" -> "bandit-hideout")
    const baseName = filename.replace(/\.json$/, '').replace(/-\d+$/, '');
    const expectedId = baseName;

    if (!levelData.id.includes(expectedId) && expectedId !== levelData.id) {
      this.addWarning('id', `ID '${levelData.id}' should match filename pattern '${expectedId}'`);
    }

    // Validate ID format
    if (!/^[a-z0-9-]+$/.test(levelData.id)) {
      this.addError('id', `ID '${levelData.id}' contains invalid characters. Use only lowercase letters, numbers, and hyphens.`);
    }
  }

  /**
   * Validate top-level required fields
   */
  private validateTopLevelFields(levelData: any): void {
    const requiredFields: Array<{ field: keyof LevelValidationSchema; type: string; description: string }> = [
      { field: 'id', type: 'string', description: 'Unique level identifier' },
      { field: 'name', type: 'string', description: 'Display name' },
      { field: 'description', type: 'string', description: 'Level description' },
      { field: 'version', type: 'string', description: 'Version number' },
      { field: 'author', type: 'string', description: 'Creator name' },
      { field: 'recommendedLevel', type: 'number', description: 'Recommended player level' },
      { field: 'estimatedDuration', type: 'number', description: 'Expected play time in minutes' },
      { field: 'difficulty', type: 'string', description: 'Difficulty level (easy/medium/hard/epic)' },
      { field: 'theme', type: 'string', description: 'Theme type' },
      { field: 'tags', type: 'array', description: 'Category tags' },
      { field: 'startingActors', type: 'array', description: 'Monster array (can be empty)' },
      { field: 'playerSpawnPoints', type: 'array', description: 'Player starting positions' },
      { field: 'environmentalEffects', type: 'array', description: 'Environmental effects' },
      { field: 'objectives', type: 'array', description: 'Victory objectives' },
      { field: 'map', type: 'object', description: 'Map data' }
    ];

    // Optional fields for compatibility
    const optionalFields = ['settings', 'metadata'];

    for (const { field, type, description } of requiredFields) {
      // Skip optional fields that are missing
      if (optionalFields.includes(field) && !(field in levelData)) {
        continue;
      }

      if (!(field in levelData)) {
        this.addError(field, `Missing required field: ${field} (${description})`);
        continue;
      }

      if (levelData[field] === null || levelData[field] === undefined) {
        this.addError(field, `Field '${field}' cannot be null or undefined`);
        continue;
      }

      // Type validation (skip for optional fields that are missing)
      if (type === 'array' && !Array.isArray(levelData[field])) {
        this.addError(field, `Field '${field}' must be an array, got ${typeof levelData[field]}`);
      } else if (type === 'string' && typeof levelData[field] !== 'string') {
        this.addError(field, `Field '${field}' must be a string, got ${typeof levelData[field]}`);
      } else if (type === 'number' && typeof levelData[field] !== 'number') {
        this.addError(field, `Field '${field}' must be a number, got ${typeof levelData[field]}`);
      } else if (type === 'object' && (typeof levelData[field] !== 'object' || Array.isArray(levelData[field]))) {
        // Skip validation for optional fields that are missing
        if (!optionalFields.includes(field)) {
          this.addError(field, `Field '${field}' must be an object, got ${typeof levelData[field]}`);
        }
      }
    }
  }

  /**
   * Validate map structure
   */
  private validateMapStructure(mapData: any): void {
    if (!mapData) {
      this.addError('map', 'Map data is required');
      return;
    }

    // Validate dimensions
    if (!mapData.dimensions) {
      this.addError('map.dimensions', 'Map dimensions are required');
      return;
    }

    if (typeof mapData.dimensions.width !== 'number' || typeof mapData.dimensions.height !== 'number') {
      this.addError('map.dimensions', 'Map dimensions must be numbers');
    }

    if (mapData.dimensions.width <= 0 || mapData.dimensions.height <= 0) {
      this.addError('map.dimensions', 'Map dimensions must be positive numbers');
    }

    // Validate terrain array
    if (!Array.isArray(mapData.terrain)) {
      this.addError('map.terrain', 'Terrain must be an array');
      return;
    }

    if (mapData.terrain.length !== mapData.dimensions.height) {
      this.addError('map.terrain', `Terrain height (${mapData.terrain.length}) doesn't match dimensions (${mapData.dimensions.height})`);
    }

    for (let y = 0; y < mapData.terrain.length; y++) {
      const row = mapData.terrain[y];
      if (!Array.isArray(row)) {
        this.addError('map.terrain', `Terrain row ${y} must be an array`);
        continue;
      }

      if (row.length !== mapData.dimensions.width) {
        this.addError('map.terrain', `Terrain row ${y} width (${row.length}) doesn't match dimensions (${mapData.dimensions.width})`);
      }

      // Validate each cell
      for (let x = 0; x < row.length; x++) {
        const cell = row[x];
        if (typeof cell !== 'string') {
          this.addError('map.terrain', `Terrain cell [${y},${x}] must be a string, got ${typeof cell}`);
        } else if (cell.length === 0) {
          this.addError('map.terrain', `Terrain cell [${y},${x}] cannot be empty string`);
        }
      }
    }
  }

  /**
   * Validate terrain configurations
   */
  private validateTerrainConfigs(terrainConfigs: any): void {
    if (!terrainConfigs || typeof terrainConfigs !== 'object') {
      this.addError('map.terrainConfigs', 'Terrain configurations must be an object');
      return;
    }

    const usedTerrainTypes = new Set<string>();

    // Find all terrain types used in the map (we'll need the terrain data for this)
    // This will be called after map validation, so terrain data should be valid

    for (const [terrainType, config] of Object.entries(terrainConfigs)) {
      if (typeof config !== 'object' || Array.isArray(config)) {
        this.addError('map.terrainConfigs', `Terrain config for '${terrainType}' must be an object`);
        continue;
      }

      // Validate required terrain config fields
      const requiredFields = ['id', 'name', 'blocksMovement', 'blocksLineOfSight', 'movementCost', 'displayGlyph', 'description'];
      for (const field of requiredFields) {
        if (!(field in config)) {
          this.addError('map.terrainConfigs', `Terrain config '${terrainType}' missing required field: ${field}`);
        }
      }

      // Validate field types
      if (typeof config.id !== 'string') {
        this.addError('map.terrainConfigs', `Terrain config '${terrainType}.id' must be a string`);
      }

      if (typeof config.name !== 'string') {
        this.addError('map.terrainConfigs', `Terrain config '${terrainType}.name' must be a string`);
      }

      if (typeof config.blocksMovement !== 'boolean') {
        this.addError('map.terrainConfigs', `Terrain config '${terrainType}.blocksMovement' must be a boolean`);
      }

      if (typeof config.blocksLineOfSight !== 'boolean') {
        this.addError('map.terrainConfigs', `Terrain config '${terrainType}.blocksLineOfSight' must be a boolean`);
      }

      if (typeof config.movementCost !== 'number') {
        this.addError('map.terrainConfigs', `Terrain config '${terrainType}.movementCost' must be a number`);
      }

      if (typeof config.displayGlyph !== 'string') {
        this.addError('map.terrainConfigs', `Terrain config '${terrainType}.displayGlyph' must be a string`);
      }

      if (typeof config.description !== 'string') {
        this.addError('map.terrainConfigs', `Terrain config '${terrainType}.description' must be a string`);
      }

      // Validate movement cost is non-negative
      if (config.movementCost < 0) {
        this.addError('map.terrainConfigs', `Terrain config '${terrainType}.movementCost' cannot be negative`);
      }
    }
  }

  /**
   * Validate arrays and collections
   */
  private validateArrays(levelData: any): void {
    // Validate startingActors
    if (!Array.isArray(levelData.startingActors)) {
      this.addError('startingActors', 'startingActors must be an array');
    }

    // Validate playerSpawnPoints
    if (!Array.isArray(levelData.playerSpawnPoints)) {
      this.addError('playerSpawnPoints', 'playerSpawnPoints must be an array');
    } else {
      for (let i = 0; i < levelData.playerSpawnPoints.length; i++) {
        const spawn = levelData.playerSpawnPoints[i];
        if (!spawn || typeof spawn !== 'object') {
          this.addError('playerSpawnPoints', `Spawn point ${i} must be an object`);
          continue;
        }

        if (typeof spawn.x !== 'number' || typeof spawn.y !== 'number') {
          this.addError('playerSpawnPoints', `Spawn point ${i} must have numeric x and y coordinates`);
        }

        if (spawn.x < 0 || spawn.y < 0) {
          this.addError('playerSpawnPoints', `Spawn point ${i} coordinates cannot be negative`);
        }
      }
    }

    // Validate objectives
    if (!Array.isArray(levelData.objectives)) {
      this.addError('objectives', 'objectives must be an array');
    } else {
      for (let i = 0; i < levelData.objectives.length; i++) {
        const objective = levelData.objectives[i];
        if (!objective || typeof objective !== 'object' || Array.isArray(objective)) {
          this.addError('objectives', `Objective ${i} must be an object`);
          continue;
        }

        const requiredFields: Array<keyof LevelObjective> = ['id', 'type', 'description'];
        requiredFields.forEach(field => {
          if (!(field in objective)) {
            this.addError('objectives', `Objective ${i} missing required field '${field}'`);
          }
        });

        if (objective.id && typeof objective.id !== 'string') {
          this.addError('objectives', `Objective ${i} field 'id' must be a string`);
        }

        if (objective.type && typeof objective.type !== 'string') {
          this.addError('objectives', `Objective ${i} field 'type' must be a string`);
        }

        if (objective.description && typeof objective.description !== 'string') {
          this.addError('objectives', `Objective ${i} field 'description' must be a string`);
        }

        if (objective.target && typeof objective.target !== 'string') {
          this.addError('objectives', `Objective ${i} field 'target' must be a string`);
        }

        if (objective.optional !== undefined && typeof objective.optional !== 'boolean') {
          this.addError('objectives', `Objective ${i} field 'optional' must be a boolean`);
        }
      }
    }

    // Validate tags
    if (!Array.isArray(levelData.tags)) {
      this.addError('tags', 'tags must be an array');
    } else {
      for (let i = 0; i < levelData.tags.length; i++) {
        if (typeof levelData.tags[i] !== 'string') {
          this.addError('tags', `Tag ${i} must be a string`);
        }
      }
    }
  }

  /**
   * Validate nested objects
   */
  private validateNestedObjects(levelData: any): void {
    // Settings and metadata validation moved to validateDataTypes for optional field handling

    // Validate metadata only if it exists (skip for compatibility)
    if (levelData.metadata && (typeof levelData.metadata !== 'object' || Array.isArray(levelData.metadata))) {
      this.addError('metadata', 'metadata must be an object');
      return;
    }

    if (levelData.metadata) {
      const requiredMetadata = [
        { field: 'seed', type: 'number' },
        { field: 'algorithm', type: 'string' },
        { field: 'compressedSize', type: 'number' },
        { field: 'generationTime', type: 'number' }
      ];

      for (const { field, type } of requiredMetadata) {
        if (!(field in levelData.metadata)) {
          this.addError(`metadata.${field}`, `Missing required metadata: ${field}`);
          continue;
        }

        if (typeof levelData.metadata[field] !== type) {
          this.addError(`metadata.${field}`, `Metadata '${field}' must be a ${type}, got ${typeof levelData.metadata[field]}`);
        }
      }
    }
  }

  /**
   * Validate data types and ranges
   */
  private validateDataTypes(levelData: any): void {
    // Validate difficulty
    const validDifficulties = ['easy', 'medium', 'hard', 'epic'];
    if (!validDifficulties.includes(levelData.difficulty)) {
      this.addError('difficulty', `Difficulty must be one of: ${validDifficulties.join(', ')}, got '${levelData.difficulty}'`);
    }

    // Validate recommendedLevel range
    if (levelData.recommendedLevel < 1 || levelData.recommendedLevel > 30) {
      this.addError('recommendedLevel', `Recommended level must be between 1-30, got ${levelData.recommendedLevel}`);
    }

    // Validate estimatedDuration range
    if (levelData.estimatedDuration < 15 || levelData.estimatedDuration > 300) {
      this.addError('estimatedDuration', `Estimated duration must be between 15-300 minutes, got ${levelData.estimatedDuration}`);
    }

    // Validate version format
    if (!/^\d+\.\d+\.\d+$/.test(levelData.version)) {
      this.addError('version', `Version must be in format X.Y.Z, got '${levelData.version}'`);
    }

    // Validate metadata ranges (skip if metadata doesn't exist for compatibility)
    if (levelData.metadata) {
      if (levelData.metadata.seed < 0) {
        this.addError('metadata.seed', 'Seed cannot be negative');
      }

      if (levelData.metadata.compressedSize < 0 || levelData.metadata.compressedSize > 100) {
        this.addError('metadata.compressedSize', 'Compressed size percentage must be between 0-100');
      }

      if (levelData.metadata.generationTime < 0) {
        this.addError('metadata.generationTime', 'Generation time cannot be negative');
      }
    }

    // Validate settings ranges (skip if settings doesn't exist for compatibility)
    if (levelData.settings && (typeof levelData.settings !== 'object' || Array.isArray(levelData.settings))) {
      this.addError('settings', 'settings must be an object');
      return;
    }
  }

  /**
   * Validate logical consistency
   */
  private validateLogicalConsistency(levelData: any): void {
    // Check that terrain types used in map have configurations
    if (levelData.map?.terrain && levelData.map?.terrainConfigs) {
      const usedTerrainTypes = new Set<string>();

      for (const row of levelData.map.terrain) {
        for (const cell of row) {
          usedTerrainTypes.add(cell);
        }
      }

      for (const terrainType of usedTerrainTypes) {
        if (!(terrainType in levelData.map.terrainConfigs)) {
          this.addError('map.terrainConfigs', `Terrain type '${terrainType}' used in map but not defined in terrainConfigs`);
        }
      }
    }

    // Check that spawn points are within map bounds
    if (levelData.map?.dimensions && levelData.playerSpawnPoints) {
      const { width, height } = levelData.map.dimensions;

      for (let i = 0; i < levelData.playerSpawnPoints.length; i++) {
        const spawn = levelData.playerSpawnPoints[i];
        if (spawn.x < 0 || spawn.x >= width || spawn.y < 0 || spawn.y >= height) {
          this.addError('playerSpawnPoints', `Spawn point ${i} is outside map bounds (${width}x${height})`);
        }
      }
    }

    // Check that objectives are not empty
    if (levelData.objectives && levelData.objectives.length === 0) {
      this.addWarning('objectives', 'No objectives defined for this level');
    }

    // Check that we have at least one spawn point
    if (levelData.playerSpawnPoints && levelData.playerSpawnPoints.length === 0) {
      this.addError('playerSpawnPoints', 'At least one player spawn point is required');
    }
  }

  /**
   * Add an error to the validation results
   */
  private addError(field: string, message: string, value?: any): void {
    this.errors.push({
      field,
      message,
      value,
      severity: 'error'
    });
  }

  /**
   * Add a warning to the validation results
   */
  private addWarning(field: string, message: string, value?: any): void {
    this.warnings.push({
      field,
      message,
      value,
      severity: 'warning'
    });
  }

  /**
   * Get all validation errors
   */
  getErrors(): ValidationError[] {
    return [...this.errors];
  }

  /**
   * Get all validation warnings
   */
  getWarnings(): ValidationError[] {
    return [...this.warnings];
  }

  /**
   * Get formatted validation report
   */
  getValidationReport(): string {
    let report = '\n🔍 Level Validation Report\n';
    report += '='.repeat(50) + '\n';

    if (this.errors.length === 0 && this.warnings.length === 0) {
      report += '✅ All validations passed!\n';
    } else {
      if (this.errors.length > 0) {
        report += `❌ Errors (${this.errors.length}):\n`;
        this.errors.forEach((error, index) => {
          report += `  ${index + 1}. ${error.field}: ${error.message}\n`;
        });
      }

      if (this.warnings.length > 0) {
        report += `⚠️  Warnings (${this.warnings.length}):\n`;
        this.warnings.forEach((warning, index) => {
          report += `  ${index + 1}. ${warning.field}: ${warning.message}\n`;
        });
      }
    }

    report += '='.repeat(50) + '\n';
    return report;
  }
}
