import { useState } from "react";
import { HYTALE_BLOCKS, BLOCK_CATEGORIES } from "@/lib/hytaleBlocks";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search, ChevronDown, ChevronRight } from "lucide-react";

interface BlockPaletteProps {
  selectedBlock: string;
  onSelectBlock: (name: string) => void;
}

export function BlockPalette({ selectedBlock, onSelectBlock }: BlockPaletteProps) {
  const [search, setSearch] = useState("");
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (category: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const filteredBlocks = search
    ? HYTALE_BLOCKS.filter((b) =>
        b.name.toLowerCase().replace(/_/g, " ").includes(search.toLowerCase())
      )
    : HYTALE_BLOCKS;

  const categoriesToShow = search
    ? [...new Set(filteredBlocks.map((b) => b.category))]
    : BLOCK_CATEGORIES;

  return (
    <div className="border-2 border-foreground bg-card shadow-md">
      <div className="p-3 border-b-2 border-foreground">
        <h3 className="mb-3 text-base font-bold uppercase tracking-wide">Blocs</h3>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 border-2 border-foreground/50 focus:border-foreground"
          />
        </div>
      </div>
      
      <ScrollArea className="h-[350px]">
        <div className="p-3 space-y-2">
          {categoriesToShow.map((category) => {
            const categoryBlocks = filteredBlocks.filter((b) => b.category === category);
            if (categoryBlocks.length === 0) return null;
            
            const isCollapsed = collapsedCategories.has(category);
            
            return (
              <div key={category} className="border-2 border-foreground/30 rounded overflow-hidden">
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-muted/50 hover:bg-muted transition-colors"
                >
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {categoryBlocks.length}
                    </span>
                    {isCollapsed ? (
                      <ChevronRight className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </button>
                
                {!isCollapsed && (
                  <div className="p-2 grid grid-cols-4 gap-1.5 bg-background/50">
                    {categoryBlocks.map((block) => (
                      <button
                        key={block.name}
                        onClick={() => onSelectBlock(block.name)}
                        title={block.name.replace(/_/g, " ")}
                        className={cn(
                          "group relative aspect-square transition-all duration-150",
                          selectedBlock === block.name
                            ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110 z-10"
                            : "hover:scale-105"
                        )}
                      >
                        {/* Block visual with 3D effect */}
                        <div className="relative w-full h-full">
                          {/* Top face */}
                          <div
                            className="absolute inset-0 rounded-sm border border-foreground/20"
                            style={{
                              backgroundColor: `hsl(${block.color})`,
                              clipPath: "polygon(15% 0%, 85% 0%, 100% 15%, 100% 100%, 0% 100%, 0% 15%)",
                            }}
                          />
                          {/* Highlight (top-left) */}
                          <div
                            className="absolute top-0 left-0 w-full h-full rounded-sm opacity-30"
                            style={{
                              background: `linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%)`,
                            }}
                          />
                          {/* Shadow (bottom-right) */}
                          <div
                            className="absolute top-0 left-0 w-full h-full rounded-sm opacity-40"
                            style={{
                              background: `linear-gradient(315deg, rgba(0,0,0,0.3) 0%, transparent 50%)`,
                            }}
                          />
                          {/* Border */}
                          <div className="absolute inset-0 rounded-sm border-2 border-foreground/30 group-hover:border-foreground/60 transition-colors" />
                        </div>
                        
                        {/* Selected indicator */}
                        {selectedBlock === block.name && (
                          <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary border-2 border-background" />
                        )}
                        
                        {/* Tooltip on hover */}
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                          <div className="bg-foreground text-background text-[10px] px-2 py-1 rounded whitespace-nowrap">
                            {block.name.replace(/_/g, " ")}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
      
      {/* Selected block preview */}
      <div className="p-3 border-t-2 border-foreground bg-muted/30">
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded border-2 border-foreground shadow-sm relative overflow-hidden"
            style={{
              backgroundColor: `hsl(${HYTALE_BLOCKS.find((b) => b.name === selectedBlock)?.color || "0 0% 50%"})`,
            }}
          >
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background: `linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%)`,
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">
              {selectedBlock.replace(/_/g, " ")}
            </p>
            <p className="text-xs text-muted-foreground">
              {HYTALE_BLOCKS.find((b) => b.name === selectedBlock)?.category}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
