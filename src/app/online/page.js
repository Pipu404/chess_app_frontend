"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, ChevronLeft, Flag, Handshake, RefreshCw, RotateCcw, Wifi, WifiOff } from "lucide-react";
import { Chess } from "chess.js";
import { io } from "socket.io-client";
import { useAuth } from "@/hooks/useAuth";
import { API_BASE_URL } from "@/lib/api";
import { CHESS_PIECES } from "@/lib/chessPieces";
import { getGameConfig } from "@/lib/gameConfig";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1];

function formatTime(milliseconds) {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function OnlineGameContent() {
  const auth = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const config = getGameConfig(searchParams);
  const socketRef = useRef(null);
  const [connection, setConnection] = useState("connecting");
  const [waiting, setWaiting] = useState(false);
  const [state, setState] = useState(null);
  const [receivedAt, setReceivedAt] = useState(0);
  const [now, setNow] = useState(0);
  const [selected, setSelected] = useState(null);
  const [targets, setTargets] = useState([]);
  const [error, setError] = useState("");
  const [rematch, setRematch] = useState({ pending: false, requestedByOpponent: false });

  useEffect(() => {
    if (auth.status === "anonymous") router.push("/login");
  }, [auth.status, router]);

  useEffect(() => {
    if (auth.status !== "authenticated") return undefined;
    const socket = io(API_BASE_URL, { withCredentials: true, transports: ["websocket", "polling"] });
    socketRef.current = socket;
    socket.on("connect", () => {
      setConnection("connected");
      setError("");
      socket.emit("online:join-queue", { timeControl: config.time, side: config.side });
    });
    socket.on("disconnect", () => setConnection("disconnected"));
    socket.on("connect_error", err => { setConnection("disconnected"); setError(err.message || "Could not connect to multiplayer server."); });
    socket.on("online:queue-status", payload => setWaiting(Boolean(payload.waiting)));
    socket.on("online:error", payload => setError(payload?.message || "Online game error."));
    socket.on("online:rematch-status", payload => setRematch(previous => ({ ...previous, ...payload })));
    socket.on("online:state", payload => {
      setState(payload);
      setReceivedAt(Date.now());
      setWaiting(false);
      setSelected(null);
      setTargets([]);
      setError("");
      if (payload.status === "active") setRematch({ pending: false, requestedByOpponent: false });
    });
    return () => { socket.emit("online:leave-queue"); socket.disconnect(); socketRef.current = null; };
  }, [auth.status, config.side, config.time]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, []);

  const game = useMemo(() => {
    try { return new Chess(state?.fen); } catch { return new Chess(); }
  }, [state?.fen]);
  const board = game.board();
  const isFlipped = state?.color === "b";
  const rows = isFlipped ? [...RANKS].reverse() : RANKS;
  const columns = isFlipped ? [...FILES].reverse() : FILES;
  const turn = game.turn();
  const elapsed = state?.status === "active" ? now - receivedAt : 0;
  const whiteTime = Math.max(0, (state?.whiteTimeMs ?? config.initialSeconds * 1000) - (turn === "w" ? elapsed : 0));
  const blackTime = Math.max(0, (state?.blackTimeMs ?? config.initialSeconds * 1000) - (turn === "b" ? elapsed : 0));
  const playerTime = state?.color === "b" ? blackTime : whiteTime;
  const opponentTime = state?.color === "b" ? whiteTime : blackTime;
  const lastMove = state?.moves?.at(-1);

  const selectSquare = square => {
    if (!state || state.status !== "active" || turn !== state.color || connection !== "connected") return;
    const piece = game.get(square);
    if (piece?.color === state.color) {
      setSelected(square);
      setTargets(game.moves({ square, verbose: true }).map(move => move.to));
      return;
    }
    if (selected && targets.includes(square)) {
      socketRef.current?.emit("online:move", { gameId: state.gameId, from: selected, to: square, promotion: "q" });
      setSelected(null);
      setTargets([]);
      return;
    }
    setSelected(null);
    setTargets([]);
  };

  const retry = () => {
    setError("");
    if (socketRef.current?.connected) socketRef.current.emit("online:join-queue", { timeControl: config.time, side: config.side });
    else socketRef.current?.connect();
  };

  if (!state) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 text-zinc-900">
        <section className="w-full max-w-md rounded-[32px] border-4 border-zinc-100 bg-white p-8 text-center shadow-2xl">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 text-white">
            {connection === "disconnected" ? <WifiOff size={28} /> : <Wifi className="animate-pulse" size={28} />}
          </div>
          <h1 className="text-2xl font-black">{waiting ? "Finding an opponent" : "Online Multiplayer"}</h1>
          <p className="mt-2 text-sm font-semibold text-zinc-500">{config.time} • {config.side} preference • Rating {auth.user?.chessRating || 1200}</p>
          <p className="mt-5 text-xs text-zinc-400">Keep this page open. Your game will begin automatically when a player with the same time control joins.</p>
          {error && <p className="mt-5 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700">{error}</p>}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Link href="/new-game?mode=online" className="rounded-xl bg-zinc-100 py-3 text-xs font-bold">Cancel</Link>
            <button onClick={retry} className="flex items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 text-xs font-bold text-white"><RefreshCw size={15} /> Retry</button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-3 font-sans text-zinc-900 lg:p-6">
      <section className="relative grid w-full max-w-6xl overflow-hidden rounded-[32px] border-4 border-zinc-100 bg-white shadow-2xl lg:h-[calc(100vh-3rem)] lg:min-h-[720px] lg:max-h-[920px] lg:grid-cols-[minmax(0,1fr)_360px] lg:grid-rows-[auto_1fr_auto]">
        <header className="flex items-center justify-between border-b px-5 py-4 lg:col-span-2 lg:px-8">
          <Link href="/player" className="rounded-full p-2 hover:bg-zinc-100"><ChevronLeft /></Link>
          <div className="text-center"><p className="text-xs font-black">{state.opponentName}</p><p className="text-[10px] font-bold text-zinc-400">ONLINE • {state.timeControl}</p></div>
          <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${connection === "connected" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{connection === "connected" ? <Wifi size={12} /> : <WifiOff size={12} />}{connection}</div>
        </header>

        <div className="flex items-center justify-center border-r p-3 sm:p-6 lg:min-h-0">
          <div className="aspect-square w-full max-w-[680px] overflow-hidden rounded-2xl border shadow-md lg:h-full lg:w-auto lg:max-w-full">
            {rows.map((rank, rowIndex) => <div key={rank} className="flex h-[12.5%]">{columns.map((file, colIndex) => {
              const square = `${file}${rank}`;
              const boardRow = 8 - rank;
              const boardCol = FILES.indexOf(file);
              const piece = board[boardRow][boardCol];
              const dark = (rowIndex + colIndex) % 2 === 1;
              const highlighted = lastMove && (lastMove.from === square || lastMove.to === square);
              return <button aria-label={square} key={square} onClick={() => selectSquare(square)} className={`relative flex h-full w-[12.5%] items-center justify-center ${dark ? "bg-[#e2d5c3]" : "bg-[#f5f1ea]"} ${selected === square ? "ring-4 ring-inset ring-zinc-900/40" : ""}`}>
                {highlighted && <span className="absolute inset-0 bg-amber-300/35" />}
                {targets.includes(square) && <span className="absolute z-20 h-3 w-3 rounded-full bg-zinc-900/25" />}
                {piece && <span className="relative z-10 h-[85%] w-[85%]"><Image src={CHESS_PIECES[piece.color][piece.type]} alt={`${piece.color}${piece.type}`} fill unoptimized className="object-contain" /></span>}
              </button>;
            })}</div>)}
          </div>
        </div>

        <aside className="flex min-h-72 flex-col p-5 lg:min-h-0">
          <div className="flex items-center justify-between rounded-2xl bg-zinc-100 p-4"><div><p className="text-xs font-black">{state.opponentName} <span className="text-zinc-400">({state.opponentRating})</span></p><p className={`text-[10px] font-bold ${state.opponentConnected ? "text-emerald-600" : "text-amber-600"}`}>{state.opponentConnected ? "Connected" : "Disconnected — grace period active"}</p></div><p className={`rounded-xl px-3 py-2 font-black ${turn !== state.color ? "bg-zinc-900 text-white" : "bg-white"}`}>{formatTime(opponentTime)}</p></div>
          <div className="my-4 flex-1 overflow-y-auto rounded-2xl border bg-zinc-50 p-3"><p className="mb-2 text-[10px] font-black uppercase text-zinc-400">Moves</p><div className="flex flex-wrap gap-1">{state.moves.map((move, index) => <span key={`${move.from}-${index}`} className="rounded bg-white px-2 py-1 text-xs font-bold shadow-sm">{index % 2 === 0 && `${Math.floor(index / 2) + 1}. `}{move.san}</span>)}</div></div>
          {error && <p className="mb-3 rounded-xl bg-red-50 p-2 text-xs font-bold text-red-700">{error}</p>}
          {state.drawOfferFromOpponent && <div className="mb-3 rounded-2xl bg-amber-50 p-3"><p className="text-xs font-black">Your opponent offered a draw.</p><div className="mt-2 grid grid-cols-2 gap-2"><button onClick={() => socketRef.current?.emit("online:respond-draw", { gameId: state.gameId, accept: false })} className="rounded-lg bg-white py-2 text-[10px] font-bold">Decline</button><button onClick={() => socketRef.current?.emit("online:respond-draw", { gameId: state.gameId, accept: true })} className="rounded-lg bg-zinc-900 py-2 text-[10px] font-bold text-white">Accept</button></div></div>}
          <div className="flex items-center justify-between rounded-2xl bg-zinc-100 p-4"><div><p className="text-xs font-black">{auth.user?.name || "You"} <span className="text-zinc-400">({state.playerRating})</span></p><p className="text-[10px] text-zinc-500">Playing as {state.color === "w" ? "White" : "Black"}</p></div><p className={`rounded-xl px-3 py-2 font-black ${turn === state.color ? "bg-zinc-900 text-white" : "bg-white"}`}>{formatTime(playerTime)}</p></div>
          <div className="mt-3 grid grid-cols-2 gap-2"><button onClick={() => socketRef.current?.emit("online:offer-draw", { gameId: state.gameId })} disabled={state.status !== "active" || state.drawOfferPending} className="flex items-center justify-center gap-2 rounded-xl border py-3 text-xs font-bold disabled:opacity-40"><Handshake size={16} /> {state.drawOfferPending ? "Offered" : "Draw"}</button><button onClick={() => socketRef.current?.emit("online:resign", { gameId: state.gameId })} disabled={state.status !== "active"} className="flex items-center justify-center gap-2 rounded-xl border py-3 text-xs font-bold disabled:opacity-40"><Flag size={16} /> Resign</button></div>
        </aside>

        {state.status === "completed" && <div className="absolute inset-0 z-50 flex items-center justify-center bg-zinc-950/80 p-6 backdrop-blur-sm"><div className="w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-2xl"><AlertCircle className="mx-auto mb-3" size={38} /><h2 className="text-2xl font-black">Game Over</h2><p className="mt-2 text-sm font-bold uppercase text-zinc-500">{state.result.reason}</p><p className="mt-5 rounded-2xl bg-zinc-50 p-4 text-lg font-black">{state.result.winner === "Draw" ? "Draw" : `${state.result.winner} won`}</p><p className={`mb-5 mt-2 text-sm font-black ${state.ratingChange >= 0 ? "text-emerald-600" : "text-red-600"}`}>Rating {state.playerRating} ({state.ratingChange >= 0 ? "+" : ""}{state.ratingChange})</p>{rematch.requestedByOpponent && <p className="mb-3 rounded-xl bg-amber-50 p-2 text-xs font-bold">Your opponent wants a rematch.</p>}<div className="grid grid-cols-2 gap-2"><Link href="/games" className="rounded-xl bg-amber-400 py-3 text-xs font-black">Game History</Link><button onClick={() => socketRef.current?.emit("online:rematch", { gameId: state.gameId })} disabled={rematch.pending && !rematch.requestedByOpponent} className="flex items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 text-xs font-black text-white disabled:opacity-50"><RotateCcw size={15} /> {rematch.pending && !rematch.requestedByOpponent ? "Waiting…" : "Rematch"}</button><Link href="/new-game?mode=online" className="col-span-2 rounded-xl bg-zinc-100 py-3 text-xs font-black">New opponent</Link></div></div></div>}
      </section>
    </main>
  );
}

export default function OnlineGamePage() {
  return <Suspense fallback={<div className="flex min-h-screen items-center justify-center font-bold">Connecting…</div>}><OnlineGameContent /></Suspense>;
}
