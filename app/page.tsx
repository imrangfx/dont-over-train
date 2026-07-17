"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OnboardingPage from "./onboarding/page";

export default function Page() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");

    if (hasSeenOnboarding === "true") {
      router.replace("/home");
    } else {
      setChecking(false);
    }
  }, [router]);

  if (checking) {
    return null;
  }

  return <OnboardingPage />;
}