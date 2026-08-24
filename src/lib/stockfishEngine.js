let worker = null;
let readyPromise = null;
let requestQueue = Promise.resolve();

function createEngine() {
  if (readyPromise) return readyPromise;
  readyPromise = new Promise((resolve, reject) => {
    worker = new Worker("/stockfish/stockfish.wasm.js");
    const handleReady = event => {
      const line = String(event.data || "");
      if (line === "uciok") worker.postMessage("isready");
      if (line === "readyok") { worker.removeEventListener("message", handleReady); resolve(worker); }
    };
    worker.addEventListener("message", handleReady);
    worker.addEventListener("error", () => { worker = null; readyPromise = null; reject(new Error("Stockfish could not start in this browser")); }, { once: true });
    worker.postMessage("uci");
  });
  return readyPromise;
}

function parseScore(line, turn) {
  const centipawns = line.match(/\bscore cp (-?\d+)/); const mate = line.match(/\bscore mate (-?\d+)/); let score = null;
  if (centipawns) score = Number(centipawns[1]);
  if (mate) score = Math.sign(Number(mate[1])) * (100000 - Math.min(99, Math.abs(Number(mate[1]))) * 1000);
  if (score === null) return null;
  return turn === "w" ? score : -score;
}

function runAnalysis(fen, depth) {
  return createEngine().then(engine => new Promise((resolve, reject) => {
    const turn = fen.split(" ")[1]; let evaluation = 0; let principalVariation = [];
    const onMessage = event => {
      const line = String(event.data || ""); const parsed = parseScore(line, turn);
      if (parsed !== null && line.includes(" pv ")) { evaluation = parsed; principalVariation = line.split(" pv ")[1].trim().split(" "); }
      if (line.startsWith("bestmove")) { engine.removeEventListener("message", onMessage); const bestMove = line.split(" ")[1]; if (!bestMove || bestMove === "(none)") reject(new Error("Stockfish found no legal move")); else resolve({ bestMove, evaluation, principalVariation }); }
    };
    engine.addEventListener("message", onMessage); engine.postMessage(`position fen ${fen}`); engine.postMessage(`go depth ${depth}`);
  }));
}

export function analyzeWithStockfish(fen, depth = 10) {
  const task = requestQueue.then(() => runAnalysis(fen, depth));
  requestQueue = task.catch(() => undefined);
  return task;
}

export async function chooseStockfishMove(fen, difficulty) {
  const depths = { Easy: 5, Medium: 8, Hard: 11, Expert: 14 };
  const result = await analyzeWithStockfish(fen, depths[difficulty] || 8);
  return { from: result.bestMove.slice(0, 2), to: result.bestMove.slice(2, 4), promotion: result.bestMove[4] || "q" };
}
