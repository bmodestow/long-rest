import { supabase } from './supabaseClient';

export type SessionResponseSummary = {
    yes: number;
    no: number;
};

export async function fetchSessionResponseSummaries(sessionIds: string []) {
    if (sessionIds.length === 0) return {};

    const { data, error } = await supabase
        .from('session_responses')
        .select('session_id, response')
        .in('session_id', sessionIds);

    if (error) throw error;

    const summaries: Record<string, SessionResponseSummary> = {};

    for (const row of data ?? []) {
        const sessionId = (row as any).session_id as string;
        const response = (row as any).response as 'yes' | 'no';

        if (!summaries[sessionId]) summaries[sessionId] = { yes: 0, no: 0 };
        if (response === 'yes') summaries[sessionId].yes += 1;
        else if (response === 'no') summaries[sessionId].no += 1;
    }

    return summaries;
}