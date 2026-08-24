import { Chess } from "chess.js";
import { analyzeWithStockfish } from "@/lib/stockfishEngine";

const VALUES = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };

function terminalEvaluation(game) {
  if (game.isCheckmate()) return game.turn() === "w" ? -100000 : 100000;
  return 0;
}

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
  const movingPiece = before.get(move.from);
  if (!movingPiece || VALUES[movingPiece.type] < 300 || loss > 15) return false;
  const capturedValue = move.captured ? VALUES[move.captured] : 0;
  return after.moves({ verbose: true }).some(reply => reply.to === move.to && capturedValue + 100 < VALUES[movingPiece.type]);
}

function principalVariationSan(fen, variation, maximumMoves = 6) {
  const line = new Chess(fen); const sanMoves = [];
  for (const uci of variation.slice(0, maximumMoves)) {
    try {
      const move = line.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] || "q" });
      if (!move) break;
      sanMoves.push(move.san);
    } catch { break; }
  }
  return sanMoves;
}

function explanationFor(name, move, bestMove, evaluation) {
  const position = Math.abs(evaluation) >= 90_000 ? "a forced mate" : `${evaluation >= 0 ? "+" : ""}${(evaluation / 100).toFixed(2)}`;
  const alternative = move === bestMove ? "It matches the engine's first choice." : `The engine preferred ${bestMove}.`;
  const descriptions = {
    Brilliant: "A strong tactical idea that offers material while preserving the advantage.",
    Best: "The most accurate move in the position.",
    Excellent: "A highly accurate move with almost no evaluation loss.",
    Good: "A sound move that keeps the position under control.",
    Inaccuracy: "A small opportunity was missed, but the position remains playable.",
    Mistake: "This significantly worsened the position and gave the opponent a clear opportunity.",
    Blunder: "This caused a major evaluation swing or allowed a decisive tactic."
  };
  return `${descriptions[name]} ${alternative} The resulting evaluation is ${position}.`;
}

export async function analyzeGame(moves, onProgress) {
  const game = new Chess(); const results = [];
  for (let index = 0; index < moves.length; index += 1) {
    const played = moves[index]; const before = new Chess(game.fen()); const mover = before.turn();
    const best = await analyzeWithStockfish(before.fen(), 11);
    const bestCandidate = before.move({ from: best.bestMove.slice(0, 2), to: best.bestMove.slice(2, 4), promotion: best.bestMove[4] || "q" });
    before.undo();
    const applied = game.move({ from: played.from, to: played.to, promotion: played.promotion || "q" });
    const actualScore = game.isGameOver() ? terminalEvaluation(game) : (await analyzeWithStockfish(game.fen(), 11)).evaluation;
    const loss = Math.max(0, Math.round(mover === "w" ? best.evaluation - actualScore : actualScore - best.evaluation));
    const name = classification(loss, isSacrifice(before, applied, game, loss));
    const bestMove = bestCandidate?.san || applied.san;
    results.push({
      index, moveNumber: Math.floor(index / 2) + 1, color: mover, san: applied.san,
      from: applied.from, to: applied.to, fen: game.fen(), evaluation: actualScore,
      evaluationBefore: best.evaluation, loss, classification: name, bestMove,
      bestLine: principalVariationSan(before.fen(), best.principalVariation),
      explanation: explanationFor(name, applied.san, bestMove, actualScore)
    });
    onProgress?.(index + 1, moves.length);
  }
  return results;
}

export function reviewSummary(results) {
  const counts = results.reduce((summary, move) => ({ ...summary, [move.classification]: (summary[move.classification] || 0) + 1 }), {});
  const accuracyFor = color => {
    const moves = results.filter(move => move.color === color);
    if (!moves.length) return 0;
    const accuracies = moves.map(move => Math.max(0, Math.min(100, 103.1668 * Math.exp(-0.04354 * Math.min(1000, move.loss)) - 3.1669)));
    return Math.round(accuracies.reduce((sum, accuracy) => sum + accuracy, 0) / accuracies.length);
  };
  return { counts, whiteAccuracy: accuracyFor("w"), blackAccuracy: accuracyFor("b") };
}
