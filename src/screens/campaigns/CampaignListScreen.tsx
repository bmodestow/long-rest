import { supabase } from "@/src/api/supabaseClient";

const { data, error } = await supabase
    .from('campaign_members')
    .select('campaigns(*)')
    .eq('user_id', userId);