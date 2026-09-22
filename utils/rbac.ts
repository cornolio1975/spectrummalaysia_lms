export type Role = 'super_admin' | 'admin' | 'trainer' | 'learner' | 'observer';

export type Permission = 
  | 'admin.dashboard.view'
  | 'admin.users.view' | 'admin.users.edit'
  | 'admin.roles.view' | 'admin.roles.edit'
  | 'admin.permissions.view' | 'admin.permissions.edit'
  
  // Trainers
  | 'admin.trainers.view' | 'admin.trainers.edit' | 'admin.trainers.approve'
  | 'observer.trainers.view'
  
  // Learners
  | 'admin.learners.view' | 'admin.learners.edit'
  | 'observer.learners.view'
  
  // Courses
  | 'admin.courses.view' | 'admin.courses.edit' | 'admin.courses.publish'
  | 'observer.courses.view'
  
  // NADI
  | 'admin.nadi.view' | 'admin.nadi.edit'
  | 'observer.nadi.view'
  
  // Programmes
  | 'admin.programmes.view' | 'admin.programmes.edit'
  | 'observer.programmes.view'
  
  // Performance & Assess
  | 'admin.assessments.view' | 'admin.assessments.edit'
  | 'observer.assessments.view'
  | 'admin.certificates.view' | 'admin.certificates.issue'
  | 'observer.certificates.view'
  
  // Governance & Reports
  | 'admin.reports.view' | 'admin.reports.export'
  | 'observer.reports.view'
  | 'admin.analytics.view'
  | 'observer.analytics.view'
  | 'admin.audit_logs.view'
  | 'observer.audit_logs.view'
  | 'observer.export'
  
  // Settings
  | 'admin.settings.view' | 'admin.settings.edit'
  
  // Observer specific dashboard
  | 'observer.dashboard.view';

// Map roles to permissions
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  super_admin: [
    // Super admins have all permissions
  ],
  admin: [
    // Assuming standard admins have all generic admin permissions but maybe not system settings
    'admin.dashboard.view',
    'admin.users.view', 'admin.users.edit',
    'admin.trainers.view', 'admin.trainers.edit', 'admin.trainers.approve',
    'admin.learners.view', 'admin.learners.edit',
    'admin.courses.view', 'admin.courses.edit', 'admin.courses.publish',
    'admin.nadi.view', 'admin.nadi.edit',
    'admin.programmes.view', 'admin.programmes.edit',
    'admin.assessments.view', 'admin.assessments.edit',
    'admin.certificates.view', 'admin.certificates.issue',
    'admin.reports.view', 'admin.reports.export',
    'admin.analytics.view',
    'admin.audit_logs.view',
    'admin.roles.view', 'admin.permissions.view'
  ],
  observer: [
    'observer.dashboard.view',
    'observer.trainers.view',
    'observer.learners.view',
    'observer.courses.view',
    'observer.nadi.view',
    'observer.programmes.view',
    'observer.assessments.view',
    'observer.certificates.view',
    'observer.reports.view',
    'observer.analytics.view',
    'observer.audit_logs.view',
    // 'observer.export' - Explicitly omitted by default based on strict requirement
  ],
  trainer: [], // Trainer permissions handled in trainer nav space
  learner: []  // Learner permissions handled in learner nav space
};

/**
 * Checks if a user profile (containing a role) has a specific permission.
 */
export function hasPermission(userRole: string | undefined | null, permission: Permission): boolean {
  if (!userRole) return false;
  
  const role = userRole.toLowerCase() as Role;
  
  // Super Admin gets everything implicitly
  if (role === 'super_admin') return true;
  
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  
  return permissions.includes(permission);
}

/**
 * Validates if the user has access to a specific data scope
 */
export function hasScope(user: any, scopeType: 'nadi_site' | 'state', scopeId: string): boolean {
  if (!user) return false;
  
  // Super Admins bypass scope checks
  if (user.role?.toLowerCase() === 'super_admin') return true;
  
  if (scopeType === 'nadi_site') {
    return user.nadi_site_id === scopeId;
  }
  
  if (scopeType === 'state') {
    return user.state_id === scopeId;
  }
  
  return true;
}
