"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ensureProfileExists, migrateGuestHistoryToCloud } from "@/lib/workouts";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    async function handleCallback() {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      if (user) {
        try {
          const { error: profileError } = await ensureProfileExists(user.id, {
            full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
            avatar_url:
              user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null,
          });

          if (profileError) {
            console.error("Failed to create profile:", profileError);
          } else {
            await migrateGuestHistoryToCloud(user.id);
          }
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