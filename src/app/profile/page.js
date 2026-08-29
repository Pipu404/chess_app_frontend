"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, KeyRound, Save, UserRound } from "lucide-react";
import { patchJson } from "@/lib/api";
import { setAuthenticatedUser } from "@/lib/authStore";
import { useAuth } from "@/hooks/useAuth";

export default function ProfilePage() {
  const router = useRouter();
  const auth = useAuth();
  const [form, setForm] = useState({ name: "", email: "", currentPassword: "", newPassword: "" });
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const profileName = form.name || auth.user?.name || "";
  const profileEmail = form.email || auth.user?.email || "";

  useEffect(() => {
    if (auth.status === "anonymous") router.push("/login");
  }, [auth.status, router]);

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setSaving(true);
    try {
      const data = await patchJson("/api/auth/me", { ...form, name: profileName, email: profileEmail });
      setAuthenticatedUser(data.user);
      setForm((current) => ({ ...current, currentPassword: "", newPassword: "" }));
      setNotice("Profile saved");
    } catch (requestError) {
      setError(requestError.message || "Unable to save your profile");
    } finally {
      setSaving(false);
    }
  };

  return <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#e9e5ff,_transparent_32%),radial-gradient(circle_at_92%_16%,_#ffe5d5,_transparent_28%),#f8f9fc] px-4 py-6 text-slate-900 sm:px-6 sm:py-10">
    <div className="mx-auto max-w-2xl">
      <Link href="/player" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"><ArrowLeft size={17} /> Back to dashboard</Link>
      <header className="mt-8 flex items-center gap-4"><div className="grid size-14 place-items-center rounded-3xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25"><UserRound size={27} /></div><div><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Account</p><h1 className="mt-1 text-3xl font-extrabold tracking-tight">Profile settings</h1><p className="mt-1 text-sm text-slate-500">Keep your player details up to date.</p></div></header>

      <form onSubmit={submit} className="mt-7 space-y-5 rounded-[1.75rem] border border-white/80 bg-white/75 p-5 shadow-xl shadow-slate-200/50 backdrop-blur sm:p-7">
        <section><div className="mb-4 flex items-center gap-2"><UserRound size={18} className="text-violet-600" /><h2 className="font-bold">Public profile</h2></div><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-semibold text-slate-600">Display name<input required minLength={2} maxLength={80} value={profileName} onChange={update("name")} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100" /></label><label className="block text-sm font-semibold text-slate-600">Email address<input required type="email" value={profileEmail} onChange={update("email")} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100" /></label></div></section>

        <section className="border-t border-slate-100 pt-5"><div className="mb-2 flex items-center gap-2"><KeyRound size={18} className="text-violet-600" /><h2 className="font-bold">Change password</h2></div><p className="mb-4 text-sm text-slate-500">Leave these fields empty to keep your current password.</p><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-semibold text-slate-600">Current password<input type="password" value={form.currentPassword} onChange={update("currentPassword")} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100" /></label><label className="block text-sm font-semibold text-slate-600">New password<input type="password" minLength={8} value={form.newPassword} onChange={update("newPassword")} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100" /></label></div></section>

        {error && <p role="alert" className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p>}
        {notice && <p role="status" className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700"><Check size={17} />{notice}</p>}
        <button disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-3.5 font-bold text-white shadow-lg shadow-violet-500/25 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"><Save size={18} />{saving ? "Saving…" : "Save changes"}</button>
      </form>
    </div>
  </main>;
}
