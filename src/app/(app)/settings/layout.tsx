import { SettingsSidebar } from "@/components/layout/settings-sidebar";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6 px-4 py-6 sm:px-10 sm:py-10 lg:flex-row lg:gap-12">
      <SettingsSidebar />
      <div className="flex-1">{children}</div>
    </div>
  );
}
