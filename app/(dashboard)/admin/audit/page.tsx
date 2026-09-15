import type { Metadata } from "next";
import { getAuditLogs } from "@/app/actions/audit";
import { AuditClient } from "@/components/dashboard/audit-client";

export const metadata: Metadata = { title: "System Audit Logs" };

export default async function AuditLogsPage() {
  const auditRes = await getAuditLogs(200); // fetch last 200 logs
  const auditLogs = auditRes.data || [];

  return <AuditClient auditLogs={auditLogs} />;
}
