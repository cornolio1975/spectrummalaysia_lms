"use server";

import { Resend } from "resend";
import { createAdminClient } from "@/utils/supabase/admin";

// Create an instance of Resend with the API key from env variables
const resend = new Resend(process.env.RESEND_API_KEY || "dummy_key");

export async function sendWelcomeEmail(userId: string) {
  try {
    const adminAuthClient = createAdminClient();

    // 1. Fetch user email from auth.users
    const { data: authData, error: authError } = await adminAuthClient.auth.admin.getUserById(userId);
    if (authError || !authData.user || !authData.user.email) {
      console.error("Failed to fetch user email:", authError);
      return { error: "Failed to fetch user email." };
    }

    const email = authData.user.email;
    const name = authData.user.user_metadata?.full_name || "User";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // 2. Send the Welcome Email
    const { data, error } = await resend.emails.send({
      from: "SpectrumMY LMS <onboarding@resend.dev>", // Uses Resend's default test address
      to: email, // Note: On a free Resend tier without a verified domain, this will only work if the recipient is your own verified email.
      subject: "Welcome to SpectrumMY LMS! Your Account is Ready",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;">
          <h2 style="color: #0d7063;">Account Approved!</h2>
          <p>Hi ${name},</p>
          <p>Great news! Your account on the <strong>SpectrumMY LMS</strong> has been officially approved by an Administrator.</p>
          <p>Your roles and access permissions have been assigned, and you can now log in to the platform.</p>
          <br/>
          <div style="text-align: center;">
            <a href="${appUrl}/login" style="background-color: #0d7063; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Sign In to Your Account
            </a>
          </div>
          <br/>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p><a href="${appUrl}/login">${appUrl}/login</a></p>
          <br/>
          <p>Best regards,<br/>The SpectrumMY LMS Team</p>
        </div>
      `,
    });

    if (error) {
      console.error("Failed to send email via Resend:", error);
      return { error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (error: any) {
    console.error("Error sending welcome email:", error);
    return { error: error.message };
  }
}
