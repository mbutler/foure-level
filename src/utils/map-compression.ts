/**
 * Compact Map Representation and Compression for FOURE VTT Level Generator
 *
 * This module provides efficient storage and compression strategies for 25x25 maps,
 * including run-length encoding and various serialization formats.
 */

import { CompactMapData, MapCell } from '../types/terrain.js';

/**
 * Run-Length Encoding (RLE) for terrain layers
 * Compresses repeated terrain types in rows
 */
export interface RLESegment {
  readonly terrain: string;
  readonly count: number;
}

export interface RLERow {
  readonly segments: RLESegment[];
  readonly y: number;
}

export interface CompressedMapData {
  readonly dimensions: { width: number; height: number };
  readonly rleData: RLERow[];
  readonly metadata: {
    readonly theme: string;
    readonly seed: number;
    readonly version: string;
    readonly compressionRatio: number;
  };
}

/**
 * Map Compression Utilities
 */
export class MapCompression {
  /**
   * Compress a 2D terrain array using Run-Length Encoding
   */
  static compressMap(terrainLayer: string[][], seed: number, theme: string): CompressedMapData {
    const height = terrainLayer.length;
    const width = terrainLayer[0]?.length || 0;

    const rleData: RLERow[] = [];

    for (let y = 0; y < height; y++) {
      const row = terrainLayer[y];
      const segments: RLESegment[] = [];

      let currentTerrain = row[0];
      let count = 1;

      for (let x = 1; x < width; x++) {
        if (row[x] === currentTerrain) {
          count++;
        } else {
          segments.push({ terrain: currentTerrain, count });
          currentTerrain = row[x];
          count = 1;
        }
      }

      // Add final segment
      segments.push({ terrain: currentTerrain, count });

      rleData.push({ segments, y });
    }

    const originalSize = height * width;
    const compressedSize = rleData.reduce((sum, row) => sum + row.segments.length, 0);
    const compressionRatio = (1 - (compressedSize / originalSize)) * 100;

    return {
      dimensions: { width, height },
      rleData,
      metadata: {
        theme,
        seed,
        version: '1.0.0',
        compressionRatio
      }
    };
  }

  /**
   * Decompress RLE data back to 2D terrain array
   */
  static decompressMap(compressedData: CompressedMapData): string[][] {
    const { width, height, rleData } = compressedData;
    const terrainLayer: string[][] = [];

    for (let y = 0; y < height; y++) {
      const row: string[] = [];
      const rleRow = rleData.find(r => r.y === y);

      if (rleRow) {
        for (const segment of rleRow.segments) {
          for (let i = 0; i < segment.count; i++) {
            row.push(segment.terrain);
          }
        }
      }

      terrainLayer.push(row);
    }

    return terrainLayer;
  }

  /**
   * Generate a compact JSON representation
   */
  static toCompactJSON(compressedData: CompressedMapData): string {
    return JSON.stringify(compressedData, null, 0);
  }

  /**
   * Generate a minimal string representation for storage/transmission
   */
  static toCompactString(compressedData: CompressedMapData): string {
    const { dimensions, rleData, metadata } = compressedData;

    // Create a compact string format: "WxH|seed|theme|version|rleData"
    const header = `${dimensions.width}x${dimensions.height}|${metadata.seed}|${metadata.theme}|${metadata.version}`;

    // Encode RLE data efficiently
    const rleString = rleData.map(row => {
      return row.segments.map(seg => `${seg.terrain}:${seg.count}`).join(',');
    }).join('|');

    return `${header}|${rleString}`;
  }

  /**
   * Parse compact string back to CompressedMapData
   */
  static fromCompactString(compactString: string): CompressedMapData {
    const parts = compactString.split('|');
    const [dimensionsStr, seedStr, theme, version] = parts.slice(0, 4);
    const rleString = parts.slice(4).join('|');

    // Parse dimensions
    const [width, height] = dimensionsStr.split('x').map(Number);

    // Parse RLE data
    const rleData: RLERow[] = rleString.split('|').map((rowStr, y) => {
      const segments: RLESegment[] = rowStr.split(',').map(segStr => {
        const [terrain, countStr] = segStr.split(':');
        return { terrain, count: parseInt(countStr, 10) };
      });
      return { segments, y };
    });

    const seed = parseInt(seedStr, 10);

    const originalSize = width * height;
    const compressedSize = rleData.reduce((sum, row) => sum + row.segments.length, 0);
    const compressionRatio = (1 - (compressedSize / originalSize)) * 100;

    return {
      dimensions: { width, height },
      rleData,
      metadata: { theme, seed, version, compressionRatio }
    };
  }

  /**
   * Calculate compression statistics
   */
  static getCompressionStats(terrainLayer: string[][]): {
    originalSize: number;
    estimatedCompressedSize: number;
    compressionRatio: number;
  } {
    const height = terrainLayer.length;
    const width = terrainLayer[0]?.length || 0;
    const originalSize = height * width;

    // Estimate RLE compression
    let estimatedCompressedSize = 0;
    for (let y = 0; y < height; y++) {
      const row = terrainLayer[y];
      let currentTerrain = row[0];
      let count = 1;

      for (let x = 1; x < width; x++) {
        if (row[x] === currentTerrain) {
          count++;
        } else {
          estimatedCompressedSize++;
          currentTerrain = row[x];
          count = 1;
        }
      }
      estimatedCompressedSize++; // Final segment
    }

    const compressionRatio = (1 - (estimatedCompressedSize / originalSize)) * 100;

    return {
      originalSize,
      estimatedCompressedSize,
      compressionRatio
    };
  }
}

/**
 * Procedural Generation Parameters
 * Compact representation for recreating maps from seeds
 */
export interface GenerationParams {
  readonly seed: number;
  readonly theme: string;
  readonly dimensions: { width: number; height: number };
  readonly algorithm: string;
  readonly parameters: Record<string, number | string | boolean>;
}

export interface ProceduralMap {
  readonly params: GenerationParams;
  readonly compressedData: CompressedMapData;
}

/**
 * Seed-based Map Recreation
 */
export class SeedMap {
  /**
   * Create a compact representation that can recreate the map
   */
  static createSeedMap(
    seed: number,
    theme: string,
    algorithm: string,
    parameters: Record<string, number | string | boolean>
  ): GenerationParams {
    return {
      seed,
      theme,
      dimensions: { width: 25, height: 25 },
      algorithm,
      parameters
    };
  }

  /**
   * Convert to minimal string for storage
   */
  static paramsToString(params: GenerationParams): string {
    const { seed, theme, dimensions, algorithm, parameters } = params;
    const paramStr = Object.entries(parameters)
      .map(([key, value]) => `${key}:${value}`)
      .join(',');

    return `${seed}|${theme}|${dimensions.width}x${dimensions.height}|${algorithm}|${paramStr}`;
  }

  /**
   * Parse string back to generation parameters
   */
  static stringToParams(paramString: string): GenerationParams {
    const parts = paramString.split('|');
    const seed = parseInt(parts[0], 10);
    const theme = parts[1];
    const dimensionsStr = parts[2];
    const algorithm = parts[3];
    const paramStr = parts[4];

    const [width, height] = dimensionsStr.split('x').map(Number);

    const parameters: Record<string, number | string | boolean> = {};
    if (paramStr) {
      paramStr.split(',').forEach(param => {
        const [key, valueStr] = param.split(':');
        let value: number | string | boolean = valueStr;

        // Try to parse as number first
        if (!isNaN(Number(valueStr))) {
          value = Number(valueStr);
        } else if (valueStr === 'true' || valueStr === 'false') {
          value = valueStr === 'true';
        }

        parameters[key] = value;
      });
    }

    return {
      seed,
      theme,
      dimensions: { width, height },
      algorithm,
      parameters
    };
  }
}
