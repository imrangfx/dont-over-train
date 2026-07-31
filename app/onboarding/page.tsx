"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Info } from "lucide-react";
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import { supabase } from "@/lib/supabase";
import { FcGoogle } from "react-icons/fc";
import { useToast } from "@/components/ui/Toast";
import InstallAppButton from "@/components/InstallAppButton";

export default function OnboardingPage() {
    const router = useRouter();
    const { toast } = useToast();
    const signInWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: window.location.origin,
            },
        });

        if (error) {
            console.error(error);
            toast(error.message || "Couldn't start Google sign-in.", "error");
        }
    };

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
                    type="button"
                    onClick={() => {
                        localStorage.setItem("hasSeenOnboarding", "true");
                        router.replace("/home");
                    }}
                    className="btn-base w-full h-14 rounded-3xl bg-lime-400 text-black text-lg font-semibold hover:brightness-110 hover:shadow-[0_0_24px_rgba(57,255,20,0.25)]"
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
                    type="button"
                    onClick={signInWithGoogle}
                    className="btn-base w-full h-14 rounded-3xl bg-white text-black text-lg font-semibold flex items-center justify-center gap-3 hover:brightness-95"
                >
                    <FcGoogle size={24} aria-hidden="true" />
                    Continue with Google
                </button>

                <InstallAppButton />

                <p className="mt-2 text-xs text-gray-400">
                    Sync your workouts across all devices
                </p>

                {/* Sign In */}
                <p className="mt-8 text-sm leading-5 text-gray-400 text-center">
                    Sign in with your Google account to sync your workouts
                    across all your devices.
                </p>

                <nav
                    className="mt-10 flex items-center justify-center gap-6"
                    aria-label="Social media"
                >
                    <a
                        href="https://www.instagram.com/dontovertrain/"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Instagram"
                        className="text-gray-500 transition-colors duration-200 hover:text-[#39ff14]"
                    >
                        <FaInstagram size={21} aria-hidden="true" />
                    </a>
                    <a
                        href="https://www.facebook.com/people/Dont-Over-Train/61592736236945/"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Facebook"
                        className="text-gray-500 transition-colors duration-200 hover:text-[#39ff14]"
                    >
                        <FaFacebook size={21} aria-hidden="true" />
                    </a>
                    <a
                        href="https://www.linkedin.com/in/imran-mallik-820a99137/"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="LinkedIn"
                        className="text-gray-500 transition-colors duration-200 hover:text-[#39ff14]"
                    >
                        <FaLinkedin size={21} aria-hidden="true" />
                    </a>
                </nav>

                {/* Info */}
                <div className="mt-12 flex w-full items-start gap-3 rounded-2xl border border-gray-900 bg-neutral-950 p-5">
                    <Info
                        size={20}
                        className="text-lime-400 mt-0.5 shrink-0"
                        aria-hidden="true"
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