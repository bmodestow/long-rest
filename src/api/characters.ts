import { supabase } from './supabaseClient';

export type CharacterRole = 'pc' | 'npc';

export interface Character{
    id: string;
    campaign_id: string;
    name: string;
    is_npc: boolean;
    class_name: string | null;
    level: number | null;
    portrait_url: string | null;
    notes: string | null;
    player_name: string | null;
}

export async function fetchCharactersForCampaign(
    campaignId: string
): Promise<Character[]> {
    const { data, error } = await supabase
        .from('characters')
        .select(
            `
            id,
            campaign_id,
            name,
            is_npc,
            class,
            level,
            portrait_url,
            notes
            `
        )
        .eq('campaign_id', campaignId)
        .order('is_npc', { ascending: true })
        .order('name', { ascending: true });

    if (error) {
        console.error('fetchCharactersForCampaign error', error);
        throw error;
    }

    const mapped: Character[] =
        (data ?? []).map((row: any) => ({
            id: row.id,
            campaign_id: row.campaign_id,
            name: row.name,
            is_npc: row.is_npc ?? false,
            class_name: row.class_name ?? null,
            level: row.level ?? null,
            portrait_url: row.portrait_url ?? null,
            notes: row.notes ?? null, // placeholder until FK fixed
            player_name: null,
        })) ?? [];

    return mapped;
}