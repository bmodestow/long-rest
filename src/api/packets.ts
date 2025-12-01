import { supabase } from './supabaseClient';

export type EventPacketType = 'xp' | 'loot' | 'secret' | 'note' | 'announcement';

export interface EventPacket {
    id: string;
    campaign_id: string;
    session_id: string | null;
    created_by: string;
    type: EventPacketType;
    title: string;
    body: string;
    is_published: boolean;
    visible_from: string;
    created_at: string;
    updated_at: string;
}

export interface EventPacketRecipient {
    id: string;
    packet_id: string;
    campaign_member_id: string;
    has_read: boolean;
    read_at: string | null;
    created_at: string;
}

export interface InboxPacket {
    recipient: EventPacketRecipient;
    packet: EventPacket;
}

/** 
 * Fetch packets visible to the current user within a campaign.
 * This is the "inbox" view: it's scoped via RLS to either:
 *  - packets where you're the recipient, or
 *  - everything (if you're a DM/co-DM).
 * 
 * We base the query on event_packet_recipients so we can get has_read/read_at.
*/
export async function getInboxPackets(campaignId: string): Promise<InboxPacket[]> {
    const { data, error } = await supabase
        .from('event_packet_recipients')
        .select(
            `

            id,
            packet_id,
            campaign_member_id,
            has_read,
            read_at,
            created_at,
            packet:event_packets!event_packet_recipients_packet_id_fkey (
                id,
                campaign_id,
                session_id,
                created_by,
                type,
                title,
                body,
                is_published,
                visible_from,
                created_at,
                updated_at
            )
        `
        )
        // supabase will join packet via FK; we filter by campaign here
        .eq('packet.campaign_id', campaignId)
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error('getInboxPackets error', error);
        throw error;
    }

    if (!data) return [];

    return data.map((row: any) => ({
        recipient: {
            id: row.id,
            packet_id: row.packet_id,
            campaign_member_id: row.campaign_member_id,
            has_read: row.has_read,
            read_at: row.read_at,
            created_at: row.created_at,
        },
        packet: row.packet as EventPacket,
    }));
}

/**
 * Fetch packets authored by the current user in a given campaign.
 * Useful for a DM "Sent / Drafts" view later.
 */

export async function getPacketsAuthoredByMe(campaignId: string): Promise<EventPacket[]> {
    const { data, error } = await supabase
        .from('event_packets')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('getPacketsAuthoredByMe error', error);
        throw error;
    }

    return (data ?? [] as EventPacket[]);
}

export interface CreatePacketInput {
    campaignId: string;
    sessionId?: string | null;
    type: EventPacketType;
    title: string;
    body: string;
    isPublished?: boolean;
    visibleFrom?: string; // Iso string, default now()
    recipientCampaignMemberIds: string[]; // ids from campaign_members table
}

/**
 * Create a packet and its recipients.
 * 
 * NOTE: This is not transactional on the client - in practice, it's usually fine,
 * but if I want true all-or-nothing semantics I can wrap this in a Supabase RPC later.
 */
export async function createPacketWithRecipients(input: CreatePacketInput): Promise<{
    packet: EventPacket;
    recipients: EventPacketRecipient[];
}> {
    const {
        campaignId,
        sessionId = null,
        type,
        title,
        body,
        isPublished = true,
        visibleFrom,
        recipientCampaignMemberIds,
    } = input;

    const visibleFromValue = visibleFrom ?? new Date().toISOString();

    // 1) Insert packet
    const { data: packetData, error: packetError } = await supabase
        .from('event_packets')
        .insert({
            campaign_id: campaignId,
            session_id: sessionId,
            type,
            title,
            body,
            is_published: isPublished,
            visible_from: visibleFromValue,
        })
        .select('*')
        .single();

    if (packetError || !packetData) {
        console.error('createPacketWithRecipients - packet error', packetError);
        throw packetError ?? new Error('Failed to insert packet');
    }

    const packet = packetData as EventPacket;  

    if (recipientCampaignMemberIds.length === 0) {
        return { packet, recipients: [] };
    }

    // 2) Insert recipients
    const recipientRows = recipientCampaignMemberIds.map((cmId) => ({
        packet_id: packet.id,
        campaign_member_id: cmId,
    }));

    const { data: recipientsData, error: recipientsError } = await supabase
        .from('event_packet_recipients')
        .insert(recipientRows)
        .select('*');

    if (recipientsError) {
        console.error('createPacketWithRecipients - recipients error', recipientsError);
        throw recipientsError;
    }

    return {
        packet,
        recipients: (recipientsData ?? []) as EventPacketRecipient[],
    };
}
/**
 * Mark a packet as read for the current user.
 * RLS ensures the row we're updating belongs to the logged-in user.
 */
export async function markPacketRead(packetId: string): Promise<void> {
    const nowIso = new Date().toISOString();

    const { error } = await supabase
        .from('event_packet_recipients')
        .update({
            has_read: true,
            read_at: nowIso,
        })
        .eq('packet_id', packetId)
        .eq('has_read', false); // idempotent

    if (error) {
        console.error('markPacketRead error', error);
        throw error;
    }
}