"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { migrateGuestHistoryToCloud } from "@/lib/workouts";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    async function handleCallback() {
      const { data } = await supabase.auth.getSession();
      const userId = data.session?.user?.id;

      if (userId) {
        try {
          await migrateGuestHistoryToCloud(userId);
        } catch (err) {
          console.error("Guest history migration failed:", err);
        }
      }

      router.replace("/home");
    }

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white">
      Signing you in...
    </div>
  );
}