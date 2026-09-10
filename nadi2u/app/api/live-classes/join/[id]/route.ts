import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { recordJoinClick } from "@/app/actions/live-attendance";

/**
 * Secure Join Endpoint.
 * Validates participant has access to this live class,
 * logs the join click, then redirects to the Meet URL.
 *
 * NEVER exposes the Meet URL in page HTML/JS — always goes through this route.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: liveClassId } = await params;

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch the live class (check it exists and is joinable)
  const { data: liveClass, error } = await supabase
    .from("live_classes")
    .select("id, status, google_meet_url, programme_id, title")
    .eq("id", liveClassId)
    .single();

  if (error || !liveClass) {
    return NextResponse.json({ error: "Live class not found" }, { status: 404 });
  }

  if (liveClass.status === "cancelled") {
    return NextResponse.json({ error: "This class has been cancelled" }, { status: 403 });
  }

  if (liveClass.status === "completed") {
    return NextResponse.json({ error: "This class has already ended" }, { status: 403 });
  }

  if (!liveClass.google_meet_url) {
    return NextResponse.json({
      error: "Google Meet link is not yet available for this class. Please try again closer to the class time.",
      status: "waiting_for_meet"
    }, { status: 503 });
  }

  // Find participant record linked to this user
  // (In this LMS, participants are separate from auth users — look up by email)
  const userEmail = authData.user.email;
  const { data: participant } = await supabase
    .from("participants")
    .select("id")
    .eq("email", userEmail)
    .single();

  const participantId = participant?.id || authData.user.id;

  // Log join click (non-blocking)
  const userAgent = request.headers.get("user-agent") || "";
  await recordJoinClick(liveClassId, participantId, {
    userAgent,
    device: /mobile/i.test(userAgent) ? "mobile" : "desktop",
    browser: userAgent.includes("Chrome") ? "Chrome" : userAgent.includes("Firefox") ? "Firefox" : "Other",
  });

  return NextResponse.json({ meetUrl: liveClass.google_meet_url });
}
