import { getCertificateTemplates } from "@/app/actions/credentials";
import { CertificateDesignerClient } from "@/components/credentials/certificate-designer-client";

export const metadata = {
  title: "Certificate & Credential Designer | SpectrumMY",
  description: "Visual designer for accredited certificates and dynamic credential templates.",
};

export default async function CertificateDesignerPage() {
  const res = await getCertificateTemplates();
  const templates = res.data || [];

  return <CertificateDesignerClient templates={templates} />;
}
