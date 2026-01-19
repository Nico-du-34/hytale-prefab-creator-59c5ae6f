// Hytale Prefab structure based on the official format
export interface PrefabBlock {
  x: number;
  y: number;
  z: number;
  name: string;
}

export interface Prefab {
  version: number;
  blockIdVersion: number;
  anchorX: number;
  anchorY: number;
  anchorZ: number;
  blocks: PrefabBlock[];
}

export function createEmptyPrefab(): Prefab {
  return {
    version: 8,
    blockIdVersion: 10,
    anchorX: 0,
    anchorY: 0,
    anchorZ: 0,
    blocks: [],
  };
}

export function exportPrefab(prefab: Prefab): string {
  return JSON.stringify(prefab, null, 2);
}

export function importPrefab(json: string): Prefab | null {
  try {
    const data = JSON.parse(json);
    if (data.version && data.blocks && Array.isArray(data.blocks)) {
      return data as Prefab;
    }
    return null;
  } catch {
    return null;
  }
}

export function getPrefabBounds(prefab: Prefab): { 
  minX: number; maxX: number; 
  minY: number; maxY: number; 
  minZ: number; maxZ: number;
} {
  if (prefab.blocks.length === 0) {
    return { minX: 0, maxX: 0, minY: 0, maxY: 0, minZ: 0, maxZ: 0 };
  }
  
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;
  
  for (const block of prefab.blocks) {
    minX = Math.min(minX, block.x);
    maxX = Math.max(maxX, block.x);
    minY = Math.min(minY, block.y);
    maxY = Math.max(maxY, block.y);
    minZ = Math.min(minZ, block.z);
    maxZ = Math.max(maxZ, block.z);
  }
  
  return { minX, maxX, minY, maxY, minZ, maxZ };
}
