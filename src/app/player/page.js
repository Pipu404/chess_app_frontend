"use client";

import { Bot, History, Puzzle, Users } from "lucide-react";
import RoleDashboard from "@/components/RoleDashboard";

const ALL_ROLES = ["player", "student", "coach"];

export default function PlayerDashboard() {
  return <RoleDashboard role="player" allowedRoles={ALL_ROLES} title="Player Portal" subtitle="The shared playing area for players, students, and coaches." features={[
    { title: "Play with AI", description: "Start a configurable computer game.", href: "/new-game?mode=ai", icon: Bot },
    { title: "Local Game", description: "Play pass-and-play chess on one device.", href: "/new-game?mode=local", icon: Users },
    { title: "Puzzles", description: "Solve tactics and maintain a streak.", href: "/puzzles", icon: Puzzle },
    { title: "Game History", description: "Reopen completed games and saved Stockfish reviews.", href: "/games", icon: History },
  ]} />;
}
