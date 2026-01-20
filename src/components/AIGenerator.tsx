import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Loader2, User, Bot, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PrefabBlock } from "@/lib/prefabTypes";
import { cn } from "@/lib/utils";

interface AIGeneratorProps {
  gridSize: number;
  onGenerated: (blocks: PrefabBlock[]) => void;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  blocksGenerated?: number;
  timestamp: Date;
}

export function AIGenerator({ gridSize, onGenerated }: AIGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 15;
        });
      }, 300);
    } else {
      setProgress(100);
      const timeout = setTimeout(() => setProgress(0), 500);
      return () => clearTimeout(timeout);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt requis",
        description: "Décrivez la structure que vous voulez générer.",
        variant: "destructive",
      });
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: prompt.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    const currentPrompt = prompt.trim();
    setPrompt("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-prefab`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ prompt: currentPrompt, gridSize }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la génération");
      }

      if (data.blocks && data.blocks.length > 0) {
        onGenerated(data.blocks);
        
        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `J'ai généré une structure avec ${data.blocks.length} blocs ! La structure a été ajoutée à l'éditeur.`,
          blocksGenerated: data.blocks.length,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        
        toast({
          title: "Génération réussie!",
          description: `${data.blocks.length} blocs générés par l'IA.`,
        });
      } else {
        throw new Error("Aucun bloc généré");
      }
    } catch (error) {
      console.error("Generation error:", error);
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Désolé, je n'ai pas pu générer cette structure. ${error instanceof Error ? error.message : "Une erreur est survenue"}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      
      toast({
        title: "Erreur de génération",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const suggestions = [
    "Maison médiévale",
    "Tour de guet",
    "Pont en pierre",
    "Arbre géant",
    "Fontaine",
    "Puits",
  ];

  return (
    <Card className="border-2 border-foreground bg-card shadow-md">
      <CardHeader className="pb-2 border-b-2 border-foreground">
        <CardTitle className="flex items-center gap-2 text-base font-bold uppercase tracking-wide">
          <Sparkles className="h-4 w-4 text-primary" />
          Génération IA
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Progress bar */}
        {isLoading && (
          <div className="px-3 pt-3">
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Génération en cours...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>
        )}

        {/* Chat history */}
        <ScrollArea className="h-[200px] px-3 pt-3" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <Sparkles className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">Décrivez une structure à générer</p>
              <p className="text-xs mt-1">Ex: "Une maison en pierre avec un toit en bois"</p>
            </div>
          ) : (
            <div className="space-y-3 pb-2">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-2",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="h-6 w-6 rounded border-2 border-foreground bg-primary flex items-center justify-center shrink-0">
                      <Bot className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[85%] rounded border-2 border-foreground px-3 py-2",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <p className="text-sm">{message.content}</p>
                    {message.blocksGenerated && (
                      <div className="mt-1 text-xs opacity-70">
                        🧱 {message.blocksGenerated} blocs
                      </div>
                    )}
                  </div>
                  {message.role === "user" && (
                    <div className="h-6 w-6 rounded border-2 border-foreground bg-secondary flex items-center justify-center shrink-0">
                      <User className="h-3 w-3" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2 justify-start">
                  <div className="h-6 w-6 rounded border-2 border-foreground bg-primary flex items-center justify-center shrink-0">
                    <Bot className="h-3 w-3 text-primary-foreground" />
                  </div>
                  <div className="rounded border-2 border-foreground px-3 py-2 bg-muted">
                    <div className="flex gap-1">
                      <span className="animate-bounce">●</span>
                      <span className="animate-bounce" style={{ animationDelay: "0.1s" }}>●</span>
                      <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>●</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Quick suggestions */}
        {messages.length === 0 && (
          <div className="px-3 pt-2">
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setPrompt(suggestion)}
                  disabled={isLoading}
                  className="text-xs px-2 py-1 rounded border border-foreground/50 bg-background hover:bg-accent hover:border-foreground transition-colors disabled:opacity-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="p-3 border-t-2 border-foreground mt-2">
          <div className="flex gap-2">
            <Textarea
              placeholder="Décrivez votre structure..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[60px] max-h-[100px] resize-none border-2 border-foreground/50 focus:border-foreground"
              disabled={isLoading}
            />
            <Button
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim()}
              size="icon"
              className="h-[60px] w-12 shrink-0"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
