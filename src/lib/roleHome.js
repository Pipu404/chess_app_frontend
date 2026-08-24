export function roleHome(role) {
  if (role === "coach") return "/coach";
  if (role === "student") return "/student";
  return "/player";
}
