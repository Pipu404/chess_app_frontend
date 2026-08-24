"use client";

import { Bot, Puzzle, Users } from "lucide-react";
import RoleDashboard from "@/components/RoleDashboard";

export default function PlayerDashboard() {
  return <RoleDashboard role="player" title="Player Dashboard" subtitle="Play chess, challenge the computer, and sharpen your tactics." features={[
    { title: "Play with AI", description: "Start a configurable computer game.", href: "/new-game?mode=ai", icon: Bot },
    { title: "Local Game", description: "Play pass-and-play chess on one device.", href: "/new-game?mode=local", icon: Users },
    { title: "Puzzles", description: "Solve tactics and maintain a streak.", href: "/puzzles", icon: Puzzle },
  ]} />;
}
