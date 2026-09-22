"use client";

import { useState } from "react";
import { Shield, Users, UserCog, GraduationCap, Check, X, Edit, Save } from "lucide-react";

export function RolesClient({ initialRoles }: { initialRoles: any[] }) {
  const [isEditing, setIsEditing] = useState(false);
  const [roles, setRoles] = useState(initialRoles);

  const handleTogglePermission = (roleId: string, permId: string) => {
    if (!isEditing) return;
    
    // Prevent editing Super Admin permissions
    if (roleId === 'super_admin') return;

    setRoles(roles.map(role => {
      if (role.id === roleId) {
        return {
          ...role,
          permissions: role.permissions.map((p: any) => 
            p.id === permId ? { ...p, has: !p.has } : p
          )
        };
      }
      return role;
    }));
  };

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to the database
    alert("Permissions matrix saved successfully!");
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Roles & Permissions</h1>
          <p className="text-gray-500">
            Review and manage the system's role-based access control (RBAC) matrix.
          </p>
        </div>
        
        {isEditing ? (
          <button 
            type="button"
            onClick={handleSave}
            className="btn btn-primary flex items-center gap-2 shadow-sm"
          >
            <Save className="h-4 w-4" /> Save Changes
          </button>
        ) : (
          <button 
            type="button"
            onClick={() => setIsEditing(true)}
            className="btn btn-outline flex items-center gap-2"
          >
            <Edit className="h-4 w-4" /> Edit Permissions
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {roles.map((role) => (
          <div key={role.id} className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-all duration-200 ${isEditing && !role.isSystem ? 'border-primary-300 ring-1 ring-primary-300 shadow-md' : 'border-gray-200'}`}>
            <div className={`p-6 border-b flex items-start gap-4 ${role.color.split(' ')[0]}`}>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                {role.id === 'super_admin' ? <Shield className="h-6 w-6 text-purple-600" /> : 
                 role.id === 'admin' ? <UserCog className="h-6 w-6 text-primary-600" /> : 
                 role.id === 'trainer' ? <Users className="h-6 w-6 text-green-600" /> : 
                 <GraduationCap className="h-6 w-6 text-orange-600" />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h2 className={`text-lg font-bold ${role.color.split(' ')[1]}`}>{role.name}</h2>
                  {role.isSystem && (
                    <span className="text-xs font-bold bg-white/50 text-purple-800 px-2 py-1 rounded-md">SYSTEM</span>
                  )}
                </div>
                <p className="text-sm mt-1 text-gray-600">{role.description}</p>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Key Permissions</h3>
                {isEditing && !role.isSystem && (
                  <span className="text-xs text-primary-600 font-medium bg-primary-50 px-2 py-1 rounded">Edit Mode Active</span>
                )}
              </div>
              
              <ul className="space-y-3">
                {role.permissions.map((perm: any) => (
                  <li key={perm.id} className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-gray-50 -mx-2 transition-colors">
                    <span className="text-gray-700 font-medium">{perm.name}</span>
                    
                    <button 
                      type="button"
                      onClick={() => handleTogglePermission(role.id, perm.id)}
                      disabled={!isEditing || role.isSystem}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                        perm.has 
                          ? isEditing && !role.isSystem ? 'bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer' : 'text-green-600 font-medium'
                          : isEditing && !role.isSystem ? 'bg-gray-100 text-gray-500 hover:bg-gray-200 cursor-pointer' : 'text-gray-400'
                      }`}
                    >
                      {perm.has ? (
                        <><Check className="h-4 w-4" /> {isEditing && !role.isSystem ? 'Enabled' : 'Yes'}</>
                      ) : (
                        <><X className="h-4 w-4" /> {isEditing && !role.isSystem ? 'Disabled' : 'No'}</>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
              
              {isEditing && role.isSystem && (
                <p className="text-xs text-gray-400 mt-4 text-center italic">
                  Super Administrator permissions cannot be modified.
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
