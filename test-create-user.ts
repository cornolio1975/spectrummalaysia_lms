import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const adminAuthClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function main() {
  const email = "test_test_123@example.com";
  console.log("Creating user...");
  const res = await adminAuthClient.auth.admin.createUser({
    email,
    password: "Password123!",
    email_confirm: true,
    user_metadata: { full_name: "Test User" }
  });
  console.log(res);
}

main().catch(console.error);
