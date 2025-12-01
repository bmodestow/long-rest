import { supabase } from './supabaseClient';

export type SessionRecap = {
    id: string;
    session_id: string;
    author_id: string;
    content: string;
    is_published: boolean;
    created_at: string;
    updated_at: string | null;
};

export async function fetchRecapForSession(
    sessionId: string
): Promise<SessionRecap | null> {
    const { data, error } = await supabase
        .from('session_recaps')
        .select('*')
        .eq('session_id', sessionId)
        .maybeSingle();

    if (error) {
        // if no row, maybeSingle returns data = null, error = null
        console.error('Error fetching recap:', error);
        throw error;
    }

    return data as SessionRecap | null;
}

export async function saveRecapForSession(
    sessionId: string,
    content: string,
    isPublished: boolean
): Promise<SessionRecap> {
    const { data, error } = await supabase.rpc('upsert_session_recap', {
        _session_id: sessionId,
        _content: content,
        _is_published: isPublished,
    });

    if (error) {
        console.error('Error saving recap:', error);
        throw error;
    }

    return data as SessionRecap;
}