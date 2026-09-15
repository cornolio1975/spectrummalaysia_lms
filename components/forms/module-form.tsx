"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ModuleFormData, moduleSchema } from "@/lib/validations/curriculum";
import { createModule, updateModule } from "@/app/actions/modules";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface ModuleFormProps {
  programmeId: string;
  initialData?: ModuleFormData & { id: string };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ModuleForm({ programmeId, initialData, onSuccess, onCancel }: ModuleFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<ModuleFormData>({
    resolver: zodResolver(moduleSchema) as any,
    defaultValues: initialData || {
      title: "",
      description: "",
      sort_order: 0,
      status: "draft",
    },
  });

  const onSubmit = async (data: ModuleFormData) => {
    setIsSubmitting(true);
    setError(null);

    const result = initialData
      ? await updateModule(programmeId, initialData.id, data)
      : await createModule(programmeId, data);

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

      <div>
        <label className="block text-sm font-medium mb-1">Module Title</label>
        <input {...register("title")} className="form-input w-full" placeholder="e.g. Module 1: Introduction" />
        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea {...register("description")} className="form-input w-full" rows={3}></textarea>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Sequence (Order)</label>
          <input type="number" {...register("sort_order", { valueAsNumber: true })} className="form-input w-full" min="0" />
          {errors.sort_order && <p className="text-red-500 text-xs mt-1">{errors.sort_order.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select {...register("status")} className="form-select w-full">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-outline" disabled={isSubmitting}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Module"}
        </button>
      </div>
    </form>
  );
}
