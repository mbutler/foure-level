/**
 * Map Renderer for FOURE VTT Level Generator
 *
 * Provides visual representation of generated maps with proper UTF-8 symbols
 * and colored output for better visualization.
 */

import { TerrainUtils, TERRAIN_TYPES } from '../types/terrain.js';

/**
 * Map Renderer with visual enhancements
 */
export class MapRenderer {
  /**
   * Render a map with UTF-8 symbols and basic formatting
   */
  static renderSimple(terrain: string[][]): string {
    let output = '\n╔' + '═'.repeat(terrain[0].length) + '╗\n';

    for (let y = 0; y < terrain.length; y++) {
      let row = '║';
      for (let x = 0; x < terrain[0].length; x++) {
        const terrainType = terrain[y][x];
        const glyph = TerrainUtils.getDisplayGlyph(terrainType);
        row += glyph === ' ' ? ' ' : glyph;
      }
      row += '║';
      output += row + '\n';
    }

    output += '╚' + '═'.repeat(terrain[0].length) + '╝\n';
    return output;
  }

  /**
   * Render a map with terrain type legend
   */
  static renderWithLegend(terrain: string[][]): string {
    const legend = this.generateLegend();
    const map = this.renderSimple(terrain);

    return map + legend;
  }

  /**
   * Generate a legend showing all terrain types
   */
  private static generateLegend(): string {
    const terrainTypes = Object.values(TERRAIN_TYPES);
    let legend = '\n🏗️  Terrain Legend:\n';

    // Group by category for better organization
    const byCategory: Record<string, typeof terrainTypes> = {};
    terrainTypes.forEach(type => {
      if (!byCategory[type.category]) {
        byCategory[type.category] = [];
      }
      byCategory[type.category].push(type);
    });

    Object.entries(byCategory).forEach(([category, types]) => {
      legend += `\n${this.getCategoryEmoji(category)} ${category.toUpperCase()}:\n`;

      types.forEach(type => {
        legend += `  ${type.displayGlyph}  ${type.name} - ${type.description}\n`;
      });
    });

    legend += `\n💡 Movement: ${this.getMovementEmoji('normal')} Normal, ${this.getMovementEmoji('difficult')} Difficult, 🚫 Blocked\n`;
    legend += `👁️  Line of Sight: ${this.getVisibilityEmoji('clear')} Clear, ${this.getVisibilityEmoji('partial')} Partial, 🚫 Blocked\n`;

    return legend;
  }

  /**
   * Get emoji for terrain categories
   */
  private static getCategoryEmoji(category: string): string {
    const emojis: Record<string, string> = {
      'open': '🌾',
      'obstructing': '🌲',
      'hazardous': '⚠️',
      'interactive': '🎯',
      'environmental': '🏞️',
      'structural': '🧱'
    };
    return emojis[category] || '⬜';
  }

  /**
   * Get emoji for movement types
   */
  private static getMovementEmoji(type: string): string {
    const emojis: Record<string, string> = {
      'normal': '🚶',
      'difficult': '🥾',
      'blocked': '🚫'
    };
    return emojis[type] || '🚶';
  }

  /**
   * Get emoji for visibility types
   */
  private static getVisibilityEmoji(type: string): string {
    const emojis: Record<string, string> = {
      'clear': '👁️',
      'partial': '👁️‍🗨️',
      'blocked': '🚫'
    };
    return emojis[type] || '👁️';
  }

  /**
   * Render a compact version for small displays
   */
  static renderCompact(terrain: string[][], maxWidth: number = 40): string {
    const height = terrain.length;
    const width = terrain[0].length;

    if (width <= maxWidth) {
      return this.renderSimple(terrain);
    }

    // Scale down the map
    const scaleX = Math.max(1, Math.floor(width / maxWidth));
    const newWidth = Math.floor(width / scaleX);
    const newHeight = Math.floor(height / scaleX);

    const scaledTerrain: string[][] = [];

    for (let y = 0; y < newHeight; y++) {
      scaledTerrain[y] = [];
      for (let x = 0; x < newWidth; x++) {
        const originalX = x * scaleX;
        const originalY = y * scaleX;

        // Use the most common terrain type in this scaled cell
        const terrainCounts: Record<string, number> = {};
        let maxCount = 0;
        let mostCommon = 'empty';

        for (let dy = 0; dy < scaleX && originalY + dy < height; dy++) {
          for (let dx = 0; dx < scaleX && originalX + dx < width; dx++) {
            const terrain = terrain[originalY + dy][originalX + dx];
            terrainCounts[terrain] = (terrainCounts[terrain] || 0) + 1;

            if (terrainCounts[terrain] > maxCount) {
              maxCount = terrainCounts[terrain];
              mostCommon = terrain;
            }
          }
        }

        scaledTerrain[y][x] = mostCommon;
      }
    }

    return this.renderSimple(scaledTerrain);
  }

  /**
   * Render with theme-specific styling
   */
  static renderThemed(terrain: string[][], theme: string): string {
    let header = '\n';

    switch (theme) {
      case 'dungeon':
        header += '🏰 DUNGEON MAP\n';
        break;
      case 'wilderness':
        header += '🌲 WILDERNESS MAP\n';
        break;
      case 'underground':
        header += '🕳️  UNDERGROUND MAP\n';
        break;
      case 'urban':
        header += '🏙️  URBAN MAP\n';
        break;
      case 'mystical':
        header += '✨ MYSTICAL MAP\n';
        break;
      default:
        header += '🗺️  GENERATED MAP\n';
    }

    header += '═'.repeat(terrain[0].length) + '\n';

    let output = header;

    for (let y = 0; y < terrain.length; y++) {
      let row = '';
      for (let x = 0; x < terrain[0].length; x++) {
        const terrainType = terrain[y][x];
        const glyph = TerrainUtils.getDisplayGlyph(terrainType);
        row += glyph === ' ' ? ' ' : glyph;
      }
      output += row + '\n';
    }

    return output;
  }

  /**
   * Get statistics about the map
   */
  static getMapStats(terrain: string[][]): Record<string, number> {
    const stats: Record<string, number> = {};
    const totalCells = terrain.length * terrain[0].length;

    // Count each terrain type
    for (let y = 0; y < terrain.length; y++) {
      for (let x = 0; x < terrain[0].length; x++) {
        const terrainType = terrain[y][x];
        stats[terrainType] = (stats[terrainType] || 0) + 1;
      }
    }

    // Add percentages
    Object.keys(stats).forEach(type => {
      stats[`${type}_percentage`] = (stats[type] / totalCells) * 100;
    });

    return stats;
  }

  /**
   * Display map statistics
   */
  static displayStats(terrain: string[][]): string {
    const stats = this.getMapStats(terrain);
    let output = '\n📊 Map Statistics:\n';

    // Sort by frequency
    const sortedTypes = Object.entries(stats)
      .filter(([key]) => !key.includes('_percentage'))
      .sort(([,a], [,b]) => b - a);

    sortedTypes.forEach(([type, count]) => {
      const percentage = stats[`${type}_percentage`];
      const terrainInfo = TERRAIN_TYPES[type];
      const name = terrainInfo ? terrainInfo.name : type;

      output += `  ${TerrainUtils.getDisplayGlyph(type)} ${name}: ${count} cells (${percentage.toFixed(1)}%)\n`;
    });

    return output;
  }
}


