import { HYTALE_BLOCKS, BLOCK_CATEGORIES } from "@/lib/hytaleBlocks";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface BlockPaletteProps {
  selectedBlock: string;
  onSelectBlock: (name: string) => void;
}

export function BlockPalette({ selectedBlock, onSelectBlock }: BlockPaletteProps) {
  return (
    <div className="border-2 border-foreground bg-card p-4 shadow-md">
      <h3 className="mb-4 text-lg font-bold uppercase tracking-wide">Blocs</h3>
      <ScrollArea className="h-[400px] pr-4">
        {BLOCK_CATEGORIES.map((category) => (
          <div key={category} className="mb-4">
            <h4 className="mb-2 text-sm font-semibold text-muted-foreground uppercase">
              {category}
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {HYTALE_BLOCKS.filter((b) => b.category === category).map((block) => (
                <button
                  key={block.name}
                  onClick={() => onSelectBlock(block.name)}
                  className={cn(
                    "group flex flex-col items-center gap-1 p-2 border-2 transition-all duration-150",
                    selectedBlock === block.name
                      ? "border-foreground bg-accent shadow-xs translate-x-[2px] translate-y-[2px]"
                      : "border-foreground/50 hover:border-foreground hover:shadow-2xs hover:-translate-x-[1px] hover:-translate-y-[1px]"
                  )}
                >
                  <div
                    className="h-8 w-8 border-2 border-foreground"
                    style={{ backgroundColor: `hsl(${block.color})` }}
                  />
                  <span className="text-[10px] font-mono leading-tight text-center truncate w-full">
                    {block.name.replace(/_/g, " ")}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
}
