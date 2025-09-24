#!/usr/bin/env bun
/**
 * Auto Index Generator
 *
 * Automatically generates an index file for all JSON level files in the generated-levels folder.
 * Run with: bun run src/scripts/auto-index-generator.ts
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { writeFileSync } from 'node:fs';
import { LevelValidator } from '../utils/level-validator.js';

/**
 * Level metadata interface
 */
interface LevelMetadata {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly recommendedLevel: number;
  readonly estimatedDuration: number;
  readonly difficulty: string;
  readonly theme: string;
  readonly tags: string[];
  readonly author: string;
  readonly version: string;
}

/**
 * Index structure
 */
interface LevelsIndex {
  readonly levels: LevelMetadata[];
  readonly generatedAt: string;
  readonly totalLevels: number;
  readonly metadata: {
    readonly generatorVersion: string;
    readonly formatVersion: string;
    readonly themes: string[];
    readonly difficulties: string[];
  };
}

/**
 * Extract metadata from a level JSON file
 */
function extractLevelMetadata(filepath: string): LevelMetadata | null {
  try {
    const jsonContent = readFileSync(filepath, 'utf8');
    const levelData = JSON.parse(jsonContent);

    return {
      id: levelData.id,
      name: levelData.name,
      description: levelData.description,
      recommendedLevel: levelData.recommendedLevel,
      estimatedDuration: levelData.estimatedDuration,
      difficulty: levelData.difficulty,
      theme: levelData.theme,
      tags: levelData.tags || [],
      author: levelData.author,
      version: levelData.version
    };
  } catch (error) {
    console.error(`❌ Error reading ${filepath}:`, error);
    return null;
  }
}

/**
 * Generate index for all levels in the generated-levels folder
 */
function generateLevelsIndex(): void {
  console.log('🔍 Scanning generated-levels folder...');

  const levelsDir = join(process.cwd(), 'generated-levels');

  try {
    const files = readdirSync(levelsDir);
    const jsonFiles = files.filter(file => file.endsWith('.json') && !['levels-index.json', 'index.json'].includes(file));

    console.log(`📁 Found ${jsonFiles.length} JSON files`);

    if (jsonFiles.length === 0) {
      console.log('⚠️  No JSON files found in generated-levels folder');
      return;
    }

    const levels: LevelMetadata[] = [];
    const themes = new Set<string>();
    const difficulties = new Set<string>();
    const validator = new LevelValidator();

    // Process each JSON file
    for (const filename of jsonFiles) {
      const filepath = join(levelsDir, filename);
      console.log(`📖 Processing ${filename}...`);

      try {
        const jsonContent = readFileSync(filepath, 'utf8');
        const levelData = JSON.parse(jsonContent);

        // Validate the level
        const validation = validator.validateLevel(levelData, filename);

        if (validation.isValid) {
          const metadata = extractLevelMetadata(filepath);
          if (metadata) {
            levels.push(metadata);
            if (metadata.theme) themes.add(metadata.theme);
            if (metadata.difficulty) difficulties.add(metadata.difficulty);
            console.log(`✅ ${filename} - Valid`);
          }
        } else {
          console.log(`❌ ${filename} - Invalid (${validation.errors.length} errors)`);
          validation.errors.forEach(error => {
            if (error.severity === 'error') {
              console.log(`   ERROR: ${error.field} - ${error.message}`);
            }
          });
        }
      } catch (error) {
        console.log(`❌ ${filename} - Invalid JSON (${error})`);
      }
    }

    if (levels.length === 0) {
      console.log('❌ No valid level files found');
      return;
    }

    // Create index structure
    const index: LevelsIndex = {
      levels: levels.sort((a, b) => {
        // Sort by theme, then difficulty, then name
        const themeA = a.theme || 'unknown';
        const themeB = b.theme || 'unknown';
        if (themeA !== themeB) return themeA.localeCompare(themeB);

        const diffA = a.difficulty || 'medium';
        const diffB = b.difficulty || 'medium';
        if (diffA !== diffB) {
          const difficultyOrder = ['easy', 'medium', 'hard', 'epic'];
          return difficultyOrder.indexOf(diffA) - difficultyOrder.indexOf(diffB);
        }
        return a.name.localeCompare(b.name);
      }),
      generatedAt: new Date().toISOString(),
      totalLevels: levels.length,
      metadata: {
        generatorVersion: '1.0.0',
        formatVersion: '1.0.0',
        themes: Array.from(themes).sort(),
        difficulties: Array.from(difficulties).sort()
      }
    };

    // Write index file
    const indexPath = join(levelsDir, 'index.json');
    writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf8');

    console.log('\n✅ Index generated successfully!');
    console.log(`📊 Total levels: ${levels.length}`);
    console.log(`🎨 Themes: ${Array.from(themes).join(', ')}`);
    console.log(`⚖️  Difficulties: ${Array.from(difficulties).join(', ')}`);
    console.log(`📁 Index saved: ${indexPath}`);

    // Display summary
    console.log('\n📋 Levels by theme:');
    const byTheme = levels.reduce((acc, level) => {
      const theme = level.theme || 'unknown';
      if (!acc[theme]) acc[theme] = [];
      acc[theme].push(level);
      return acc;
    }, {} as Record<string, LevelMetadata[]>);

    Object.entries(byTheme).forEach(([theme, themeLevels]) => {
      console.log(`  ${theme}: ${themeLevels.length} levels`);
    });

    console.log('\n📋 Levels by difficulty:');
    const byDifficulty = levels.reduce((acc, level) => {
      const difficulty = level.difficulty || 'medium';
      if (!acc[difficulty]) acc[difficulty] = [];
      acc[difficulty].push(level);
      return acc;
    }, {} as Record<string, LevelMetadata[]>);

    Object.entries(byDifficulty).forEach(([difficulty, diffLevels]) => {
      console.log(`  ${difficulty}: ${diffLevels.length} levels`);
    });

  } catch (error) {
    console.error('❌ Error generating index:', error);
    process.exit(1);
  }
}

/**
 * Validate a single level file
 */
function validateLevelFile(filepath: string): boolean {
  try {
    const jsonContent = readFileSync(filepath, 'utf8');
    const levelData = JSON.parse(jsonContent);
    const filename = filepath.split('/').pop() || '';

    const validator = new LevelValidator();
    const validation = validator.validateLevel(levelData, filename);

    console.log(`\n🔍 Validation Results for ${filename}:`);
    console.log('='.repeat(50));

    if (validation.isValid) {
      console.log('✅ All validations passed!');
      return true;
    } else {
      console.log(`❌ Validation failed (${validation.errors.length} issues):`);
      validation.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error.severity.toUpperCase()}: ${error.field} - ${error.message}`);
      });
      return false;
    }
  } catch (error) {
    console.log(`❌ Invalid JSON in ${filepath}:`, error);
    return false;
  }
}

/**
 * Validate all levels
 */
function validateAllLevels(): void {
  console.log('🔍 Validating all generated levels...');

  const levelsDir = join(process.cwd(), 'generated-levels');

  try {
    const files = readdirSync(levelsDir);
    const jsonFiles = files.filter(file => file.endsWith('.json') && !['levels-index.json', 'index.json'].includes(file));

    let validCount = 0;
    let invalidCount = 0;

    for (const filename of jsonFiles) {
      const filepath = join(levelsDir, filename);
      if (validateLevelFile(filepath)) {
        validCount++;
      } else {
        invalidCount++;
      }
    }

    console.log(`\n📊 Validation Results:`);
    console.log(`✅ Valid: ${validCount}`);
    console.log(`❌ Invalid: ${invalidCount}`);

    if (invalidCount === 0) {
      console.log('🎉 All levels are valid!');
    } else {
      console.log(`⚠️  ${invalidCount} levels have issues`);
    }

  } catch (error) {
    console.error('❌ Error during validation:', error);
  }
}

// Main execution
if (import.meta.main) {
  const args = process.argv.slice(2);

  if (args.includes('--validate') || args.includes('-v')) {
    validateAllLevels();
  } else {
    generateLevelsIndex();
  }
}

export { generateLevelsIndex, validateAllLevels, extractLevelMetadata };
