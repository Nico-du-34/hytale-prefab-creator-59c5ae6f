import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const HYTALE_BLOCKS = [
  "Stone", "Cobblestone", "Granite", "Diorite", "Andesite", "Basalt", "Obsidian",
  "Oak_Wood", "Birch_Wood", "Spruce_Wood", "Dark_Oak_Wood", "Oak_Planks", "Birch_Planks",
  "Iron_Block", "Gold_Block", "Diamond_Block", "Copper_Block",
  "Glass", "Tinted_Glass", "Stained_Glass_Red", "Stained_Glass_Blue",
  "Brick", "Stone_Brick", "Mossy_Stone_Brick", "Chiseled_Stone_Brick",
  "Dirt", "Grass", "Sand", "Gravel", "Clay",
  "Water", "Lava", "Ice", "Snow", "Moss",
  "Glowstone", "Torch", "Lantern", "Redstone_Lamp",
  "Wool_White", "Wool_Red", "Wool_Blue", "Wool_Green"
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, gridSize = 16 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!prompt || typeof prompt !== 'string') {
      return new Response(
        JSON.stringify({ error: "Le prompt est requis" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Generating prefab for prompt: "${prompt}" with gridSize: ${gridSize}`);

    const systemPrompt = `Tu es un générateur de structures 3D pour le jeu Hytale. Tu dois générer des prefabs (structures de blocs) en JSON.

RÈGLES IMPORTANTES:
1. Génère UNIQUEMENT un tableau JSON de blocs, rien d'autre
2. Chaque bloc a: x, y, z (coordonnées entières) et name (nom du bloc)
3. Utilise UNIQUEMENT ces blocs: ${HYTALE_BLOCKS.join(", ")}
4. Les coordonnées doivent être dans la plage [-${Math.floor(gridSize/2)}, ${Math.floor(gridSize/2) - 1}]
5. Y=0 est le sol, Y augmente vers le haut
6. Génère des structures cohérentes et détaillées
7. Maximum 500 blocs pour des raisons de performance

EXEMPLES DE STRUCTURES:
- Maison: murs en Brick ou Stone_Brick, toit en Oak_Planks, sol en Oak_Planks
- Tour: base en Stone_Brick, corps en Cobblestone, créneaux
- Arbre: tronc en Oak_Wood, feuilles autour du sommet
- Pont: piliers en Stone, surface en Oak_Planks

RÉPONDS UNIQUEMENT AVEC LE JSON, pas d'explication.
Format attendu: [{"x": 0, "y": 0, "z": 0, "name": "Stone"}, ...]`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Génère une structure: ${prompt}` }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Trop de requêtes, réessayez plus tard." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Crédits insuffisants. Ajoutez des crédits à votre espace de travail." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Erreur du service IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    console.log("AI response:", content.substring(0, 200));

    // Parse the JSON response
    let blocks;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        blocks = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON array found");
      }
    } catch (parseError) {
      console.error("Parse error:", parseError);
      return new Response(
        JSON.stringify({ error: "Impossible de parser la réponse de l'IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate blocks
    const validBlocks = blocks.filter((b: any) => 
      typeof b.x === 'number' && 
      typeof b.y === 'number' && 
      typeof b.z === 'number' && 
      typeof b.name === 'string'
    ).slice(0, 500); // Limit to 500 blocks

    console.log(`Generated ${validBlocks.length} valid blocks`);

    return new Response(
      JSON.stringify({ blocks: validBlocks }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Generate prefab error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erreur inconnue" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
