import { supabase } from "./supabaseClient";

export type CampaignInvite = {
    id: string;
    campaign: string;
    code: string;
    created_by: string;
    created_at: string;_
}

export async function fetchInvites(campaignId: string): Promise<CampaignInvite[]> {
    const { data, error } = await supabase
        .from('campaign_invites')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching invites:', error);
        throw error;
    }

    return (data ?? []) as CampaignInvite[];
}

export async function createInvite(campaignId: string): Promise<CampaignInvite[]> {
    const { data, error } = await supabase.rpc('create_campaign_invite', {
        _campaign_id: campaignId,
    });

    if (error) {
        console.error('Error creating invite:', error);
        throw error;
    }

    return data as CampaignInvite;
}