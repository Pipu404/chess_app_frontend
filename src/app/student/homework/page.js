"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Play } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { roleHome } from "@/lib/roleHome";
import { getJson } from "@/lib/api";

export default function StudentHomework() {
  const auth = useAuth(); const router = useRouter();
  const [items, setItems] = useState([]); const [attempts, setAttempts] = useState([]); const [error, setError] = useState("");
  useEffect(() => {
    if (auth.status === "anonymous") router.push("/login");
    if (auth.status === "authenticated" && auth.user.role !== "student") router.push(roleHome(auth.user.role));
    if (auth.status === "authenticated" && auth.user.role === "student") getJson("/api/assignments/student").then(data => { setItems(data.assignments); setAttempts(data.attempts); }).catch(requestError => setError(requestError.message));
  }, [auth, router]);
  const bestAttempt = (assignmentId, puzzleId) => attempts.filter(attempt => attempt.assignmentId === assignmentId && attempt.puzzleId === puzzleId).sort((a, b) => b.accuracy - a.accuracy || a.durationSeconds - b.durationSeconds)[0];
  return <main className="min-h-screen bg-zinc-50 p-5"><div className="mx-auto max-w-4xl">
    <h1 className="text-3xl font-black">My Homework</h1><p className="mt-2 text-zinc-500">Solve assigned puzzles and track your best result.</p>
    {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-red-700">{error}</p>}
    <div className="mt-6 space-y-4">{items.map(assignment => <article key={assignment._id} className="rounded-3xl border bg-white p-6">
      <h2 className="text-xl font-black">{assignment.title}</h2><p className="text-sm text-zinc-500">{assignment.classroomId?.name} • Due {new Date(assignment.dueAt).toLocaleString()}</p>{assignment.instructions && <p className="my-3">{assignment.instructions}</p>}
      <div className="mt-4 space-y-2">{assignment.puzzleIds.map(puzzle => { const completed = bestAttempt(assignment._id, puzzle._id); return <div key={puzzle._id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-zinc-50 p-4">
        <div><p className="font-bold">{puzzle.title}</p><p className="text-xs text-zinc-500">{puzzle.difficulty}{completed ? ` • Best ${completed.accuracy}% in ${completed.durationSeconds}s` : " • Not attempted"}</p></div>
        <Link href={`/student/homework/${assignment._id}/${puzzle._id}`} className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-bold text-white">{completed ? <CheckCircle2 size={15}/> : <Play size={15}/>} {completed ? "Try again" : "Solve"}</Link>
      </div>; })}</div>
    </article>)}{!items.length && !error && <p className="rounded-3xl border border-dashed bg-white p-10 text-center">No pending homework.</p>}</div>
  </div></main>;
}
