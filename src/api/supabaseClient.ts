import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://rdbsmijnlceeuddeahxv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkYnNtaWpubGNlZXVkZGVhaHh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwODMwNjcsImV4cCI6MjA3OTY1OTA2N30.zcQJ8ScfU4oMmY_zG7nEEKt8ZG37e3Hkt_1jJiubxKo";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);