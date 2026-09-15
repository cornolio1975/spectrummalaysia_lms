"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NadiFormData, nadiSchema } from "@/lib/validations/nadi";
import { createNadiSite, updateNadiSite } from "@/app/actions/nadi";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface NadiFormProps {
  initialData?: NadiFormData & { id: string };
  states: { id: string; state_name: string }[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function NadiForm({ initialData, states, onSuccess, onCancel }: NadiFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<NadiFormData>({
    resolver: zodResolver(nadiSchema) as any,
    defaultValues: (initialData as any) || {
      nadi_code: "",
      nadi_name: "",
      state_id: "",
      address: "",
      district: "",
      postcode: "",
      contact_person: "",
      contact_phone: "",
      contact_email: "",
      status: "active",
    },
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    setError(null);

    const result = initialData
      ? await updateNadiSite(initialData.id, data)
      : await createNadiSite(data);

    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
    } else {
      router.refresh();
      if (onSuccess) onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && <div className="text-red-500 text-sm">{error}</div>}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">NADI Code</label>
          <input {...register("nadi_code")} className="form-input w-full" placeholder="e.g. NADI-SGR-001" />
          {errors.nadi_code && <p className="text-red-500 text-xs mt-1">{errors.nadi_code.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">NADI Name</label>
          <input {...register("nadi_name")} className="form-input w-full" placeholder="e.g. NADI Petaling Jaya" />
          {errors.nadi_name && <p className="text-red-500 text-xs mt-1">{errors.nadi_name.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">State</label>
        <select {...register("state_id")} className="form-select w-full">
          <option value="">Select a state</option>
          {states.map(state => (
            <option key={state.id} value={state.id}>{state.state_name}</option>
          ))}
        </select>
        {errors.state_id && <p className="text-red-500 text-xs mt-1">{errors.state_id.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">District</label>
          <input {...register("district")} className="form-input w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Postcode</label>
          <input {...register("postcode")} className="form-input w-full" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Address</label>
        <textarea {...register("address")} className="form-input w-full" rows={2}></textarea>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Contact Person</label>
          <input {...register("contact_person")} className="form-input w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Contact Phone</label>
          <input {...register("contact_phone")} className="form-input w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Contact Email</label>
          <input {...register("contact_email")} className="form-input w-full" type="email" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Status</label>
        <select {...register("status")} className="form-select w-full">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-outline" disabled={isSubmitting}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save NADI Site"}
        </button>
      </div>
    </form>
  );
}
