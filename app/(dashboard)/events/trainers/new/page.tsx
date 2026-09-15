import { TrainerForm } from "@/components/forms/trainer-form";
import Link from "next/link";

export default function NewTrainerPage() {
  return (
    <>
      <div className="page-header">
        <div>
          <Link href="/events/trainers" className="text-sm text-primary-500 hover:underline mb-2 inline-block">
            ← Back to Trainers
          </Link>
          <h1>Add New Trainer</h1>
          <p>Register a new trainer in the system</p>
        </div>
      </div>

      <div className="page-body">
        <div className="card max-w-2xl">
          <TrainerForm />
        </div>
      </div>
    </>
  );
}
