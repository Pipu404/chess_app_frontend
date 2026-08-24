"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronLeft, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { logoutSession } from "@/lib/authStore";
import { roleHome } from "@/lib/roleHome";

export default function RoleDashboard({ role, title, subtitle, features, allowedRoles, children }) {
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    if (auth.status === "anonymous") router.push("/login");
    if (auth.status === "authenticated" && !(allowedRoles || [role]).includes(auth.user.role)) {
      router.push(roleHome(auth.user.role));
    }
  }, [allowedRoles, auth, role, router]);

  const signOut = async () => {
    await logoutSession();
    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-900">
      <div className="mx-auto w-full max-w-5xl">
        {auth.status === "authenticated" && auth.user.role !== role && <Link href={roleHome(auth.user.role)} className="mb-5 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-zinc-600 hover:bg-zinc-200/60"><ChevronLeft size={17}/>My {auth.user.role} dashboard</Link>}
        <header className="mb-8 flex items-start justify-between rounded-3xl bg-zinc-900 p-7 text-white shadow-xl">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">{role} portal</p>
            <h1 className="mt-2 text-3xl font-black">{title}</h1>
            <p className="mt-2 max-w-xl text-sm text-zinc-300">{subtitle}</p>
            <p className="mt-4 text-sm font-bold">Welcome, {auth.user?.name || "Player"}</p>
          </div>
          <button onClick={signOut} aria-label="Sign out" className="rounded-xl p-3 text-zinc-300 transition hover:bg-white/10 hover:text-white">
            <LogOut size={20} />
          </button>
        </header>

        {children}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Link key={feature.title} href={feature.href} className="group rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
              <feature.icon size={24} className="text-zinc-700" />
              <h2 className="mt-5 text-lg font-black">{feature.title}</h2>
              <p className="mt-2 min-h-10 text-sm text-zinc-500">{feature.description}</p>
              <span className="mt-5 flex items-center gap-2 text-xs font-bold">Open <ArrowRight size={15} className="transition group-hover:translate-x-1" /></span>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
