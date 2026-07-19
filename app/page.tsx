"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OnboardingPage from "./onboarding/page";
import { supabase } from "@/lib/supabase";
import { ensureProfileExists, migrateGuestHistoryToCloud } from "@/lib/workouts";

export default function Page() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // Logged in with Google
      if (session) {
        localStorage.setItem("hasSeenOnboarding", "true");

        try {
          const { error: profileError } = await ensureProfileExists(session.user.id, {
            full_name:
              session.user.user_metadata?.full_name ??
              session.user.user_metadata?.name ??
              null,
            avatar_url:
              session.user.user_metadata?.avatar_url ??
              session.user.user_metadata?.picture ??
              null,
          });

          if (profileError) {
            console.error("Failed to create profile:", profileError);
          } else {
            await migrateGuestHistoryToCloud(session.user.id);
          }
        } catch (err) {
          console.error("Guest history migration failed:", err);
        }

        router.replace("/home");
        return;
      }

      // Guest user
      const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");

      if (hasSeenOnboarding === "true") {
        router.replace("/home");
      } else {
        setChecking(false);
      }
    }

    checkUser();
  }, [router]);

  if (checking) {
    return (
      <main
        role="status"
        aria-label="Loading"
        className="flex min-h-screen items-center justify-center bg-black"
      >
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-lime-400" />
      </main>
    );
  }

  return <OnboardingPage />;
}