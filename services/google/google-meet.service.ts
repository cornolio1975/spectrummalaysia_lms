/**
 * Google Meet Service — SpectrumMY LMS
 *
 * This service is the ONLY place that calls Google APIs.
 * All methods fail gracefully when Google credentials are not configured.
 * The rest of the LMS uses this service; never call Google APIs directly elsewhere.
 */
import { google } from "googleapis";

export interface MeetResult {
  success: boolean;
  meetUrl?: string;
  meetCode?: string;
  eventId?: string;
  calendarId?: string;
  error?: string;
}

export interface GoogleHealthStatus {
  credentialsConfigured: boolean;
  domainConfigured: boolean;
  calendarApiEnabled: boolean;
  meetApiEnabled: boolean;
  lastCheckedAt: string;
  error?: string;
}

function getServiceAccount() {
  const json = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!);
  if (json.private_key) {
    json.private_key = json.private_key.replace(/\\n/g, '\n');
  }
  return json;
}

function isGoogleConfigured(): boolean {
  return !!(
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  );
}

/**
 * Create a Google Meet via Google Calendar API.
 * Returns graceful fallback if credentials are not yet configured.
 */
export async function createGoogleMeet(params: {
  title: string;
  description?: string;
  startIso: string; // ISO 8601 UTC
  endIso: string;
  trainerGoogleEmail?: string;
  timezone?: string;
}): Promise<MeetResult> {
  if (!isGoogleConfigured()) {
    return {
      success: false,
      error: "Google credentials not configured. The class has been saved. The Meet link will be created once Google Workspace is connected in Admin → Google Integration.",
    };
  }

  try {
    // Google API uses static import
    const serviceAccountJson = getServiceAccount();

    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccountJson,
      scopes: [
        "https://www.googleapis.com/auth/calendar",
        "https://www.googleapis.com/auth/calendar.events",
      ],
    });

    const calendar = google.calendar({ version: "v3", auth });

    const event = await calendar.events.insert({
      calendarId: params.trainerGoogleEmail || "primary",
      requestBody: {
        summary: params.title,
        description: params.description || "",
        start: { dateTime: params.startIso, timeZone: params.timezone || "Asia/Kuala_Lumpur" },
        end: { dateTime: params.endIso, timeZone: params.timezone || "Asia/Kuala_Lumpur" },
        conferenceData: {
          createRequest: {
            requestId: `spectrummy-${Date.now()}`,
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
      },
      conferenceDataVersion: 1,
    });

    const meetLink = event.data.hangoutLink;
    const meetCode = meetLink?.split("/").pop() || undefined;

    return {
      success: true,
      meetUrl: meetLink || undefined,
      meetCode,
      eventId: event.data.id || undefined,
      calendarId: params.trainerGoogleEmail || "primary",
    };
  } catch (err: any) {
    console.error("[GoogleMeetService] createGoogleMeet failed:", err);
    return {
      success: false,
      error: `Google API error: ${err.message || String(err)}`,
    };
  }
}

/**
 * Update an existing Google Calendar event (e.g. on reschedule).
 */
export async function updateGoogleMeet(params: {
  eventId: string;
  calendarId: string;
  title?: string;
  description?: string;
  startIso?: string;
  endIso?: string;
  timezone?: string;
}): Promise<MeetResult> {
  if (!isGoogleConfigured()) {
    return { success: false, error: "Google credentials not configured." };
  }

  try {

    const auth = new google.auth.GoogleAuth({
      credentials: getServiceAccount(),
      scopes: ["https://www.googleapis.com/auth/calendar"],
    });

    const calendar = google.calendar({ version: "v3", auth });
    const patch: any = {};
    if (params.title) patch.summary = params.title;
    if (params.description) patch.description = params.description;
    if (params.startIso) patch.start = { dateTime: params.startIso, timeZone: params.timezone || "Asia/Kuala_Lumpur" };
    if (params.endIso) patch.end = { dateTime: params.endIso, timeZone: params.timezone || "Asia/Kuala_Lumpur" };

    const event = await calendar.events.patch({
      calendarId: params.calendarId,
      eventId: params.eventId,
      requestBody: patch,
    });

    return { success: true, eventId: event.data.id || undefined };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Cancel/delete a Google Calendar event.
 */
export async function cancelGoogleMeet(eventId: string, calendarId: string): Promise<MeetResult> {
  if (!isGoogleConfigured()) {
    return { success: false, error: "Google credentials not configured." };
  }

  try {

    const auth = new google.auth.GoogleAuth({
      credentials: getServiceAccount(),
      scopes: ["https://www.googleapis.com/auth/calendar"],
    });
    const calendar = google.calendar({ version: "v3", auth });
    await calendar.events.delete({ calendarId, eventId });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Check Google API health. Returns status of credentials and API availability.
 */
export async function checkGoogleHealth(): Promise<GoogleHealthStatus> {
  const base: GoogleHealthStatus = {
    credentialsConfigured: isGoogleConfigured(),
    domainConfigured: !!process.env.GOOGLE_WORKSPACE_DOMAIN,
    calendarApiEnabled: false,
    meetApiEnabled: false,
    lastCheckedAt: new Date().toISOString(),
  };

  if (!base.credentialsConfigured) {
    return { ...base, error: "GOOGLE_SERVICE_ACCOUNT_JSON not set." };
  }

  try {

    const auth = new google.auth.GoogleAuth({
      credentials: getServiceAccount(),
      scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
    });
    const calendar = google.calendar({ version: "v3", auth });
    await calendar.calendarList.list({ maxResults: 1 });
    return { ...base, calendarApiEnabled: true, meetApiEnabled: true };
  } catch (err: any) {
    return { ...base, error: `Calendar API error: ${err.message}` };
  }
}
