"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ParticipantClassJoinClientProps {
  liveClass: any;
}

export function ParticipantClassJoinClient({ liveClass }: ParticipantClassJoinClientProps) {
  const router = useRouter();
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async () => {
    setJoining(true);
    setError(null);
    try {
      const res = await fetch(`/api/live-classes/join/${liveClass.id}`, {
        method: "POST"
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Failed to join class");
        return;
      }

      if (data.meetUrl) {
        window.location.href = data.meetUrl;
      } else {
        setError("Meeting URL not found in response.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setJoining(false);
    }
  };

  const isLive = liveClass.status === "live";
  const isCancelled = liveClass.status === "cancelled";
  const isCompleted = liveClass.status === "completed";

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <div className="mb-4">
        <Link href="/my-classes" className="text-sm text-muted hover:underline">
          ← Back to My Classes
        </Link>
      </div>

      <div className="card p-0 overflow-hidden shadow-xl rounded-2xl border-0">
        <div className={`p-8 text-white ${isLive ? "bg-gradient-to-br from-blue-600 to-indigo-700" : "bg-gradient-to-br from-gray-700 to-gray-900"}`}>
          <div className="text-sm font-medium uppercase tracking-widest text-blue-200 mb-2">
            Live Training Session
          </div>
          <h1 className="text-4xl font-bold mb-4 text-white leading-tight">{liveClass.title}</h1>
          <p className="text-blue-100 text-lg">{liveClass.programmes?.programme_name}</p>
        </div>

        <div className="p-8">
          {isCancelled && (
            <div className="alert alert-danger mb-6">
              <h4 className="m-0 text-red-900">Class Cancelled</h4>
              <p className="mt-1">This live class has been cancelled. Please check your other classes.</p>
            </div>
          )}

          {isCompleted && (
            <div className="alert alert-warning mb-6">
              <h4 className="m-0 text-yellow-900">Class Completed</h4>
              <p className="mt-1">This class has already ended.</p>
            </div>
          )}

          {error && (
            <div className="alert alert-danger mb-6">{error}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <div className="text-sm text-muted uppercase tracking-wider mb-1">Schedule</div>
              <div className="text-lg font-medium">
                {new Date(liveClass.scheduled_start).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
              <div className="text-lg text-muted">
                {new Date(liveClass.scheduled_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(liveClass.scheduled_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (MYT)
              </div>
            </div>
            <div>
              <div className="text-sm text-muted uppercase tracking-wider mb-1">Trainer</div>
              <div className="flex items-center gap-3 mt-2">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-lg">
                  {(liveClass.trainers?.name || "T")[0]}
                </div>
                <div>
                  <div className="font-medium text-lg">{liveClass.trainers?.name || "To be announced"}</div>
                  <div className="text-sm text-muted">{liveClass.trainers?.organization}</div>
                </div>
              </div>
            </div>
          </div>

          {liveClass.description && (
            <div className="mb-8 p-4 bg-gray-50 rounded-xl">
              <div className="text-sm font-medium mb-2">Class Description</div>
              <p className="text-muted">{liveClass.description}</p>
            </div>
          )}

          <div className="flex flex-col items-center pt-6 border-t">
            {!isCancelled && !isCompleted && (
              <>
                <button
                  className={`btn btn-lg w-full max-w-sm rounded-full text-lg shadow-lg h-14 ${
                    isLive ? "btn-primary animate-pulse" : "btn-neutral opacity-50 cursor-not-allowed"
                  }`}
                  onClick={handleJoin}
                  disabled={joining || !isLive}
                >
                  {joining ? "Joining..." : isLive ? "🎥 JOIN GOOGLE MEET" : "Wait for class to start"}
                </button>
                {!isLive && (
                  <p className="text-sm text-muted mt-4 text-center">
                    The join button will become active when the trainer starts the session.
                  </p>
                )}
                <div className="text-xs text-muted mt-4 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                  Secured by SpectrumMY LMS Authorization
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
