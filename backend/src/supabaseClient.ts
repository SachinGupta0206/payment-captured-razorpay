import { createClient } from "@supabase/supabase-js";
import { config } from "./config";
import WebSocket from "ws";

// Polyfill WebSocket on globalThis for Node.js environments (Node < 21)
// so Supabase Realtime can pick it up without needing the realtime.transport option.
if (!globalThis.WebSocket) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).WebSocket = WebSocket;
}

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
  },
);

export default supabase;
