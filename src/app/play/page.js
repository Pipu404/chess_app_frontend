"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Settings, RotateCcw, Flag, Share, ChevronRight, Play, Pause, AlertCircle } from "lucide-react";
import { Chess } from "chess.js";

const PIECES = {
  w: {
    p: "https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg",
    n: "https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg",
    b: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg",
    r: "https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg",
    q: "https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg",
    k: "https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg",
  },
  b: {
    p: "https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg",
    n: "https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg",
    b: "https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg",
    r: "https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg",
    q: "https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg",
    k: "https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg",
  }
};

function GameContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL Parameters
  const mode = searchParams.get("mode") || "online"; // online, ai, local
  const timeParam = searchParams.get("time") || "10+0"; // e.g., 10+0, 3+2
  const sideParam = searchParams.get("side") || "White"; // White, Black
  const difficulty = searchParams.get("difficulty") || "Medium";

  // Chess instance state
  const [game, setGame] = useState(() => new Chess());
  const [board, setBoard] = useState(() => game.board());
  const [history, setHistory] = useState([]);
  const [turn, setTurn] = useState("w"); // 'w' or 'b'
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [lastMove, setLastMove] = useState(null); // { from, to }

  // User details
  const [userName, setUserName] = useState("Player");

  // Game configuration
  const userColor = sideParam.toLowerCase() === "black" ? "b" : "w";
  const isFlipped = userColor === "b";

  // Parsing time limit (e.g. "10+2" -> 10 mins, 2s inc)
  const parseTimeLimit = (str) => {
    if (str === "Custom" || !str.includes("+")) {
      return { initialSeconds: 600, incrementSeconds: 0 }; // Default 10 min
    }
    const [minStr, incStr] = str.split("+");
    const initialSeconds = parseInt(minStr, 10) * 60;
    const incrementSeconds = parseInt(incStr, 10);
    return { initialSeconds, incrementSeconds };
  };

  const { initialSeconds, incrementSeconds } = parseTimeLimit(timeParam);

  // Timers state (in seconds)
  const [whiteTime, setWhiteTime] = useState(initialSeconds);
  const [blackTime, setBlackTime] = useState(initialSeconds);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(null); // { reason: 'checkmate'|'draw'|'timeout'|'resigned', winner: 'White'|'Black'|'Draw' }

  // Reference to game loop / timers
  const timerRef = useRef(null);

  // Load username
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setUserName(u.name || "Player");
      } catch (e) {}
    }
  }, []);

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

  // AI Turn triggering
  useEffect(() => {
    if (mode === "ai" && turn !== userColor && !gameOver) {
      // Small thinking timeout for AI
      const aiDelay = setTimeout(() => {
        makeAIMove();
      }, 700);
      return () => clearTimeout(aiDelay);
    }
  }, [turn, mode, gameOver]);

  // Format seconds to MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // Check Game State status helper
  const updateGameState = (newGameInstance) => {
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
  };

  // AI Logic: selects moves
  const makeAIMove = () => {
    const moves = game.moves({ verbose: true });
    if (moves.length === 0) return;

    let selectedMove;
    if (difficulty === "Easy") {
      // Pick purely random
      selectedMove = moves[Math.floor(Math.random() * moves.length)];
    } else if (difficulty === "Medium") {
      // Prefer captures if any, otherwise random
      const captures = moves.filter(m => m.captured);
      if (captures.length > 0 && Math.random() > 0.3) {
        selectedMove = captures[Math.floor(Math.random() * captures.length)];
      } else {
        selectedMove = moves[Math.floor(Math.random() * moves.length)];
      }
    } else {
      // Hard/Expert Heuristic (Basic smart choice: captures/checks first, then center squares)
      const checks = moves.filter(m => m.san.includes("+"));
      const captures = moves.filter(m => m.captured);
      if (checks.length > 0) {
        selectedMove = checks[Math.floor(Math.random() * checks.length)];
      } else if (captures.length > 0) {
        selectedMove = captures[Math.floor(Math.random() * captures.length)];
      } else {
        // Prefer center moves
        const centerMoves = moves.filter(m => ["d4", "d5", "e4", "e5", "c4", "c5", "f3", "f6"].includes(m.to));
        if (centerMoves.length > 0) {
          selectedMove = centerMoves[Math.floor(Math.random() * centerMoves.length)];
        } else {
          selectedMove = moves[Math.floor(Math.random() * moves.length)];
        }
      }
    }

    if (selectedMove) {
      const nextTurn = game.turn() === "w" ? "b" : "w";
      game.move({ from: selectedMove.from, to: selectedMove.to, promotion: "q" });
      setLastMove({ from: selectedMove.from, to: selectedMove.to });

      // Apply increment
      if (nextTurn === "w") {
        setBlackTime(prev => prev + incrementSeconds);
      } else {
        setWhiteTime(prev => prev + incrementSeconds);
      }

      updateGameState(game);
    }
  };

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
    setGameStarted(false);
    setGameOver(null);
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
    <div className="flex flex-col min-h-screen bg-zinc-50 items-center justify-center font-sans text-zinc-900 px-4 py-4">
      {/* Mobile Container */}
      <div className="w-full max-w-[400px] bg-white h-[850px] shadow-2xl rounded-[40px] overflow-hidden flex flex-col relative border-[8px] border-zinc-100">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 pt-10 pb-4">
          <Link href="/new-game" className="p-2 -ml-2 rounded-full hover:bg-zinc-100 transition">
            <ChevronLeft size={24} className="text-zinc-600" />
          </Link>

          {/* Opponent Info (Top) */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-xs font-bold leading-tight">
                {mode === "ai" ? `Stockfish AI (${difficulty})` : "Opponent"}
              </span>
              <div className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${turn !== userColor ? "bg-amber-100 text-amber-800" : "bg-zinc-100 text-zinc-600"}`}>
                {formatTime(opponentTime)}
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-zinc-200 overflow-hidden border border-zinc-300">
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
        <div className="px-6 py-2 flex justify-between items-center bg-zinc-50/50 border-y border-zinc-100">
          <span className="text-[11px] font-bold tracking-wide uppercase text-zinc-400">
            {mode.toUpperCase()} MODE • {timeParam}
          </span>
          <span className="text-[11px] font-bold text-zinc-600 bg-white border px-2 py-0.5 rounded-full shadow-sm">
            {turn === "w" ? "White's turn" : "Black's turn"}
          </span>
        </div>

        {/* Board Area */}
        <div className="px-4 py-4 flex-shrink-0">
          <div className="w-full aspect-square bg-[#efebe4] rounded-2xl flex flex-col relative shadow-md border border-zinc-200/60 overflow-hidden">
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
                      onClick={() => handleSquareClick(squareRepr)}
                      className={`flex-1 relative flex items-center justify-center cursor-pointer transition-all duration-100 select-none ${
                        isDark ? "bg-[#e2d5c3]" : "bg-[#f5f1ea]"
                      } ${isSelected ? "ring-4 ring-zinc-900/40 ring-inset" : ""}`}
                    >
                      {/* Last move highlight */}
                      {isLastMoveSquare && !isSelected && (
                        <div className="absolute inset-0 bg-amber-200/40 mix-blend-multiply pointer-events-none" />
                      )}

                      {/* Possible move indicator dot */}
                      {isPossibleTarget && (
                        <div className="absolute w-3.5 h-3.5 bg-zinc-900/25 rounded-full z-20 pointer-events-none" />
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
                            src={PIECES[piece.color][piece.type]}
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
        <div className="px-6 py-2 flex-shrink-0">
          <div className="flex items-center text-xs font-semibold text-zinc-600 gap-2 bg-zinc-50 py-2.5 px-4 rounded-xl shadow-inner border border-zinc-100 overflow-x-auto whitespace-nowrap scrollbar-thin">
            <span className="text-[10px] uppercase font-bold text-zinc-400">Moves:</span>
            {history.slice(-4).map((h, i) => (
              <div key={i} className="flex gap-1 items-center bg-white px-2 py-1 rounded shadow-sm border border-zinc-100">
                <span className="text-zinc-400 text-[10px]">{h.color === "w" ? "W:" : "B:"}</span>
                <span className="font-bold text-zinc-800">{h.san}</span>
              </div>
            ))}
            {history.length === 0 && <span className="text-zinc-400 font-medium">No moves played yet</span>}
          </div>
        </div>

        <div className="flex-grow"></div>

        {/* Player Info (Bottom) */}
        <div className="flex justify-between items-center px-6 py-3 border-t border-zinc-100 bg-zinc-50/20">
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
        <div className="px-8 pb-10 pt-4 flex justify-between items-center bg-white border-t border-zinc-100">
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

              <div className="flex gap-2 w-full">
                <Link 
                  href="/new-game" 
                  className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold py-3.5 rounded-xl text-xs transition"
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
