import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const HYTALE_BLOCKS = [
  "Stone", "Stone_Brick", "Stone_Cobble", "Cobblestone", "Granite", "Diorite", "Andesite", "Basalt", "Obsidian",
  "Wood_Oak", "Wood_Birch", "Wood_Spruce", "Wood_Dark_Oak", "Wood_Planks_Oak", "Wood_Planks_Birch", "Wood_Planks_Spruce",
  "Iron_Block", "Gold_Block", "Diamond_Block", "Copper_Block",
  "Glass", "Glass_White", "Glass_Red", "Glass_Blue", "Glass_Green",
  "Brick_Red", "Brick_Brown", "Brick_Stone",
  "Soil", "Soil_Grass", "Sand", "Gravel", "Clay",
  "Water", "Lava", "Ice", "Snow", "Moss",
  "Glow_Stone", "Leaves_Oak", "Leaves_Birch",
  "Wool_White", "Wool_Red", "Wool_Blue", "Wool_Green",
  "Tile_Roof_Red", "Tile_Roof_Blue", "Thatch"
];

async function callAIWithRetry(apiKey: string, systemPrompt: string, userPrompt: string, maxRetries = 3): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`AI call attempt ${attempt}/${maxRetries}`);
      
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.7,
        }),
      });

      // If we get a successful response or a client error (4xx), return it
      if (response.ok || (response.status >= 400 && response.status < 500)) {
        return response;
      }

      // For 5xx errors, we retry
      const errorText = await response.text();
      console.error(`Attempt ${attempt} failed with status ${response.status}:`, errorText.substring(0, 200));
      lastError = new Error(`HTTP ${response.status}`);
      
      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 500; // 1s, 2s, 4s
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } catch (error) {
      console.error(`Attempt ${attempt} threw error:`, error);
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 500;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error("All retry attempts failed");
}

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
- Maison: murs en Brick_Red ou Stone_Brick, toit en Tile_Roof_Red ou Wood_Planks_Oak, sol en Wood_Planks_Oak
- Tour: base en Stone_Brick, corps en Stone_Cobble, créneaux
- Arbre: tronc en Wood_Oak, feuilles en Leaves_Oak autour du sommet
- Pont: piliers en Stone, surface en Wood_Planks_Oak

RÉPONDS UNIQUEMENT AVEC LE JSON, pas d'explication.
Format attendu: [{"x": 0, "y": 0, "z": 0, "name": "Stone"}, ...]`;

    const response = await callAIWithRetry(
      LOVABLE_API_KEY,
      systemPrompt,
      `Génère une structure: ${prompt}`
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Trop de requêtes, réessayez dans quelques secondes." }),
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
      console.error("AI gateway error after retries:", response.status, errorText.substring(0, 200));
      return new Response(
        JSON.stringify({ error: "Erreur du service IA, veuillez réessayer." }),
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
        JSON.stringify({ error: "Impossible de parser la réponse de l'IA, veuillez réessayer." }),
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
      JSON.stringify({ error: error instanceof Error ? error.message : "Erreur inconnue, veuillez réessayer." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
