import { useState, useCallback } from "react";
import { Prefab, PrefabBlock, createEmptyPrefab } from "@/lib/prefabTypes";

export type EditorTool = "place" | "erase" | "select" | "fill";

export function usePrefabEditor() {
  const [prefab, setPrefab] = useState<Prefab>(createEmptyPrefab());
  const [selectedBlock, setSelectedBlock] = useState<string>("Stone");
  const [currentLayer, setCurrentLayer] = useState<number>(0);
  const [tool, setTool] = useState<EditorTool>("place");
  const [gridSize, setGridSize] = useState<number>(16);

  const addBlock = useCallback((x: number, y: number, z: number, name: string) => {
    setPrefab((prev) => {
      // Check if block already exists at this position
      const existingIndex = prev.blocks.findIndex(
        (b) => b.x === x && b.y === y && b.z === z
      );

      if (existingIndex >= 0) {
        // Replace existing block
        const newBlocks = [...prev.blocks];
        newBlocks[existingIndex] = { x, y, z, name };
        return { ...prev, blocks: newBlocks };
      }

      // Add new block
      return { ...prev, blocks: [...prev.blocks, { x, y, z, name }] };
    });
  }, []);

  const removeBlock = useCallback((x: number, y: number, z: number) => {
    setPrefab((prev) => ({
      ...prev,
      blocks: prev.blocks.filter(
        (b) => !(b.x === x && b.y === y && b.z === z)
      ),
    }));
  }, []);

  const getBlockAt = useCallback(
    (x: number, y: number, z: number): PrefabBlock | undefined => {
      return prefab.blocks.find((b) => b.x === x && b.y === y && b.z === z);
    },
    [prefab.blocks]
  );

  const clearPrefab = useCallback(() => {
    setPrefab(createEmptyPrefab());
  }, []);

  const loadPrefab = useCallback((newPrefab: Prefab) => {
    setPrefab(newPrefab);
  }, []);

  const fillLayer = useCallback((y: number, name: string, size: number) => {
    setPrefab((prev) => {
      const half = Math.floor(size / 2);
      const newBlocks = [...prev.blocks];
      
      for (let x = -half; x < half; x++) {
        for (let z = -half; z < half; z++) {
          const existingIndex = newBlocks.findIndex(
            (b) => b.x === x && b.y === y && b.z === z
          );
          if (existingIndex >= 0) {
            newBlocks[existingIndex] = { x, y, z, name };
          } else {
            newBlocks.push({ x, y, z, name });
          }
        }
      }
      
      return { ...prev, blocks: newBlocks };
    });
  }, []);

  const clearLayer = useCallback((y: number) => {
    setPrefab((prev) => ({
      ...prev,
      blocks: prev.blocks.filter((b) => b.y !== y),
    }));
  }, []);

  const getLayerBlocks = useCallback(
    (y: number): PrefabBlock[] => {
      return prefab.blocks.filter((b) => b.y === y);
    },
    [prefab.blocks]
  );

  return {
    prefab,
    setPrefab,
    selectedBlock,
    setSelectedBlock,
    currentLayer,
    setCurrentLayer,
    tool,
    setTool,
    gridSize,
    setGridSize,
    addBlock,
    removeBlock,
    getBlockAt,
    clearPrefab,
    loadPrefab,
    fillLayer,
    clearLayer,
    getLayerBlocks,
  };
}
