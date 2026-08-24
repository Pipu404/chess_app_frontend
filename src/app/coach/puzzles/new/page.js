"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Chess } from "chess.js";
import { RotateCcw, Save, Undo2 } from "lucide-react";
import CoachSection from "@/components/CoachSection";
import { CHESS_PIECES } from "@/lib/chessPieces";
import { postJson } from "@/lib/api";

const START_FEN = new Chess().fen();
const FILES = ["a","b","c","d","e","f","g","h"];
const RANKS = [8,7,6,5,4,3,2,1];
const TAGS = ["Fork","Pin","Skewer","Mate","Endgame","Discovery","Deflection"];

export default function NewCoachPuzzlePage() {
  const router = useRouter();
  const [form, setForm] = useState({ title:"", description:"", fen:START_FEN, hint:"", difficulty:"Medium", status:"draft", tags:[] });
  const [game, setGame] = useState(() => new Chess(START_FEN));
  const [selected, setSelected] = useState(null);
  const [targets, setTargets] = useState([]);
  const [moves, setMoves] = useState([]);
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  const applyFen = () => {
    try { const next = new Chess(form.fen); setGame(next); setMoves([]); setSelected(null); setTargets([]); setMessage({type:"success",text:"Valid FEN loaded."}); }
    catch { setMessage({type:"error",text:"Invalid FEN position."}); }
  };

  const clickSquare = (square) => {
    const piece = game.get(square);
    if (piece?.color === game.turn()) { setSelected(square); setTargets(game.moves({square,verbose:true}).map(move=>move.to)); return; }
    if (!selected || !targets.includes(square)) { setSelected(null); setTargets([]); return; }
    const next = new Chess(game.fen());
    const move = next.move({from:selected,to:square,promotion:"q"});
    setGame(next); setMoves(previous=>[...previous,{from:move.from,to:move.to,promotion:move.promotion||"q",san:move.san}]); setSelected(null); setTargets([]); setMessage(null);
  };

  const undoMove = () => {
    if (!moves.length) return;
    const remaining = moves.slice(0,-1); const next = new Chess(form.fen);
    remaining.forEach(move=>next.move(move)); setMoves(remaining); setGame(next); setSelected(null); setTargets([]);
  };

  const toggleTag = (tag) => setForm(current=>({...current,tags:current.tags.includes(tag)?current.tags.filter(item=>item!==tag):[...current.tags,tag]}));

  const save = async (event) => {
    event.preventDefault(); setSaving(true); setMessage(null);
    try { await postJson("/api/coach/puzzles", {title:form.title,description:form.description,initialFen:form.fen,solutionMoves:moves,hints:form.hint?[form.hint]:[],tags:form.tags,difficulty:form.difficulty,status:form.status}); router.push("/coach/puzzles"); }
    catch (error) { setMessage({type:"error",text:error.message}); } finally { setSaving(false); }
  };

  return <CoachSection title="Create Custom Puzzle" description="Load a FEN position, record the correct move sequence on the board, and add teaching metadata.">
    <form onSubmit={save} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex aspect-square flex-col overflow-hidden rounded-2xl border border-zinc-200">
          {RANKS.map((rank,row)=><div key={rank} className="flex flex-1">{FILES.map((file,col)=>{const square=`${file}${rank}`;const piece=game.board()[row][col];return <button type="button" aria-label={`${square}${piece?` ${piece.color} ${piece.type}`:" empty"}`} onClick={()=>clickSquare(square)} key={square} className={`relative flex flex-1 items-center justify-center ${(row+col)%2?"bg-[#e2d5c3]":"bg-[#f5f1ea]"} ${selected===square?"ring-4 ring-inset ring-amber-500":""}`}>{targets.includes(square)&&<span className="absolute z-20 h-3 w-3 rounded-full bg-zinc-900/30"/>}{piece&&<span className="relative h-[85%] w-[85%]"><Image src={CHESS_PIECES[piece.color][piece.type]} alt={`${piece.color} ${piece.type}`} fill unoptimized className="object-contain"/></span>}</button>})}</div>)}
        </div>
        <div className="mt-4 flex items-center justify-between"><p className="text-sm font-bold">Solution: {moves.map(move=>move.san).join(" ")||"Not recorded"}</p><button type="button" onClick={undoMove} disabled={!moves.length} className="rounded-xl border p-2 disabled:opacity-30"><Undo2 size={18}/></button></div>
      </section>
      <section className="space-y-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <input required placeholder="Puzzle title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} className="w-full rounded-xl border p-3"/>
        <textarea placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} className="w-full rounded-xl border p-3"/>
        <div><label className="text-xs font-bold">Initial FEN</label><textarea value={form.fen} onChange={e=>setForm({...form,fen:e.target.value})} className="mt-1 w-full rounded-xl border p-3 text-xs"/><button type="button" onClick={applyFen} className="mt-2 flex items-center gap-2 text-xs font-bold"><RotateCcw size={15}/>Load position</button></div>
        <textarea placeholder="Hint" value={form.hint} onChange={e=>setForm({...form,hint:e.target.value})} className="w-full rounded-xl border p-3"/>
        <div className="flex flex-wrap gap-2">{TAGS.map(tag=><button type="button" key={tag} onClick={()=>toggleTag(tag)} className={`rounded-full px-3 py-1.5 text-xs font-bold ${form.tags.includes(tag)?"bg-zinc-900 text-white":"bg-zinc-100"}`}>{tag}</button>)}</div>
        <div className="grid grid-cols-2 gap-3"><select value={form.difficulty} onChange={e=>setForm({...form,difficulty:e.target.value})} className="rounded-xl border p-3"><option>Beginner</option><option>Easy</option><option>Medium</option><option>Hard</option><option>Expert</option></select><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} className="rounded-xl border p-3"><option value="draft">Draft</option><option value="published">Published</option></select></div>
        {message&&<p role="alert" className={`rounded-xl p-3 text-xs font-bold ${message.type==="error"?"bg-red-50 text-red-700":"bg-emerald-50 text-emerald-700"}`}>{message.text}</p>}
        <button disabled={saving||!moves.length} className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 p-3 font-bold text-white disabled:opacity-40"><Save size={18}/>{saving?"Saving...":"Save puzzle"}</button>
      </section>
    </form>
  </CoachSection>;
}
