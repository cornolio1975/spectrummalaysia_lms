"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createNadiAssignment, createCourseAssignment } from "@/app/actions/trainers";

export function TrainerAssignmentsClient({ 
  trainers, 
  nadiSites, 
  programmes,
  courses,
  states,
  nadiAssignments,
  courseAssignments
}: any) {
  const searchParams = useSearchParams();
  const initialType = searchParams.get('type') || 'nadi';
  
  const [activeTab, setActiveTab] = useState(initialType);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const router = useRouter();

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleNadiSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      trainer_id: formData.get("trainer_id"),
      state_id: formData.get("state_id") || null,
      nadi_id: formData.get("nadi_id") || null,
      programme_id: formData.get("programme_id") || null,
      is_primary: formData.get("is_primary") === "on",
      start_date: formData.get("start_date") || new Date().toISOString().split('T')[0],
      end_date: formData.get("end_date") || null,
      status: "active"
    };
    
    await createNadiAssignment(data);
    setIsSubmitting(false);
    setIsModalOpen(false);
    router.refresh();
  };

  const handleCourseSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const selection = formData.get("programme_or_course") as string;
    
    let programme_id = null;
    let course_id = null;
    
    if (selection.startsWith("prog_")) {
      programme_id = selection.replace("prog_", "");
    } else if (selection.startsWith("course_")) {
      course_id = selection.replace("course_", "");
    }

    const data = {
      trainer_id: formData.get("trainer_id"),
      programme_id,
      course_id,
      role: formData.get("role") || "Lead Trainer",
      nadi_id: formData.get("nadi_id") || null,
      start_date: formData.get("start_date") || new Date().toISOString().split('T')[0],
      end_date: formData.get("end_date") || null,
      status: "active"
    };
    
    await createCourseAssignment(data);
    setIsSubmitting(false);
    setIsModalOpen(false);
    router.refresh();
  };

  return (
    <div>
      <div className="flex gap-4 border-b border-gray-200 mb-6">
        <button 
          onClick={() => setActiveTab('nadi')}
          className={`pb-3 font-medium transition-colors ${activeTab === 'nadi' ? 'border-b-2 border-primary-500 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          NADI Site Assignments
        </button>
        <button 
          onClick={() => setActiveTab('course')}
          className={`pb-3 font-medium transition-colors ${activeTab === 'course' ? 'border-b-2 border-primary-500 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Course Assignments
        </button>
      </div>
      
      <div className="mb-6 flex justify-end">
        <button onClick={handleOpenModal} className="btn btn-primary">
          + Assign {activeTab === 'nadi' ? 'NADI Site' : 'Course'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {activeTab === 'nadi' ? (
          <table className="data-table w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-4 text-left font-medium text-gray-500">Trainer</th>
                <th className="p-4 text-left font-medium text-gray-500">State</th>
                <th className="p-4 text-left font-medium text-gray-500">NADI Site</th>
                <th className="p-4 text-left font-medium text-gray-500">Primary</th>
                <th className="p-4 text-left font-medium text-gray-500">Start Date</th>
                <th className="p-4 text-left font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {nadiAssignments && nadiAssignments.length > 0 ? nadiAssignments.map((row: any) => (
                <tr key={row.id} className="border-t border-gray-100">
                  <td className="p-4 font-medium text-primary-600">{row.trainers?.name}</td>
                  <td className="p-4">{row.states?.state_name || "-"}</td>
                  <td className="p-4">{row.nadi_sites?.site_name || "-"}</td>
                  <td className="p-4">{row.is_primary ? "Yes" : "No"}</td>
                  <td className="p-4">{row.start_date}</td>
                  <td className="p-4 capitalize">
                    <span className={`badge ${row.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>{row.status}</span>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">No NADI assignments found.</td></tr>
              )}
            </tbody>
          </table>
        ) : (
          <table className="data-table w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-4 text-left font-medium text-gray-500">Trainer</th>
                <th className="p-4 text-left font-medium text-gray-500">Course</th>
                <th className="p-4 text-left font-medium text-gray-500">Role</th>
                <th className="p-4 text-left font-medium text-gray-500">NADI Site</th>
                <th className="p-4 text-left font-medium text-gray-500">Start Date</th>
                <th className="p-4 text-left font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {courseAssignments && courseAssignments.length > 0 ? courseAssignments.map((row: any) => (
                <tr key={row.id} className="border-t border-gray-100">
                  <td className="p-4 font-medium text-primary-600">{row.trainers?.name}</td>
                  <td className="p-4">
                    {row.programmes?.programme_name || row.courses?.title || "-"}
                    {row.courses && <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Micro-credential</span>}
                  </td>
                  <td className="p-4">{row.role}</td>
                  <td className="p-4">{row.nadi_sites?.site_name || "All"}</td>
                  <td className="p-4">{row.start_date}</td>
                  <td className="p-4 capitalize">
                    <span className={`badge ${row.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>{row.status}</span>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">No Course assignments found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold">Assign {activeTab === 'nadi' ? 'NADI Site' : 'Course'}</h2>
            </div>
            
            <form onSubmit={activeTab === 'nadi' ? handleNadiSubmit : handleCourseSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Trainer *</label>
                <select name="trainer_id" required className="form-select w-full">
                  <option value="">Select Trainer...</option>
                  {trainers?.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>

              {activeTab === 'nadi' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">State</label>
                    <select name="state_id" className="form-select w-full">
                      <option value="">Select State (Optional)...</option>
                      {states?.map((s: any) => <option key={s.id} value={s.id}>{s.state_name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">NADI Site *</label>
                    <select name="nadi_id" required className="form-select w-full">
                      <option value="">Select NADI Site...</option>
                      {nadiSites?.map((n: any) => <option key={n.id} value={n.id}>{n.site_name}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <input type="checkbox" name="is_primary" id="is_primary" />
                    <label htmlFor="is_primary" className="text-sm">Set as Primary NADI Site</label>
                  </div>
                </>
              )}

              {activeTab === 'course' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Course / Programme *</label>
                    <select name="programme_or_course" required className="form-select w-full">
                      <option value="">Select Course...</option>
                      <optgroup label="Programmes">
                        {programmes?.map((p: any) => <option key={p.id} value={`prog_${p.id}`}>{p.programme_name}</option>)}
                      </optgroup>
                      <optgroup label="Micro-credential Courses">
                        {courses?.map((c: any) => <option key={c.id} value={`course_${c.id}`}>{c.title}</option>)}
                      </optgroup>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Role</label>
                    <select name="role" className="form-select w-full">
                      <option value="Lead Trainer">Lead Trainer</option>
                      <option value="Co-Trainer">Co-Trainer</option>
                      <option value="Facilitator">Facilitator</option>
                      <option value="Assessor">Assessor</option>
                      <option value="Moderator">Moderator</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">NADI Site (Optional Override)</label>
                    <select name="nadi_id" className="form-select w-full">
                      <option value="">All Assigned Sites</option>
                      {nadiSites?.map((n: any) => <option key={n.id} value={n.id}>{n.site_name}</option>)}
                    </select>
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date *</label>
                  <input type="date" name="start_date" required className="form-input w-full" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <input type="date" name="end_date" className="form-input w-full" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={handleCloseModal} className="btn btn-outline" disabled={isSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? "Assigning..." : "Confirm Assignment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
