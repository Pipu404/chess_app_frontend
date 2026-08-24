import { Chess } from "chess.js";
import { analyzeWithStockfish } from "@/lib/stockfishEngine";

const VALUES = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };

function terminalEvaluation(game) { if (game.isCheckmate()) return game.turn() === "w" ? -100000 : 100000; return 0; }

function classification(loss, brilliant) {
  if (brilliant) return "Brilliant";
  if (loss <= 15) return "Best";
  if (loss <= 45) return "Excellent";
  if (loss <= 90) return "Good";
  if (loss <= 180) return "Inaccuracy";
  if (loss <= 350) return "Mistake";
  return "Blunder";
}

function isSacrifice(before, move, after, loss) {
  const movingPiece = before.get(move.from); if (!movingPiece || VALUES[movingPiece.type] < 300 || loss > 15) return false;
  const capturedValue = move.captured ? VALUES[move.captured] : 0;
  return after.moves({ verbose: true }).some(reply => reply.to === move.to && capturedValue + 100 < VALUES[movingPiece.type]);
}

export async function analyzeGame(moves, onProgress) {
  const game = new Chess(); const results = [];
  for (let index = 0; index < moves.length; index += 1) {
    const played = moves[index]; const before = new Chess(game.fen()); const mover = before.turn(); const best = await analyzeWithStockfish(before.fen(), 9);
    const bestCandidate = before.move({ from: best.bestMove.slice(0, 2), to: best.bestMove.slice(2, 4), promotion: best.bestMove[4] || "q" }); before.undo();
    const applied = game.move({ from: played.from, to: played.to, promotion: played.promotion || "q" });
    const actualScore = game.isGameOver() ? terminalEvaluation(game) : (await analyzeWithStockfish(game.fen(), 9)).evaluation;
    const loss = Math.max(0, Math.round(mover === "w" ? best.evaluation - actualScore : actualScore - best.evaluation));
    const brilliant = isSacrifice(before, applied, game, loss);
    results.push({ index, moveNumber: Math.floor(index / 2) + 1, color: mover, san: applied.san, from: applied.from, to: applied.to, fen: game.fen(), evaluation: actualScore, loss, classification: classification(loss, brilliant), bestMove: bestCandidate?.san || applied.san });
    onProgress?.(index + 1, moves.length);
  }
  return results;
}

export function reviewSummary(results) {
  const counts = results.reduce((summary, move) => ({ ...summary, [move.classification]: (summary[move.classification] || 0) + 1 }), {});
  const accuracyFor = color => { const moves = results.filter(move => move.color === color); if (!moves.length) return 0; const averageLoss = moves.reduce((sum, move) => sum + Math.min(500, move.loss), 0) / moves.length; return Math.max(0, Math.round(100 - averageLoss / 5)); };
  return { counts, whiteAccuracy: accuracyFor("w"), blackAccuracy: accuracyFor("b") };
}
