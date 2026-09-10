"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LessonFormData, lessonSchema } from "@/lib/validations/curriculum";
import { createLesson, updateLesson } from "@/app/actions/lessons";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface LessonFormProps {
  programmeId: string;
  moduleId: string;
  initialData?: LessonFormData & { id: string };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function LessonForm({ programmeId, moduleId, initialData, onSuccess, onCancel }: LessonFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<LessonFormData>({
    resolver: zodResolver(lessonSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      content_type: "video",
      sequence: 1,
      is_required: true,
      status: "draft",
    },
  });

  const onSubmit = async (data: LessonFormData) => {
    setIsSubmitting(true);
    setError(null);

    const result = initialData
      ? await updateLesson(programmeId, initialData.id, data)
      : await createLesson(programmeId, moduleId, data);

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
        <label className="block text-sm font-medium mb-1">Lesson Title</label>
        <input {...register("title")} className="form-input w-full" placeholder="e.g. Lesson 1: Basics" />
        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea {...register("description")} className="form-input w-full" rows={3}></textarea>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Content Type</label>
          <select {...register("content_type")} className="form-select w-full">
            <option value="video">Video</option>
            <option value="pdf">PDF Document</option>
            <option value="powerpoint">PowerPoint</option>
            <option value="word">Word Document</option>
            <option value="text">Text / Article</option>
            <option value="quiz">Quiz</option>
            <option value="assessment">Assessment</option>
            <option value="external">External Link</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Estimated Duration (mins)</label>
          <input type="number" {...register("duration_minutes", { valueAsNumber: true })} className="form-input w-full" min="1" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Sequence (Order)</label>
          <input type="number" {...register("sequence", { valueAsNumber: true })} className="form-input w-full" min="1" />
          {errors.sequence && <p className="text-red-500 text-xs mt-1">{errors.sequence.message}</p>}
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

      <div className="p-4 bg-gray-50 rounded-lg border flex items-center gap-2">
        <input type="checkbox" {...register("is_required")} id="isRequired" />
        <label htmlFor="isRequired" className="text-sm font-medium">This lesson is required for module completion</label>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-outline" disabled={isSubmitting}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Lesson"}
        </button>
      </div>
    </form>
  );
}
