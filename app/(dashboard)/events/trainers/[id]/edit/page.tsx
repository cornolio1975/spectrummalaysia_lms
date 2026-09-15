import { TrainerForm } from "@/components/forms/trainer-form";
import { getTrainerById } from "@/app/actions/trainers";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditTrainerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: trainer, error } = await getTrainerById(id);

  if (error || !trainer) {
    notFound();
  }

  return (
    <>
      <div className="page-header">
        <div>
          <Link href="/events/trainers" className="text-sm text-primary-500 hover:underline mb-2 inline-block">
            ← Back to Trainers
          </Link>
          <h1>Edit Trainer: {trainer.name}</h1>
          <p>Update trainer details</p>
        </div>
      </div>

      <div className="page-body">
        <div className="card max-w-2xl">
          <TrainerForm initialData={trainer} />
        </div>
      </div>
    </>
  );
}
