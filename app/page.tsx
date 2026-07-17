"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OnboardingPage from "./onboarding/page";
import { supabase } from "@/lib/supabase";
import { migrateGuestHistoryToCloud } from "@/lib/workouts";

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
          await migrateGuestHistoryToCloud(session.user.id);
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
  // Test Supabase Connection
  useEffect(() => {
    async function testSupabase() {
      const { data, error } = await supabase.auth.getSession();

      console.log("✅ Supabase Connected");
      console.log("Session:", data.session);
      console.log("Error:", error);
    }

    testSupabase();
  }, []);
  if (checking) {
    return null;
  }

  return <OnboardingPage />;
}