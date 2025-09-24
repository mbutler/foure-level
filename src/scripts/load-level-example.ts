#!/usr/bin/env bun
/**
 * Level Loading Example for FOURE VTT Game Engine
 *
 * Shows how to load and use the generated JSON level files
 * in your game engine.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Level data interface for game engine
 */
interface GameLevel {
  id: string;
  name: string;
  description: string;
  recommendedLevel: number;
  estimatedDuration: number;
  difficulty: string;
  theme: string;
  map: {
    dimensions: { width: number; height: number };
    terrain: string[][];
    terrainConfigs: Record<string, any>;
  };
  startingActors: any[];
  playerSpawnPoints: Array<{ x: number; y: number }>;
  environmentalEffects: any[];
  objectives: string[];
  settings: any;
}

/**
 * Load a level from JSON file
 */
function loadLevel(filepath: string): GameLevel {
  console.log(`🎮 Loading level: ${filepath}`);

  try {
    const jsonContent = readFileSync(filepath, 'utf8');
    const levelData = JSON.parse(jsonContent) as GameLevel;

    console.log(`✅ Loaded: ${levelData.name}`);
    console.log(`📊 Size: ${levelData.map.dimensions.width}x${levelData.map.dimensions.height}`);
    console.log(`👥 Monsters: ${levelData.startingActors.length}`);
    console.log(`🎯 Objectives: ${levelData.objectives.length}`);
    console.log(`🎨 Theme: ${levelData.theme} (${levelData.difficulty})`);

    return levelData;
  } catch (error) {
    console.error(`❌ Error loading level:`, error);
    throw error;
  }
}

/**
 * Initialize game engine with level data
 */
function initializeGameEngine(level: GameLevel): void {
  console.log('\n🔧 Initializing Game Engine...');

  // Step 1: Create the map
  console.log('📍 Creating map grid...');
  const mapGrid = level.map.terrain;
  console.log(`  ✓ Map size: ${mapGrid.length} rows x ${mapGrid[0]?.length || 0} columns`);

  // Step 2: Load terrain configurations
  console.log('🏗️  Loading terrain configurations...');
  const terrainConfigs = level.map.terrainConfigs;
  const terrainTypes = Object.keys(terrainConfigs);
  console.log(`  ✓ Loaded ${terrainTypes.length} terrain types: ${terrainTypes.join(', ')}`);

  // Step 3: Check monsters
  console.log('⚔️  Checking monsters...');
  const monsters = level.startingActors;
  console.log(`  ✓ Monsters array ready (currently ${monsters.length} monsters - add manually)`);

  // Step 4: Set up spawn points
  console.log('🎯 Setting up spawn points...');
  const spawnPoints = level.playerSpawnPoints;
  console.log(`  ✓ Created ${spawnPoints.length} spawn points`);

  // Step 5: Apply environmental effects
  console.log('🌍 Applying environmental effects...');
  const effects = level.environmentalEffects;
  console.log(`  ✓ Applied ${effects.length} environmental effects`);

  console.log('\n🎉 Game Engine Ready!');
  console.log(`🎮 Level "${level.name}" loaded successfully!`);
}

/**
 * Display level preview information
 */
function displayLevelPreview(level: GameLevel): void {
  console.log('\n📋 Level Preview:');
  console.log('='.repeat(50));
  console.log(`🏷️  ID: ${level.id}`);
  console.log(`📝 Name: ${level.name}`);
  console.log(`📖 Description: ${level.description}`);
  console.log(`🎯 Difficulty: ${level.difficulty}`);
  console.log(`🎨 Theme: ${level.theme}`);
  console.log(`⭐ Recommended Level: ${level.recommendedLevel}`);
  console.log(`⏱️  Duration: ${level.estimatedDuration} minutes`);
  console.log(`🏷️  Tags: ${level.tags.join(', ')}`);
  console.log('='.repeat(50));
}

/**
 * Validate level structure for game engine compatibility
 */
function validateLevelStructure(level: GameLevel): boolean {
  console.log('\n🔍 Validating level structure...');

  const checks = [
    { name: 'Map dimensions', check: () => level.map.dimensions.width > 0 && level.map.dimensions.height > 0 },
    { name: 'Terrain array', check: () => level.map.terrain && level.map.terrain.length > 0 },
    { name: 'Terrain configs', check: () => level.map.terrainConfigs && Object.keys(level.map.terrainConfigs).length > 0 },
    { name: 'Monsters', check: () => level.startingActors && level.startingActors.length >= 0 },
    { name: 'Spawn points', check: () => level.playerSpawnPoints && level.playerSpawnPoints.length > 0 },
    { name: 'Objectives', check: () => level.objectives && level.objectives.length > 0 },
  ];

  let allValid = true;

  checks.forEach(({ name, check }) => {
    const valid = check();
    console.log(`  ${valid ? '✅' : '❌'} ${name}`);
    if (!valid) allValid = false;
  });

  return allValid;
}

// Main execution
if (import.meta.main) {
  const args = process.argv.slice(2);
  const levelFile = args[0] || 'generated-levels/bandit-hideout-12345.json';

  try {
    // Load the level
    const level = loadLevel(join(process.cwd(), levelFile));

    // Display preview
    displayLevelPreview(level);

    // Validate structure
    const isValid = validateLevelStructure(level);

    if (isValid) {
      // Initialize game engine
      initializeGameEngine(level);

      console.log('\n🎯 Ready to play!');
      console.log('💡 Tip: Use the level data to render the map, place monsters, and set up gameplay.');
    } else {
      console.log('\n⚠️  Level has structural issues. Please check the JSON file.');
    }

  } catch (error) {
    console.error('❌ Failed to load level:', error);
    process.exit(1);
  }
}

export { loadLevel, initializeGameEngine, displayLevelPreview, validateLevelStructure };
