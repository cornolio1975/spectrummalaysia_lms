const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

async function main() {
  const { data, error } = await supabase.from('system_settings').select('*');
  if (error) {
    console.error("ERROR:", error);
  } else {
    console.log("DATA:", data);
  }
}

main();
