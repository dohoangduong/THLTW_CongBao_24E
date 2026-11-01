"use client";

import React from "react";
import StoreHeader from "@/components/StoreHeader";
import StoreFooter from "@/components/StoreFooter";
import { AlertCircleIcon } from "@/components/Icons";

export const inputCls =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 transition-all font-sans";
export const btnPrimary =
  "rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 active:scale-[0.98] transition-all disabled:cursor-not-allowed disabled:bg-zinc-300 shadow-2xs";
export const btnGhost =
  "rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs font-medium text-zinc-700 hover:border-zinc-900 hover:bg-zinc-50 transition-all";
export const card = "rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xs";

export function PageShell({
  title,
  children,
  narrow = false,
}) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 flex flex-col font-sans antialiased">
      <StoreHeader />

      <main className={`flex-1 mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 ${narrow ? "max-w-md" : "max-w-7xl"}`}>
        {title && (
          <div className="mb-6 border-b border-zinc-200/80 pb-4">
            <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight">
              {title}
            </h1>
          </div>
        )}
        {children}
      </main>

      <StoreFooter />
    </div>
  );
}

export function ErrorBox({ message }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800 flex items-center gap-2"
    >
      <AlertCircleIcon className="w-4 h-4 text-rose-600 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
