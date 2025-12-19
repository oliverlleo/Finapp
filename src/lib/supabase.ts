import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kevrmiyrkqirivbpgzkl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtldnJtaXlya3Fpcml2YnBnemtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNzk5NTcsImV4cCI6MjA4MTY1NTk1N30.TWRwhbsqiBhZkrm_7xT_qw6bX7_FWkngShfnSnohfC8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
