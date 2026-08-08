"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { SettingsSidebar } from "@/components/layout/settings-sidebar";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollPositions = useRef<Record<string, number>>({});

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    el.scrollTop = scrollPositions.current[pathname] ?? 0;
    function handleScroll() {
      scrollPositions.current[pathname] = el!.scrollTop;
    }
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  return (
    <div className="flex flex-col gap-6 px-4 py-6 sm:px-10 sm:py-10 lg:h-[calc(100vh-4rem)] lg:flex-row lg:gap-12 lg:overflow-hidden lg:py-10">
      <div className="lg:h-full lg:shrink-0 lg:overflow-y-auto">
        <SettingsSidebar />
      </div>
      <div ref={contentRef} className="flex-1 lg:h-full lg:overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
