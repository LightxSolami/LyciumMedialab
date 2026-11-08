export type PublicSupabaseConfig = {
  url: string;
  key: string;
};

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

export const publicSupabaseConfig: PublicSupabaseConfig | null =
  url && key ? { url, key } : null;
