import { TrainerTabs } from "@/components/admin/trainer-tabs";

export default function TrainersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <TrainerTabs />
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
