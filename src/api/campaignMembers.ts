import { supabase } from "./supabaseClient";

export type CampaignMemberRole = 'dm' | 'co_dm' | 'player';

export interface CampaignMember {
    id: string;
    campaign_id: string;
    user_id; string;
    role: CampaignMemberRole;
}

export async function fetchCampaignMembers(
    campaignId: string
): Promise<CampaignMember[]> {
    const { data, error } = await supabase
        .from('campaign_members')
        .select('id, campaign_id, user_id, role')
        .eq('campaign_id', campaignId);

    if (error) {
        console.error('fetchCampaignMembers error', error);
        throw error;
    }

    return (data ?? []) as CampaignMember[];
}