"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Menu, Bell, Globe, Bot, Users, BookOpen,
  Home, Puzzle, BarChart2, User,
  UserCircle, Mail, Settings, LogOut,
} from "lucide-react";

export default function HomeView() {
  const router = useRouter();
  const [userName, setUserName] = useState("Player");
  const [userInitial, setUserInitial] = useState("P");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (!token) {
      router.push("/login");
    } else if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.name || "Player");
        setUserInitial((user.name || "P")[0].toUpperCase());
      } catch (e) {}
    }
  }, [router]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const MENU_ITEMS = [
    {
      icon: UserCircle,
      label: "Profile",
      dot: true,
      onClick: () => { setDropdownOpen(false); },
    },
    {
      icon: Mail,
      label: "Inbox",
      onClick: () => { setDropdownOpen(false); },
    },
    {
      icon: Settings,
      label: "Preferences",
      onClick: () => { setDropdownOpen(false); },
    },
    {
      icon: LogOut,
      label: "Sign out",
      danger: true,
      onClick: handleSignOut,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 items-center justify-center font-sans text-zinc-900 px-4">
      {/* Mobile App Container */}
      <div className="w-full max-w-[400px] bg-white h-[850px] shadow-2xl rounded-[40px] overflow-hidden flex flex-col relative border-[8px] border-zinc-100">

        {/* Top Header */}
        <div className="flex items-center justify-between px-6 pt-10 pb-4">
          <button className="p-2 -ml-2 rounded-full hover:bg-zinc-100 transition">
            <Menu size={24} className="text-zinc-600" />
          </button>

          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full hover:bg-zinc-100 transition relative">
              <Bell size={24} className="text-zinc-600" />
              {/* Notification dot */}
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>

            {/* Profile Avatar + Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className="w-9 h-9 rounded-full bg-zinc-900 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-offset-1 ring-zinc-300 hover:ring-zinc-500 transition-all active:scale-95"
                aria-label="Open profile menu"
              >
                {userInitial}
              </button>

              {/* Dropdown Panel */}
              <div
                className={`absolute right-0 top-12 w-52 bg-[#2a2a2a] rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-50 transition-all duration-200 origin-top-right ${
                  dropdownOpen
                    ? "opacity-100 scale-100 translate-y-0"
                    : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                }`}
              >
                {/* User info row */}
                <div className="px-4 pt-4 pb-3 border-b border-white/10">
                  <p className="text-white font-bold text-sm">{userName}</p>
                  <p className="text-zinc-400 text-xs mt-0.5">Chess Player</p>
                </div>

                {/* Menu items */}
                <div className="py-2">
                  {MENU_ITEMS.map(({ icon: Icon, label, dot, danger, onClick }) => (
                    <button
                      key={label}
                      onClick={onClick}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                        danger
                          ? "text-red-400 hover:bg-red-500/10"
                          : "text-zinc-200 hover:bg-white/10"
                      }`}
                    >
                      <span className="relative flex items-center">
                        <Icon size={17} />
                        {dot && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-[#2a2a2a]" />
                        )}
                      </span>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Title Area */}
        <div className="flex flex-col items-center mt-6 mb-10">
          <div className="w-14 h-14 bg-zinc-100 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-zinc-800">
              <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-black tracking-widest text-zinc-900 mb-1">CHESS</h1>
          <p className="text-zinc-500 font-medium text-sm">Play. Learn. Improve.</p>
          <p className="text-green-600 font-semibold text-xs mt-2">Welcome back, {userName}!</p>
        </div>

        {/* Menu Options */}
        <div className="px-6 flex flex-col gap-4 flex-1">
          <Link href="/new-game?mode=online" className="flex items-center bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm hover:border-zinc-300 hover:shadow-md transition-all active:scale-[0.98]">
            <div className="w-12 h-12 bg-zinc-50 rounded-xl flex items-center justify-center mr-4">
              <Globe size={24} className="text-zinc-700" />
            </div>
            <div>
              <h2 className="font-bold text-zinc-900">Play Online</h2>
              <p className="text-xs font-medium text-zinc-500 mt-0.5">Play with players around the world</p>
            </div>
          </Link>

          <Link href="/new-game?mode=ai" className="flex items-center bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm hover:border-zinc-300 hover:shadow-md transition-all active:scale-[0.98]">
            <div className="w-12 h-12 bg-zinc-50 rounded-xl flex items-center justify-center mr-4">
              <Bot size={24} className="text-zinc-700" />
            </div>
            <div>
              <h2 className="font-bold text-zinc-900">Play with AI</h2>
              <p className="text-xs font-medium text-zinc-500 mt-0.5">Challenge the computer</p>
            </div>
          </Link>

          <Link href="/new-game?mode=local" className="flex items-center bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm hover:border-zinc-300 hover:shadow-md transition-all active:scale-[0.98]">
            <div className="w-12 h-12 bg-zinc-50 rounded-xl flex items-center justify-center mr-4">
              <Users size={24} className="text-zinc-700" />
            </div>
            <div>
              <h2 className="font-bold text-zinc-900">Local Multiplayer</h2>
              <p className="text-xs font-medium text-zinc-500 mt-0.5">Play with your friends</p>
            </div>
          </Link>

          <Link href="#" className="flex items-center bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm hover:border-zinc-300 hover:shadow-md transition-all active:scale-[0.98]">
            <div className="w-12 h-12 bg-zinc-50 rounded-xl flex items-center justify-center mr-4">
              <BookOpen size={24} className="text-zinc-700" />
            </div>
            <div>
              <h2 className="font-bold text-zinc-900">Learn</h2>
              <p className="text-xs font-medium text-zinc-500 mt-0.5">Puzzles, Lessons, and more</p>
            </div>
          </Link>
        </div>

        {/* Bottom Navigation */}
        <div className="flex items-center justify-between px-8 py-6 bg-white border-t border-zinc-100">
          <button className="flex flex-col items-center gap-1.5 text-zinc-900">
            <Home size={22} fill="currentColor" />
            <span className="text-[10px] font-bold">Home</span>
          </button>
          <button className="flex flex-col items-center gap-1.5 text-zinc-400 hover:text-zinc-600 transition">
            <Puzzle size={22} />
            <span className="text-[10px] font-semibold">Puzzles</span>
          </button>
          <button className="flex flex-col items-center gap-1.5 text-zinc-400 hover:text-zinc-600 transition">
            <BarChart2 size={22} />
            <span className="text-[10px] font-semibold">Stats</span>
          </button>
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex flex-col items-center gap-1.5 text-zinc-400 hover:text-zinc-600 transition"
          >
            <User size={22} />
            <span className="text-[10px] font-semibold">Profile</span>
          </button>
        </div>

      </div>
    </div>
  );
}
