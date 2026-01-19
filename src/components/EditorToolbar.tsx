import { Button } from "@/components/ui/button";
import { EditorTool } from "@/hooks/usePrefabEditor";
import { Pencil, Eraser, Square, Layers, Download, Upload, Trash2, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditorToolbarProps {
  tool: EditorTool;
  onToolChange: (tool: EditorTool) => void;
  currentLayer: number;
  onLayerChange: (layer: number) => void;
  gridSize: number;
  onGridSizeChange: (size: number) => void;
  onExport: () => void;
  onImport: () => void;
  onClear: () => void;
  onFillLayer: () => void;
  onClearLayer: () => void;
  blockCount: number;
}

const tools: { id: EditorTool; icon: typeof Pencil; label: string }[] = [
  { id: "place", icon: Pencil, label: "Placer" },
  { id: "erase", icon: Eraser, label: "Effacer" },
  { id: "fill", icon: Square, label: "Remplir" },
];

export function EditorToolbar({
  tool,
  onToolChange,
  currentLayer,
  onLayerChange,
  gridSize,
  onGridSizeChange,
  onExport,
  onImport,
  onClear,
  onFillLayer,
  onClearLayer,
  blockCount,
}: EditorToolbarProps) {
  return (
    <div className="border-2 border-foreground bg-card p-4 shadow-md">
      <div className="flex flex-wrap items-center gap-4">
        {/* Tools */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold uppercase">Outils:</span>
          <div className="flex gap-1">
            {tools.map((t) => (
              <Button
                key={t.id}
                variant={tool === t.id ? "default" : "outline"}
                size="sm"
                onClick={() => onToolChange(t.id)}
                className={cn(
                  "gap-1",
                  tool === t.id && "shadow-xs translate-x-[2px] translate-y-[2px]"
                )}
              >
                <t.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{t.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Layer control */}
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4" />
          <span className="text-sm font-bold uppercase">Couche Y:</span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onLayerChange(currentLayer - 1)}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center font-mono text-lg font-bold">
              {currentLayer}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onLayerChange(currentLayer + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Grid size */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold uppercase">Grille:</span>
          <select
            value={gridSize}
            onChange={(e) => onGridSizeChange(Number(e.target.value))}
            className="border-2 border-foreground bg-background px-2 py-1 font-mono text-sm"
          >
            <option value={8}>8x8</option>
            <option value={16}>16x16</option>
            <option value={32}>32x32</option>
            <option value={64}>64x64</option>
          </select>
        </div>

        {/* Layer actions */}
        <div className="flex gap-1">
          <Button variant="outline" size="sm" onClick={onFillLayer}>
            <Square className="h-4 w-4 mr-1" />
            Remplir couche
          </Button>
          <Button variant="outline" size="sm" onClick={onClearLayer}>
            <Trash2 className="h-4 w-4 mr-1" />
            Vider couche
          </Button>
        </div>

        {/* File actions */}
        <div className="flex gap-1 ml-auto">
          <Button variant="outline" size="sm" onClick={onImport}>
            <Upload className="h-4 w-4 mr-1" />
            Importer
          </Button>
          <Button variant="default" size="sm" onClick={onExport}>
            <Download className="h-4 w-4 mr-1" />
            Exporter
          </Button>
          <Button variant="destructive" size="sm" onClick={onClear}>
            <Trash2 className="h-4 w-4 mr-1" />
            Effacer tout
          </Button>
        </div>

        {/* Block count */}
        <div className="flex items-center gap-2 border-2 border-foreground bg-muted px-3 py-1">
          <span className="text-sm font-bold uppercase">Blocs:</span>
          <span className="font-mono text-lg font-bold">{blockCount}</span>
        </div>
      </div>
    </div>
  );
}
