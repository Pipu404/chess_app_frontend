export const PUZZLES = [
  {
    id: "bishop-queen-mate",
    title: "Protected Queen Mate",
    instruction: "White to move and checkmate in one.",
    hint: "The bishop on c3 protects a queen capture near the king.",
    fen: "6k1/6pp/7Q/8/8/2B5/8/6K1 w - - 0 1",
    solution: { from: "h6", to: "g7" },
  },
  {
    id: "back-rank-mate",
    title: "Back-Rank Finish",
    instruction: "White to move and checkmate in one.",
    hint: "Use the open e-file to reach the eighth rank.",
    fen: "6k1/5ppp/8/8/8/8/8/4R1K1 w - - 0 1",
    solution: { from: "e1", to: "e8" },
  },
  {
    id: "fools-mate",
    title: "Open King Punishment",
    instruction: "Black to move and checkmate in one.",
    hint: "The queen can attack the exposed king along a diagonal.",
    fen: "rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR b KQkq - 0 2",
    solution: { from: "d8", to: "h4" },
  },
];
