"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Briefcase, Mail, Phone, MapPin, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
// Assuming there is an action for creating a trainer
// import { createTrainer } from "@/app/actions/trainers"; 

export default function AddTrainerPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    ic_number: "",
    address: "",
    city: "",
    state: "",
    specialization: "",
    bio: "",
    years_experience: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // In a real implementation:
      // await createTrainer(formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      router.push("/admin/trainers");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to create trainer");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-[1000px] mx-auto">
      <div className="mb-6">
        <Link href="/admin/trainers" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Directory
        </Link>
      </div>
      
      <div className="page-header mb-8">
        <h1 className="text-2xl font-bold mb-2">Add New Trainer</h1>
        <p className="text-gray-500">Create a new trainer profile and securely connect it to their LMS identity.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-2">
            <User className="h-5 w-5 text-gray-500" />
            <h3 className="font-bold text-gray-900">Personal Information</h3>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input 
                required
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500" 
                placeholder="e.g. Ahmad bin Abdullah"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IC / Passport Number *</label>
              <input 
                required
                type="text" 
                name="ic_number"
                value={formData.ic_number}
                onChange={handleChange}
                className="form-input w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500" 
                placeholder="e.g. 900101-14-5123"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input 
                  required
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input w-full pl-10 rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500" 
                  placeholder="ahmad@example.com"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">This email will be used to log in to the Trainer Console.</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 text-gray-400" />
                </div>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input w-full pl-10 rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500" 
                  placeholder="+60 12-345 6789"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-gray-500" />
            <h3 className="font-bold text-gray-900">Location</h3>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
              <textarea 
                rows={2}
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="form-textarea w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500" 
                placeholder="Enter complete address..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input 
                type="text" 
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="form-input w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500" 
                placeholder="e.g. Kuala Lumpur"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State / Region</label>
              <select 
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="form-select w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="">Select a state...</option>
                <option value="Kuala Lumpur">Kuala Lumpur</option>
                <option value="Selangor">Selangor</option>
                <option value="Penang">Penang</option>
                <option value="Johor">Johor</option>
                <option value="Sabah">Sabah</option>
                <option value="Sarawak">Sarawak</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-gray-500" />
            <h3 className="font-bold text-gray-900">Professional Profile</h3>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Professional Biography</label>
              <textarea 
                rows={4}
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="form-textarea w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500" 
                placeholder="Describe the trainer's background, teaching style, and key achievements..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specializations (Comma separated)</label>
              <input 
                type="text" 
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                className="form-input w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500" 
                placeholder="e.g. Leadership, Digital Marketing, Python"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
              <input 
                type="number" 
                name="years_experience"
                value={formData.years_experience}
                onChange={handleChange}
                min="0"
                className="form-input w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500" 
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Link href="/admin/trainers" className="btn btn-outline">
            Cancel
          </Link>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="btn btn-primary flex items-center gap-2"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <Save className="h-5 w-5" />
            )}
            {isSubmitting ? 'Creating...' : 'Create Trainer Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
