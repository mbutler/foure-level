#!/usr/bin/env bun
/**
 * Level Generator Demo
 *
 * Demonstrates how to use the FOURE VTT Level Generator to create
 * tactical combat maps with terrain, monsters, and environmental effects.
 */

import { LevelGenerator, LevelGeneratorUtils } from '../generators/level-generator.js';
import { MapCompression } from '../utils/map-compression.js';
import { MapRenderer } from '../utils/map-renderer.js';

/**
 * Display a generated map in the console with enhanced rendering
 */
function displayMap(terrain: string[][], theme: string = 'dungeon'): void {
  console.log(MapRenderer.renderThemed(terrain, theme));
  console.log(MapRenderer.displayStats(terrain));
}

/**
 * Display level summary
 */
function displayLevelSummary(level: any): void {
  console.log('\n' + '='.repeat(60));
  console.log(`LEVEL: ${level.name}`);
  console.log('='.repeat(60));
  console.log(`Description: ${level.description}`);
  console.log(`Theme: ${level.theme} | Difficulty: ${level.difficulty}`);
  console.log(`Recommended Level: ${level.recommendedLevel} | Duration: ${level.estimatedDuration}min`);
  console.log(`Seed: ${level.metadata.seed} | Algorithm: ${level.metadata.algorithm}`);
  console.log(`Generation Time: ${level.metadata.generationTime}ms`);
  console.log(`Compressed Size: ${level.metadata.compressedSize.toFixed(1)}%`);
  console.log('\nMonsters:');
  level.startingActors.forEach((monster: any) => {
    console.log(`  - ${monster.name} (${monster.role}) at (${monster.position.x}, ${monster.position.y})`);
  });
  console.log(`\nObjectives: ${level.objectives.length}`);
  level.objectives.forEach((obj: string, index: number) => {
    console.log(`  ${index + 1}. ${obj}`);
  });
  console.log('\nEnvironmental Effects:');
  level.environmentalEffects.forEach((effect: any) => {
    console.log(`  - ${effect.name}: ${effect.description}`);
  });
  console.log('='.repeat(60));
}

/**
 * Main demo function
 */
async function main() {
  console.log('🗺️  FOURE VTT Level Generator Demo');
  console.log('=================================\n');

  // Demo 1: Dungeon with BSP algorithm
  console.log('1️⃣  Generating Dungeon Level (BSP Algorithm)...');
  const dungeonLevel = LevelGeneratorUtils.generateDungeon(12345);
  displayLevelSummary(dungeonLevel);
  displayMap(dungeonLevel.map.terrain, dungeonLevel.theme);

  // Demo 2: Wilderness encounter
  console.log('\n2️⃣  Generating Wilderness Encounter (Mixed Algorithm)...');
  const wildernessLevel = LevelGeneratorUtils.generateWilderness(67890);
  displayLevelSummary(wildernessLevel);

  // Demo 3: Underground crystal cave
  console.log('\n3️⃣  Generating Underground Cave (Cellular Algorithm)...');
  const undergroundLevel = LevelGeneratorUtils.generateUnderground(11111);
  displayLevelSummary(undergroundLevel);

  // Demo 4: Custom mystical level
  console.log('\n4️⃣  Generating Custom Mystical Sanctum...');
  const mysticalGenerator = new LevelGenerator(99999, 'mystical', 'mixed');
  const mysticalLevel = mysticalGenerator.generateLevel(4, 3, 'Arcane Nexus');
  displayLevelSummary(mysticalLevel);

  // Demo 5: Compression demo
  console.log('\n5️⃣  Map Compression Demo...');
  const compressedData = mysticalGenerator.generateCompressed();
  console.log(`Original estimated size: 25x25 = 625 cells`);
  console.log(`Compressed size: ${compressedData.metadata.compressionRatio.toFixed(1)}% of original`);
  console.log(`Compressed data: ${MapCompression.toCompactString(compressedData).length} characters`);

  // Demo 6: Export as JSON
  console.log('\n6️⃣  Export Demo...');
  const jsonData = mysticalGenerator.generateJSON(4, 3);
  console.log(`JSON export size: ${jsonData.length} characters`);
  console.log('Sample JSON structure:');
  const parsed = JSON.parse(jsonData);
  console.log(`  - ID: ${parsed.id}`);
  console.log(`  - Name: ${parsed.name}`);
  console.log(`  - Monsters: ${parsed.startingActors.length}`);
  console.log(`  - Effects: ${parsed.environmentalEffects.length}`);

  console.log('\n✨ Demo completed! The level generator is ready for use.');
}

// Run the demo
main().catch(console.error);

