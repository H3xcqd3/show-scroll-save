import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get auth user
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const user = { id: claimsData.claims.sub as string };

    // Fetch user's watched library for context
    const { data: library } = await supabase
      .from("library")
      .select("title, media_type, status, user_rating, genres, year")
      .eq("user_id", user.id)
      .order("added_at", { ascending: false })
      .limit(100);

    if (!library || library.length === 0) {
      return new Response(
        JSON.stringify({
          recommendations: "You haven't added anything to your library yet! Start by marking some movies or TV shows as watched, and I'll give you personalized recommendations.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build context
    const watched = library.filter((i: any) => i.status === "watched");
    const watchlist = library.filter((i: any) => i.status === "watchlist");

    const watchedTitles = watched.map((i: any) => {
      let s = `${i.title} (${i.media_type}, ${i.year || "unknown year"})`;
      if (i.user_rating) s += ` - rated ${i.user_rating}/10`;
      if (i.genres?.length) s += ` [${i.genres.join(", ")}]`;
      return s;
    }).join("\n");

    const watchlistTitles = watchlist.map((i: any) => i.title).join(", ");

    const prompt = `You are a movie and TV recommendation expert. Based on the user's viewing history and ratings, suggest 10 movies or TV shows they would enjoy. Be specific about WHY they'd like each one based on patterns in their taste.

WATCHED:
${watchedTitles || "None yet"}

ALREADY ON WATCHLIST (don't suggest these):
${watchlistTitles || "None"}

Give recommendations as a numbered list with title, year, type (movie/TV), and a brief reason why they'd like it based on their taste. Be conversational and fun.`;

    // Call AI via Lovable AI gateway
    const aiResponse = await fetch("https://ai-gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableApiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1500,
      }),
    });

    if (!aiResponse.ok) {
      const errBody = await aiResponse.text();
      throw new Error(`AI API call failed [${aiResponse.status}]: ${errBody}`);
    }

    const aiData = await aiResponse.json();
    const recommendations = aiData.choices?.[0]?.message?.content || "Unable to generate recommendations at this time.";

    return new Response(
      JSON.stringify({ recommendations }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
