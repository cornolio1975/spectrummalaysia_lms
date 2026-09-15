import type { Metadata } from "next";
import { getLiveTrainingReport } from "@/app/actions/live-attendance";
import { getProgrammes } from "@/app/actions/programmes";
import { getTrainers } from "@/app/actions/trainers";

export const metadata: Metadata = { title: "Live Training Report" };

export default async function LiveTrainingReportPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const sp = await searchParams;

  const [reportRes, programmesRes, trainersRes] = await Promise.all([
    getLiveTrainingReport({
      programme_id: sp.programme_id,
      trainer_id: sp.trainer_id,
      date_from: sp.date_from,
      date_to: sp.date_to,
    }),
    getProgrammes(),
    getTrainers(),
  ]);

  const report = reportRes.data || [];
  const programmes = programmesRes.data || [];
  const trainers = trainersRes.data || [];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="page-header">
        <h1>Live Training Report</h1>
        <p>Analytics and attendance for completed Google Meet sessions</p>
      </div>

      <div className="card p-6 mb-6">
        <form className="flex gap-4 flex-wrap items-end" method="GET">
          <div className="form-group flex-grow">
            <label className="form-label">Programme</label>
            <select name="programme_id" className="form-select" defaultValue={sp.programme_id || ""}>
              <option value="">All Programmes</option>
              {programmes.map((p: any) => (
                <option key={p.id} value={p.id}>{p.programme_name}</option>
              ))}
            </select>
          </div>
          <div className="form-group flex-grow">
            <label className="form-label">Trainer</label>
            <select name="trainer_id" className="form-select" defaultValue={sp.trainer_id || ""}>
              <option value="">All Trainers</option>
              {trainers.map((t: any) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Date From</label>
            <input type="date" name="date_from" className="form-input" defaultValue={sp.date_from || ""} />
          </div>
          <div className="form-group">
            <label className="form-label">Date To</label>
            <input type="date" name="date_to" className="form-input" defaultValue={sp.date_to || ""} />
          </div>
          <button type="submit" className="btn btn-primary h-[42px] px-6">Filter</button>
        </form>
      </div>

      <div className="card p-0">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="m-0 text-lg">Report Results ({report.length} classes)</h3>
          <button className="btn btn-outline btn-sm" onClick={() => alert("CSV Export coming soon")}>
            Export CSV
          </button>
        </div>
        
        <table className="data-table w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Class / Programme</th>
              <th className="p-3 text-left">Trainer / NADI</th>
              <th className="p-3 text-right">Duration</th>
              <th className="p-3 text-center">Total</th>
              <th className="p-3 text-center text-green-700">Present</th>
              <th className="p-3 text-center text-yellow-700">Late</th>
              <th className="p-3 text-center text-red-700">Absent</th>
              <th className="p-3 text-right">Att Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {report.length === 0 ? (
              <tr><td colSpan={9} className="p-8 text-center text-muted">No completed classes found matching filters.</td></tr>
            ) : report.map((r: any) => (
              <tr key={r.id}>
                <td className="p-3 whitespace-nowrap">
                  {new Date(r.date).toLocaleDateString()}
                </td>
                <td className="p-3">
                  <div className="font-medium">{r.title}</div>
                  <div className="text-xs text-muted">{r.programme}</div>
                </td>
                <td className="p-3">
                  <div>{r.trainer}</div>
                  <div className="text-xs text-muted">{r.nadi}</div>
                </td>
                <td className="p-3 text-right">{r.duration_min}m</td>
                <td className="p-3 text-center font-bold">{r.total}</td>
                <td className="p-3 text-center text-green-700">{r.present}</td>
                <td className="p-3 text-center text-yellow-700">{r.late}</td>
                <td className="p-3 text-center text-red-700">{r.absent}</td>
                <td className="p-3 text-right font-medium">{r.rate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
