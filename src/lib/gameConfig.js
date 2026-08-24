export const GAME_MODES = ["online", "ai", "local"];
export const TIME_CONTROLS = [
  "1+0",
  "2+1",
  "3+0",
  "3+2",
  "5+0",
  "5+3",
  "10+0",
  "10+5",
  "15+10",
  "30+0",
  "30+20",
  "Custom",
];
export const DIFFICULTIES = ["Easy", "Medium", "Hard", "Expert"];
export const PLAYER_SIDES = ["White", "Black"];

const DEFAULTS = {
  mode: "online",
  time: "10+0",
  side: "White",
  difficulty: "Medium",
};

function allowedValue(value, values, fallback) {
  return values.includes(value) ? value : fallback;
}

export function normalizeGameMode(value) {
  return allowedValue(value, GAME_MODES, DEFAULTS.mode);
}

export function getGameConfig(searchParams) {
  const mode = normalizeGameMode(searchParams.get("mode"));
  // URLSearchParams decodes a literal `+` as a space. Accept both legacy
  // `time=1+0` URLs and correctly encoded `time=1%2B0` URLs.
  const requestedTime = searchParams.get("time")?.replaceAll(" ", "+");
  const time = allowedValue(requestedTime, TIME_CONTROLS, DEFAULTS.time);
  const side = allowedValue(searchParams.get("side"), PLAYER_SIDES, DEFAULTS.side);
  const difficulty = allowedValue(
    searchParams.get("difficulty"),
    DIFFICULTIES,
    DEFAULTS.difficulty,
  );

  const [minutes, increment] = time === "Custom" ? [10, 0] : time.split("+").map(Number);

  return {
    mode,
    time,
    side,
    difficulty,
    initialSeconds: minutes * 60,
    incrementSeconds: increment,
  };
}
