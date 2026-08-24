export function chooseAIMove(moves, difficulty) {
  if (moves.length === 0) return null;

  if (difficulty === "Easy") {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  if (difficulty === "Medium") {
    const captures = moves.filter((move) => move.captured);
    if (captures.length > 0 && Math.random() > 0.3) {
      return captures[Math.floor(Math.random() * captures.length)];
    }
    return moves[Math.floor(Math.random() * moves.length)];
  }

  const checks = moves.filter((move) => move.san.includes("+"));
  if (checks.length > 0) {
    return checks[Math.floor(Math.random() * checks.length)];
  }

  const captures = moves.filter((move) => move.captured);
  if (captures.length > 0) {
    return captures[Math.floor(Math.random() * captures.length)];
  }

  const centralSquares = ["d4", "d5", "e4", "e5", "c4", "c5", "f3", "f6"];
  const centralMoves = moves.filter((move) => centralSquares.includes(move.to));
  if (centralMoves.length > 0) {
    return centralMoves[Math.floor(Math.random() * centralMoves.length)];
  }

  return moves[Math.floor(Math.random() * moves.length)];
}
