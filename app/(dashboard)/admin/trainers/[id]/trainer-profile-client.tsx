"use client";

import { useState } from "react";
import { User, Briefcase, FileText, Award, BookOpen, MapPin, Mail, Phone, Calendar } from "lucide-react";
import Link from "next/link";

export function TrainerProfileClient({ trainer, credentials, documents, assignments }: { trainer: any, credentials: any[], documents: any[], assignments: any[] }) {
  const [activeTab, setActiveTab] = useState('personal');

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'professional', label: 'Professional Info', icon: Briefcase },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'credentials', label: 'Credentials', icon: Award },
    { id: 'assignments', label: 'LMS Assignments', icon: BookOpen },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sidebar Profile Card */}
      <div className="w-full md:w-80 flex-shrink-0">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-primary-500 to-primary-700"></div>
          <div className="px-6 flex flex-col items-center -mt-16 mb-6">
            <div className="h-32 w-32 bg-white rounded-full p-2 mb-4">
              <div className="h-full w-full bg-primary-100 rounded-full flex items-center justify-center text-4xl text-primary-700 font-bold border-4 border-white shadow-md">
                {trainer.name?.substring(0,2).toUpperCase()}
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 text-center">{trainer.name}</h2>
            <p className="text-gray-500 font-medium mb-4">{trainer.specialization || "General Trainer"}</p>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              trainer.status === 'active' ? 'bg-green-100 text-green-700' : 
              trainer.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
              'bg-red-100 text-red-700'
            }`}>
              {trainer.status}
            </span>
          </div>
          
          <div className="border-t border-gray-100 px-6 py-4 space-y-3 text-sm">
            <div className="flex items-center text-gray-600 gap-3">
              <Mail className="h-4 w-4" />
              <span>{trainer.email || "No email"}</span>
            </div>
            <div className="flex items-center text-gray-600 gap-3">
              <Phone className="h-4 w-4" />
              <span>{trainer.phone || "No phone"}</span>
            </div>
            <div className="flex items-center text-gray-600 gap-3">
              <MapPin className="h-4 w-4" />
              <span>{trainer.city || "No location"}</span>
            </div>
            <div className="flex items-center text-gray-600 gap-3">
              <Calendar className="h-4 w-4" />
              <span>Joined {new Date(trainer.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-[600px]">
        <div className="flex border-b border-gray-200 overflow-x-auto bg-gray-50/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-primary-600 text-primary-600 bg-white"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-8 flex-1">
          {activeTab === 'personal' && (
            <div className="max-w-2xl">
              <h3 className="text-lg font-bold mb-6">Personal Information</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1 block">Full Name</label>
                  <p className="font-medium">{trainer.name}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1 block">Email Address</label>
                  <p className="font-medium">{trainer.email}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1 block">Phone Number</label>
                  <p className="font-medium">{trainer.phone || "-"}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1 block">Date of Birth</label>
                  <p className="font-medium">{trainer.dob || "-"}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1 block">Address</label>
                  <p className="font-medium">{trainer.address || "-"}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1 block">City</label>
                  <p className="font-medium">{trainer.city || "-"}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1 block">State / Region</label>
                  <p className="font-medium">{trainer.state || "-"}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'professional' && (
            <div className="max-w-3xl">
              <h3 className="text-lg font-bold mb-6">Professional Profile</h3>
              
              <div className="mb-8">
                <label className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2 block">Biography</label>
                <div className="bg-gray-50 p-4 rounded-lg text-gray-700 leading-relaxed">
                  {trainer.bio || "No professional biography provided."}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2 block">Specializations</label>
                  <div className="flex flex-wrap gap-2">
                    {trainer.specialization ? trainer.specialization.split(',').map((spec: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">
                        {spec.trim()}
                      </span>
                    )) : <span className="text-gray-500 italic">None specified</span>}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2 block">Years of Experience</label>
                  <p className="text-2xl font-bold text-gray-900">{trainer.years_experience || 0} <span className="text-base font-normal text-gray-500">years</span></p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Uploaded Documents</h3>
                <button className="btn btn-primary text-sm py-1.5 px-3">Upload New</button>
              </div>
              
              {documents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documents.map((doc: any) => (
                    <div key={doc.id} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors">
                      <div className="h-10 w-10 bg-red-50 text-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 line-clamp-1">{doc.document_name}</h4>
                        <p className="text-xs text-gray-500 capitalize">{doc.document_type} • {(doc.file_size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <a href={doc.file_url} target="_blank" rel="noreferrer" className="text-primary-600 hover:text-primary-800 text-sm font-medium">
                        View
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <FileText className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                  <h4 className="font-medium text-gray-900">No documents found</h4>
                  <p className="text-sm text-gray-500 mt-1">This trainer hasn't uploaded any CVs or identity documents yet.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'credentials' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Verified Credentials</h3>
                <Link href="/admin/trainers/credentials" className="btn btn-primary text-sm py-1.5 px-3">Issue Credential</Link>
              </div>

              {credentials.length > 0 ? (
                <div className="space-y-4">
                  {credentials.map((cred: any) => (
                    <div key={cred.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                      <div className="h-12 w-12 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Award className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{cred.credential_name}</h4>
                        <p className="text-sm text-gray-500">Issued by {cred.issuing_organization}</p>
                      </div>
                      <div className="text-right">
                        <span className="block text-sm font-medium text-gray-900">Valid until</span>
                        <span className="text-sm text-gray-500">{cred.expiry_date || "Lifetime"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <Award className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                  <h4 className="font-medium text-gray-900">No credentials on file</h4>
                  <p className="text-sm text-gray-500 mt-1">There are no professional certifications logged for this trainer.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'assignments' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">LMS Assignments</h3>
                <Link href="/admin/trainers/assignments" className="btn btn-primary text-sm py-1.5 px-3">Assign Course</Link>
              </div>

              {assignments.length > 0 ? (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 font-medium text-gray-500">Course / Programme</th>
                        <th className="px-4 py-3 font-medium text-gray-500">Role</th>
                        <th className="px-4 py-3 font-medium text-gray-500">Duration</th>
                        <th className="px-4 py-3 font-medium text-gray-500 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {assignments.map((assignment: any) => (
                        <tr key={assignment.id}>
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {assignment.programmes?.programme_name || assignment.courses?.title || "Unknown"}
                          </td>
                          <td className="px-4 py-3 text-gray-600">{assignment.role}</td>
                          <td className="px-4 py-3 text-gray-600">
                            {assignment.start_date} {assignment.end_date ? `to ${assignment.end_date}` : 'onwards'}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="badge badge-success capitalize">{assignment.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <BookOpen className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                  <h4 className="font-medium text-gray-900">No active assignments</h4>
                  <p className="text-sm text-gray-500 mt-1">This trainer is not currently assigned to any courses or programmes.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
