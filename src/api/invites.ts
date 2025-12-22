import { supabase } from "./supabaseClient";

export type CampaignInvite = {
    id: string;
    campaign: string;
    code: string;
    created_by: string;
    created_at: string;_
}

type JoinResult =
    | { ok: true; campaignId: string }
    | { ok: false; reason: 'invalid' | 'expired' | 'already_member' | 'unknown'; message?: string };

function normalizeInviteCode(raw: string) {
    return raw.replace(/\s+/g, '').toUpperCase();
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

export async function joinCampaignWithInviteCode(rawCode: string): Promise<JoinResult> {
    const code = normalizeInviteCode(rawCode);

    if (!code) {
        return { ok: false, reason: 'invalid', message: 'Please enter an invite code.'};
    }

    const { data: userRes, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userRes.user) {
        return { ok: false, reason: 'unknown', message: 'You must be logged in to join a campaign.' };
    }

    const { data: invite, error: inviteErr } = await supabase
        .from('campaign_invites')
        .select('id, campaign_id, expires_at')
        .eq('code', code)
        .maybeSingle();

    if (inviteErr) {
        return { ok: false, reason: 'unknown', message: inviteErr.message };
    }

    if(!invite) {
        return { ok: false, reason: 'invalid', message: 'That invite code has expired.' }
    }

    if (invite.expires_at) {
        const expiresAt = new Date(invite.expires_at);
        if (Number.isFinite(expiresAt.getTime()) && expiresAt.getTime() < Date.now()) {
            return { ok: false, reason: 'expired', message: 'That invite code has expired.' };
        }
    }

    const { error: insertErr } = await supabase.from('campaign_members').insert({
        campaign_id: invite.campaign_id,
        user_id: userRes.user.id,
        role: 'player',
    });

    if (insertErr) {
        const msg = insertErr.message?.toLowerCase() ?? '';
        if (msg.includes('duplicate') || msg.includes('unique') || msg.includes('already')) {
            return { ok: false, reason: 'already_member', message: 'You are already in that campaign.' };
        }
        return { ok: false, reason: 'unknown', message: insertErr.message };
    }

    return { ok: true, campaignId: invite.campaign_id };
}