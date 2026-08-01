"use client";

import type { ReactNode } from "react";
import FloatingWorkoutTimer from "@/components/FloatingWorkoutTimer";
import { ToastProvider } from "@/components/ui/Toast";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      {children}
      <FloatingWorkoutTimer />
    </ToastProvider>
  );
}
