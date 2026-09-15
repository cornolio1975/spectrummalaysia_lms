"use client";

import { useForm } from "react-hook-form";
import { createQuiz, updateQuiz } from "@/app/actions/quizzes";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface QuizFormProps {
  programmeId: string;
  initialData?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function QuizForm({ programmeId, initialData, onSuccess, onCancel }: QuizFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialData || {
      title: "",
      description: "",
      pass_mark: 70,
      max_attempts: 3,
      status: "draft",
    },
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    setError(null);

    const result = initialData
      ? await updateQuiz(programmeId, initialData.id, data)
      : await createQuiz(programmeId, data);

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
        <label className="block text-sm font-medium mb-1">Quiz Title *</label>
        <input {...register("title", { required: "Title is required" })} className="form-input w-full" />
        {errors.title && <p className="text-red-500 text-xs mt-1">{String(errors.title.message)}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea {...register("description")} className="form-input w-full" rows={3}></textarea>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Passing Mark (%)</label>
          <input type="number" {...register("pass_mark")} className="form-input w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Max Attempts</label>
          <input type="number" {...register("max_attempts")} className="form-input w-full" />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Status</label>
        <select {...register("status")} className="form-select w-full">
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-outline" disabled={isSubmitting}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Quiz"}
        </button>
      </div>
    </form>
  );
}
