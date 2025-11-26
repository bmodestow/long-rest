import { supabase } from './supabaseClient';

export type MyCampaign = {
    campaign_id: string;
    name: string;
    description: string | null;
    member_role: 'dm' | 'co_dm' | 'player';
    created_at: string;
};

export async function fetchMyCampaigns() {
    const { data, error } = await supabase.rpc('get_my_campaigns');

    if (error) {
        console.error('Error fetching campaigns:', error);
        throw error;
    }

    return (data ?? []) as MyCampaign[];
}

export async function createCampaign(name: string, description?: string) {
    const { data, error } = await supabase.rpc('create_campaign_with_membership', {
        _name: name,
        _description: description ?? null,
    });

    if (error) {
        console.error('Error creating campaign:', error);
        throw error;
    }

    return data; // campaigns row
}

export async function joinCampaignByCode(code: string) {
    const { data, error } = await supabase.rpc('join_campaign_with_code', {
        _code: code,
    });

    if (error) {
        console.error('Error joining campaign:', error);
        throw error;
    }

    return data; // campaign_members row
}