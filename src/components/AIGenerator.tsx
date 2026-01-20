import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PrefabBlock } from "@/lib/prefabTypes";

interface AIGeneratorProps {
  gridSize: number;
  onGenerated: (blocks: PrefabBlock[]) => void;
}

export function AIGenerator({ gridSize, onGenerated }: AIGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt requis",
        description: "Décrivez la structure que vous voulez générer.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-prefab`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ prompt: prompt.trim(), gridSize }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la génération");
      }

      if (data.blocks && data.blocks.length > 0) {
        onGenerated(data.blocks);
        toast({
          title: "Génération réussie!",
          description: `${data.blocks.length} blocs générés par l'IA.`,
        });
        setPrompt("");
      } else {
        throw new Error("Aucun bloc généré");
      }
    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "Erreur de génération",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    "Une petite maison en pierre avec un toit en bois",
    "Une tour de guet médiévale",
    "Un arbre avec des feuilles",
    "Un pont en pierre et bois",
    "Un puits de village",
    "Une fontaine décorative",
  ];

  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-primary" />
          Génération IA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          placeholder="Décrivez la structure que vous voulez créer... Ex: Une maison médiévale avec un toit en pente"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[80px] resize-none bg-background/50"
          disabled={isLoading}
        />
        
        <div className="flex flex-wrap gap-1.5">
          {suggestions.slice(0, 3).map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setPrompt(suggestion)}
              disabled={isLoading}
              className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isLoading || !prompt.trim()}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Génération en cours...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Générer avec l'IA
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
