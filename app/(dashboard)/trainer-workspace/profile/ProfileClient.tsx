'use client'

import { useState } from 'react';
import { updateTrainerProfile } from './actions';
import { useRouter } from 'next/navigation';

export default function ProfileClient({ trainer }: { trainer: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const result = await updateTrainerProfile(formData);
    
    setIsLoading(false);
    
    if (result.success) {
      setIsEditing(false);
      router.refresh();
    } else {
      alert('Failed to update profile: ' + result.error);
    }
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
      <div className="p-8">
        <div className="flex items-center space-x-6 mb-8">
          <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold border-4 border-white shadow-sm">
            {trainer.name ? trainer.name.charAt(0).toUpperCase() : 'T'}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{trainer.name}</h2>
            <p className="text-gray-500">{trainer.specialization || 'Trainer'}</p>
            <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {trainer.status.charAt(0).toUpperCase() + trainer.status.slice(1)}
            </div>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="border-t pt-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Contact Information</h3>
                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-1">Email Address (Read-only)</label>
                  <input type="text" disabled defaultValue={trainer.email} className="w-full border-gray-300 rounded-md shadow-sm bg-gray-50 px-3 py-2 text-sm text-gray-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-1">Full Name</label>
                  <input type="text" name="name" required defaultValue={trainer.name} className="w-full border-gray-300 rounded-md shadow-sm px-3 py-2 border focus:ring-blue-500 focus:border-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-1">Phone Number</label>
                  <input type="text" name="phone" defaultValue={trainer.phone || ''} className="w-full border-gray-300 rounded-md shadow-sm px-3 py-2 border focus:ring-blue-500 focus:border-blue-500 text-sm" />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Professional Details</h3>
                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-1">Organization</label>
                  <input type="text" name="organization" defaultValue={trainer.organization || ''} className="w-full border-gray-300 rounded-md shadow-sm px-3 py-2 border focus:ring-blue-500 focus:border-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-1">Specialization</label>
                  <input type="text" name="specialization" defaultValue={trainer.specialization || ''} className="w-full border-gray-300 rounded-md shadow-sm px-3 py-2 border focus:ring-blue-500 focus:border-blue-500 text-sm" />
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={isLoading} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 flex items-center">
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t pt-8">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Contact Information</h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm text-gray-400">Email Address</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-medium">{trainer.email}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-400">Phone Number</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-medium">{trainer.phone || 'Not provided'}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Professional Details</h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm text-gray-400">Organization</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-medium">{trainer.organization || 'Not provided'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-400">Specialization</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-medium">{trainer.specialization || 'Not provided'}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </div>
      
      {!isEditing && (
        <div className="bg-gray-50 px-8 py-4 border-t flex justify-between items-center">
          <p className="text-sm text-gray-500">Need to update your profile?</p>
          <button onClick={() => setIsEditing(true)} className="bg-white border border-gray-300 rounded-md shadow-sm px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Edit Profile
          </button>
        </div>
      )}
    </div>
  );
}
