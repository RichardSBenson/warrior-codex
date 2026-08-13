// ─────────────────────────────────────────────────────────────
// DATA · PROGRAM REPOSITORY
// Static JSON in, domain-shaped objects out. Bundled with the app, so the
// program works with no network and no account.
// ─────────────────────────────────────────────────────────────
import recruitToSoldier from '../sources/recruitToSoldier.json';
import exercises from '../sources/exercises.json';

const PROGRAMS = { Recruit: recruitToSoldier };

export const programFor = (rankName) => PROGRAMS[rankName] || null;

export const allPrograms = () => Object.values(PROGRAMS);

const BY_ID = Object.fromEntries(exercises.map((e) => [e.id, e]));

export const exerciseById = (id) => BY_ID[id] || null;
export const allExercises = () => exercises;

export default { programFor, allPrograms, exerciseById, allExercises };
