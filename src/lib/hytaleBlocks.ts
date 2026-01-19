// Hytale block definitions with colors for visualization
export interface HytaleBlock {
  name: string;
  category: string;
  color: string; // HSL color for visualization
}

export const HYTALE_BLOCKS: HytaleBlock[] = [
  // Nature
  { name: "Soil_Grass", category: "Nature", color: "120 50% 40%" },
  { name: "Soil", category: "Nature", color: "30 40% 30%" },
  { name: "Sand", category: "Nature", color: "45 60% 70%" },
  { name: "Gravel", category: "Nature", color: "0 0% 50%" },
  { name: "Clay", category: "Nature", color: "20 30% 55%" },
  { name: "Snow", category: "Nature", color: "200 20% 95%" },
  
  // Stone
  { name: "Stone", category: "Stone", color: "0 0% 55%" },
  { name: "Stone_Cobble", category: "Stone", color: "0 0% 45%" },
  { name: "Stone_Brick", category: "Stone", color: "0 0% 60%" },
  { name: "Stone_Mossy", category: "Stone", color: "120 20% 45%" },
  { name: "Granite", category: "Stone", color: "15 25% 45%" },
  { name: "Marble", category: "Stone", color: "0 0% 90%" },
  
  // Wood
  { name: "Wood_Oak", category: "Wood", color: "30 50% 35%" },
  { name: "Wood_Birch", category: "Wood", color: "40 30% 70%" },
  { name: "Wood_Spruce", category: "Wood", color: "25 40% 25%" },
  { name: "Wood_Planks_Oak", category: "Wood", color: "35 45% 45%" },
  { name: "Wood_Planks_Birch", category: "Wood", color: "45 35% 75%" },
  { name: "Wood_Planks_Spruce", category: "Wood", color: "30 35% 30%" },
  
  // Metals & Ores
  { name: "Iron_Ore", category: "Metals", color: "25 20% 50%" },
  { name: "Gold_Ore", category: "Metals", color: "45 80% 50%" },
  { name: "Copper_Ore", category: "Metals", color: "25 70% 45%" },
  { name: "Iron_Block", category: "Metals", color: "0 0% 75%" },
  { name: "Gold_Block", category: "Metals", color: "45 90% 55%" },
  { name: "Copper_Block", category: "Metals", color: "25 80% 55%" },
  
  // Glass & Crystal
  { name: "Glass", category: "Glass", color: "200 50% 85%" },
  { name: "Glass_Tinted", category: "Glass", color: "270 30% 50%" },
  { name: "Crystal_Blue", category: "Glass", color: "200 80% 60%" },
  { name: "Crystal_Red", category: "Glass", color: "0 80% 50%" },
  { name: "Crystal_Green", category: "Glass", color: "140 70% 45%" },
  
  // Building
  { name: "Brick_Red", category: "Building", color: "0 60% 45%" },
  { name: "Brick_White", category: "Building", color: "0 0% 85%" },
  { name: "Concrete", category: "Building", color: "0 0% 65%" },
  { name: "Terracotta", category: "Building", color: "20 50% 50%" },
  { name: "Thatch", category: "Building", color: "45 50% 55%" },
  
  // Special
  { name: "Water", category: "Special", color: "210 80% 50%" },
  { name: "Lava", category: "Special", color: "15 100% 50%" },
  { name: "Void", category: "Special", color: "280 80% 20%" },
  { name: "Light", category: "Special", color: "50 100% 75%" },
];

export const BLOCK_CATEGORIES = [...new Set(HYTALE_BLOCKS.map(b => b.category))];

export function getBlockByName(name: string): HytaleBlock | undefined {
  return HYTALE_BLOCKS.find(b => b.name === name);
}

export function getBlockColor(name: string): string {
  const block = getBlockByName(name);
  return block?.color || "0 0% 50%";
}
