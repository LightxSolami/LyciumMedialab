import { createClient } from "@supabase/supabase-js";
import type { PublicSupabaseConfig } from "../../config";

export function createPublicSupabaseClient(config: PublicSupabaseConfig) {
  return createClient(config.url, config.key);
}
