import { supabase } from './supabaseClient';

export type Session = {
    id: string;
    campaign_id: string;
    title: string;
    start_at: string;
    scheduled_end: string | null;
    location: string | null;
    status: 'planned' | 'completed' | 'cancelled';
    created_at: string;
};

export async function fetchSessions(campaignId: string): Promise<Session[]> {
    const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('start_at', { ascending: true });
    
    if (error) {
        console.error('Error fetching sessions:', error);
        throw error;
    }

    return (data ?? []) as Session[];
}

export async function createSession(
    campaignId: string,
    title: string,
    startAt: string,
    location?: string
): Promise<Session> {
    const { data, error } = await supabase
        .from('sessions')
        .insert({
            campaign_id: campaignId,
            title,
            start_at: startAt,
            location: location ?? null,
        })
        .select('*')
        .single()
    
    if (error) {
        console.log('Error creating session:', error);
        throw error;
    }

    return data as Session;
}