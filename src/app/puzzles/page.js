"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Chess } from "chess.js";
import { CalendarDays, ChevronLeft, Lightbulb, RefreshCcw, Star, Trophy } from "lucide-react";
import { CHESS_PIECES } from "@/lib/chessPieces";
import { getJson, postJson } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { roleHome } from "@/lib/roleHome";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"]; const RANKS = [8, 7, 6, 5, 4, 3, 2, 1];

export default function PuzzlesPage() {
  const router = useRouter(); const auth = useAuth(); const startedAt = useRef(null);
  const [puzzles, setPuzzles] = useState([]); const [dailyId, setDailyId] = useState(""); const [attempts, setAttempts] = useState([]); const [rating, setRating] = useState(1200); const [index, setIndex] = useState(0); const [game, setGame] = useState(null);
  const [selected, setSelected] = useState(null); const [targets, setTargets] = useState([]); const [mistakes, setMistakes] = useState(0); const [showHint, setShowHint] = useState(false); const [hintWasUsed, setHintWasUsed] = useState(false); const [feedback, setFeedback] = useState(null); const [error, setError] = useState(""); const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (auth.status === "anonymous") router.push("/login");
    if (auth.status === "authenticated") getJson("/api/global-puzzles").then(data => { const dailyIndex = data.puzzles.findIndex(puzzle => puzzle._id === data.dailyPuzzleId); const startIndex = dailyIndex < 0 ? 0 : dailyIndex; setPuzzles(data.puzzles); setDailyId(data.dailyPuzzleId); setAttempts(data.attempts); setRating(data.puzzleRating); setIndex(startIndex); setGame(new Chess(data.puzzles[startIndex].fen)); startedAt.current = Date.now(); }).catch(requestError => setError(requestError.message));
  }, [auth.status, router]);
  const puzzle = puzzles[index]; const previousAttempt = puzzle && attempts.find(attempt => attempt.puzzleId === puzzle._id);
  const dashboardHref = auth.status === "authenticated" ? roleHome(auth.user.role) : "/";
  const loadPuzzle = nextIndex => { const normalized = (nextIndex + puzzles.length) % puzzles.length; setIndex(normalized); setGame(new Chess(puzzles[normalized].fen)); setSelected(null); setTargets([]); setMistakes(0); setShowHint(false); setHintWasUsed(false); setFeedback(null); setError(""); startedAt.current = Date.now(); };
  const clickSquare = async square => {
    if (!game || !puzzle || feedback?.type === "success" || saving) return; const piece = game.get(square);
    if (piece?.color === game.turn()) { setSelected(square); setTargets(game.moves({ square, verbose: true }).map(move => move.to)); return; }
    if (!selected || !targets.includes(square)) { setSelected(null); setTargets([]); return; }
    const candidate = new Chess(game.fen()); candidate.move({ from: selected, to: square, promotion: "q" }); const solved = selected === puzzle.solution.from && square === puzzle.solution.to; setSelected(null); setTargets([]);
    if (!solved) { setMistakes(current => current + 1); setFeedback({ type: "error", message: "That legal move is not the solution. Try again." }); return; }
    setGame(candidate); setSaving(true);
    if (previousAttempt) { setFeedback({ type: "success", message: "Correct — practice complete. Your first result remains rated." }); setSaving(false); return; }
    try { const response = await postJson(`/api/global-puzzles/${puzzle._id}/attempts`, { from: selected, to: square, promotion: "q", mistakes, hintsUsed: hintWasUsed ? 1 : 0, durationSeconds: Math.max(1, Math.round((Date.now() - startedAt.current) / 1000)) }); setRating(response.puzzleRating); setAttempts(current => [...current, response.attempt]); setPuzzles(current => current.map(item => item._id === puzzle._id ? { ...item, ...response.puzzle } : item)); setFeedback({ type: "success", message: `Correct — rating ${response.attempt.ratingChange >= 0 ? "+" : ""}${response.attempt.ratingChange}` }); }
    catch (requestError) { setError(requestError.message); } finally { setSaving(false); }
  };
  if (error && !puzzle) return <main className="grid min-h-screen place-items-center bg-zinc-50 p-5"><p className="rounded-2xl bg-red-50 p-5 text-red-700">{error}</p></main>;
  if (!puzzle || !game) return <main className="grid min-h-screen place-items-center bg-zinc-50">Loading rated puzzles…</main>;
  const flipped = game.turn() === "b"; const ranks = flipped ? [...RANKS].reverse() : RANKS; const files = flipped ? [...FILES].reverse() : FILES;
  const solvedCount = attempts.length; const averageAccuracy = solvedCount ? Math.round(attempts.reduce((sum, attempt) => sum + attempt.accuracy, 0) / solvedCount) : 0;
  return <main className="flex min-h-screen justify-center bg-zinc-50 px-4 py-6 text-zinc-900"><div className="flex min-h-[850px] w-full max-w-[440px] flex-col overflow-hidden rounded-[40px] border-[8px] border-zinc-100 bg-white shadow-2xl">
    <header className="flex items-center justify-between px-6 pb-3 pt-8"><Link href={dashboardHref} aria-label="Back to dashboard" title="Back to dashboard" className="rounded-full p-2 hover:bg-zinc-100"><ChevronLeft/></Link><div className="text-center"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-zinc-400">Global rated puzzles</p><h1 className="text-lg font-black">{puzzle.title}</h1></div><div className="flex items-center gap-1 rounded-full bg-zinc-900 px-3 py-2 text-xs font-black text-white"><Star size={13} className="text-amber-300"/>{rating}</div></header>
    <section className="grid grid-cols-4 gap-2 px-5 pb-4">{[["Solved", solvedCount], ["Accuracy", `${averageAccuracy}%`], ["Puzzle", puzzle.rating], ["Played", puzzle.plays]].map(([label, value]) => <div key={label} className="rounded-2xl bg-zinc-50 px-2 py-2 text-center ring-1 ring-zinc-100"><p className="text-sm font-black">{value}</p><p className="text-[9px] font-bold uppercase text-zinc-400">{label}</p></div>)}</section>
    <section className="px-5"><div className="mb-3 flex items-center justify-between rounded-2xl bg-zinc-900 px-4 py-3 text-white"><div><div className="flex items-center gap-2">{puzzle._id === dailyId && <span className="flex items-center gap-1 rounded-full bg-amber-400 px-2 py-1 text-[9px] font-black uppercase text-zinc-900"><CalendarDays size={11}/>Daily</span>}<span className="text-[10px] text-zinc-300">#{index + 1} of {puzzles.length}</span></div><p className="mt-2 text-xs font-bold">{puzzle.instruction}</p></div>{previousAttempt && <Trophy size={20} className="text-amber-300"/>}</div>
      <div className="flex aspect-square flex-col overflow-hidden rounded-2xl border shadow-md">{ranks.map((rank, row) => <div key={rank} className="flex flex-1">{files.map((file, col) => { const square = `${file}${rank}`; const boardPiece = game.get(square); return <button key={square} type="button" aria-label={square} onClick={() => clickSquare(square)} className={`relative flex flex-1 items-center justify-center ${(row + col) % 2 ? "bg-[#e2d5c3]" : "bg-[#f5f1ea]"} ${selected === square ? "ring-4 ring-inset ring-amber-500" : ""}`}>{targets.includes(square) && <span className="absolute z-20 h-3.5 w-3.5 rounded-full bg-zinc-900/30"/>}{boardPiece && <span className="relative h-[86%] w-[86%]"><Image src={CHESS_PIECES[boardPiece.color][boardPiece.type]} alt={`${boardPiece.color} ${boardPiece.type}`} fill unoptimized className="object-contain"/></span>}</button>; })}</div>)}</div>
    </section>
    <section className="flex flex-1 flex-col px-5 pb-7 pt-4">{error && <p className="rounded-2xl bg-red-50 p-3 text-center text-xs font-bold text-red-700">{error}</p>}{feedback && <p role="status" className={`rounded-2xl p-3 text-center text-xs font-bold ${feedback.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{feedback.message}</p>}{showHint && <p className="mt-3 rounded-2xl bg-amber-50 p-3 text-xs font-semibold text-amber-800">{puzzle.hint}</p>}
      <div className="mt-auto grid grid-cols-2 gap-3 pt-4"><button type="button" onClick={() => { setShowHint(current => !current); setHintWasUsed(true); }} className="flex items-center justify-center gap-2 rounded-2xl border py-3 text-xs font-bold"><Lightbulb size={17}/>{showHint ? "Hide hint" : "Show hint"}</button><button type="button" onClick={() => feedback?.type === "success" ? loadPuzzle(index + 1) : loadPuzzle(index)} className="flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 py-3 text-xs font-bold text-white"><RefreshCcw size={17}/>{feedback?.type === "success" ? "Next puzzle" : "Reset"}</button></div>
    </section>
  </div></main>;
}
