import { supabase } from './supabaseClient';

export type Session = {
    id: string;
    campaign_id: string;
    title: string;
    scheduled_start: string;
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
        .order('scheduled_start', { ascending: true });
    
    if (error) {
        console.error('Error fetching sessions:', error);
        throw error;
    }

    return (data ?? []) as Session[];
}

export async function createSession(
    campaignId: string,
    title: string,
    scheduledStart: string,
    location?: string
): Promise<Session> {
    const { data, error } = await supabase
        .from('sessions')
        .insert({
            campaign_id: campaignId,
            title,
            scheduled_start: scheduledStart,
            location: location ?? null,
            status: 'planned',
        })
        .select('*')
        .single()
    
    if (error) {
        console.log('Error creating session:', error);
        throw error;
    }

    return data as Session;
}