"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { createLiveClass } from "@/app/actions/live-classes";

interface CreateLiveClassFormProps {
  programmes: any[];
  trainers: any[];
  nadiSites: any[];
}

export function CreateLiveClassForm({ programmes, trainers, nadiSites }: CreateLiveClassFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      title: "",
      description: "",
      programme_id: "",
      trainer_id: "",
      nadi_id: "",
      date: "",
      start_time: "",
      end_time: "",
      max_participants: "",
    }
  });

  const onSubmit = async (data: any, actionType: "draft" | "schedule") => {
    setLoading(true);
    setError(null);

    // Combine date and time to ISO strings
    const startIso = new Date(`${data.date}T${data.start_time}:00`).toISOString();
    const endIso = new Date(`${data.date}T${data.end_time}:00`).toISOString();

    const payload = {
      title: data.title,
      description: data.description,
      programme_id: data.programme_id,
      trainer_id: data.trainer_id,
      nadi_id: data.nadi_id || undefined,
      scheduled_start: startIso,
      scheduled_end: endIso,
      max_participants: data.max_participants ? parseInt(data.max_participants) : undefined,
      schedule_now: actionType === "schedule",
    };

    const result = await createLiveClass(payload);

    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      router.push("/live-classes");
    }
  };

  return (
    <div className="card max-w-3xl">
      {error && <div className="alert alert-danger mb-4">{error}</div>}
      
      <form className="flex flex-col gap-4">
        <div className="form-group">
          <label className="form-label">Class Title *</label>
          <input 
            type="text" 
            className="form-input" 
            {...register("title", { required: "Title is required" })} 
          />
          {errors.title && <span className="text-red-500 text-sm">{errors.title.message}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea 
            className="form-textarea" 
            rows={3} 
            {...register("description")} 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">Programme *</label>
            <select className="form-select" {...register("programme_id", { required: "Programme is required" })}>
              <option value="">Select Programme</option>
              {programmes.map(p => (
                <option key={p.id} value={p.id}>{p.programme_name}</option>
              ))}
            </select>
            {errors.programme_id && <span className="text-red-500 text-sm">{errors.programme_id.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Trainer *</label>
            <select className="form-select" {...register("trainer_id", { required: "Trainer is required" })}>
              <option value="">Select Trainer</option>
              {trainers.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            {errors.trainer_id && <span className="text-red-500 text-sm">{errors.trainer_id.message}</span>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">NADI Site (Optional)</label>
            <select className="form-select" {...register("nadi_id")}>
              <option value="">All / None Specific</option>
              {nadiSites.map(n => (
                <option key={n.id} value={n.id}>{n.nadi_name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Max Participants (Optional)</label>
            <input type="number" className="form-input" {...register("max_participants")} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="form-group">
            <label className="form-label">Date *</label>
            <input 
              type="date" 
              className="form-input" 
              {...register("date", { required: "Date is required" })} 
            />
            {errors.date && <span className="text-red-500 text-sm">{errors.date.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Start Time *</label>
            <input 
              type="time" 
              className="form-input" 
              {...register("start_time", { required: "Start time is required" })} 
            />
            {errors.start_time && <span className="text-red-500 text-sm">{errors.start_time.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">End Time *</label>
            <input 
              type="time" 
              className="form-input" 
              {...register("end_time", { required: "End time is required" })} 
            />
            {errors.end_time && <span className="text-red-500 text-sm">{errors.end_time.message}</span>}
          </div>
        </div>

        <div className="flex gap-4 mt-4 justify-end">
          <button 
            type="button" 
            className="btn btn-outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className="btn btn-neutral"
            onClick={handleSubmit((data) => onSubmit(data, "draft"))}
            disabled={loading}
          >
            Save as Draft
          </button>
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={handleSubmit((data) => onSubmit(data, "schedule"))}
            disabled={loading}
          >
            Schedule Live Class
          </button>
        </div>
      </form>
    </div>
  );
}
