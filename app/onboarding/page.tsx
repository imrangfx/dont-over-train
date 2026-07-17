"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Info } from "lucide-react";

export default function OnboardingPage() {
    const router = useRouter();

    return (
        <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
            <div className="w-full max-w-[340px] flex flex-col items-center">

                {/* Logo */}
                <div className="mb-20">
                    <Image
                        src="/logo/logo.webp"
                        alt="Don't Over Train"
                        width={160}
                        height={160}
                        priority
                        className="mx-auto"
                    />
                </div>
                {/* Guest Button */}
                <button
                    onClick={() => {
                        localStorage.setItem("hasSeenOnboarding", "true");
                        router.replace("/home");
                      }}
                    className="w-full h-14 rounded-3xl bg-lime-400 text-black text-lg font-semibold transition-all duration-200 hover:brightness-110 hover:shadow-[0_0_24px_rgba(57,255,20,0.25)] active:scale-95"
                >
                    Continue as Guest
                </button>

                <p className="mt-2 mb-6 text-xs text-gray-400">
                    No account required
                </p>

                {/* Divider */}
                <div className="my-6 flex w-full items-center gap-4">
                    <div className="h-px flex-1 bg-gray-800" />
                    <span className="text-sm uppercase tracking-wider text-gray-500">
                        OR
                    </span>
                    <div className="h-px flex-1 bg-gray-800" />
                </div>

                {/* Create Account */}
                <button
                    className="w-full h-14 rounded-3xl bg-yellow-400 text-black text-lg font-semibold transition-all duration-200 hover:brightness-110 hover:shadow-[0_0_24px_rgba(255,212,0,0.20)] active:scale-95"
                >
                    Create Account
                </button>

                <p className="mt-2 text-xs text-gray-400">
                    Sync your workouts across all devices
                </p>

                {/* Sign In */}
                <p className="mt-8 text-sm leading-5 text-gray-400">
                    Already have an account?{" "}
                    <Link
                        href="#"
                        className="text-lime-400 font-semibold hover:underline"
                    >
                        Sign In
                    </Link>
                </p>

                {/* Info */}
                <div className="mt-12 flex w-full items-start gap-3 rounded-2xl border border-gray-900 bg-neutral-950 p-5">
                    <Info
                        size={20}
                        className="text-lime-400 mt-0.5 shrink-0"
                    />

                    <p className="text-sm leading-7 text-gray-400">
                        Your workout history is stored only on this device.
                        <br />
                        Create a free account anytime to sync and back it up.
                    </p>
                </div>
            </div>
        </main>
    );
}