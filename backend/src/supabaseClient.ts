import { createClient } from "@supabase/supabase-js";
import { config } from "./config";

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
  },
);

export default supabase;
