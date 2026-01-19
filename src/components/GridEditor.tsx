import { useCallback, useState, MouseEvent } from "react";
import { PrefabBlock } from "@/lib/prefabTypes";
import { getBlockColor } from "@/lib/hytaleBlocks";
import { EditorTool } from "@/hooks/usePrefabEditor";
import { cn } from "@/lib/utils";

interface GridEditorProps {
  layerBlocks: PrefabBlock[];
  gridSize: number;
  currentLayer: number;
  tool: EditorTool;
  selectedBlock: string;
  onPlaceBlock: (x: number, y: number, z: number, name: string) => void;
  onRemoveBlock: (x: number, y: number, z: number) => void;
  getBlockAt: (x: number, y: number, z: number) => PrefabBlock | undefined;
}

export function GridEditor({
  layerBlocks,
  gridSize,
  currentLayer,
  tool,
  selectedBlock,
  onPlaceBlock,
  onRemoveBlock,
  getBlockAt,
}: GridEditorProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<{ x: number; z: number } | null>(null);

  const half = Math.floor(gridSize / 2);
  const cellSize = Math.min(600 / gridSize, 40);

  const handleCellAction = useCallback(
    (x: number, z: number) => {
      if (tool === "place") {
        onPlaceBlock(x, currentLayer, z, selectedBlock);
      } else if (tool === "erase") {
        onRemoveBlock(x, currentLayer, z);
      } else if (tool === "fill") {
        // Fill is a single action, not for individual cells
        onPlaceBlock(x, currentLayer, z, selectedBlock);
      }
    },
    [tool, currentLayer, selectedBlock, onPlaceBlock, onRemoveBlock]
  );

  const handleMouseDown = (x: number, z: number) => {
    setIsDragging(true);
    handleCellAction(x, z);
  };

  const handleMouseEnter = (x: number, z: number) => {
    setHoveredCell({ x, z });
    if (isDragging) {
      handleCellAction(x, z);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setHoveredCell(null);
  };

  // Create grid cells
  const cells = [];
  for (let z = -half; z < half; z++) {
    for (let x = -half; x < half; x++) {
      const block = getBlockAt(x, currentLayer, z);
      const isHovered = hoveredCell?.x === x && hoveredCell?.z === z;
      
      cells.push(
        <div
          key={`${x}-${z}`}
          className={cn(
            "border border-foreground/20 transition-all duration-75 cursor-crosshair",
            isHovered && "ring-2 ring-foreground ring-inset",
            block ? "border-foreground/40" : "hover:bg-accent/50"
          )}
          style={{
            width: cellSize,
            height: cellSize,
            backgroundColor: block ? `hsl(${getBlockColor(block.name)})` : undefined,
          }}
          onMouseDown={() => handleMouseDown(x, z)}
          onMouseEnter={() => handleMouseEnter(x, z)}
          onMouseUp={handleMouseUp}
          title={block ? `${block.name} (${x}, ${currentLayer}, ${z})` : `(${x}, ${currentLayer}, ${z})`}
        />
      );
    }
  }

  return (
    <div className="border-2 border-foreground bg-card p-4 shadow-md">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-lg font-bold uppercase tracking-wide">
          Éditeur de grille
        </h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>X: {hoveredCell?.x ?? "-"}</span>
          <span>Y: {currentLayer}</span>
          <span>Z: {hoveredCell?.z ?? "-"}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-center">
        <div
          className="grid select-none border-2 border-foreground"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
          }}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
        >
          {cells}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-4 text-sm text-muted-foreground">
        <span>← X →</span>
        <span className="rotate-90">← Z →</span>
      </div>
    </div>
  );
}
