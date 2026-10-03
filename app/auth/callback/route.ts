import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  
  if (code) {
    console.log("Auth Callback: Code received, exchanging for session...");
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("Auth callback error:", error.message);
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url));
    }
    console.log("Auth Callback: Session exchanged successfully for user:", data.user?.email);
  } else {
    console.log("Auth Callback: No code found in URL!");
  }
  
  // Clear any cached redirects for the dashboard
  revalidatePath("/", "layout");
  
  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL("/dashboard", request.url));
}
