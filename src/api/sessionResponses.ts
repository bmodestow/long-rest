// src/api/sessionResponses.ts
import { supabase } from './supabaseClient';

export type SessionResponseValue = 'yes' | 'no';

export type SessionResponse = {
  id?: string;
  session_id: string;
  user_id: string;
  response: SessionResponseValue;
  created_at?: string;
  updated_at?: string;
};

export async function fetchSessionResponses(sessionId: string): Promise<SessionResponse[]> {
  const { data, error } = await supabase
    .from('session_responses')
    .select('*')
    .eq('session_id', sessionId)
    .order('responded_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as SessionResponse[];
}

export async function upsertSessionResponse(sessionId: string, response: SessionResponseValue) {
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userRes.user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('session_responses')
    .upsert(
      { session_id: sessionId, 
        user_id: userRes.user.id, 
        response,
        responded_at: new Date().toISOString(), 
      },
      { onConflict: 'session_id,user_id' }
    );

  if (error) throw error;
}

/**
 * NEW: Fetch current user's responses for many sessions.
 * Returns: { [sessionId]: 'yes' | 'no' }
 */
export async function fetchMySessionResponseMap(
  sessionIds: string[]
): Promise<Record<string, SessionResponseValue>> {
  const ids = (sessionIds ?? []).filter(Boolean);
  if (ids.length === 0) return {};

  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userRes.user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('session_responses')
    .select('session_id, response')
    .eq('user_id', userRes.user.id)
    .in('session_id', ids);

  if (error) throw error;

  const map: Record<string, SessionResponseValue> = {};
  (data ?? []).forEach((row: any) => {
    if (row?.session_id && row?.response) map[row.session_id] = row.response;
  });
  return map;
}
