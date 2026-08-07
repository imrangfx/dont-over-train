"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronRight,
  Cloud,
  CloudUpload,
  Info,
  ShieldCheck,
  Smartphone,
  Zap,
} from "lucide-react";
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import InstallAppButton from "@/components/InstallAppButton";
import { MdBolt } from "react-icons/md";

const FEATURES = [
  {
    title: "Backup Data",
    description: "Never lose your workout history.",
    Icon: CloudUpload,
  },
  {
    title: "All Devices",
    description: "Access from anywhere.",
    Icon: Smartphone,
  },
  {
    title: "Secure & Private",
    description: "Your data is protected.",
    Icon: ShieldCheck,
  },
] as const;

const SOCIAL_LINKS = [
  {
    href: "https://www.instagram.com/dontovertrain/",
    label: "Instagram",
    Icon: FaInstagram,
  },
  {
    href: "https://www.facebook.com/people/Dont-Over-Train/61592736236945/",
    label: "Facebook",
    Icon: FaFacebook,
  },
  {
    href: "https://www.linkedin.com/in/imran-mallik-820a99137/",
    label: "LinkedIn",
    Icon: FaLinkedin,
  },
] as const;

const btnPrimary =
  "btn-base flex h-[58px] w-full items-center justify-between gap-3 rounded-[12px] px-5 text-[17px] font-semibold shadow-[0_10px_28px_rgba(0,0,0,0.35)] transition-[transform,box-shadow,filter] duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]";

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

  const continueAsGuest = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    router.replace("/home");
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-black text-white">
      {/* Full-screen cinematic artwork */}
      <div className="pointer-events-none fixed inset-0 z-0 animate-onboarding-fade">
        <Image
          src="/onboarding/back-hero.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-top"
        />
      </div>

      {/* Soft readability overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-black/10"
        aria-hidden="true"
      />

      {/* Logo Overlay */}
      <div className="absolute left-1/2 top-[160px] z-20 -translate-x-1/2">
        <Image
          src="/logo/logo.webp"
          alt="Don't Over Train"
          width={170}
          height={170}
          priority
          className="drop-shadow-[0_12px_30px_rgba(0,0,0,0.75)]"
        />
      </div>

      {/* Foreground UI */}
      <div className="relative z-10 mx-auto flex w-full max-w-[480px] flex-col items-center px-5 pb-12 pt-[320px] sm:px-6">

        {/* Guest CTA */}
        <div className="animate-onboarding-rise-delay-1 w-full">
          <button
            type="button"
            onClick={continueAsGuest}
            className={`${btnPrimary} bg-lime-400 text-black hover:brightness-110 hover:shadow-[0_0_30px_rgba(170,255,0,.18)]`}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/10">
              <MdBolt size={18} className="text-black" />
            </span>

            <span className="flex-1 text-center">Continue as Guest</span>

            <ChevronRight size={18} className="text-black/65" />
          </button>

          <p className="mt-3 flex items-center justify-center gap-1.5 text-[13px] text-zinc-500">
            <Check size={13} className="text-lime-400" />
            No account required
          </p>
        </div>

        {/* OR */}
        <div className="animate-onboarding-rise-delay-2 mt-6 flex w-full items-center gap-4">
          <div className="h-px flex-1 bg-zinc-800" />
          <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500">
            OR
          </span>
          <div className="h-px flex-1 bg-zinc-800" />
        </div>

        {/* Google */}
        <div className="animate-onboarding-rise-delay-2 mt-6 w-full">
          <button
            type="button"
            onClick={signInWithGoogle}
            className={`${btnPrimary} bg-white text-black hover:brightness-[0.97] hover:shadow-[0_14px_32px_rgba(255,255,255,0.12)]`}
          >
            <FcGoogle size={24} aria-hidden="true" />
            <span className="flex-1 text-center">Continue with Google</span>
            <ChevronRight size={18} className="text-black/45" aria-hidden="true" />
          </button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-[13px] text-zinc-500">
            <Cloud size={13} className="text-lime-400/80" aria-hidden="true" />
            Sync workouts across all devices
          </p>
        </div>

        {/* Features */}
        <section
          aria-label="Why create an account"
          className="animate-onboarding-rise-delay-3 mt-8 w-full overflow-hidden rounded-[18px] border border-zinc-800/90 bg-[#111] shadow-[0_12px_32px_rgba(0,0,0,0.4)]"
        >
          <div className="grid grid-cols-3 divide-x divide-zinc-800/90">
            {FEATURES.map(({ title, description, Icon }) => (
              <div
                key={title}
                className="flex flex-col items-center px-3 py-6 text-center sm:px-4 sm:py-7"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-lime-400/10 text-lime-400">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <p className="mt-3.5 text-[14px] font-semibold leading-tight tracking-tight text-white sm:text-[15px]">
                  {title}
                </p>
                <p className="mt-2 text-[12px] leading-relaxed text-zinc-500">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Install — below auth hierarchy */}
        <div className="animate-onboarding-rise-delay-4 mt-5 w-full [&_button]:mt-0 [&_button]:h-12 [&_button]:rounded-[20px] [&_button]:bg-zinc-900 [&_button]:text-sm [&_button]:font-medium [&_button]:text-zinc-200 [&_button]:shadow-none [&_button]:ring-1 [&_button]:ring-zinc-800 [&_button]:hover:brightness-110">
          <InstallAppButton />
        </div>

        {/* Social */}
        <div className="animate-onboarding-rise-delay-5 mt-7 w-full">
          <div className="mb-5 flex items-center gap-4">
            <div className="h-px flex-1 bg-zinc-800/80" />
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-600">
              Follow us
            </span>
            <div className="h-px flex-1 bg-zinc-800/80" />
          </div>

          <nav
            className="flex items-center justify-center gap-7 opacity-100"
            aria-label="Social media"
          >
            {SOCIAL_LINKS.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="text-zinc-500 transition-colors duration-200 hover:text-lime-400"
              >
                <Icon size={18} aria-hidden="true" />
              </a>
            ))}
          </nav>
        </div>
      </div>
    </main>
  );
}
