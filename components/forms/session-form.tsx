"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SessionFormData, sessionSchema } from "@/lib/validations/event";
import { createSession, updateSession } from "@/app/actions/sessions";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface SessionFormProps {
  eventId: string;
  initialData?: SessionFormData & { id: string };
  trainers: { id: string; name: string }[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function SessionForm({ eventId, initialData, trainers, onSuccess, onCancel }: SessionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema) as any,
    defaultValues: initialData ? {
      session_name: (initialData as any).session_name,
      session_date: new Date((initialData as any).session_date).toISOString().split('T')[0],
      start_time: (initialData as any).start_time,
      end_time: (initialData as any).end_time,
      trainer_id: (initialData as any).trainer_id || "",
      status: (initialData as any).status || "scheduled",
    } : {
      session_name: "",
      session_date: "",
      start_time: "",
      end_time: "",
      trainer_id: "",
      status: "scheduled",
    },
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    setError(null);

    const result = initialData
      ? await updateSession(eventId, initialData.id, data)
      : await createSession(eventId, data);

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
        <label className="block text-sm font-medium mb-1">Session Name</label>
        <input {...register("session_name")} className="form-input w-full" placeholder="e.g. Introduction to Robotics" />
        {errors.session_name && <p className="text-red-500 text-xs mt-1">{errors.session_name.message}</p>}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <input type="date" {...register("session_date")} className="form-input w-full" />
          {errors.session_date && <p className="text-red-500 text-xs mt-1">{errors.session_date.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Start Time</label>
          <input type="time" {...register("start_time")} className="form-input w-full" />
          {errors.start_time && <p className="text-red-500 text-xs mt-1">{errors.start_time.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">End Time</label>
          <input type="time" {...register("end_time")} className="form-input w-full" />
          {errors.end_time && <p className="text-red-500 text-xs mt-1">{errors.end_time.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Trainer (Optional)</label>
          <select {...register("trainer_id")} className="form-select w-full">
            <option value="">None Assigned</option>
            {trainers.map(trainer => (
              <option key={trainer.id} value={trainer.id}>{trainer.name}</option>
            ))}
          </select>
          {errors.trainer_id && <p className="text-red-500 text-xs mt-1">{errors.trainer_id.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select {...register("status")} className="form-select w-full">
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
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
          {isSubmitting ? "Saving..." : "Save Session"}
        </button>
      </div>
    </form>
  );
}
