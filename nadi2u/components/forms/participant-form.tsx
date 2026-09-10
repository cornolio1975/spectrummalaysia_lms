"use client";

import { useForm } from "react-hook-form";
import { createParticipant, updateParticipant } from "@/app/actions/participants";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface ParticipantFormProps {
  initialData?: any;
}

export function ParticipantForm({ initialData }: ParticipantFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialData || {
      full_name: "",
      ic_number: "",
      email: "",
      phone: "",
      gender: "male",
      date_of_birth: "",
      address: "",
      organization: "",
      status: "active",
    },
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    setError(null);

    const result = initialData
      ? await updateParticipant(initialData.id, data)
      : await createParticipant(data);

    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
    } else {
      router.push("/participants");
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && <div className="text-red-500 text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name *</label>
          <input {...register("full_name", { required: "Name is required" })} className="form-input w-full" />
          {errors.full_name && <p className="text-red-500 text-xs mt-1">{String(errors.full_name.message)}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">IC Number / Passport</label>
          <input {...register("ic_number")} className="form-input w-full" />
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
          <label className="block text-sm font-medium mb-1">Gender</label>
          <select {...register("gender")} className="form-select w-full">
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Date of Birth</label>
          <input type="date" {...register("date_of_birth")} className="form-input w-full" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Organization</label>
          <input {...register("organization")} className="form-input w-full" placeholder="School/Company" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select {...register("status")} className="form-select w-full">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Address</label>
        <textarea {...register("address")} className="form-input w-full" rows={3}></textarea>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <button type="button" onClick={() => router.push("/participants")} className="btn btn-outline" disabled={isSubmitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Participant"}
        </button>
      </div>
    </form>
  );
}
