import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

export function createSupabaseAdminClient(config: ConfigService): SupabaseClient {
  return createClient(
    config.getOrThrow<string>('SUPABASE_URL'),
    config.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY'),
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

export function createSupabaseAnonClient(config: ConfigService): SupabaseClient {
  return createClient(
    config.getOrThrow<string>('SUPABASE_URL'),
    config.getOrThrow<string>('SUPABASE_ANON_KEY'),
  );
}
