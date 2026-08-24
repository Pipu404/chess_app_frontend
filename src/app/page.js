"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { logoutSession } from "@/lib/authStore";
import { usePuzzleStats } from "@/hooks/usePuzzleStats";
import {
  Menu, Bell, Globe, Bot, Users, BookOpen,
  Home, Puzzle, User,
  UserCircle, Mail, Settings, LogOut,
  ChevronLeft, Send, CheckCheck, Swords, Search, LayoutDashboard
} from "lucide-react";
import { roleHome } from "@/lib/roleHome";

// Pre-defined list of friends with their metadata & initial messages
const INITIAL_FRIENDS = [
  {
    id: "magnus",
    name: "Magnus Carlsen",
    title: "GM | World #1",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Magnus",
    status: "online",
    lastMsg: "Let's see if you can defend my knight attack next time!",
    messages: [
      { sender: "them", text: "Hey! Ready for a Blitz match?" },
      { sender: "me", text: "Always ready. Let's do it." },
      { sender: "them", text: "Let's see if you can defend my knight attack next time!" },
    ],
    responses: [
      "Not bad! But you have to move faster.",
      "Are you trying to trap my Queen?",
      "That is a classical mistake. Want to challenge me now? ⚔️",
      "Interesting move, but I have already calculated checkmate in 5.",
    ]
  },
  {
    id: "kasun",
    name: "Kasun Silva",
    title: "Friend",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kasun",
    status: "offline",
    lastMsg: "Ow machan, dynamic match ekak daamu raata.",
    messages: [
      { sender: "me", text: "Machan free da chess game ekak gahanna?" },
      { sender: "them", text: "Free wenne raata thamai bn." },
      { sender: "them", text: "Ow machan, dynamic match ekak daamu raata." },
    ],
    responses: [
      "Ela ela, game eka start karala invite ekak ewapang.",
      "Mama white gannawa me paara, ela da?",
      "Ado patta game eka habai ara move eka pissa wage gahuwe 😂",
      "Mama dinnoth koththuwak oni hah!",
    ]
  },
  {
    id: "nimal",
    name: "Nimal Perera",
    title: "Club Member",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nimal",
    status: "online",
    lastMsg: "Good game last night!",
    messages: [
      { sender: "them", text: "Good game last night!" },
    ],
    responses: [
      "Thanks! Let's play again soon.",
      "That rook sacrifice was brilliant.",
      "Do you want to practice endgame theory?",
    ]
  },
  {
    id: "anish",
    name: "Anish Giri",
    title: "GM | Challenger",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anish",
    status: "online",
    lastMsg: "Don't draw this chat, okay?",
    messages: [
      { sender: "them", text: "Hi there! Looking for some training matches?" },
      { sender: "me", text: "Absolutely, Magnus is too tough today." },
      { sender: "them", text: "Don't draw this chat, okay?" },
    ],
    responses: [
      "Haha! I love a solid draw anyway.",
      "Let's play and see who has the better tweet afterwards.",
      "Check out my new course on endgame tactics first!",
    ]
  }
];

export default function HomeView() {
  const router = useRouter();
  const auth = useAuth();
  const puzzleStats = usePuzzleStats();
  const userName = auth.user?.name || "Player";
  const userInitial = userName[0].toUpperCase();
  const dashboardHref = auth.status === "authenticated" ? roleHome(auth.user.role) : "/";
  
  // Navigation & Dropdown states
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentView, setCurrentView] = useState("home"); // home, inbox, chat
  const dropdownRef = useRef(null);

  // Chat/Inbox States
  const [friends, setFriends] = useState(INITIAL_FRIENDS);
  const [activeFriendId, setActiveFriendId] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  // Get active friend object
  const activeFriend = friends.find(f => f.id === activeFriendId);

  useEffect(() => {
    if (auth.status === "anonymous") {
      router.push("/login");
    }
  }, [auth.status, router]);

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

  // Scroll to bottom on new chat messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeFriend?.messages, currentView]);

  const handleSignOut = async () => {
    await logoutSession();
    router.push("/login");
  };

  // Send Message Logic
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeFriendId) return;

    const userText = newMessage;
    setNewMessage("");

    // Append user message
    setFriends(prevFriends => 
      prevFriends.map(friend => {
        if (friend.id === activeFriendId) {
          return {
            ...friend,
            lastMsg: userText,
            messages: [...friend.messages, { sender: "me", text: userText }]
          };
        }
        return friend;
      })
    );

    // Mock dynamic replies after a small delay
    setTimeout(() => {
      setFriends(prevFriends => 
        prevFriends.map(friend => {
          if (friend.id === activeFriendId) {
            // Pick a random response from the friend's pool
            const pool = friend.responses;
            const randomReply = pool[Math.floor(Math.random() * pool.length)];
            return {
              ...friend,
              lastMsg: randomReply,
              messages: [...friend.messages, { sender: "them", text: randomReply }]
            };
          }
          return friend;
        })
      );
    }, 1200);
  };

  const MENU_ITEMS = [
    {
      icon: LayoutDashboard,
      label: "My dashboard",
      onClick: () => { setDropdownOpen(false); router.push(dashboardHref); },
    },
    {
      icon: UserCircle,
      label: "Profile",
      dot: true,
      onClick: () => { setDropdownOpen(false); },
    },
    {
      icon: Mail,
      label: "Inbox",
      onClick: () => {
        setDropdownOpen(false);
        setCurrentView("inbox");
      },
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

        {/* ────────── VIEW 1: HOME VIEW ────────── */}
        {currentView === "home" && (
          <>
            {/* Top Header */}
            <div className="flex items-center justify-between px-6 pt-10 pb-4">
              <button className="p-2 -ml-2 rounded-full hover:bg-zinc-100 transition">
                <Menu size={24} className="text-zinc-600" />
              </button>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setCurrentView("inbox")} 
                  className="p-2 rounded-full hover:bg-zinc-100 transition relative"
                >
                  <Bell size={24} className="text-zinc-600" />
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
              <Link href={dashboardHref} className="mt-4 flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-zinc-800">
                <LayoutDashboard size={16} /> Open {auth.user?.role || "player"} dashboard
              </Link>
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

              <Link href="/puzzles" className="flex items-center bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm hover:border-zinc-300 hover:shadow-md transition-all active:scale-[0.98]">
                <div className="w-12 h-12 bg-zinc-50 rounded-xl flex items-center justify-center mr-4">
                  <BookOpen size={24} className="text-zinc-700" />
                </div>
                <div>
                  <h2 className="font-bold text-zinc-900">Learn</h2>
                  <p className="text-xs font-medium text-zinc-500 mt-0.5">
                    {puzzleStats.solved > 0 ? `${puzzleStats.solved} solved • ${puzzleStats.currentStreak} streak` : "Solve tactics and track your progress"}
                  </p>
                </div>
              </Link>
            </div>

            {/* Bottom Navigation */}
            <div className="flex items-center justify-between px-8 py-6 bg-white border-t border-zinc-100">
              <button className="flex flex-col items-center gap-1.5 text-zinc-900">
                <Home size={22} fill="currentColor" />
                <span className="text-[10px] font-bold">Home</span>
              </button>
              <Link href="/puzzles" className="flex flex-col items-center gap-1.5 text-zinc-400 hover:text-zinc-600 transition">
                <Puzzle size={22} />
                <span className="text-[10px] font-semibold">Puzzles</span>
              </Link>
              <Link href={dashboardHref} className="flex flex-col items-center gap-1.5 text-zinc-400 hover:text-zinc-600 transition">
                <LayoutDashboard size={22} />
                <span className="text-[10px] font-semibold">Dashboard</span>
              </Link>
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className="flex flex-col items-center gap-1.5 text-zinc-400 hover:text-zinc-600 transition"
              >
                <User size={22} />
                <span className="text-[10px] font-semibold">Profile</span>
              </button>
            </div>
          </>
        )}

        {/* ────────── VIEW 2: INBOX VIEW (Friends Listing) ────────── */}
        {currentView === "inbox" && (
          <div className="flex flex-col h-full bg-zinc-50">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-10 pb-4 bg-white border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentView("home")} 
                  className="p-2 -ml-2 rounded-full hover:bg-zinc-100 transition"
                >
                  <ChevronLeft size={24} className="text-zinc-600" />
                </button>
                <h2 className="text-lg font-black tracking-tight text-zinc-900">Inbox</h2>
              </div>
            </div>

            {/* Search Bar */}
            <div className="px-5 pt-4 pb-2">
              <div className="flex items-center gap-2 bg-white px-3.5 py-2.5 rounded-2xl border border-zinc-200">
                <Search size={18} className="text-zinc-400" />
                <input 
                  type="text" 
                  placeholder="Search friends..." 
                  className="bg-transparent text-sm w-full outline-none placeholder-zinc-400 font-medium"
                />
              </div>
            </div>

            {/* Friends list */}
            <div className="flex-1 overflow-y-auto px-5 py-2 flex flex-col gap-3">
              {friends.map((friend) => (
                <button
                  key={friend.id}
                  onClick={() => {
                    setActiveFriendId(friend.id);
                    setCurrentView("chat");
                  }}
                  className="flex items-center bg-white p-4 rounded-3xl border border-zinc-100 shadow-sm hover:border-zinc-200 active:scale-[0.98] transition-all text-left"
                >
                  {/* Avatar section */}
                  <div className="relative mr-4 flex-shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-100 border border-zinc-200">
                      <Image 
                        src={friend.avatar} 
                        alt={friend.name} 
                        width={48} 
                        height={48} 
                        unoptimized 
                      />
                    </div>
                    {/* Status dot */}
                    <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                      friend.status === "online" ? "bg-green-500" : "bg-zinc-300"
                    }`} />
                  </div>

                  {/* Text section */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h3 className="font-bold text-zinc-900 truncate pr-2 text-sm">{friend.name}</h3>
                      <span className="text-[10px] font-bold text-zinc-400 flex-shrink-0">{friend.title}</span>
                    </div>
                    <p className="text-xs text-zinc-500 truncate font-medium">
                      {friend.lastMsg}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ────────── VIEW 3: CHAT VIEW (Individual Chat Room) ────────── */}
        {currentView === "chat" && activeFriend && (
          <div className="flex flex-col h-full bg-zinc-50">
            {/* Chat Room Header */}
            <div className="flex items-center justify-between px-6 pt-10 pb-4 bg-white border-b border-zinc-100 shadow-sm">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setCurrentView("inbox")} 
                  className="p-1.5 -ml-1 rounded-full hover:bg-zinc-100 transition"
                >
                  <ChevronLeft size={22} className="text-zinc-600" />
                </button>
                <div className="relative flex-shrink-0">
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-zinc-100 border border-zinc-200">
                    <Image 
                      src={activeFriend.avatar} 
                      alt={activeFriend.name} 
                      width={36} 
                      height={36} 
                      unoptimized 
                    />
                  </div>
                  <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                    activeFriend.status === "online" ? "bg-green-500" : "bg-zinc-300"
                  }`} />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 text-sm leading-tight">{activeFriend.name}</h3>
                  <span className="text-[10px] font-semibold text-zinc-400 block">{activeFriend.title}</span>
                </div>
              </div>

              {/* Quick Challenge button */}
              <Link 
                href={`/new-game?mode=local&side=White`}
                className="p-2 rounded-full bg-zinc-100 hover:bg-zinc-900 hover:text-white transition active:scale-95"
                title="Challenge to Chess Match"
              >
                <Swords size={18} />
              </Link>
            </div>

            {/* Chat Message Workspace */}
            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
              {activeFriend.messages.map((msg, idx) => {
                const isMe = msg.sender === "me";
                return (
                  <div 
                    key={idx} 
                    className={`flex flex-col max-w-[75%] ${isMe ? "self-end items-end" : "self-start items-start"}`}
                  >
                    <div 
                      className={`px-4 py-3 rounded-2xl text-xs font-semibold leading-relaxed shadow-sm ${
                        isMe 
                          ? "bg-zinc-900 text-white rounded-tr-none" 
                          : "bg-white border border-zinc-100 text-zinc-800 rounded-tl-none"
                      }`}
                    >
                      {msg.text}
                    </div>
                    {isMe && idx === activeFriend.messages.length - 1 && (
                      <span className="flex items-center gap-1 text-[9px] font-bold text-zinc-400 mt-1">
                        Sent <CheckCheck size={10} className="text-blue-500" />
                      </span>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Bar */}
            <form 
              onSubmit={handleSendMessage} 
              className="p-4 bg-white border-t border-zinc-100 flex items-center gap-2 pb-8"
            >
              <input 
                type="text" 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..." 
                className="flex-1 bg-zinc-100 text-xs font-semibold px-4 py-3.5 rounded-2xl outline-none border border-transparent focus:bg-white focus:border-zinc-200 transition"
              />
              <button 
                type="submit"
                disabled={!newMessage.trim()}
                className="p-3 rounded-2xl bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-40 disabled:pointer-events-none transition active:scale-95"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
