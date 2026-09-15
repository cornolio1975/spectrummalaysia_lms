import { ParticipantForm } from "@/components/forms/participant-form";
import Link from "next/link";

export default function NewParticipantPage() {
  return (
    <>
      <div className="page-header">
        <div>
          <Link href="/participants" className="text-sm text-primary-500 hover:underline mb-2 inline-block">
            ← Back to Participants
          </Link>
          <h1>Register Participant</h1>
          <p>Create a new participant profile</p>
        </div>
      </div>

      <div className="page-body">
        <div className="card max-w-2xl">
          <ParticipantForm />
        </div>
      </div>
    </>
  );
}
