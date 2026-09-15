"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProgrammeFormData, programmeSchema } from "@/lib/validations/programme";
import { createProgramme, updateProgramme } from "@/app/actions/programmes";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface ProgrammeFormProps {
  initialData?: ProgrammeFormData & { id: string };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ProgrammeForm({ initialData, onSuccess, onCancel }: ProgrammeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<ProgrammeFormData>({
    resolver: zodResolver(programmeSchema) as any,
    defaultValues: (initialData as any) || {
      programme_code: "",
      programme_name: "",
      description: "",
      category: "",
      target_age_group: "",
      target_gender: "all",
      status: "draft",
      certificate_enabled: true,
      completion_percentage_required: 80,
    },
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    setError(null);

    const result = initialData
      ? await updateProgramme(initialData.id, data)
      : await createProgramme(data);

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
          <label className="block text-sm font-medium mb-1">Programme Code</label>
          <input {...register("programme_code")} className="form-input w-full" placeholder="e.g. PROG-EKELAS" />
          {errors.programme_code && <p className="text-red-500 text-xs mt-1">{errors.programme_code.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Programme Name</label>
          <input {...register("programme_name")} className="form-input w-full" placeholder="e.g. eKelas Pelajar" />
          {errors.programme_name && <p className="text-red-500 text-xs mt-1">{errors.programme_name.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea {...register("description")} className="form-input w-full" rows={3}></textarea>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <input {...register("category")} className="form-input w-full" placeholder="e.g. Education" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select {...register("status")} className="form-select w-full">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Target Age Group</label>
          <input {...register("target_age_group")} className="form-input w-full" placeholder="e.g. 13-17" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Target Gender</label>
          <select {...register("target_gender")} className="form-select w-full">
            <option value="all">All</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border">
        <div className="flex items-center gap-2">
          <input type="checkbox" {...register("certificate_enabled")} id="certEnabled" />
          <label htmlFor="certEnabled" className="text-sm font-medium">Enable Certificates</label>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Required Completion (%)</label>
          <input type="number" {...register("completion_percentage_required", { valueAsNumber: true })} className="form-input w-full" min="0" max="100" />
          {errors.completion_percentage_required && <p className="text-red-500 text-xs mt-1">{errors.completion_percentage_required.message}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-outline" disabled={isSubmitting}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Programme"}
        </button>
      </div>
    </form>
  );
}
