import { useMemo } from "react";
import { Prefab, getPrefabBounds } from "@/lib/prefabTypes";
import { getBlockColor } from "@/lib/hytaleBlocks";

interface Preview3DProps {
  prefab: Prefab;
  currentLayer: number;
}

export function Preview3D({ prefab, currentLayer }: Preview3DProps) {
  const bounds = useMemo(() => getPrefabBounds(prefab), [prefab]);
  
  // Isometric projection constants
  const blockSize = 8;
  const isoAngle = Math.PI / 6; // 30 degrees

  // Calculate canvas size
  const rangeX = bounds.maxX - bounds.minX + 1;
  const rangeY = bounds.maxY - bounds.minY + 1;
  const rangeZ = bounds.maxZ - bounds.minZ + 1;
  
  const canvasWidth = (rangeX + rangeZ) * blockSize * Math.cos(isoAngle) + 100;
  const canvasHeight = rangeY * blockSize + (rangeX + rangeZ) * blockSize * Math.sin(isoAngle) + 100;

  // Convert 3D coordinates to 2D isometric
  const toIso = (x: number, y: number, z: number) => {
    const isoX = (x - z) * blockSize * Math.cos(isoAngle);
    const isoY = (x + z) * blockSize * Math.sin(isoAngle) - y * blockSize;
    return {
      x: isoX + canvasWidth / 2,
      y: isoY + canvasHeight / 2,
    };
  };

  // Sort blocks for proper rendering order (back to front, bottom to top)
  const sortedBlocks = useMemo(() => {
    return [...prefab.blocks].sort((a, b) => {
      // Sort by depth (x + z), then by height (y)
      const depthA = a.x + a.z;
      const depthB = b.x + b.z;
      if (depthA !== depthB) return depthA - depthB;
      return a.y - b.y;
    });
  }, [prefab.blocks]);

  if (prefab.blocks.length === 0) {
    return (
      <div className="border-2 border-foreground bg-card p-4 shadow-md h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-bold">Aperçu 3D</p>
          <p className="text-sm">Placez des blocs pour voir l'aperçu</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border-2 border-foreground bg-card p-4 shadow-md">
      <h3 className="mb-2 text-lg font-bold uppercase tracking-wide">Aperçu 3D</h3>
      <div className="flex items-center justify-center overflow-auto bg-muted border-2 border-foreground/50">
        <svg
          width={Math.min(canvasWidth, 400)}
          height={Math.min(canvasHeight, 300)}
          viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
          className="min-w-[200px]"
        >
          {sortedBlocks.map((block, index) => {
            const pos = toIso(block.x - bounds.minX, block.y - bounds.minY, block.z - bounds.minZ);
            const color = getBlockColor(block.name);
            const isCurrentLayer = block.y === currentLayer;
            const opacity = isCurrentLayer ? 1 : 0.5;

            // Draw isometric cube faces
            const size = blockSize;
            const cosA = Math.cos(isoAngle) * size;
            const sinA = Math.sin(isoAngle) * size;

            // Top face
            const topPath = `M ${pos.x} ${pos.y - size}
              L ${pos.x + cosA} ${pos.y - size + sinA}
              L ${pos.x} ${pos.y + 2 * sinA - size}
              L ${pos.x - cosA} ${pos.y - size + sinA} Z`;

            // Left face
            const leftPath = `M ${pos.x - cosA} ${pos.y - size + sinA}
              L ${pos.x} ${pos.y + 2 * sinA - size}
              L ${pos.x} ${pos.y + 2 * sinA}
              L ${pos.x - cosA} ${pos.y + sinA} Z`;

            // Right face
            const rightPath = `M ${pos.x + cosA} ${pos.y - size + sinA}
              L ${pos.x} ${pos.y + 2 * sinA - size}
              L ${pos.x} ${pos.y + 2 * sinA}
              L ${pos.x + cosA} ${pos.y + sinA} Z`;

            return (
              <g key={`${block.x}-${block.y}-${block.z}-${index}`} opacity={opacity}>
                {/* Left face (darker) */}
                <path
                  d={leftPath}
                  fill={`hsl(${color})`}
                  stroke="hsl(0 0% 0% / 0.3)"
                  strokeWidth="0.5"
                  style={{ filter: "brightness(0.7)" }}
                />
                {/* Right face (medium) */}
                <path
                  d={rightPath}
                  fill={`hsl(${color})`}
                  stroke="hsl(0 0% 0% / 0.3)"
                  strokeWidth="0.5"
                  style={{ filter: "brightness(0.85)" }}
                />
                {/* Top face (brightest) */}
                <path
                  d={topPath}
                  fill={`hsl(${color})`}
                  stroke="hsl(0 0% 0% / 0.3)"
                  strokeWidth="0.5"
                />
                {/* Highlight current layer */}
                {isCurrentLayer && (
                  <path
                    d={topPath}
                    fill="none"
                    stroke="hsl(0 0% 100%)"
                    strokeWidth="1"
                    opacity="0.5"
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mt-2 text-xs text-muted-foreground text-center">
        Couche actuelle ({currentLayer}) en surbrillance
      </div>
    </div>
  );
}
