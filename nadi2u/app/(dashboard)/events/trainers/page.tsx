import { createClient } from "@/utils/supabase/server";
import { getTrainers } from "@/app/actions/trainers";
import Link from "next/link";

export default async function TrainersPage() {
  const { data: trainers, error } = await getTrainers();

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Trainers Management</h1>
          <p>Manage trainers for events and programmes</p>
        </div>
        <div className="header-actions">
          <Link href="/events/trainers/new" className="btn btn-primary">
            + Add Trainer
          </Link>
        </div>
      </div>

      <div className="page-body">
        <div className="card" style={{ padding: "0" }}>
          {error ? (
            <div className="p-8 text-center text-red-500">
              Error loading trainers: {error}
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Trainer Name</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {trainers && trainers.length > 0 ? (
                  trainers.map((trainer: any) => (
                    <tr key={trainer.id}>
                      <td className="font-medium text-primary-600">
                        {trainer.name}
                      </td>
                      <td>
                        <span className="badge badge-success">Active</span>
                      </td>
                      <td className="text-right">
                        <Link href={`/events/trainers/${trainer.id}/edit`} className="text-sm font-medium text-primary-600 hover:underline">
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="text-center p-8 text-gray-500">
                      No trainers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
