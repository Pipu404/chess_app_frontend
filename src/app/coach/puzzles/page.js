"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpenCheck, Plus, Trash2 } from "lucide-react";
import CoachSection from "@/components/CoachSection";
import { PUZZLES } from "@/lib/puzzles";
import { deleteJson, getJson } from "@/lib/api";

export default function CoachPuzzlesPage() {
  const [customPuzzles, setCustomPuzzles] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getJson("/api/coach/puzzles").then(data=>setCustomPuzzles(data.puzzles)).catch(error=>setError(error.message));
  }, []);

  const removePuzzle = async (id) => {
    try { await deleteJson(`/api/coach/puzzles/${id}`); setCustomPuzzles(current=>current.filter(puzzle=>puzzle._id!==id)); }
    catch (error) { setError(error.message); }
  };

  return <CoachSection title="Puzzle Studio" description="Create, preview, and organize tactical training material.">
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div><h2 className="text-xl font-black">Puzzle library</h2><p className="mt-1 text-sm text-zinc-500">{customPuzzles.length} custom • {PUZZLES.length} starter</p></div>
          <Link href="/coach/puzzles/new" className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-bold text-white"><Plus size={15}/>Create puzzle</Link>
        </div>
        <div className="mt-5 space-y-3">
          {PUZZLES.map((puzzle) => <div key={puzzle.id} className="flex items-center gap-3 rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-100"><BookOpenCheck size={19} /><div><p className="text-sm font-bold">{puzzle.title}</p><p className="text-xs text-zinc-500">{puzzle.instruction}</p></div></div>)}
        </div>
        {customPuzzles.length>0&&<div className="mt-6"><h3 className="mb-3 text-sm font-black uppercase tracking-wide">Your custom puzzles</h3>{customPuzzles.map(puzzle=><div key={puzzle._id} className="mb-2 flex items-center justify-between rounded-2xl border p-4"><div><p className="font-bold">{puzzle.title}</p><p className="text-xs text-zinc-500">{puzzle.difficulty} • {puzzle.status} • {puzzle.solutionMoves.length} moves</p></div><button type="button" onClick={()=>removePuzzle(puzzle._id)} aria-label={`Delete ${puzzle.title}`} className="rounded-xl p-2 text-red-500 hover:bg-red-50"><Trash2 size={17}/></button></div>)}</div>}
        {error&&<p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700">{error}</p>}
      </section>
      <aside className="rounded-3xl border border-dashed border-zinc-300 bg-white p-6">
        <Plus size={24} /><h2 className="mt-4 font-black">Custom puzzle editor</h2><p className="mt-2 text-sm text-zinc-500">Import a FEN, record a multi-move solution, and add hints, difficulty, publishing status, and tactical tags.</p><Link href="/coach/puzzles/new" className="mt-5 inline-block rounded-xl border px-4 py-2 text-xs font-bold">Open editor</Link>
      </aside>
    </div>
  </CoachSection>;
}
