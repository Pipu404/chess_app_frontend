"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Bot, History, LogOut, Settings, Sparkles, Target } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { logoutSession } from "@/lib/authStore";
import FuturisticChessBoard from "@/components/FuturisticChessBoard";

export default function PlayerDashboard() {
  const router = useRouter();
  const auth = useAuth();
  const userName = auth.user?.name || "Player";
  const rating = auth.user?.chessRating || 1200;
  const recentGame = auth.user?.ratingHistory?.[0];

  useEffect(() => {
    if (auth.status === "anonymous") router.push("/login");
  }, [auth.status, router]);

  const signOut = async () => {
    await logoutSession();
    router.push("/login");
  };

  return <main className="min-h-screen bg-[#080d17] text-slate-100">
    <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_8%_8%,rgba(42,101,139,.3),transparent_28%),radial-gradient(circle_at_88%_16%,rgba(180,126,67,.16),transparent_24%)]" />
    <div className="relative mx-auto max-w-7xl px-5 py-5 sm:px-8 sm:py-8">
      <header className="flex items-center justify-between border-b border-white/10 pb-5"><div><p className="text-[11px] font-bold uppercase tracking-[.22em] text-amber-300">Quiet chess</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">Good evening, {userName.split(" ")[0]}.</h1></div><div className="flex gap-2"><Link href="/profile" aria-label="Profile settings" className="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/[.035] text-slate-300 transition hover:bg-white/[.1]"><Settings size={17} /></Link><button onClick={signOut} aria-label="Sign out" className="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/[.035] text-slate-300 transition hover:bg-white/[.1]"><LogOut size={17} /></button></div></header>

      <section className="grid items-center gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:py-14">
        <div className="grid items-center gap-9 lg:grid-cols-[minmax(0,.8fr)_minmax(320px,.9fr)]"><div className="order-2 lg:order-1"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-slate-500"><Sparkles size={14} className="text-amber-300" /> Today&apos;s focus</p><h2 className="mt-4 max-w-md text-4xl font-semibold tracking-[-.045em] text-white sm:text-5xl">Play with patience. <span className="text-slate-500">See more.</span></h2><p className="mt-5 max-w-sm text-sm leading-6 text-slate-400">No feed to catch up on. No notifications to clear. Just a board and your next best move.</p><Link href="/new-game?mode=ai" className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-amber-300 px-5 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-300/10 transition hover:bg-amber-200">Play with AI <ArrowUpRight size={17} /></Link></div><div className="order-1 lg:order-2"><FuturisticChessBoard compact /></div></div>

        <aside className="border-t border-white/10 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0"><p className="text-[11px] font-bold uppercase tracking-[.18em] text-slate-500">Session</p><div className="mt-5"><p className="font-mono text-4xl tracking-tight text-white">{rating}</p><p className="mt-1 text-sm text-slate-400">Current rating</p></div><div className="my-7 h-px bg-white/10" /><p className="text-sm font-medium text-slate-300">{recentGame ? `Last game: ${recentGame.result} vs ${recentGame.opponentName}` : "Your first rated game is waiting."}</p><Link href="/new-game?mode=online" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-amber-300 hover:text-amber-200">Find an opponent <ArrowUpRight size={15} /></Link></aside>
      </section>

      <footer className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/10 py-5 text-sm"><Link href="/puzzles" className="flex items-center gap-2 text-slate-400 transition hover:text-white"><Target size={16} /> Puzzles</Link><Link href="/openings" className="text-slate-400 transition hover:text-white">Opening trainer</Link><Link href="/improvement" className="text-slate-400 transition hover:text-white">Improvement</Link><Link href="/games" className="flex items-center gap-2 text-slate-400 transition hover:text-white"><History size={16} /> Game history</Link><Link href="/new-game?mode=local" className="flex items-center gap-2 text-slate-400 transition hover:text-white"><Bot size={16} /> Local board</Link></footer>
    </div>
  </main>;
}
