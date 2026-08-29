"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, RotateCcw, Flag, Play, AlertCircle, BarChart3 } from "lucide-react";
import { Chess } from "chess.js";
import { useAuth } from "@/hooks/useAuth";
import { getGameConfig } from "@/lib/gameConfig";
import { chooseStockfishMove } from "@/lib/chessAi";
import { CHESS_PIECES } from "@/lib/chessPieces";
import { postJson } from "@/lib/api";

const AI_THINKING_DELAY_MS = 1500;

function GameContent() {
  const router = useRouter();
  const auth = useAuth();
  const searchParams = useSearchParams();

  const {
    mode,
    time: timeParam,
    side: sideParam,
    difficulty,
    initialSeconds,
    incrementSeconds,
  } = getGameConfig(searchParams);

  // Chess instance state
  const [game, setGame] = useState(() => new Chess());
  const [board, setBoard] = useState(() => game.board());
  const [history, setHistory] = useState([]);
  const [turn, setTurn] = useState("w"); // 'w' or 'b'
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [lastMove, setLastMove] = useState(null); // { from, to }

  // User details
  const userName = auth.user?.name || "Player";

  // Game configuration
  const userColor = sideParam.toLowerCase() === "black" ? "b" : "w";
  const isFlipped = userColor === "b";

  // Timers state (in seconds)
  const [whiteTime, setWhiteTime] = useState(initialSeconds);
  const [blackTime, setBlackTime] = useState(initialSeconds);
  const [gameStarted, setGameStarted] = useState(mode === "ai");
  const [gameOver, setGameOver] = useState(null); // { reason: 'checkmate'|'draw'|'timeout'|'resigned', winner: 'White'|'Black'|'Draw' }

  // Reference to game loop / timers
  const timerRef = useRef(null);
  const saveStartedRef = useRef(false);
  const [savedGameId, setSavedGameId] = useState(null);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (auth.status === "anonymous") router.push("/login");
  }, [auth.status, router]);

  // Timers logic
  useEffect(() => {
    if (!gameStarted || gameOver) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      if (turn === "w") {
        setWhiteTime((prev) => {
          if (prev <= 1) {
            setGameOver({ reason: "timeout", winner: "Black" });
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      } else {
        setBlackTime((prev) => {
          if (prev <= 1) {
            setGameOver({ reason: "timeout", winner: "White" });
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [turn, gameStarted, gameOver]);

  useEffect(() => {
    if (!gameOver || !history.length || saveStartedRef.current) return;
    saveStartedRef.current = true;
    const clientGameId = crypto.randomUUID();
    postJson("/api/games", {
      clientGameId, mode, difficulty, timeControl: timeParam, userColor, result: gameOver,
      moves: history.map(move => ({ from: move.from, to: move.to, promotion: move.promotion || "q", san: move.san })),
    }).then(response => setSavedGameId(response.game._id)).catch(error => setSaveError(error.message));
  }, [difficulty, gameOver, history, mode, timeParam, userColor]);

  // Format seconds to MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // Check Game State status helper
  const updateGameState = useCallback((newGameInstance) => {
    setBoard(newGameInstance.board());
    setTurn(newGameInstance.turn());
    setHistory(newGameInstance.history({ verbose: true }));

    if (newGameInstance.isGameOver()) {
      if (newGameInstance.isCheckmate()) {
        const winner = newGameInstance.turn() === "w" ? "Black" : "White";
        setGameOver({ reason: "checkmate", winner });
      } else if (newGameInstance.isDraw()) {
        setGameOver({ reason: "draw", winner: "Draw" });
      }
    }
  }, [setBoard, setGameOver, setHistory, setTurn]);

  // AI Turn triggering
  useEffect(() => {
    if (mode === "ai" && turn !== userColor && !gameOver) {
      let cancelled = false;
      const aiDelay = setTimeout(async () => {
        try {
          const selectedMove = await chooseStockfishMove(game.fen(), difficulty);
          if (cancelled || !selectedMove) return;

        const nextTurn = game.turn() === "w" ? "b" : "w";
          game.move({ from: selectedMove.from, to: selectedMove.to, promotion: selectedMove.promotion || "q" });
        setLastMove({ from: selectedMove.from, to: selectedMove.to });

        if (nextTurn === "w") {
          setBlackTime((previous) => previous + incrementSeconds);
        } else {
          setWhiteTime((previous) => previous + incrementSeconds);
        }

          updateGameState(game);
        } catch {
          if (!cancelled) setGameOver({ reason: "engine error", winner: "Draw" });
        }
      }, AI_THINKING_DELAY_MS);
      return () => { cancelled = true; clearTimeout(aiDelay); };
    }
  }, [difficulty, game, gameOver, incrementSeconds, mode, turn, updateGameState, userColor]);

  // Square Click handler (for player movement)
  const handleSquareClick = (squareRepresentation) => {
    if (gameOver) return;
    
    // Check if it's the player's turn (in AI mode, restrict playing opponent pieces)
    if (mode === "ai" && turn !== userColor) return;

    const piece = game.get(squareRepresentation);

    // If selecting own piece, show targets
    if (piece && piece.color === turn) {
      setSelectedSquare(squareRepresentation);
      const moves = game.moves({ square: squareRepresentation, verbose: true });
      setPossibleMoves(moves.map(m => m.to));
      return;
    }

    // Try making a move if a target square is clicked
    if (selectedSquare && possibleMoves.includes(squareRepresentation)) {
      if (!gameStarted) setGameStarted(true);

      const nextTurn = game.turn() === "w" ? "b" : "w";
      const fromSquare = selectedSquare;

      game.move({
        from: fromSquare,
        to: squareRepresentation,
        promotion: "q", // default auto promotion to queen
      });

      setLastMove({ from: fromSquare, to: squareRepresentation });
      setSelectedSquare(null);
      setPossibleMoves([]);

      // Apply increment
      if (nextTurn === "w") {
        setBlackTime(prev => prev + incrementSeconds);
      } else {
        setWhiteTime(prev => prev + incrementSeconds);
      }

      updateGameState(game);
      return;
    }

    // Clear selection
    setSelectedSquare(null);
    setPossibleMoves([]);
  };

  // Undo Last Move
  const handleUndo = () => {
    if (gameOver) return;
    
    // In AI mode, undo twice to revert computer's move too
    if (mode === "ai") {
      game.undo();
      game.undo();
    } else {
      game.undo();
    }
    
    setSelectedSquare(null);
    setPossibleMoves([]);
    setLastMove(null);
    updateGameState(game);
  };

  // Resign Handler
  const handleResign = () => {
    if (gameOver) return;
    const winner = userColor === "w" ? "Black" : "White";
    setGameOver({ reason: "resigned", winner });
  };

  // Rematch / Reset Game
  const handleReset = () => {
    const freshGame = new Chess();
    setGame(freshGame);
    setBoard(freshGame.board());
    setHistory([]);
    setTurn("w");
    setSelectedSquare(null);
    setPossibleMoves([]);
    setLastMove(null);
    setWhiteTime(initialSeconds);
    setBlackTime(initialSeconds);
    setGameStarted(mode === "ai");
    setGameOver(null);
    saveStartedRef.current = false;
    setSavedGameId(null);
    setSaveError("");
  };

  const openReview = () => {
    const reviewMoves = game.history({ verbose: true }).map(move => ({ from: move.from, to: move.to, promotion: move.promotion || "q", san: move.san }));
    sessionStorage.setItem("chess:last-game-review", JSON.stringify({ gameId: savedGameId, moves: reviewMoves, result: gameOver, mode, difficulty, timeControl: timeParam, playedAt: new Date().toISOString() }));
    router.push(savedGameId ? `/review?gameId=${savedGameId}` : "/review");
  };

  // Organize board files & ranks for render
  const columns = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const rows = [8, 7, 6, 5, 4, 3, 2, 1];

  // Rotate board coordinates if flipped
  const renderedRows = isFlipped ? [...rows].reverse() : rows;
  const renderedCols = isFlipped ? [...columns].reverse() : columns;

  // Decide Timer locations (Opponent top, User bottom)
  const opponentTime = isFlipped ? whiteTime : blackTime;
  const playerTime = isFlipped ? blackTime : whiteTime;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080d17] px-3 py-3 font-sans text-slate-100 sm:px-4 lg:px-6 lg:py-6">
      {/* Responsive game shell */}
      <div className="relative flex min-h-[780px] w-full max-w-[420px] flex-col overflow-hidden rounded-[32px] border border-white/10 bg-[#111a28] shadow-2xl shadow-black/50 sm:rounded-[40px] lg:grid lg:h-[calc(100vh-3rem)] lg:min-h-[720px] lg:max-h-[920px] lg:max-w-6xl lg:grid-cols-[minmax(0,1fr)_360px] lg:grid-rows-[auto_auto_1fr_auto_auto] lg:rounded-[32px]">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-white/10 px-6 pb-4 pt-8 lg:col-span-2 lg:row-start-1 lg:border-b lg:px-8 lg:py-5">
          <Link href="/new-game" className="-ml-2 rounded-full p-2 transition hover:bg-white/10">
            <ChevronLeft size={24} className="text-slate-400" />
          </Link>

          {/* Opponent Info (Top) */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-xs font-bold leading-tight text-slate-200">
                {mode === "ai" ? `Stockfish AI (${difficulty})` : "Opponent"}
              </span>
              <div className={`rounded px-2.5 py-0.5 font-mono text-[10px] font-bold ${turn !== userColor ? "bg-amber-300 text-slate-950" : "bg-white/10 text-slate-400"}`}>
                {formatTime(opponentTime)}
              </div>
            </div>
            <div className="h-9 w-9 overflow-hidden rounded-full border border-white/10 bg-white/10">
              <Image 
                src={`https://api.dicebear.com/7.x/bottts/svg?seed=${mode === "ai" ? "Stockfish" : "Opponent"}`} 
                alt="Opponent" 
                width={36} 
                height={36} 
                unoptimized 
              />
            </div>
          </div>
        </div>

        {/* Board Header Stats */}
        <div className="flex items-center justify-between border-y border-white/10 bg-white/[.025] px-6 py-2 lg:col-start-1 lg:row-start-2 lg:border-r lg:border-t-0 lg:px-8 lg:py-3">
          <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
            {mode.toUpperCase()} MODE • {timeParam}
          </span>
          <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-2 py-0.5 text-[11px] font-bold text-amber-200">
            {turn === "w" ? "White's turn" : "Black's turn"}
          </span>
        </div>

        {/* Board Area */}
        <div className="flex-shrink-0 px-4 py-4 lg:col-start-1 lg:row-start-3 lg:row-span-3 lg:flex lg:min-h-0 lg:items-center lg:justify-center lg:border-r lg:p-6">
          <div className="relative flex aspect-square w-full flex-col overflow-hidden rounded-2xl border border-[#d4a359]/25 bg-[#17110e] shadow-2xl shadow-black/40 lg:h-full lg:max-h-[680px] lg:w-auto lg:max-w-full lg:flex-1">
            {renderedRows.map((rank, rowIndex) => (
              <div key={rank} className="flex flex-1">
                {renderedCols.map((file, colIndex) => {
                  const squareRepr = `${file}${rank}`;
                  const piece = board[isFlipped ? 7 - rowIndex : rowIndex][isFlipped ? 7 - colIndex : colIndex];
                  const isDark = (rowIndex + colIndex) % 2 === 1;

                  // Highlighting criteria
                  const isSelected = selectedSquare === squareRepr;
                  const isPossibleTarget = possibleMoves.includes(squareRepr);
                  const isLastMoveSquare = lastMove && (lastMove.from === squareRepr || lastMove.to === squareRepr);

                  return (
                    <div
                      key={squareRepr}
                      data-square={squareRepr}
                      onClick={() => handleSquareClick(squareRepr)}
                      className={`flex-1 relative flex items-center justify-center cursor-pointer transition-all duration-100 select-none ${
                        isDark ? "bg-[#5a4032]" : "bg-[#dac7ad]"
                      } ${isSelected ? "ring-4 ring-zinc-900/40 ring-inset" : ""}`}
                    >
                      {/* Last move highlight */}
                      {isLastMoveSquare && !isSelected && (
                        <div className="pointer-events-none absolute inset-0 bg-amber-300/45 mix-blend-multiply" />
                      )}

                      {/* Possible move indicator dot */}
                      {isPossibleTarget && (
                        <div className="pointer-events-none absolute z-20 h-3.5 w-3.5 rounded-full bg-[#17110e]/30" />
                      )}

                      {/* Coordinate Labels */}
                      {colIndex === 0 && (
                        <span className={`absolute top-1 left-1.5 text-[9px] font-bold ${isDark ? 'text-[#c2b099]' : 'text-[#d4c5b3]'}`}>
                          {rank}
                        </span>
                      )}
                      {rowIndex === 7 && (
                        <span className={`absolute bottom-0.5 right-1.5 text-[9px] font-bold ${isDark ? 'text-[#c2b099]' : 'text-[#d4c5b3]'}`}>
                          {file}
                        </span>
                      )}

                      {/* Piece Icon */}
                      {piece && (
                        <div className="w-[85%] h-[85%] relative z-10 drop-shadow-sm active:scale-95 transition-transform">
                          <Image
                            src={CHESS_PIECES[piece.color][piece.type]}
                            alt={`${piece.color}${piece.type}`}
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Move History Log */}
        <div className="flex-shrink-0 px-6 py-2 lg:col-start-2 lg:row-start-2 lg:row-span-2 lg:min-h-0 lg:px-5 lg:py-5">
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-2.5 text-xs font-semibold text-zinc-600 shadow-inner scrollbar-thin lg:h-full lg:content-start lg:items-start lg:overflow-y-auto lg:whitespace-normal lg:flex-wrap">
            <span className="text-[10px] uppercase font-bold text-zinc-400">Moves:</span>
            {history.map((h, i) => (
              <div key={i} className="flex gap-1 items-center bg-white px-2 py-1 rounded shadow-sm border border-zinc-100">
                <span className="text-zinc-400 text-[10px]">{h.color === "w" ? "W:" : "B:"}</span>
                <span className="font-bold text-zinc-800">{h.san}</span>
              </div>
            ))}
            {history.length === 0 && <span className="text-zinc-400 font-medium">No moves played yet</span>}
          </div>
        </div>

        <div className="flex-grow lg:hidden"></div>

        {/* Player Info (Bottom) */}
        <div className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50/20 px-6 py-3 lg:col-start-2 lg:row-start-4 lg:px-5 lg:py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-zinc-900 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-zinc-200">
              {userName[0]?.toUpperCase() || "P"}
            </div>
            <div>
              <p className="text-xs font-bold leading-tight">{userName} (You)</p>
              <p className="text-[10px] font-medium text-zinc-400">Playing as {sideParam}</p>
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-xl font-black text-sm tracking-wide shadow-sm border transition-colors ${turn === userColor ? "bg-zinc-900 border-zinc-900 text-white" : "bg-white border-zinc-200 text-zinc-700"}`}>
            {formatTime(playerTime)}
          </div>
        </div>

        {/* Game Actions Panel */}
        <div className="flex items-center justify-between border-t border-zinc-100 bg-white px-8 pb-8 pt-4 lg:col-start-2 lg:row-start-5 lg:px-7 lg:py-5">
          <button 
            onClick={handleUndo} 
            disabled={history.length === 0 || gameOver}
            className="flex flex-col items-center gap-1 text-zinc-400 hover:text-zinc-800 disabled:opacity-40 disabled:pointer-events-none transition"
          >
            <RotateCcw size={20} />
            <span className="text-[10px] font-bold">Undo</span>
          </button>

          <button 
            onClick={handleReset}
            className="w-14 h-14 bg-zinc-900 rounded-full flex items-center justify-center text-white shadow-lg shadow-zinc-900/20 hover:bg-zinc-800 transition transform hover:scale-105 active:scale-95"
            title="Reset Game"
          >
            <Play size={20} fill="currentColor" className="ml-0.5" />
          </button>

          <button 
            onClick={handleResign} 
            disabled={gameOver}
            className="flex flex-col items-center gap-1 text-zinc-400 hover:text-zinc-800 disabled:opacity-40 disabled:pointer-events-none transition"
          >
            <Flag size={20} />
            <span className="text-[10px] font-bold">Resign</span>
          </button>
        </div>

        {/* Game Over Modal Popup overlay */}
        {gameOver && (
          <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 flex items-center justify-center px-6">
            <div className="bg-white rounded-3xl p-6 w-full max-w-[320px] flex flex-col items-center text-center shadow-2xl border border-zinc-100 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center mb-4">
                <AlertCircle size={28} className="text-white" />
              </div>
              <h3 className="text-xl font-black tracking-tight text-zinc-950">Game Over</h3>
              <p className="text-zinc-500 font-semibold text-xs mt-1 uppercase tracking-wider">
                {gameOver.reason}
              </p>
              
              <div className="my-5 py-3 px-6 bg-zinc-50 rounded-2xl w-full border border-zinc-100">
                <span className="text-[10px] font-bold text-zinc-400 block uppercase mb-1">Result</span>
                <span className="text-lg font-black text-zinc-900">
                  {gameOver.winner === "Draw" ? "Draw Game 🤝" : `${gameOver.winner} Won! 🏆`}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 w-full">
                {saveError && <p className="col-span-2 rounded-lg bg-red-50 p-2 text-[10px] font-bold text-red-700">Game history save failed: {saveError}</p>}
                <button
                  onClick={openReview}
                  disabled={history.length === 0 || (!savedGameId && !saveError)}
                  className="col-span-2 flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black py-3.5 rounded-xl text-xs transition disabled:opacity-40"
                >
                  <BarChart3 size={17} /> {!savedGameId && !saveError ? "Saving game…" : "Review Game"}
                </button>
                <Link 
                  href="/new-game" 
                  className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold py-3.5 rounded-xl text-xs transition"
                >
                  New Lobby
                </Link>
                <button 
                  onClick={handleReset} 
                  className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-3.5 rounded-xl text-xs transition"
                >
                  Rematch
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function ChessGame() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-bold text-zinc-500">Setting up lobby...</span>
        </div>
      </div>
    }>
      <GameContent />
    </Suspense>
  );
}
