import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hrirvzyfiepivaxwhsvx.supabase.co"; // apna URL
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyaXJ2enlmaWVwaXZheHdoc3Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMTk0NTcsImV4cCI6MjA3NTc5NTQ1N30.scSsSbQVXujst-yo0i-2X50i0HFThBL04kZY9GHdBbM";       // apna anon key
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

