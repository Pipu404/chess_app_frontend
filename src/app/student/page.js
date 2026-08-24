"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, ArrowRight, BookOpenCheck, CalendarClock, CheckCircle2, Clock3, LogOut, MessageSquareText, Swords, Target, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { logoutSession } from "@/lib/authStore";
import { roleHome } from "@/lib/roleHome";
import { getJson } from "@/lib/api";

const RADAR_TAGS = ["Fork", "Pin", "Skewer", "Mate", "Endgame", "Discovery", "Deflection"];
const radarPoint = (index, value = 100) => { const angle = (Math.PI * 2 * index / RADAR_TAGS.length) - Math.PI / 2; const radius = 70 * value / 100; return `${100 + Math.cos(angle) * radius},${100 + Math.sin(angle) * radius}`; };
const Metric = ({ icon: Icon, label, value }) => <div className="rounded-2xl border bg-white p-5 shadow-sm"><Icon size={19} className="text-zinc-500"/><p className="mt-4 text-3xl font-black">{value}</p><p className="mt-1 text-xs font-bold uppercase tracking-wide text-zinc-500">{label}</p></div>;

function TacticalRadar({ areas }) {
  const values = new Map(areas.map(area => [area.tag, area.accuracy]));
  const resultPoints = RADAR_TAGS.map((tag, index) => radarPoint(index, values.get(tag) || 0)).join(" ");
  return <div className="grid items-center gap-4 md:grid-cols-[280px_1fr]">
    <svg viewBox="0 0 200 200" role="img" aria-label="Tactical accuracy radar chart" className="mx-auto w-full max-w-72 overflow-visible">
      {[25, 50, 75, 100].map(level => <polygon key={level} points={RADAR_TAGS.map((tag, index) => radarPoint(index, level)).join(" ")} fill="none" stroke="#e4e4e7" strokeWidth="1"/>)}
      {RADAR_TAGS.map((tag, index) => <line key={tag} x1="100" y1="100" x2={radarPoint(index).split(",")[0]} y2={radarPoint(index).split(",")[1]} stroke="#e4e4e7" strokeWidth="1"/>)}
      <polygon points={resultPoints} fill="rgba(245, 158, 11, .24)" stroke="#d97706" strokeWidth="2"/>
      {RADAR_TAGS.map((tag, index) => { const [x, y] = radarPoint(index, 116).split(",").map(Number); return <text key={tag} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="8" fontWeight="700" fill="#52525b">{tag}</text>; })}
    </svg>
    <div className="space-y-3">{RADAR_TAGS.map(tag => { const score = values.get(tag); return <div key={tag}><div className="mb-1 flex justify-between text-xs font-bold"><span>{tag}</span><span>{score === undefined ? "No data" : `${score}%`}</span></div><div className="h-2 overflow-hidden rounded-full bg-zinc-100"><div className={`h-full rounded-full ${score < 70 ? "bg-red-400" : "bg-amber-500"}`} style={{ width: `${score || 0}%` }}/></div></div>; })}</div>
  </div>;
}

export default function StudentDashboard() {
  const auth = useAuth(); const router = useRouter(); const [data, setData] = useState(null); const [error, setError] = useState("");
  useEffect(() => {
    if (auth.status === "anonymous") router.push("/login");
    if (auth.status === "authenticated" && auth.user.role !== "student") router.push(roleHome(auth.user.role));
    if (auth.status === "authenticated" && auth.user.role === "student") getJson("/api/analytics/student").then(setData).catch(requestError => setError(requestError.message));
  }, [auth, router]);
  const signOut = async () => { await logoutSession(); router.push("/login"); };
  return <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-900"><div className="mx-auto w-full max-w-6xl">
    <header className="mb-7 flex items-start justify-between rounded-3xl bg-zinc-900 p-7 text-white shadow-xl"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-zinc-400">Student portal</p><h1 className="mt-2 text-3xl font-black">Welcome, {auth.user?.name || "Student"}</h1><p className="mt-2 text-sm text-zinc-300">Your personalized chess learning journey.</p></div><button type="button" onClick={signOut} aria-label="Sign out" className="rounded-xl p-3 text-zinc-300 hover:bg-white/10"><LogOut size={20}/></button></header>
    <nav className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{[
      { title: "Homework", href: "/student/homework", icon: CalendarClock }, { title: "Classrooms", href: "/student/classes", icon: Users }, { title: "Coach feedback", href: "/student/feedback", icon: MessageSquareText }, { title: "Player portal", href: "/player", icon: Swords }, { title: "Puzzle trainer", href: "/puzzles", icon: BookOpenCheck }
    ].map(item => <Link key={item.title} href={item.href} className="flex items-center justify-between rounded-2xl border bg-white p-4 font-bold shadow-sm"><span className="flex items-center gap-3"><item.icon size={19}/>{item.title}</span><ArrowRight size={16}/></Link>)}</nav>
    {error && <p className="rounded-2xl bg-red-50 p-4 text-red-700">{error}</p>}{!data && !error && <p className="rounded-3xl border bg-white p-10 text-center text-zinc-500">Loading your progress…</p>}
    {data && <><section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"><Metric icon={CheckCircle2} label="Completion" value={`${data.summary.completionRate}%`}/><Metric icon={Target} label="Accuracy" value={`${data.summary.averageAccuracy}%`}/><Metric icon={Clock3} label="Avg. solve time" value={`${data.summary.averageTime}s`}/><Metric icon={Activity} label="Practice attempts" value={data.summary.totalPracticeAttempts}/><Metric icon={Users} label="Classrooms" value={data.summary.classrooms}/></section>
      <section className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_.85fr]"><div className="rounded-3xl border bg-white p-6 shadow-sm"><h2 className="text-xl font-black">Tactical radar</h2><p className="mt-1 text-sm text-zinc-500">Accuracy from your best assigned-puzzle results.</p><div className="mt-6"><TacticalRadar areas={data.tacticalAreas}/></div>{data.strengths.length > 0 && <p className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700">Strengths: {data.strengths.join(", ")}</p>}{data.weakAreas.length > 0 && <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">Focus next: {data.weakAreas.join(", ")}</p>}</div>
        <div className="rounded-3xl border bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="text-xl font-black">Homework</h2><p className="mt-1 text-sm text-zinc-500">Upcoming assignments</p></div><Link href="/student/homework" className="text-xs font-bold">View all</Link></div><div className="mt-5 space-y-3">{data.assignments.slice(0, 5).map(assignment => <div key={assignment._id} className="rounded-2xl bg-zinc-50 p-4"><div className="flex justify-between gap-3"><div><p className="font-bold">{assignment.title}</p><p className="text-xs text-zinc-500">{assignment.classroom}</p></div><span className="text-xs font-black">{assignment.completedPuzzles}/{assignment.totalPuzzles}</span></div><p className="mt-3 text-xs text-zinc-500">Due {new Date(assignment.dueAt).toLocaleString()} • {assignment.remainingPuzzles} remaining</p></div>)}{!data.assignments.length && <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-zinc-500">No active homework.</p>}</div></div>
      </section>
      <section className="mt-6 rounded-3xl border bg-white p-6 shadow-sm"><h2 className="text-xl font-black">Recent results</h2><div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">{data.recentAttempts.map(attempt => <div key={attempt._id} className="rounded-2xl bg-zinc-50 p-4"><p className="font-bold">{attempt.puzzle}</p><p className="mt-2 text-2xl font-black">{attempt.accuracy}%</p><p className="text-xs text-zinc-500">{attempt.durationSeconds}s • {attempt.mistakes} mistakes • {new Date(attempt.createdAt).toLocaleDateString()}</p></div>)}{!data.recentAttempts.length && <p className="text-sm text-zinc-500">Complete homework puzzles to begin your progress history.</p>}</div></section>
    </>}
  </div></main>;
}
