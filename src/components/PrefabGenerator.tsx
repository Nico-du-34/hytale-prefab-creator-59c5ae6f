import { useRef } from "react";
import { usePrefabEditor } from "@/hooks/usePrefabEditor";
import { BlockPalette } from "./BlockPalette";
import { EditorToolbar } from "./EditorToolbar";
import { GridEditor } from "./GridEditor";
import { Preview3D } from "./Preview3D";
import { AIGenerator } from "./AIGenerator";
import { exportPrefab, importPrefab, PrefabBlock } from "@/lib/prefabTypes";
import { useToast } from "@/hooks/use-toast";

export function PrefabGenerator() {
  const {
    prefab,
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
  } = usePrefabEditor();

  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const json = exportPrefab(prefab);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "prefab.prefab.json";
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Exporté!",
      description: `${prefab.blocks.length} blocs exportés avec succès.`,
    });
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const imported = importPrefab(content);
      if (imported) {
        loadPrefab(imported);
        toast({
          title: "Importé!",
          description: `${imported.blocks.length} blocs importés avec succès.`,
        });
      } else {
        toast({
          title: "Erreur",
          description: "Fichier prefab invalide.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleClear = () => {
    if (prefab.blocks.length > 0) {
      clearPrefab();
      toast({
        title: "Effacé",
        description: "Tous les blocs ont été supprimés.",
      });
    }
  };

  const handleFillLayer = () => {
    fillLayer(currentLayer, selectedBlock, gridSize);
    toast({
      title: "Couche remplie",
      description: `Couche Y=${currentLayer} remplie avec ${selectedBlock}.`,
    });
  };

  const handleClearLayer = () => {
    clearLayer(currentLayer);
    toast({
      title: "Couche vidée",
      description: `Couche Y=${currentLayer} vidée.`,
    });
  };

  const handleAIGenerated = (blocks: PrefabBlock[], replaceAll: boolean) => {
    if (replaceAll) {
      clearPrefab();
    }
    blocks.forEach((block) => {
      addBlock(block.x, block.y, block.z, block.name);
    });
  };

  return (
    <div className="flex flex-col gap-4 p-4 min-h-screen">
      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Toolbar */}
      <EditorToolbar
        tool={tool}
        onToolChange={setTool}
        currentLayer={currentLayer}
        onLayerChange={setCurrentLayer}
        gridSize={gridSize}
        onGridSizeChange={setGridSize}
        onExport={handleExport}
        onImport={handleImport}
        onClear={handleClear}
        onFillLayer={handleFillLayer}
        onClearLayer={handleClearLayer}
        blockCount={prefab.blocks.length}
      />

      {/* Main content */}
      <div className="flex flex-col lg:flex-row gap-4 flex-1">
        {/* Block palette + AI Generator */}
        <div className="lg:w-72 shrink-0 space-y-4">
          <AIGenerator gridSize={gridSize} onGenerated={handleAIGenerated} />
          <BlockPalette
            selectedBlock={selectedBlock}
            onSelectBlock={setSelectedBlock}
          />
        </div>

        {/* Grid editor */}
        <div className="flex-1 flex items-start justify-center">
          <GridEditor
            layerBlocks={getLayerBlocks(currentLayer)}
            gridSize={gridSize}
            currentLayer={currentLayer}
            tool={tool}
            selectedBlock={selectedBlock}
            onPlaceBlock={addBlock}
            onRemoveBlock={removeBlock}
            getBlockAt={getBlockAt}
          />
        </div>

        {/* 3D Preview */}
        <div className="lg:w-80 shrink-0">
          <Preview3D prefab={prefab} currentLayer={currentLayer} />
        </div>
      </div>
    </div>
  );
}
