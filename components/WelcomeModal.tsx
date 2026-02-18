"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, X } from "lucide-react";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: (dontShowAgain: boolean) => void;
}

export function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const id = setTimeout(() => setIsVisible(true), 20);
    setDontShowAgain(true);
    setIsClosing(false);
    return () => clearTimeout(id);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const requestClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setIsVisible(false);
    setTimeout(() => {
      onClose(dontShowAgain);
    }, 180);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        aria-label="Fermer"
        className={`absolute inset-0 z-0 bg-black/55 backdrop-blur-sm transition-opacity duration-200 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={requestClose}
      />

      <div
        onClick={(event) => event.stopPropagation()}
        className={`relative z-10 w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl transition-all duration-300 ${
          isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 scale-[0.98]"
        }`}
      >
        <div className="pointer-events-none absolute -top-24 -left-14 h-44 w-44 rounded-full bg-[#007FFF]/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-8 h-40 w-40 rounded-full bg-[#EFDA5B]/25 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 right-1/3 h-24 w-24 rounded-full bg-[#CA3E4B]/20 blur-2xl" />

        <button
          type="button"
          onClick={requestClose}
          className="absolute z-20 right-3 top-3 rounded-md p-2 text-slate-500 transition-all duration-200 hover:bg-slate-100 hover:text-slate-700 active:scale-95"
          aria-label="Fermer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative p-6 sm:p-8">
          <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl shadow-lg ring-4 ring-blue-200">
            <Image
              src="/flag-rdc.png"
              alt="Drapeau RDC"
              width={26}
              height={16}
              className="rounded-sm"
            />
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Bienvenue sur 243 DRC
          </h2>
          <p className="mt-2 text-slate-700 leading-7">
            Decouvrez des projets, collaborez avec la communaute tech congolaise et publiez vos
            propres realisations.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Commencez par explorer, puis completez votre profil pour mieux connecter avec la communaute.
          </p>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="rounded-xl border border-blue-200 bg-blue-50/70 px-3 py-2 text-xs font-medium text-blue-800">
              Projets reels
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 px-3 py-2 text-xs font-medium text-amber-800">
              Contributions ouvertes
            </div>
            <div className="rounded-xl border border-rose-200 bg-rose-50/70 px-3 py-2 text-xs font-medium text-rose-800">
              Impact local
            </div>
          </div>

          <label className="mt-5 flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(event) => setDontShowAgain(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-[#007FFF] focus:ring-[#007FFF]"
            />
            Ne plus afficher ce message
          </label>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/explorer-les-projets"
              onClick={requestClose}
              className="inline-flex w-full justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-[#007FFF] to-[#0066CC] px-4 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:shadow-xl hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007FFF]/40 active:translate-y-0 active:scale-[0.98]"
            >
              Explorer la plateforme
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/u/dashboard/ajouter-projet"
              onClick={requestClose}
              className="inline-flex w-full justify-center items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:border-slate-400 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 active:translate-y-0 active:scale-[0.98]"
            >
              Publier un projet
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
