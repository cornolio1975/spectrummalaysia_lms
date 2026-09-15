import { ParticipantForm } from "@/components/forms/participant-form";
import { getParticipantById } from "@/app/actions/participants";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditParticipantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: participant, error } = await getParticipantById(id);

  if (error || !participant) {
    notFound();
  }

  return (
    <>
      <div className="page-header">
        <div>
          <Link href="/participants" className="text-sm text-primary-500 hover:underline mb-2 inline-block">
            ← Back to Participants
          </Link>
          <h1>Edit Participant: {participant.full_name}</h1>
          <p>Update participant profile details</p>
        </div>
      </div>

      <div className="page-body">
        <div className="card max-w-2xl">
          <ParticipantForm initialData={participant} />
        </div>
      </div>
    </>
  );
}
