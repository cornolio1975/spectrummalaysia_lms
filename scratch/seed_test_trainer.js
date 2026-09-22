const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey || supabaseKey === 'your_service_role_key_here') {
  console.error("Missing or invalid SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedTestTrainer() {
  const email = 'testtrainer@spectrum-malaysia.com';
  const password = 'Password123!';
  const name = 'Test Trainer';

  try {
    // 1. Create or get user
    let user;
    console.log("Checking if user exists...");
    const { data: existingUser, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) throw listError;
    
    const found = existingUser.users.find(u => u.email === email);
    
    if (found) {
      console.log("User found. Updating password just in case...");
      const { data: updated, error: updateError } = await supabase.auth.admin.updateUserById(found.id, {
        password: password
      });
      if (updateError) throw updateError;
      user = updated.user;
    } else {
      console.log("Creating new user...");
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: { full_name: name }
      });
      if (createError) throw createError;
      user = newUser.user;
    }

    console.log("User ID:", user.id);

    // 2. Ensure profile exists and has role 'Trainer'
    console.log("Ensuring profile...");
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({ id: user.id, full_name: name, role: 'trainer' });
    if (profileError) throw profileError;

    // 3. Ensure trainer record exists
    console.log("Ensuring trainer record...");
    const { data: existingTrainer, error: getTrainerError } = await supabase
      .from('trainers')
      .select('id')
      .eq('email', email)
      .single();

    let trainerId;
    if (existingTrainer) {
      trainerId = existingTrainer.id;
      // Update profile_id just in case
      await supabase.from('trainers').update({ profile_id: user.id }).eq('id', trainerId);
      console.log("Trainer record found:", trainerId);
    } else {
      const { data: newTrainer, error: createTrainerError } = await supabase
        .from('trainers')
        .insert({
          name: name,
          email: email,
          profile_id: user.id,
          status: 'active'
        })
        .select('id')
        .single();
      
      if (createTrainerError) throw createTrainerError;
      trainerId = newTrainer.id;
      console.log("Created trainer record:", trainerId);
    }

    // 4. Ensure trainer workspace exists
    console.log("Ensuring trainer workspace...");
    const { data: existingWorkspace, error: getWorkspaceError } = await supabase
      .from('trainer_workspaces')
      .select('id')
      .eq('trainer_id', trainerId)
      .single();

    if (existingWorkspace) {
      console.log("Trainer workspace found:", existingWorkspace.id);
    } else {
      const { data: newWorkspace, error: createWorkspaceError } = await supabase
        .from('trainer_workspaces')
        .insert({
          trainer_id: trainerId,
          name: `${name}'s Workspace`,
          status: 'active'
        })
        .select('id')
        .single();
        
      if (createWorkspaceError) throw createWorkspaceError;
      console.log("Created trainer workspace:", newWorkspace.id);
    }

    console.log("Done! Test Trainer is fully set up.");

  } catch (err) {
    console.error("Error setting up Test Trainer:", err);
  }
}

seedTestTrainer();
