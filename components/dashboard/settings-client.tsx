"use client";

import { useState } from "react";
import { updateSystemSetting } from "@/app/actions/settings";

interface SettingsClientProps {
  settings: any[];
}

export function SettingsClient({ settings }: SettingsClientProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Group settings by category
  const groupedSettings = settings.reduce((acc, setting) => {
    const cat = setting.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(setting);
    return acc;
  }, {} as Record<string, any[]>);

  const startEdit = (setting: any) => {
    setEditingId(setting.id);
    setEditValue(setting.setting_value || "");
  };

  const handleSave = async (id: string) => {
    setIsSubmitting(true);
    const res = await updateSystemSetting(id, editValue);
    setIsSubmitting(false);
    
    if (res.error) {
      alert("Error saving setting: " + res.error);
    } else {
      setEditingId(null);
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>System Settings</h1>
          <p>Configure global application parameters</p>
        </div>
      </div>
      
      <div className="page-body">
        {Object.entries(groupedSettings).length === 0 ? (
          <div className="card text-center p-8 text-gray-500">
            No system settings found.
          </div>
        ) : (
          <div className="space-y-8">
            {(Object.entries(groupedSettings) as [string, any[]][]).map(([category, catSettings]) => (
              <div key={category} className="card max-w-4xl p-0 overflow-hidden">
                <div className="bg-gray-50 p-4 border-b">
                  <h2 className="font-bold text-gray-800 capitalize">{category.replace(/_/g, ' ')} Settings</h2>
                </div>
                <div className="p-4 space-y-6">
                  {catSettings.map((setting) => (
                    <div key={setting.id} className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b last:border-0 pb-6 last:pb-0">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 font-mono text-sm">{setting.setting_key}</h3>
                        <p className="text-sm text-gray-500 mt-1">{setting.description || "No description provided."}</p>
                      </div>
                      <div className="w-full md:w-1/2 flex gap-2 items-start">
                        {editingId === setting.id ? (
                          <div className="flex-1 flex gap-2">
                            {setting.setting_type === 'boolean' ? (
                              <select 
                                className="form-select flex-1" 
                                value={editValue} 
                                onChange={e => setEditValue(e.target.value)}
                              >
                                <option value="true">True</option>
                                <option value="false">False</option>
                              </select>
                            ) : (
                              <input 
                                type={setting.setting_type === 'number' ? 'number' : 'text'}
                                className="form-input flex-1"
                                value={editValue}
                                onChange={e => setEditValue(e.target.value)}
                              />
                            )}
                            <button 
                              className="btn btn-primary btn-sm h-10" 
                              onClick={() => handleSave(setting.id)}
                              disabled={isSubmitting}
                            >
                              Save
                            </button>
                            <button 
                              className="btn btn-outline btn-sm h-10" 
                              onClick={() => setEditingId(null)}
                              disabled={isSubmitting}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex-1 flex gap-2 justify-between items-center bg-gray-50 p-2 rounded border">
                            <span className="font-medium truncate" title={setting.setting_value}>
                              {setting.setting_value || <span className="text-gray-400 italic">Empty</span>}
                            </span>
                            <button 
                              className="text-primary-600 hover:underline text-sm font-medium ml-4 shrink-0"
                              onClick={() => startEdit(setting)}
                            >
                              Edit
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
