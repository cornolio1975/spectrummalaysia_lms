const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

(async () => {
  const env = fs.readFileSync('.env.local', 'utf8');
  const url = env.split('\n').find(l => l.startsWith('NEXT_PUBLIC_SUPABASE_URL=')).split('=')[1].trim().replace(/['"]/g, '');
  const key = env.split('\n').find(l => l.startsWith('SUPABASE_SERVICE_ROLE_KEY=')).split('=')[1].trim().replace(/['"]/g, '');
  
  const supabase = createClient(url, key);
  
  const { data: profiles, error: pError } = await supabase.from('profiles').select('*').eq('role', 'trainer');
  console.log('Found trainers in profiles:', profiles?.length || 0);
  
  for (const p of profiles || []) {
    const { data: existingTrainer } = await supabase.from('trainers').select('id').eq('profile_id', p.id).maybeSingle();
    if (!existingTrainer) {
        const { data: t, error } = await supabase.from('trainers').insert({
        profile_id: p.id,
        name: p.full_name || 'Unknown',
        status: p.is_active ? 'active' : 'inactive'
        });
        if(error) {
           console.log('Error inserting:', error);
        } else {
           console.log('Inserted trainer for', p.full_name);
        }
    } else {
        console.log('Trainer already exists for', p.full_name);
    }
  }
})();
