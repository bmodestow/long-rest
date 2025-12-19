import { supabase } from './supabaseClient';

export type SessionResponseValue = 'yes' | 'no';

export type SessionResponse = {
    id: string;
    session_id: string;
    user_id: string;
    response: SessionResponseValue;
    created_at: string;
    updated_at: string;
};

export async function upsertSessionResponse(
    sessionId: string,
    response: SessionResponseValue
) {
    const { data: userRes } = await supabase.auth.getUser();
    const userId = userRes.user?.id;
    if (!userId) throw new Error('Not authenticated');

    const { error } = await supabase
        .from('session_responses')
        .upsert(
            { session_id: sessionId, user_id: userId, response },
            { onConflict: 'session_id,user_id' }
        );

    if (error) throw error;
}

export async function fetchSessionResponses(sessionId: string) {
    const { data, error } = await supabase
        .from('session_responses')
        .select('*')
        .eq('session_id', sessionId);

    if (error) throw error;
    return (data ?? []) as SessionResponse[];
}