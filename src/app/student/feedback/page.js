"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Mail, MailOpen } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { roleHome } from "@/lib/roleHome";
import { getJson, patchJson } from "@/lib/api";

export default function StudentFeedbackPage() {
  const auth = useAuth(); const router = useRouter(); const [items, setItems] = useState([]); const [error, setError] = useState("");
  useEffect(() => {
    if (auth.status === "anonymous") router.push("/login");
    if (auth.status === "authenticated" && auth.user.role !== "student") router.push(roleHome(auth.user.role));
    if (auth.status === "authenticated" && auth.user.role === "student") getJson("/api/feedback/student").then(data => setItems(data.feedback)).catch(requestError => setError(requestError.message));
  }, [auth, router]);
  const markRead = async id => { try { const response = await patchJson(`/api/feedback/student/${id}/read`); setItems(current => current.map(item => item._id === id ? response.feedback : item)); } catch (requestError) { setError(requestError.message); } };
  const unread = items.filter(item => !item.readAt).length;
  return <main className="min-h-screen bg-zinc-50 p-5"><div className="mx-auto max-w-4xl"><Link href="/student" className="mb-5 inline-flex items-center gap-2 text-sm font-bold"><ArrowLeft size={17}/>Student dashboard</Link>
    <header className="rounded-3xl bg-zinc-900 p-7 text-white"><p className="text-xs font-black uppercase tracking-widest text-zinc-400">Coach messages</p><h1 className="mt-2 text-3xl font-black">Feedback Inbox</h1><p className="mt-2 text-sm text-zinc-300">{unread} unread message{unread === 1 ? "" : "s"}</p></header>
    {error && <p className="mt-5 rounded-xl bg-red-50 p-3 text-red-700">{error}</p>}<section className="mt-6 space-y-4">{items.map(item => <article key={item._id} className={`rounded-3xl border p-6 shadow-sm ${item.readAt ? "bg-white" : "border-amber-300 bg-amber-50"}`}><div className="flex items-start justify-between gap-4"><div className="flex gap-3">{item.readAt ? <MailOpen className="text-zinc-400"/> : <Mail className="text-amber-600"/>}<div><h2 className="font-black">Coach {item.coachId?.name}</h2><p className="text-xs text-zinc-500">{new Date(item.createdAt).toLocaleString()}</p></div></div>{!item.readAt && <button type="button" onClick={() => markRead(item._id)} className="flex items-center gap-2 rounded-xl border border-amber-300 bg-white px-3 py-2 text-xs font-bold"><Check size={15}/>Mark read</button>}</div><p className="mt-5 text-xs font-black uppercase tracking-wide text-amber-700">Focus: {item.focusArea}</p><p className="mt-2 whitespace-pre-wrap leading-7 text-zinc-700">{item.message}</p></article>)}{!items.length && !error && <p className="rounded-3xl border border-dashed bg-white p-10 text-center text-zinc-500">No coach feedback yet.</p>}</section>
  </div></main>;
}
