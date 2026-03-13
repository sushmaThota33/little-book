import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://duijqxmjacfoennovxsx.supabase.co";
const supabaseKey = "sb_publishable_bqsmI4pEjC3UwEGpyziXIA_Nk_LTS_8";

export const supabase = createClient(supabaseUrl, supabaseKey);