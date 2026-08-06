"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronRight,
  Cloud,
  CloudUpload,
  Dumbbell,
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
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto flex w-full max-w-[400px] flex-col items-center px-6 pb-10 pt-6 sm:pt-10">
        {/* Hero */}
        <section
          className="relative mb-8 flex w-full items-center justify-center"
          aria-label="Don't Over Train"
        >
          <div
            className="pointer-events-none absolute left-1/2 top-[42%] h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime-400/20 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute left-1/2 top-[42%] h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-lime-400/25"
            aria-hidden="true"
          />

          <div className="relative h-[280px] w-full max-w-[300px]">
            <Image
              src="/onboarding/back-hero.png"
              alt=""
              fill
              priority
              sizes="300px"
              className="object-contain object-bottom opacity-45 brightness-[0.55] contrast-110 saturate-0"
              aria-hidden="true"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
            <div className="absolute inset-x-0 top-[18%] flex justify-center">
              <Image
                src="/logo/logo.webp"
                alt="Don't Over Train"
                width={168}
                height={168}
                priority
                className="drop-shadow-[0_8px_24px_rgba(0,0,0,0.65)]"
              />
            </div>
          </div>
        </section>

        {/* Primary CTA */}
        <div className="w-full">
          <button
            type="button"
            onClick={continueAsGuest}
            className="btn-base flex h-14 w-full items-center justify-between gap-3 rounded-[22px] bg-lime-400 px-5 text-base font-semibold text-black hover:brightness-110"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/10">
              <Zap size={16} className="text-black" aria-hidden="true" />
            </span>
            <span className="flex-1 text-center">Continue as Guest</span>
            <ChevronRight size={18} className="text-black/70" aria-hidden="true" />
          </button>
          <p className="mt-2.5 flex items-center justify-center gap-1.5 text-xs text-zinc-500">
            <Check size={12} className="text-lime-400" aria-hidden="true" />
            No account required
          </p>
        </div>

        {/* Divider */}
        <div className="my-7 flex w-full items-center gap-4">
          <div className="h-px flex-1 bg-zinc-800" />
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
            OR
          </span>
          <div className="h-px flex-1 bg-zinc-800" />
        </div>

        {/* Google sign-in */}
        <div className="w-full">
          <button
            type="button"
            onClick={signInWithGoogle}
            className="btn-base flex h-14 w-full items-center justify-between gap-3 rounded-[22px] bg-white px-5 text-base font-semibold text-black hover:brightness-95"
          >
            <FcGoogle size={22} aria-hidden="true" />
            <span className="flex-1 text-center">Continue with Google</span>
            <ChevronRight size={18} className="text-black/50" aria-hidden="true" />
          </button>
          <p className="mt-2.5 flex items-center justify-center gap-1.5 text-xs text-zinc-500">
            <Cloud size={12} className="text-lime-400/80" aria-hidden="true" />
            Sync workouts across all devices
          </p>
          <InstallAppButton />
        </div>

        {/* Why sign in */}
        <section
          aria-label="Why create an account"
          className="mt-9 w-full overflow-hidden rounded-[22px] border border-zinc-800/90 bg-[#111] shadow-[0_10px_28px_rgba(0,0,0,0.35)]"
        >
          <div className="grid grid-cols-3 divide-x divide-zinc-800/90">
            {FEATURES.map(({ title, description, Icon }) => (
              <div
                key={title}
                className="flex flex-col items-center px-2.5 py-5 text-center"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-lime-400/10 text-lime-400">
                  <Icon size={16} aria-hidden="true" />
                </span>
                <p className="mt-3 text-[11px] font-semibold leading-tight text-white">
                  {title}
                </p>
                <p className="mt-1.5 text-[10px] leading-snug text-zinc-500">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Guest mode card */}
        <section
          aria-labelledby="guest-mode-heading"
          className="mt-5 flex w-full items-stretch gap-3 overflow-hidden rounded-[22px] border border-zinc-800/90 bg-gradient-to-br from-[#161616] to-[#0d0d0d] p-4 shadow-[0_10px_28px_rgba(0,0,0,0.3)]"
        >
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-lime-400/10 text-lime-400">
            <Info size={15} aria-hidden="true" />
          </div>

          <div className="min-w-0 flex-1 py-0.5">
            <h2
              id="guest-mode-heading"
              className="text-sm font-semibold text-white"
            >
              Guest Mode
            </h2>
            <p className="mt-1.5 text-xs leading-5 text-zinc-400">
              Your workout history stays on this device.
            </p>
            <div className="my-3 h-px w-full bg-zinc-800/90" />
            <p className="text-xs leading-5 text-zinc-500">
              Create a{" "}
              <span className="font-medium text-lime-400">free account</span>{" "}
              anytime to sync and back up your data.
            </p>
          </div>

          <div className="flex shrink-0 items-end self-stretch pb-0.5 pr-0.5">
            <Dumbbell
              size={44}
              strokeWidth={1.25}
              className="rotate-[-28deg] text-zinc-600"
              aria-hidden="true"
            />
          </div>
        </section>

        {/* Social */}
        <div className="mt-10 w-full">
          <div className="mb-5 flex items-center gap-4">
            <div className="h-px flex-1 bg-zinc-800" />
            <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-600">
              Follow us
            </span>
            <div className="h-px flex-1 bg-zinc-800" />
          </div>

          <nav
            className="flex items-start justify-center gap-8"
            aria-label="Social media"
          >
            {SOCIAL_LINKS.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="group flex flex-col items-center gap-2 text-zinc-500 transition-colors duration-200 hover:text-lime-400"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-800 transition-colors group-hover:border-lime-400/40">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <span className="text-[10px] text-zinc-600 group-hover:text-zinc-400">
                  {label}
                </span>
              </a>
            ))}
          </nav>
        </div>
      </div>
    </main>
  );
}
