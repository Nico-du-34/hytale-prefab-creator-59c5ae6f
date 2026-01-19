import { Blocks } from "lucide-react";

export function Header() {
  return (
    <header className="border-b-4 border-foreground bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="bg-foreground text-background p-2 shadow-sm">
            <Blocks className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-tight">
              Hytale Prefab Generator
            </h1>
            <p className="text-sm text-muted-foreground font-mono">
              Créez vos structures bloc par bloc
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
