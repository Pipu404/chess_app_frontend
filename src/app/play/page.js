"use client";

import Image from "next/image";
import { ChevronLeft, Settings, RotateCcw, Flag, Share, Search, RefreshCw, ChevronRight } from "lucide-react";

const PIECES = {
  P: "https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg",
  N: "https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg",
  B: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg",
  R: "https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg",
  Q: "https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg",
  K: "https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg",
  p: "https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg",
  n: "https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg",
  b: "https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg",
  r: "https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg",
  q: "https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg",
  k: "https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg",
};

// 1. e4 e5 2. Nf3 Nc6 3. Bc4
const initialBoard = [
  ["r", null, "b", "q", "k", "b", "n", "r"], // 8
  ["p", "p", "p", "p", null, "p", "p", "p"], // 7
  [null, null, "n", null, null, null, null, null], // 6 (Nc6)
  [null, null, null, null, "p", null, null, null], // 5 (e5)
  [null, null, "B", null, "P", null, null, null], // 4 (Bc4, e4)
  [null, null, null, null, null, "N", null, null], // 3 (Nf3)
  ["P", "P", "P", "P", null, "P", "P", "P"], // 2
  ["R", "N", "B", "Q", "K", null, null, "R"], // 1
];

export default function ChessGame() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 items-center justify-center font-sans text-zinc-900">
      {/* Mobile App Container */}
      <div className="w-full max-w-[400px] bg-white h-[850px] shadow-2xl rounded-[40px] overflow-hidden flex flex-col relative border-[8px] border-zinc-100">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 pt-10 pb-4">
          <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-zinc-100 transition">
            <ChevronLeft size={24} className="text-zinc-600" />
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-10 h-10 bg-zinc-200 rounded-full overflow-hidden border-2 border-white shadow-sm">
                  <Image src="https://api.dicebear.com/7.x/avataaars/svg?seed=Pipu" alt="You" width={40} height={40} unoptimized />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <span className="text-[11px] font-semibold mt-1">You</span>
            </div>

            <div className="bg-zinc-100 px-4 py-1.5 rounded-full font-bold text-sm tracking-wide shadow-sm">
              09:41
            </div>

            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-10 h-10 bg-zinc-200 rounded-full overflow-hidden border-2 border-white shadow-sm opacity-80 filter grayscale">
                  <Image src="https://api.dicebear.com/7.x/avataaars/svg?seed=Opponent" alt="Opponent" width={40} height={40} unoptimized />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-zinc-300 border-2 border-white rounded-full"></div>
              </div>
              <span className="text-[11px] font-medium mt-1 text-zinc-500">Opponent</span>
            </div>
          </div>

          <button className="p-2 -mr-2 rounded-full hover:bg-zinc-100 transition">
            <Settings size={22} className="text-zinc-600" />
          </button>
        </div>

        {/* Board Area */}
        <div className="px-4 py-2 flex-shrink-0">
          <div className="w-full aspect-square bg-[#efebe4] rounded-sm flex flex-col relative shadow-sm border border-zinc-200/60 overflow-hidden">
            {initialBoard.map((row, rowIndex) => (
              <div key={rowIndex} className="flex flex-1">
                {row.map((piece, colIndex) => {
                  const isDark = (rowIndex + colIndex) % 2 === 1;
                  const file = String.fromCharCode(97 + colIndex);
                  const rank = 8 - rowIndex;
                  return (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={`flex-1 relative flex items-center justify-center ${
                        isDark ? "bg-[#e2d5c3]" : "bg-[#f5f1ea]"
                      }`}
                    >
                      {/* Highlight last move e2-e4 or something subtle if needed */}
                      {((rowIndex === 4 && colIndex === 4) || (rowIndex === 6 && colIndex === 4)) && (
                        <div className="absolute inset-0 bg-yellow-200 opacity-40 mix-blend-multiply"></div>
                      )}

                      {/* Coordinates */}
                      {colIndex === 0 && (
                        <span className={`absolute top-0.5 left-1 text-[10px] font-medium ${isDark ? 'text-[#c2b099]' : 'text-[#d4c5b3]'}`}>
                          {rank}
                        </span>
                      )}
                      {rowIndex === 7 && (
                        <span className={`absolute bottom-0.5 right-1 text-[10px] font-medium ${isDark ? 'text-[#c2b099]' : 'text-[#d4c5b3]'}`}>
                          {file}
                        </span>
                      )}

                      {/* Piece */}
                      {piece && (
                        <div className="w-[85%] h-[85%] relative z-10 drop-shadow-sm">
                          <Image src={PIECES[piece]} alt={piece} fill className="object-contain" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Move History */}
        <div className="px-6 py-4 flex-shrink-0">
          <div className="flex items-center text-sm font-medium text-zinc-700 space-x-3 bg-zinc-50 py-3 px-4 rounded-2xl shadow-inner border border-zinc-100">
            <div className="flex space-x-2 items-center">
              <span className="text-zinc-400 text-xs">1.</span>
              <span>e4</span>
              <span>e5</span>
            </div>
            <div className="flex space-x-2 items-center">
              <span className="text-zinc-400 text-xs">2.</span>
              <span>Nf3</span>
              <span>Nc6</span>
            </div>
            <div className="flex space-x-2 items-center">
              <span className="text-zinc-400 text-xs">3.</span>
              <span className="bg-white shadow-sm border border-zinc-200 px-2 py-0.5 rounded-md">Bc4</span>
            </div>
            <ChevronRight size={16} className="text-zinc-400 ml-auto" />
          </div>
        </div>

        <div className="flex-grow"></div>

        {/* Bottom Controls */}
        <div className="px-8 pb-10 pt-4 flex justify-between items-center bg-white border-t border-zinc-50">
          <button className="flex flex-col items-center gap-2 text-zinc-500 hover:text-zinc-800 transition">
            <RotateCcw size={22} />
            <span className="text-xs font-medium">Undo</span>
          </button>

          <button className="w-16 h-16 bg-[#d4c5b3] rounded-full flex items-center justify-center text-white shadow-lg shadow-[#d4c5b3]/40 hover:bg-[#c2b099] transition transform hover:scale-105 active:scale-95">
            <ChevronRight size={32} strokeWidth={2.5} />
          </button>

          <button className="flex flex-col items-center gap-2 text-zinc-500 hover:text-zinc-800 transition">
            <Flag size={22} />
            <span className="text-xs font-medium">Resign</span>
          </button>
        </div>

      </div>
    </div>
  );
}
