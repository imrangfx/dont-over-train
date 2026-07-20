"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OnboardingPage from "./onboarding/page";
import { supabase } from "@/lib/supabase";
import { ensureProfileExists, migrateGuestHistoryToCloud } from "@/lib/workouts";

// Rotates on the loading screen. Add more tips here anytime.
const FITNESS_TIPS = [
  "Warm up with light cardio and dynamic stretches for 5–10 minutes before every workout.",
  "Stay hydrated before and after training.",
  "Muscles grow during recovery, not during training.",
  "Progressive overload beats random heavy lifting.",
  "Perfect form is better than heavier weight.",
  "Rest 60–90 seconds between hypertrophy sets.",
  "Eat enough protein to support muscle recovery.",
];

export default function Page() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [tip] = useState(
    () => FITNESS_TIPS[Math.floor(Math.random() * FITNESS_TIPS.length)]
  );

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
        className="flex min-h-screen flex-col items-center justify-center gap-5 bg-black px-8 text-center"
      >
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-lime-400" />

        <p className="flex max-w-[280px] items-start justify-center gap-2 text-sm leading-relaxed text-zinc-500">
          <span aria-hidden="true">💡</span>
          <span>{tip}</span>
        </p>
      </main>
    );
  }

  return <OnboardingPage />;
}