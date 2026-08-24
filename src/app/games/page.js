"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BarChart3, Bot, CheckCircle2, Clock3, History, Swords } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getJson } from "@/lib/api";

function outcome(game) {
  if (game.result.winner === "Draw") return "Draw";
  const userWon = (game.userColor === "w" && game.result.winner === "White") || (game.userColor === "b" && game.result.winner === "Black");
  return userWon ? "Win" : "Loss";
}

export default function GameHistoryPage() {
  const auth = useAuth(); const router = useRouter(); const [games, setGames] = useState([]); const [error, setError] = useState("");
  useEffect(() => { if (auth.status === "anonymous") router.push("/login"); if (auth.status === "authenticated") getJson("/api/games").then(data => setGames(data.games)).catch(requestError => setError(requestError.message)); }, [auth.status, router]);
  return <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-900"><div className="mx-auto max-w-5xl"><Link href="/player" className="mb-5 inline-flex items-center gap-2 text-sm font-bold"><ArrowLeft size={17}/>Player Portal</Link>
    <header className="rounded-3xl bg-zinc-900 p-7 text-white"><div className="flex items-center gap-3"><History/><div><p className="text-xs font-black uppercase tracking-widest text-zinc-400">Your archive</p><h1 className="text-3xl font-black">Game History</h1></div></div><p className="mt-3 text-sm text-zinc-300">Completed games and saved Stockfish reviews.</p></header>
    {error && <p className="mt-5 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}<section className="mt-6 grid gap-4 md:grid-cols-2">{games.map(game => <article key={game._id} className="rounded-3xl border bg-white p-6 shadow-sm"><div className="flex items-start justify-between"><div className="flex items-center gap-3">{game.mode === "ai" ? <Bot/> : <Swords/>}<div><h2 className="font-black">{game.mode === "ai" ? `AI • ${game.difficulty}` : `${game.mode} game`}</h2><p className="text-xs text-zinc-500">{new Date(game.createdAt).toLocaleString()}</p></div></div><span className={`rounded-full px-3 py-1 text-xs font-black ${outcome(game) === "Win" ? "bg-emerald-100 text-emerald-700" : outcome(game) === "Loss" ? "bg-red-100 text-red-700" : "bg-zinc-100"}`}>{outcome(game)}</span></div>
      <div className="mt-5 grid grid-cols-3 gap-2 text-center"><div className="rounded-xl bg-zinc-50 p-3"><Clock3 className="mx-auto" size={15}/><p className="mt-1 text-xs font-bold">{game.timeControl}</p></div><div className="rounded-xl bg-zinc-50 p-3"><Swords className="mx-auto" size={15}/><p className="mt-1 text-xs font-bold">{game.moves.length} ply</p></div><div className="rounded-xl bg-zinc-50 p-3"><CheckCircle2 className="mx-auto" size={15}/><p className="mt-1 text-xs font-bold">{game.result.reason}</p></div></div>
      <Link href={`/review?gameId=${game._id}`} className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-zinc-900 p-3 text-xs font-bold text-white"><BarChart3 size={16}/>{game.reviewedAt ? "Open saved review" : "Analyze game"}</Link>
    </article>)}{!games.length && !error && <div className="rounded-3xl border border-dashed bg-white p-10 text-center md:col-span-2"><History className="mx-auto text-zinc-400"/><h2 className="mt-3 font-black">No completed games yet</h2><p className="mt-1 text-sm text-zinc-500">Finish a game to add it to your history.</p><Link href="/new-game" className="mt-5 inline-block rounded-xl bg-zinc-900 px-5 py-3 text-sm font-bold text-white">Play now</Link></div>}</section>
  </div></main>;
}
