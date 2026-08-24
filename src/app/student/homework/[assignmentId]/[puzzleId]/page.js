"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Chess } from "chess.js";
import { ArrowLeft, CheckCircle2, Lightbulb } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { roleHome } from "@/lib/roleHome";
import { CHESS_PIECES } from "@/lib/chessPieces";
import { getJson, postJson } from "@/lib/api";

const WHITE_FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const WHITE_RANKS = [8, 7, 6, 5, 4, 3, 2, 1];

export default function AssignedPuzzlePage() {
  const { assignmentId, puzzleId } = useParams(); const auth = useAuth(); const router = useRouter(); const startedAt = useRef(null);
  const [data, setData] = useState(null); const [game, setGame] = useState(null); const [learnerColor, setLearnerColor] = useState("w");
  const [selected, setSelected] = useState(null); const [targets, setTargets] = useState([]); const [moveIndex, setMoveIndex] = useState(0); const [playedMoves, setPlayedMoves] = useState([]);
  const [mistakes, setMistakes] = useState(0); const [hintsUsed, setHintsUsed] = useState(0); const [feedback, setFeedback] = useState(""); const [result, setResult] = useState(null); const [error, setError] = useState("");

  useEffect(() => {
    if (auth.status === "anonymous") router.push("/login");
    if (auth.status === "authenticated" && auth.user.role !== "student") router.push(roleHome(auth.user.role));
    if (auth.status === "authenticated" && auth.user.role === "student") getJson(`/api/assignments/student/${assignmentId}/puzzles/${puzzleId}`).then(response => {
      const initialGame = new Chess(response.puzzle.initialFen); setData(response); setGame(initialGame); setLearnerColor(initialGame.turn()); startedAt.current = Date.now();
    }).catch(requestError => setError(requestError.message));
  }, [auth, router, assignmentId, puzzleId]);

  const finish = async (moves, mistakeCount, hintCount) => {
    try { const durationSeconds = Math.max(1, Math.round((Date.now() - startedAt.current) / 1000)); const response = await postJson(`/api/assignments/student/${assignmentId}/puzzles/${puzzleId}/attempts`, { playedMoves: moves, mistakes: mistakeCount, hintsUsed: hintCount, durationSeconds }); setResult(response.attempt); setFeedback("Puzzle completed!"); }
    catch (requestError) { setError(requestError.message); }
  };

  const clickSquare = (square) => {
    if (!game || !data || result) return; const piece = game.get(square);
    if (piece?.color === learnerColor && game.turn() === learnerColor) { setSelected(square); setTargets(game.moves({ square, verbose: true }).map(move => move.to)); return; }
    if (!selected || !targets.includes(square)) { setSelected(null); setTargets([]); return; }
    const candidateGame = new Chess(game.fen()); const candidate = candidateGame.move({ from: selected, to: square, promotion: "q" }); const expected = data.puzzle.solutionMoves[moveIndex]; setSelected(null); setTargets([]);
    if (!expected || candidate.from !== expected.from || candidate.to !== expected.to || (candidate.promotion || "q") !== (expected.promotion || "q")) { setMistakes(current => current + 1); setFeedback("That is not the solution move. Try again."); return; }
    let nextIndex = moveIndex + 1; const nextMoves = [...playedMoves, { from: candidate.from, to: candidate.to, promotion: candidate.promotion || "q" }];
    if (nextIndex < data.puzzle.solutionMoves.length && candidateGame.turn() !== learnerColor) { const reply = data.puzzle.solutionMoves[nextIndex]; const playedReply = candidateGame.move({ from: reply.from, to: reply.to, promotion: reply.promotion || "q" }); nextMoves.push({ from: playedReply.from, to: playedReply.to, promotion: playedReply.promotion || "q" }); nextIndex += 1; }
    setGame(candidateGame); setMoveIndex(nextIndex); setPlayedMoves(nextMoves); setFeedback("Correct move."); if (nextIndex === data.puzzle.solutionMoves.length) finish(nextMoves, mistakes, hintsUsed);
  };

  const showHint = () => { if (!data || result) return; setHintsUsed(current => current + 1); setFeedback(data.puzzle.hints?.[0] || `Look for a move from ${data.puzzle.solutionMoves[moveIndex]?.from}.`); };
  if (error) return <main className="grid min-h-screen place-items-center bg-zinc-50 p-6"><div className="rounded-2xl bg-red-50 p-6 text-red-700">{error}</div></main>;
  if (!game || !data) return <main className="grid min-h-screen place-items-center bg-zinc-50">Loading puzzle…</main>;
  const files = learnerColor === "w" ? WHITE_FILES : [...WHITE_FILES].reverse(); const ranks = learnerColor === "w" ? WHITE_RANKS : [...WHITE_RANKS].reverse();
  return <main className="min-h-screen bg-zinc-50 p-5"><div className="mx-auto max-w-5xl"><Link href="/student/homework" className="mb-5 inline-flex items-center gap-2 text-sm font-bold"><ArrowLeft size={17}/>Homework</Link>
    <div className="grid gap-6 lg:grid-cols-[minmax(0,620px)_1fr]"><section className="overflow-hidden rounded-3xl border bg-white p-4 shadow-sm"><div className="flex aspect-square flex-col overflow-hidden rounded-2xl">{ranks.map((rank, row) => <div key={rank} className="flex flex-1">{files.map((file, col) => { const square = `${file}${rank}`; const boardPiece = game.get(square); return <button type="button" aria-label={square} onClick={() => clickSquare(square)} key={square} className={`relative flex flex-1 items-center justify-center ${(row + col) % 2 ? "bg-[#b58863]" : "bg-[#f0d9b5]"} ${selected === square ? "ring-4 ring-inset ring-amber-400" : ""}`}>{targets.includes(square) && <span className="absolute z-20 h-3 w-3 rounded-full bg-zinc-900/35"/>}{boardPiece && <span className="relative h-[86%] w-[86%]"><Image src={CHESS_PIECES[boardPiece.color][boardPiece.type]} alt={`${boardPiece.color} ${boardPiece.type}`} fill unoptimized className="object-contain"/></span>}</button>; })}</div>)}</div></section>
      <aside className="rounded-3xl border bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-widest text-amber-600">{data.assignment.title}</p><h1 className="mt-2 text-3xl font-black">{data.puzzle.title}</h1><p className="mt-2 text-zinc-500">{data.puzzle.description || "Find the best continuation."}</p><div className="mt-5 flex flex-wrap gap-2">{data.puzzle.tags.map(tag => <span key={tag} className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold">{tag}</span>)}</div>
        <div className="mt-6 rounded-2xl bg-zinc-50 p-4"><p className="text-sm font-bold">Progress: {moveIndex} / {data.puzzle.solutionMoves.length} moves</p><p className="mt-1 text-sm text-zinc-500">Mistakes: {mistakes} • Hints: {hintsUsed}</p></div>{feedback && <p role="status" className={`mt-4 rounded-xl p-3 text-sm font-bold ${result ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>{feedback}</p>}
        {result ? <div className="mt-5 rounded-2xl bg-emerald-600 p-5 text-white"><CheckCircle2/><p className="mt-2 text-2xl font-black">{result.accuracy}% accuracy</p><p>{result.durationSeconds} seconds</p></div> : <button type="button" onClick={showHint} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border p-3 font-bold"><Lightbulb size={18}/>Show hint</button>}
      </aside></div>
  </div></main>;
}
