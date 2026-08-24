"use client";

import { BookOpen, Bot, Brain, Globe, History, Puzzle, TrendingUp, Users } from "lucide-react";
import RoleDashboard from "@/components/RoleDashboard";
import { useAuth } from "@/hooks/useAuth";

const ALL_ROLES = ["player", "student", "coach"];

export default function PlayerDashboard() {
  const auth = useAuth();
  const history = auth.user?.ratingHistory || [];
  return <RoleDashboard role="player" allowedRoles={ALL_ROLES} title="Player Portal" subtitle="The shared playing area for players, students, and coaches." features={[
    { title: "Online Rated", description: "Play a real-time rated match against another player.", href: "/new-game?mode=online", icon: Globe },
    { title: "Improvement Plan", description: "See weaknesses, recommendations, and progress goals.", href: "/improvement", icon: Brain },
    { title: "Opening Trainer", description: "Build and practice opening repertoires with spaced repetition.", href: "/openings", icon: BookOpen },
    { title: "Play with AI", description: "Start a configurable computer game.", href: "/new-game?mode=ai", icon: Bot },
    { title: "Local Game", description: "Play pass-and-play chess on one device.", href: "/new-game?mode=local", icon: Users },
    { title: "Puzzles", description: "Solve tactics and maintain a streak.", href: "/puzzles", icon: Puzzle },
    { title: "Game History", description: "Reopen completed games and saved Stockfish reviews.", href: "/games", icon: History },
  ]}>
    <section className="mb-6 grid gap-4 lg:grid-cols-[220px_1fr]">
      <div className="rounded-3xl bg-amber-400 p-6 text-zinc-950 shadow-sm">
        <TrendingUp size={24} />
        <p className="mt-4 text-xs font-black uppercase tracking-widest">Online rating</p>
        <p className="mt-1 text-4xl font-black">{auth.user?.chessRating || 1200}</p>
      </div>
      <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-black">Recent rating changes</h2>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {history.length === 0 && <p className="py-4 text-xs font-semibold text-zinc-400">Complete an online rated game to begin your rating history.</p>}
          {history.slice(0, 8).map(entry => <div key={entry._id || `${entry.gameId}-${entry.playedAt}`} className="min-w-32 rounded-2xl bg-zinc-50 p-3">
            <p className="truncate text-[10px] font-bold text-zinc-500">vs {entry.opponentName}</p>
            <p className={`mt-1 text-lg font-black ${entry.change >= 0 ? "text-emerald-600" : "text-red-600"}`}>{entry.change >= 0 ? "+" : ""}{entry.change}</p>
            <p className="text-[10px] font-bold uppercase text-zinc-400">{entry.result} • {entry.rating}</p>
          </div>)}
        </div>
      </div>
    </section>
  </RoleDashboard>;
}
