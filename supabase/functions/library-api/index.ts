import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-api-key",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Authenticate via API key
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey) {
    return json({ error: "Missing x-api-key header" }, 401);
  }

  // Hash the key to compare
  const keyHash = await hashKey(apiKey);
  const { data: keyRow, error: keyError } = await supabase
    .from("api_keys")
    .select("user_id, revoked")
    .eq("key_hash", keyHash)
    .single();

  if (keyError || !keyRow || keyRow.revoked) {
    return json({ error: "Invalid or revoked API key" }, 401);
  }

  const userId = keyRow.user_id;

  // Update last_used_at
  await supabase
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("key_hash", keyHash);

  const url = new URL(req.url);
  const method = req.method;

  try {
    // GET /library-api - List library items
    if (method === "GET") {
      const status = url.searchParams.get("status");
      const mediaType = url.searchParams.get("media_type");

      let query = supabase
        .from("library")
        .select("*")
        .eq("user_id", userId)
        .order("added_at", { ascending: false });

      if (status) query = query.eq("status", status);
      if (mediaType) query = query.eq("media_type", mediaType);

      const { data, error } = await query;
      if (error) return json({ error: error.message }, 400);
      return json({ items: data });
    }

    // POST /library-api - Add item
    if (method === "POST") {
      const body = await req.json();
      const { tmdb_id, media_type, title, status, poster_path, vote_average, year } = body;

      if (!tmdb_id || !media_type || !title || !status) {
        return json({ error: "Missing required fields: tmdb_id, media_type, title, status" }, 400);
      }

      if (!["watchlist", "watching", "watched"].includes(status)) {
        return json({ error: "Invalid status. Must be: watchlist, watching, or watched" }, 400);
      }

      const row = {
        user_id: userId,
        tmdb_id,
        media_type,
        title,
        status,
        poster_path: poster_path || null,
        vote_average: vote_average || 0,
        year: year || null,
      };

      const { data, error } = await supabase
        .from("library")
        .upsert(row, { onConflict: "user_id,tmdb_id,media_type" })
        .select()
        .single();

      if (error) return json({ error: error.message }, 400);
      return json({ item: data }, 201);
    }

    // PUT /library-api?tmdb_id=X&media_type=Y - Update status
    if (method === "PUT") {
      const body = await req.json();
      const tmdbId = url.searchParams.get("tmdb_id");
      const mediaType = url.searchParams.get("media_type");

      if (!tmdbId || !mediaType) {
        return json({ error: "Query params tmdb_id and media_type required" }, 400);
      }

      const { status } = body;
      if (!status || !["watchlist", "watching", "watched"].includes(status)) {
        return json({ error: "Invalid status" }, 400);
      }

      const { data, error } = await supabase
        .from("library")
        .update({ status })
        .eq("user_id", userId)
        .eq("tmdb_id", parseInt(tmdbId))
        .eq("media_type", mediaType)
        .select()
        .single();

      if (error) return json({ error: error.message }, 400);
      return json({ item: data });
    }

    // DELETE /library-api?tmdb_id=X&media_type=Y - Remove item
    if (method === "DELETE") {
      const tmdbId = url.searchParams.get("tmdb_id");
      const mediaType = url.searchParams.get("media_type");

      if (!tmdbId || !mediaType) {
        return json({ error: "Query params tmdb_id and media_type required" }, 400);
      }

      const { error } = await supabase
        .from("library")
        .delete()
        .eq("user_id", userId)
        .eq("tmdb_id", parseInt(tmdbId))
        .eq("media_type", mediaType);

      if (error) return json({ error: error.message }, 400);
      return json({ success: true });
    }

    return json({ error: "Method not allowed" }, 405);
  } catch (err) {
    return json({ error: "Internal server error" }, 500);
  }
});

async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
