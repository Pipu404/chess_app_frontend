"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { roleHome } from "@/lib/roleHome";

export default function CoachSection({ title, description, children }) {
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    if (auth.status === "anonymous") router.push("/login");
    if (auth.status === "authenticated" && auth.user.role !== "coach") {
      router.push(roleHome(auth.user.role));
    }
  }, [auth, router]);

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-900">
      <div className="mx-auto w-full max-w-6xl">
        <Link href="/coach" className="mb-6 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-zinc-600 transition hover:bg-zinc-200/60">
          <ChevronLeft size={18} /> Coach dashboard
        </Link>
        <header className="mb-7 rounded-3xl bg-zinc-900 p-7 text-white shadow-xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Coach portal</p>
          <h1 className="mt-2 text-3xl font-black">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-300">{description}</p>
        </header>
        {children}
      </div>
    </main>
  );
}
