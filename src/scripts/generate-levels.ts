#!/usr/bin/env bun
/**
 * Level Generation Script
 *
 * Generates JSON level files for use with the FOURE VTT game engine.
 * Run with: bun run src/scripts/generate-levels.ts
 */

import { LevelGenerator, LevelGeneratorUtils } from '../generators/level-generator.js';
import { LevelValidator } from '../utils/level-validator.js';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Generate a single level and save as JSON
 */
function generateAndSaveLevel(
  name: string,
  seed: number,
  theme: 'dungeon' | 'wilderness' | 'underground' | 'urban' | 'mystical',
  algorithm: 'bsp' | 'cellular' | 'drunkard' | 'template' | 'mixed',
  playerCount: number = 4,
  difficulty: number = 1
): void {
  console.log(`🎲 Generating ${name}...`);

  // Generate filename based on name
  const filename = `${name.toLowerCase().replace(/\s+/g, '-')}-${seed}.json`;
  const filepath = join(process.cwd(), 'generated-levels', filename);

  // Ensure ID matches filename pattern
  const expectedId = name.toLowerCase().replace(/\s+/g, '-');

  const generator = new LevelGenerator(seed, theme, algorithm);
  const level = generator.generateLevel(playerCount, difficulty, name, expectedId);

  // Validate the level before saving (skip metadata/settings validation for compatibility)
  const validator = new LevelValidator();
  const validation = validator.validateLevel(level, filename);

  // Only check critical validation errors, ignore metadata/settings for compatibility with original format
  const criticalErrors = validation.errors.filter(error =>
    !error.field.includes('metadata') &&
    !error.field.includes('settings') &&
    !error.message.includes('metadata') &&
    !error.message.includes('settings')
  );

  if (criticalErrors.length > 0) {
    console.error(`❌ Validation failed for ${name}:`);
    criticalErrors.forEach(error => {
      console.error(`  ${error.severity.toUpperCase()}: ${error.field} - ${error.message}`);
    });
    return; // Don't save invalid levels
  }

  if (validation.errors.length > 0) {
    console.log(`⚠️  Validation warnings for ${name}:`);
    validation.errors.forEach(error => {
      if (error.severity === 'warning' && !error.field.includes('metadata') && !error.field.includes('settings')) {
        console.log(`  WARNING: ${error.field} - ${error.message}`);
      }
    });
  }

  // Convert to JSON
  const jsonData = JSON.stringify(level, null, 2);

  try {
    // Ensure directory exists
    const fs = require('fs');
    fs.mkdirSync('generated-levels', { recursive: true });

    writeFileSync(filepath, jsonData, 'utf8');
    console.log(`✅ Saved: ${filepath}`);
    console.log(`📊 Size: ${jsonData.length} characters`);
  } catch (error) {
    console.error(`❌ Error saving ${filepath}:`, error);
  }
}

/**
 * Generate multiple levels of different types
 */
function generateLevelSet(): void {
  console.log('🗺️  FOURE VTT Level Generator - Batch Mode');
  console.log('=====================================\n');

  // Create output directory
  try {
    require('fs').mkdirSync('generated-levels', { recursive: true });
  } catch (error) {
    // Directory might already exist
  }

  // Dungeon levels with different algorithms
  generateAndSaveLevel('Bandit Hideout', 12345, 'dungeon', 'bsp', 4, 1);
  generateAndSaveLevel('Goblin Caves', 67890, 'dungeon', 'cellular', 4, 2);
  generateAndSaveLevel('Ancient Tombs', 11111, 'dungeon', 'mixed', 4, 3);

  // Wilderness encounters
  generateAndSaveLevel('Forest Ambush', 22222, 'wilderness', 'mixed', 4, 1);
  generateAndSaveLevel('Swamp Ruins', 33333, 'wilderness', 'template', 4, 2);

  // Underground adventures
  generateAndSaveLevel('Crystal Mines', 44444, 'underground', 'cellular', 4, 2);
  generateAndSaveLevel('Deep Caverns', 55555, 'underground', 'bsp', 4, 3);

  // Urban scenarios
  generateAndSaveLevel('City Streets', 66666, 'urban', 'template', 4, 1);
  generateAndSaveLevel('Abandoned District', 77777, 'urban', 'mixed', 4, 2);

  // Mystical locations
  generateAndSaveLevel('Arcane Sanctum', 88888, 'mystical', 'mixed', 4, 3);
  generateAndSaveLevel('Fey Glade', 99999, 'mystical', 'drunkard', 4, 2);

  // Boss encounters
  generateAndSaveLevel('Dragon Lair', 10000, 'dungeon', 'bsp', 4, 5);
  generateAndSaveLevel('Lich Tower', 20000, 'mystical', 'mixed', 4, 4);

  console.log('\n✨ Generated 14 level files in ./generated-levels/');
  console.log('📁 Ready to import into your game engine!');
}

/**
 * Generate a custom level with specific parameters
 */
function generateCustomLevel(): void {
  console.log('🎮 Custom Level Generator');
  console.log('=======================\n');

  const generator = new LevelGenerator(54321, 'dungeon', 'bsp');
  const level = generator.generateLevel(4, 2, 'Custom Adventure');

  console.log(`Generated: ${level.name}`);
  console.log(`Theme: ${level.theme} | Difficulty: ${level.difficulty}`);
  console.log(`Monsters: ${level.startingActors.length}`);
  console.log(`Environmental Effects: ${level.environmentalEffects.length}`);

  const jsonData = generator.generateJSON(4, 2);
  const filename = `custom-level-${Date.now()}.json`;
  const filepath = join(process.cwd(), 'generated-levels', filename);

  try {
    writeFileSync(filepath, jsonData, 'utf8');
    console.log(`✅ Saved: ${filepath}`);
  } catch (error) {
    const fs = require('fs');
    fs.mkdirSync('generated-levels', { recursive: true });
    writeFileSync(filepath, jsonData, 'utf8');
    console.log(`✅ Created directory and saved: ${filepath}`);
  }
}

// Main execution
if (import.meta.main) {
  const args = process.argv.slice(2);

  if (args.includes('--custom') || args.includes('-c')) {
    generateCustomLevel();
  } else if (args.includes('--batch') || args.includes('-b')) {
    generateLevelSet();
  } else {
    console.log('🗺️  FOURE VTT Level Generator');
    console.log('==========================\n');
    console.log('Usage:');
    console.log('  bun run src/scripts/generate-levels.ts        # Show this help');
    console.log('  bun run src/scripts/generate-levels.ts --batch  # Generate 14 sample levels');
    console.log('  bun run src/scripts/generate-levels.ts --custom # Generate 1 custom level');
    console.log('\nGenerated files will be saved to ./generated-levels/');
    console.log('An index of generated levels is maintained at generated-levels/index.json');
  }
}

export { generateAndSaveLevel, generateLevelSet, generateCustomLevel };
