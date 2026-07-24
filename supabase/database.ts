import { createSupabaseBrowserClient } from './client';
import type { Database } from './database.types';

const supabase = createSupabaseBrowserClient();

export async function getMembers() {
  return supabase.from('big_members').select('*').order('points', { ascending: false });
}

export async function getPosts() {
  return supabase.from('big_posts').select('*').order('timestamp', { ascending: false });
}

export async function getEvents() {
  return supabase.from('big_events').select('*').order('date', { ascending: true });
}

export async function upsertMember(member: Database['public']['Tables']['big_members']['Insert']) {
  return supabase.from('big_members').upsert(member as any, { onConflict: 'id' } as any);
}

export async function upsertEvent(event: Database['public']['Tables']['big_events']['Insert']) {
  return supabase.from('big_events').upsert(event as any, { onConflict: 'id' } as any);
}
