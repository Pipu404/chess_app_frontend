"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Crown, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { postJson } from "@/lib/api";
import { setAuthenticatedUser } from "@/lib/authStore";
import { roleHome } from "@/lib/roleHome";
import FuturisticChessBoard from "@/components/FuturisticChessBoard";

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await postJson("/api/auth/login", formData);
      setAuthenticatedUser(data.user);
      router.push(roleHome(data.user.role));
    } catch (requestError) {
      setError(requestError.message || "Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return <main className="min-h-screen overflow-hidden bg-[#080d17] text-slate-100">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(42,101,139,.3),transparent_28%),radial-gradient(circle_at_84%_15%,rgba(180,126,67,.16),transparent_24%)]" />
    <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-5 py-8 sm:px-8 lg:grid-cols-[.82fr_1.18fr] lg:px-10">
      <section className="mx-auto w-full max-w-md"><Link href="/" className="mb-12 inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white"><span className="grid size-8 place-items-center rounded-lg bg-amber-300 text-slate-950"><Crown size={17} /></span>Quiet Chess</Link><p className="text-[11px] font-bold uppercase tracking-[.22em] text-amber-300">Welcome back</p><h1 className="mt-3 text-4xl font-semibold tracking-[-.05em] text-white sm:text-5xl">Return to the board.</h1><p className="mt-4 text-sm leading-6 text-slate-400">Your games, analysis, and practice are ready when you are.</p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-5 rounded-[1.75rem] border border-white/10 bg-white/[.045] p-5 shadow-2xl shadow-cyan-950/25 backdrop-blur-xl sm:p-7">
          {error && <p role="alert" className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2.5 text-sm font-medium text-rose-200">{error}</p>}
          <label className="block text-sm font-semibold text-slate-300">Email address<span className="relative mt-2 block"><Mail size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" /><input type="email" required autoComplete="email" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} placeholder="you@example.com" className="w-full rounded-2xl border border-white/10 bg-slate-950/50 py-3.5 pl-11 pr-4 text-slate-100 outline-none placeholder:text-slate-600" /></span></label>
          <label className="block text-sm font-semibold text-slate-300">Password<span className="relative mt-2 block"><LockKeyhole size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" /><input type={showPassword ? "text" : "password"} required autoComplete="current-password" value={formData.password} onChange={(event) => setFormData({ ...formData, password: event.target.value })} placeholder="Your password" className="w-full rounded-2xl border border-white/10 bg-slate-950/50 py-3.5 pl-11 pr-12 text-slate-100 outline-none placeholder:text-slate-600" /><button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-white">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>
          <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-300 px-4 py-3.5 font-bold text-slate-950 shadow-lg shadow-amber-300/10 transition hover:bg-amber-200 disabled:opacity-60">{loading ? "Signing in…" : "Sign in"}<ArrowUpRight size={17} /></button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-400">New to Quiet Chess? <Link href="/signup" className="font-semibold text-amber-300 hover:text-amber-200">Create an account</Link></p>
      </section>
      <section className="hidden lg:block"><FuturisticChessBoard /></section>
    </div>
  </main>;
}
