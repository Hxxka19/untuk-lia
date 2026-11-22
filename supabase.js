
import { createClient } from
'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL =
'https://wloeuggiclmazbhhrsyz.supabase.co';

const SUPABASE_KEY =
'sb_publishable_dzllWEqohPbXvo2igcWg_Q_63GZMrIb';

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);
