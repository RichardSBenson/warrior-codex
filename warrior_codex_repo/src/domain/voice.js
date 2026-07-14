// ─────────────────────────────────────────────────────────────
// DOMAIN · THE COMMANDER'S VOICE
// Spoken once per moment, like a coach at your shoulder.
// {rank} = the rank you hold. {next} = the rank above (the victory line aims one higher).
// Streak-nags are deliberately absent: the Codex commands, it never pleads.
// ─────────────────────────────────────────────────────────────
import { RANKS } from "./ranks.js";

export const VOICE = {
  launch: [
    "The sun rises. The arena waits. Rise and claim it.",
    "The weak still sleep. The {rank} is already standing.",
    "Today you build the wall. Let nothing breach it.",
    "Step into the dust. Your ancestors are watching you.",
    "Discipline is your armor, {rank}. Put it on right now.",
    "Silence the excuses. The campaign of today begins now.",
    "Awaken the iron within. No hesitation. No regrets today.",
    "The day demands a tribute of sweat. Pay it.",
    "Leave the comfort of the tent, {rank}. Battle awaits you.",
    "Your destiny is forged in the fire of discipline.",
  ],
  preworkout: [
    "Shields up. Swords drawn. Focus your mind entirely.",
    "Your only enemy today is your own past limitation.",
    "Crush this obstacle like a line of weak iron.",
    "Grip the iron. Feel the weight. Dominate it completely.",
    "No mercy for the weights. Strike hard and fast.",
    "Become the storm. Let nothing stand in your way.",
    "Channel the rage of ancient kings into this moment.",
    "Steel your nerves, {rank}. The heavy trial is right here.",
    "Take a deep breath. Exhale doubt. Step forward now.",
    "This is your battlefield. Take absolute control of it.",
  ],
  midworkout: [
    "The lungs burn. Good. That is weakness leaving.",
    "The muscles scream. Lock your jaw and push back.",
    "This is where the gap forms. Close it immediately.",
    "Do not yield an inch, {rank}. Hold the line steady.",
    "A true warrior quits only when the work is finished.",
    "Pain is temporary. Glory in the arena is eternal.",
    "Dig deep into the dirt. Find your second wind.",
    "Break through the mental wall. It is an illusion.",
    "Your spirit dictates your strength. Command your body now.",
    "Stand tall in the fire. You will not melt.",
  ],
  victory: [
    "The dust settles. The arena belongs to you today.",
    "The wall stood firm. You gave up no territory.",
    "Victory is earned in the silence of hard work.",
    "Wipe the sweat, {rank}. Look back at what you conquered.",
    "You are stronger than you were one hour ago.",
    "Sheathe your weapon. The day's tribute is fully paid.",
    "Honor to your effort. You fought like a {next}.",
    "Rest now. Repair your armor. Feast like a victor.",
    "You survived the trial. The gods favor your resolve.",
    "Another stone is laid in your unshakeable fortress wall.",
  ],
};
// pick a line and fill {rank} (current) and {next} (one rank up, capped at Legend)

export const pickVoice = (pool, rank = "warrior") => {
  const i = RANKS.indexOf(rank);
  const next = i >= 0 ? RANKS[Math.min(i + 1, RANKS.length - 1)] : "warrior";
  const lines = VOICE[pool] || [];
  const line = lines[Math.floor(Math.random() * lines.length)] || "";
  return line
    .replace(/\{rank\}/g, rank ? rank.toLowerCase() : "warrior")
    .replace(/\{next\}/g, next.toLowerCase());
};
