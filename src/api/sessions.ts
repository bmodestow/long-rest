// src/api/sessions.ts
import { supabase } from './supabaseClient';

export type ScheduleStatus = 'proposed' | 'final';

export type Session = {
  id: string;
  campaign_id: string;
  title: string;

  // Proposed time
  start_at: string;

  // Finalized time (nullable until finalized)
  final_start_at: string | null;

  scheduled_end: string | null;
  location: string | null;

  status: 'planned' | 'completed' | 'cancelled';
  schedule_status: ScheduleStatus;

  created_at: string;
};

export function getEffectiveStartAt(s: Pick<Session, 'start_at' | 'final_start_at'>) {
  return s.final_start_at ?? s.start_at;
}

export async function fetchSessions(campaignId: string): Promise<Session[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching sessions:', error);
    throw error;
  }

  const rows = (data ?? []) as Session[];
  rows.sort((a, b) => {
    const aT = new Date(getEffectiveStartAt(a)).getTime();
    const bT = new Date(getEffectiveStartAt(b)).getTime();
    return aT - bT;
  });

  return rows;
}

export async function createSession(
  campaignId: string,
  title: string,
  proposedStartAt: string,
  location?: string
): Promise<Session> {
  const { data, error } = await supabase
    .from('sessions')
    .insert({
      campaign_id: campaignId,
      title,
      start_at: proposedStartAt,
      location: location ?? null,
      schedule_status: 'proposed',
      final_start_at: null,
    })
    .select('*')
    .single();

  if (error) {
    console.log('Error creating session:', error);
    throw error;
  }

  return data as Session;
}

export async function setProposedTime(sessionId: string, proposedStartAt: string) {
  const { error } = await supabase
    .from('sessions')
    .update({
      start_at: proposedStartAt,
      schedule_status: 'proposed',
      final_start_at: null,
    })
    .eq('id', sessionId);

  if (error) throw error;
}

export async function finalizeSession(sessionId: string) {
  const { error } = await supabase.rpc('finalize_session', {
    _session_id: sessionId,
  });

  if (error) throw error;
}
