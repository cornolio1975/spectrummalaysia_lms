"use client";

import { useForm } from "react-hook-form";
import { createTrainer, updateTrainer } from "@/app/actions/trainers";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface TrainerFormProps {
  initialData?: any;
}

export function TrainerForm({ initialData }: TrainerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialData || {
      name: "",
      email: "",
      phone: "",
      specialization: "",
      organization: "",
      status: "active",
    },
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    setError(null);

    const result = initialData
      ? await updateTrainer(initialData.id, data)
      : await createTrainer(data);

    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
    } else {
      router.push("/events/trainers");
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && <div className="text-red-500 text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name *</label>
          <input {...register("name", { required: "Name is required" })} className="form-input w-full" />
          {errors.name && <p className="text-red-500 text-xs mt-1">{String(errors.name.message)}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email Address</label>
          <input type="email" {...register("email")} className="form-input w-full" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Phone Number</label>
          <input {...register("phone")} className="form-input w-full" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Specialization</label>
          <input {...register("specialization")} className="form-input w-full" placeholder="e.g. Digital Marketing, GenAI" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Organization</label>
          <input {...register("organization")} className="form-input w-full" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select {...register("status")} className="form-select w-full">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <button type="button" onClick={() => router.push("/events/trainers")} className="btn btn-outline" disabled={isSubmitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Trainer"}
        </button>
      </div>
    </form>
  );
}
