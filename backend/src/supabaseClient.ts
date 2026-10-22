import { createClient } from "@supabase/supabase-js";
import { config } from "./config";
import WebSocket from "ws";

// Use the service role key on the backend so we can bypass RLS for server-side writes.
// Never expose this key to the frontend.
const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      // Provide ws package as WebSocket implementation for Node.js environments
      // that don't have native WebSocket (Node < 21)
      fetch: fetch,
    },
    realtime: {
      transport: WebSocket,
    },
  },
);

export default supabase;
