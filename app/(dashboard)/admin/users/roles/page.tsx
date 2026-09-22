import { RolesClient } from "./RolesClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roles & Permissions | SpectrumMY LMS",
};

export default function RolesPage() {
  const initialRoles = [
    {
      id: "super_admin",
      name: "Super Administrator",
      description: "Full system access. Can modify all settings, manage users, and view all data.",
      color: "bg-purple-50 text-purple-700 border-purple-200",
      isSystem: true,
      permissions: [
        { id: "settings", name: "System Settings", has: true },
        { id: "users", name: "User Management", has: true },
        { id: "courses", name: "Course Creation", has: true },
        { id: "reports", name: "Reporting & Analytics", has: true },
        { id: "data", name: "View All Data", has: true },
      ]
    },
    {
      id: "admin",
      name: "Administrator",
      description: "Standard administrative access for day-to-day operations and management.",
      color: "bg-primary-50 text-primary-700 border-primary-200",
      isSystem: false,
      permissions: [
        { id: "settings", name: "System Settings", has: false },
        { id: "users", name: "User Management", has: true },
        { id: "courses", name: "Course Creation", has: true },
        { id: "reports", name: "Reporting & Analytics", has: true },
        { id: "data", name: "View All Data", has: true },
      ]
    },
    {
      id: "trainer",
      name: "Trainer",
      description: "Access to assigned courses, class management, and learner assessments.",
      color: "bg-green-50 text-green-700 border-green-200",
      isSystem: false,
      permissions: [
        { id: "settings", name: "System Settings", has: false },
        { id: "users", name: "User Management", has: false },
        { id: "courses", name: "Course Creation", has: false },
        { id: "reports", name: "Reporting & Analytics", has: false },
        { id: "data", name: "View Assigned Data", has: true },
      ]
    },
    {
      id: "learner",
      name: "Learner",
      description: "Basic access to enrolled courses, digital wallet, and certificates.",
      color: "bg-orange-50 text-orange-700 border-orange-200",
      isSystem: false,
      permissions: [
        { id: "settings", name: "System Settings", has: false },
        { id: "users", name: "User Management", has: false },
        { id: "courses", name: "Course Creation", has: false },
        { id: "reports", name: "Reporting & Analytics", has: false },
        { id: "data", name: "View Own Data", has: true },
      ]
    }
  ];

  return <RolesClient initialRoles={initialRoles} />;
}
