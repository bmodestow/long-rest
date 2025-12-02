import { supabase } from './supabaseClient';

export type CampaignRole = 'dm' | 'co_dm' | 'player';

export interface Campaign {
    id: string;
    name: string;
    description: string | null;
    member_role: CampaignRole;
}

export type MyCampaign = {
    campaign_id: string;
    name: string;
    description: string | null;
    member_role: 'dm' | 'co_dm' | 'player';
    created_at: string;
};

export async function fetchCampaigns(): Promise<Campaign[]> {
  const { data, error } = await supabase
    .from('campaign_members')
    .select(
      `
      role,
      campaigns (
        id,
        name,
        description
      )
    `
    )
    .order('created_at', { referencedTable: 'campaigns', ascending: false });

  if (error) {
    console.error('fetchCampaigns error', error);
    throw error;
  }

  // data is an array of rows like:
  // { role: 'dm', campaigns: { id, name, description } }
  return (data ?? [])
    .filter((row: any) => row.campaigns) // just in case
    .map((row: any) => ({
      id: row.campaigns.id,
      name: row.campaigns.name,
      description: row.campaigns.description,
      member_role: row.role as CampaignRole,
    }));
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

export async function updateCampaign(
    campaignId: string,
    patch: { name?: string; description?: string | null }
) {
    const { data, error } = await supabase
        .from('campaigns')
        .update(patch)
        .eq('id', campaignId)
        .select('*')
        .single();

    if (error) {
        console.error('Error updating campaign:', error);
        throw error;
    }

    return data;
}

export async function deleteCampaign(campaignId: string) {
    const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaignId);

    if (error) {
        console.error('Error deleting campaign:', error);
        throw error;
    }
}