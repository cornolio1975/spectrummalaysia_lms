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
      entity_name: "",
      phase: "",
      state_id: "",
      site_name: "",
      ref_id: "",
      region: "",
      tp_dusp: "",
      contact_person: "",
      status: "In Operation",
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
          <label className="block text-sm font-medium mb-1">Entity Name</label>
          <input {...register("entity_name")} className="form-input w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phase</label>
          <input {...register("phase")} className="form-input w-full" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Site Name</label>
          <input {...register("site_name")} className="form-input w-full" />
          {errors.site_name && <p className="text-red-500 text-xs mt-1">{errors.site_name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">RefID</label>
          <input {...register("ref_id")} className="form-input w-full" />
          {errors.ref_id && <p className="text-red-500 text-xs mt-1">{errors.ref_id.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
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
        <div>
          <label className="block text-sm font-medium mb-1">Region</label>
          <input {...register("region")} className="form-input w-full" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">TP (DUSP)</label>
          <input {...register("tp_dusp")} className="form-input w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Contact Person</label>
          <input {...register("contact_person")} className="form-input w-full" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Status</label>
        <input {...register("status")} className="form-input w-full" placeholder="In Operation" />
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
