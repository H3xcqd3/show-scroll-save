import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Authenticate via x-api-key header
    const apiKey = req.headers.get("x-api-key");
    if (!apiKey) {
      return json({ error: "Missing x-api-key header" }, 401);
    }

    const keyHash = await hashKey(apiKey);
    const { data: keyRow, error: keyError } = await supabase
      .from("api_keys")
      .select("user_id, revoked")
      .eq("key_hash", keyHash)
      .single();

    if (keyError || !keyRow) {
      return json({ error: "Invalid API key" }, 401);
    }
    if (keyRow.revoked) {
      return json({ error: "API key has been revoked" }, 401);
    }

    const userId = keyRow.user_id;

    // Update last_used_at
    await supabase.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("key_hash", keyHash);

    const url = new URL(req.url);
    const path = url.pathname.split("/").filter(Boolean).pop() || "";

    // GET /lists-api — return all lists with item counts
    if (req.method === "GET" && (path === "lists-api" || path === "")) {
      const listId = url.searchParams.get("list_id");

      if (listId) {
        // Return single list with items
        const { data: list, error: listErr } = await supabase
          .from("custom_lists")
          .select("*")
          .eq("id", listId)
          .eq("user_id", userId)
          .single();

        if (listErr || !list) return json({ error: "List not found" }, 404);

        const { data: items } = await supabase
          .from("custom_list_items")
          .select("*")
          .eq("list_id", listId)
          .order("added_at", { ascending: false });

        return json({ ...list, items: items || [] });
      }

      // Return all lists with item counts
      const { data: lists } = await supabase
        .from("custom_lists")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (!lists || lists.length === 0) return json([]);

      const listIds = lists.map(l => l.id);
      const { data: allItems } = await supabase
        .from("custom_list_items")
        .select("list_id")
        .in("list_id", listIds);

      const countMap: Record<string, number> = {};
      (allItems || []).forEach(i => { countMap[i.list_id] = (countMap[i.list_id] || 0) + 1; });

      return json(lists.map(l => ({ ...l, item_count: countMap[l.id] || 0 })));
    }

    return json({ error: "Not found" }, 404);
  } catch (err) {
    return json({ error: err.message }, 500);
  }
});
