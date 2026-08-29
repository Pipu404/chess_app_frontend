const pieces = [
  ["♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"],
  ["♟", "♟", "♟", "", "♟", "♟", "♟", "♟"],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "♟", "", "", "", ""],
  ["", "", "", "♙", "", "", "", ""],
  ["", "", "", "", "", "♘", "", ""],
  ["♙", "♙", "♙", "", "♙", "♙", "♙", "♙"],
  ["♖", "♘", "♗", "♕", "♔", "♗", "", "♖"],
];

export default function FuturisticChessBoard({ compact = false }) {
  return <div className={`relative ${compact ? "max-w-[370px]" : "max-w-[540px]"} mx-auto w-full`}>
    <div className="absolute -inset-12 rounded-full bg-amber-300/15 blur-3xl" />
    <div className="relative rounded-[1.8rem] border border-[#d8c0a2]/20 bg-[#15110f]/80 p-3 shadow-2xl shadow-black/60 backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between px-2 text-[10px] font-mono tracking-[0.2em] text-stone-500"><span>POSITION STUDY</span><span className="text-[#d4a359]">+0.4</span></div>
      <div className="relative overflow-hidden rounded-2xl border border-[#d8c0a2]/25 shadow-2xl" style={{ transform: "perspective(900px) rotateX(7deg) rotateZ(-2deg)" }}>
        <div className="absolute inset-y-0 left-0 z-20 w-1 bg-gradient-to-b from-[#fff6e8] via-[#d4a359] to-[#271d19]" />
        <div className="grid aspect-square grid-cols-8">
          {pieces.flatMap((row, rowIndex) => row.map((piece, colIndex) => <div key={`${rowIndex}-${colIndex}`} className={`relative grid aspect-square place-items-center ${(rowIndex + colIndex) % 2 ? "bg-[#563d31]" : "bg-[#d9c9b3]"} ${rowIndex === 4 && colIndex === 3 ? "bg-[#d4a359]" : ""}`}>
            {piece && <span className={`select-none font-serif text-[clamp(1.3rem,5vw,3.5rem)] leading-none drop-shadow-[0_3px_2px_rgba(0,0,0,.5)] ${rowIndex < 2 || rowIndex === 3 ? "text-[#15110f]" : "text-[#fff7e8]"}`}>{piece}</span>}
          </div>))}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between rounded-xl bg-[#fff7e8]/5 px-3 py-2 font-mono text-xs text-stone-300"><span>12. ...d5</span><span>03:42</span></div>
    </div>
  </div>;
}
