"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EventFormData, eventSchema } from "@/lib/validations/event";
import { createEvent, updateEvent } from "@/app/actions/events";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface EventFormProps {
  initialData?: EventFormData & { id: string };
  programmes: { id: string; programme_name: string }[];
  nadiSites: { id: string; nadi_name: string }[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EventForm({ initialData, programmes, nadiSites, onSuccess, onCancel }: EventFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema) as any,
    defaultValues: initialData ? {
      programme_id: initialData.programme_id,
      nadi_id: initialData.nadi_id,
      start_date: new Date(initialData.start_date).toISOString().split('T')[0],
      end_date: new Date(initialData.end_date).toISOString().split('T')[0],
      status: initialData.status,
      capacity: initialData.capacity,
    } : {
      programme_id: "",
      nadi_id: "",
      start_date: "",
      end_date: "",
      status: "draft",
      capacity: 30,
    },
  });

  const onSubmit = async (data: EventFormData) => {
    setIsSubmitting(true);
    setError(null);

    const result = initialData
      ? await updateEvent(initialData.id, data)
      : await createEvent(data);

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
        <label className="block text-sm font-medium mb-1">Programme</label>
        <select {...register("programme_id")} className="form-select w-full">
          <option value="">Select a programme</option>
          {programmes.map(prog => (
            <option key={prog.id} value={prog.id}>{prog.programme_name}</option>
          ))}
        </select>
        {errors.programme_id && <p className="text-red-500 text-xs mt-1">{errors.programme_id.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">NADI Site</label>
        <select {...register("nadi_id")} className="form-select w-full">
          <option value="">Select a NADI site</option>
          {nadiSites.map(nadi => (
            <option key={nadi.id} value={nadi.id}>{nadi.nadi_name}</option>
          ))}
        </select>
        {errors.nadi_id && <p className="text-red-500 text-xs mt-1">{errors.nadi_id.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Start Date</label>
          <input type="date" {...register("start_date")} className="form-input w-full" />
          {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">End Date</label>
          <input type="date" {...register("end_date")} className="form-input w-full" />
          {errors.end_date && <p className="text-red-500 text-xs mt-1">{errors.end_date.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select {...register("status")} className="form-select w-full">
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="registration_open">Registration Open</option>
            <option value="registration_closed">Registration Closed</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Capacity</label>
          <input type="number" {...register("capacity", { valueAsNumber: true })} className="form-input w-full" min="1" />
          {errors.capacity && <p className="text-red-500 text-xs mt-1">{errors.capacity.message}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-outline" disabled={isSubmitting}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Event"}
        </button>
      </div>
    </form>
  );
}
