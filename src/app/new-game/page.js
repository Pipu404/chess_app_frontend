"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Globe, Bot, Users } from "lucide-react";

const MODES = [
  { id: "online", icon: Globe, label: "Online" },
  { id: "ai",     icon: Bot,   label: "With AI" },
  { id: "local",  icon: Users, label: "Local" },
];

const TIME_CONTROLS = [
  { time: "1+0",   type: "Bullet"    },
  { time: "2+1",   type: "Bullet"    },
  { time: "3+0",   type: "Blitz"     },
  { time: "3+2",   type: "Blitz"     },
  { time: "5+0",   type: "Blitz"     },
  { time: "5+3",   type: "Blitz"     },
  { time: "10+0",  type: "Rapid"     },
  { time: "10+5",  type: "Rapid"     },
  { time: "15+10", type: "Rapid"     },
  { time: "30+0",  type: "Classical" },
  { time: "30+20", type: "Classical" },
  { time: "Custom",type: "Custom"    },
];

const TYPE_COLORS = {
  Bullet:    "text-red-400",
  Blitz:     "text-orange-400",
  Rapid:     "text-blue-400",
  Classical: "text-green-400",
  Custom:    "text-purple-400",
};

const TYPE_ACTIVE_BG = {
  Bullet:    "bg-red-500    border-red-500    ring-red-400",
  Blitz:     "bg-orange-500 border-orange-500 ring-orange-400",
  Rapid:     "bg-blue-500   border-blue-500   ring-blue-400",
  Classical: "bg-green-500  border-green-500  ring-green-400",
  Custom:    "bg-purple-500 border-purple-500 ring-purple-400",
};

const DIFFICULTIES = ["Easy", "Medium", "Hard", "Expert"];
const SIDES = ["White", "Black"];

export default function NewGame() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialMode = searchParams.get("mode") || "online";
  const [selectedMode, setSelectedMode]           = useState(initialMode);
  const [selectedTime, setSelectedTime]           = useState("10+0");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Medium");
  const [selectedSide, setSelectedSide]           = useState("White");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
  }, [router]);

  const handleStart = () => {
    router.push(`/play?mode=${selectedMode}&time=${selectedTime}&side=${selectedSide}&difficulty=${selectedDifficulty}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 items-center justify-center font-sans text-zinc-900 px-4 py-6">
      <div className="w-full max-w-[400px] bg-white shadow-2xl rounded-[40px] overflow-hidden flex flex-col border-[8px] border-zinc-100">

        {/* Header */}
        <div className="flex items-center px-6 pt-8 pb-2">
          <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-zinc-100 transition">
            <ChevronLeft size={24} className="text-zinc-600" />
          </Link>
          <h1 className="text-lg font-bold text-zinc-900 ml-2">New Game</h1>
        </div>

        <div className="flex flex-col gap-5 px-6 pt-2 pb-8">

          {/* ── Mode ── */}
          <div>
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Choose Mode</h2>
            <div className="grid grid-cols-3 gap-2">
              {MODES.map(({ id, icon: Icon, label }) => {
                const active = selectedMode === id;
                return (
                  <button
                    key={id}
                    onClick={() => setSelectedMode(id)}
                    className={`flex flex-col items-center justify-center gap-1.5 py-4 rounded-2xl border-2 text-xs font-bold transition-all ${
                      active
                        ? "border-zinc-900 bg-zinc-900 text-white shadow-md"
                        : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400"
                    }`}
                  >
                    <Icon size={20} />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Time Control ── */}
          <div>
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Time Control</h2>
            <div className="grid grid-cols-3 gap-2">
              {TIME_CONTROLS.map(({ time, type }) => {
                const active = selectedTime === time;
                return (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`flex flex-col items-center justify-center py-3 rounded-2xl border-2 transition-all duration-150 ${
                      active
                        ? `${TYPE_ACTIVE_BG[type]} ring-2 ring-offset-1 scale-[1.06] shadow-lg text-white`
                        : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:border-zinc-400 hover:scale-[1.02]"
                    }`}
                  >
                    <span className="text-base font-black leading-none">
                      {time}
                    </span>
                    <span className={`text-[10px] font-semibold mt-1 ${active ? "text-white/80" : TYPE_COLORS[type]}`}>
                      {type}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Difficulty (AI only) ── */}
          {selectedMode === "ai" && (
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Difficulty</h2>
              <div className="grid grid-cols-4 gap-2">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDifficulty(d)}
                    className={`py-3 rounded-2xl border-2 text-xs font-bold transition-all ${
                      selectedDifficulty === d
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-400"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Play As ── */}
          <div>
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Play as</h2>
            <div className="grid grid-cols-2 gap-3">
              {SIDES.map((side) => {
                const active = selectedSide === side;
                const isWhite = side === "White";
                return (
                  <button
                    key={side}
                    onClick={() => setSelectedSide(side)}
                    className={`flex flex-col items-center justify-center gap-2 py-5 rounded-2xl border-2 transition-all font-bold ${
                      active
                        ? "border-zinc-900 bg-zinc-900 text-white shadow-md"
                        : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-400"
                    }`}
                  >
                    <svg viewBox="0 0 45 45" className="w-9 h-9" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03C15.41 27.09 11 31.58 11 39.5H34c0-7.92-4.41-12.41-7.41-13.47C28.06 24.84 29 23.03 29 21c0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"
                        fill={isWhite ? (active ? "#fff" : "#f5f1ea") : (active ? "#888" : "#333")}
                        stroke={isWhite ? (active ? "#bbb" : "#999") : (active ? "#555" : "#111")}
                        strokeWidth="1.5"
                      />
                    </svg>
                    <span className="text-sm">{side}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Summary ── */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Summary</p>
            <div className="flex flex-col gap-1">
              {[
                ["Mode",       MODES.find(m => m.id === selectedMode)?.label],
                ["Time",       selectedTime],
                ...(selectedMode === "ai" ? [["Difficulty", selectedDifficulty]] : []),
                ["Playing as", selectedSide],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between font-semibold">
                  <span className="text-zinc-500">{label}</span>
                  <span className="text-zinc-900">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Start ── */}
          <button
            onClick={handleStart}
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-2xl py-4 flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-zinc-900/20"
          >
            Start Game
            <ChevronRight size={18} />
          </button>

        </div>
      </div>
    </div>
  );
}
