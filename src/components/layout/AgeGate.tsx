"use client";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { GoldButton } from "@/components/brand/GoldButton";
import { Hairline } from "@/components/brand/Hairline";
import lifestyle from "@/assets/lifestyle-2.webp";

const KEY = "terps_age_verified";
const TTL = 30 * 24 * 60 * 60 * 1000;

export function AgeGate() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return setShow(true);
      const ts = Number(raw);
      if (!ts || Date.now() - ts > TTL) setShow(true);
    } catch {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[color:var(--bg-rich)]/90 backdrop-blur-2xl px-4">
      <img src={lifestyle} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-15 blur-xl" />
      <div className="relative max-w-lg rounded-lg border border-[color:var(--border-strong)] bg-[color:var(--bg-elevated)] p-10 md:p-16 text-center">
        <div className="flex justify-center"><Logo height={64} /></div>
        <Hairline className="my-8 mx-auto w-24" />
        <h2 className="font-display text-3xl leading-tight md:text-4xl">You must be of legal age to enter.</h2>
        <p className="mt-4 font-body text-[color:var(--text-secondary)] leading-relaxed">
          By entering this site you confirm you are 18+ and of legal smoking age in your region.
        </p>
        <div className="mt-10 flex flex-col gap-3">
          <GoldButton
            onClick={() => {
              localStorage.setItem(KEY, String(Date.now()));
              setShow(false);
            }}
          >
            I am 18 or older
          </GoldButton>
          <GoldButton variant="tertiary" onClick={() => { window.location.href = "https://www.google.com"; }}>
            Exit
          </GoldButton>
        </div>
        <p className="meta-xs mt-10 text-[color:var(--text-tertiary)]">18+ · Bred in South Africa</p>
      </div>
    </div>
  );
}
