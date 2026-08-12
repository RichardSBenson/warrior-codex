/**
 * Single source of truth for every visual value in the Warrior Codex.
 * Nothing in this app hardcodes a colour, size, font or spacing value.
 *
 * The palette is the one already shipping — a structural migration is not
 * the moment to change how the product looks.
 */

export const colours = {
  BLACK:     '#0a0a0a',
  PANEL:     '#141414',
  GOLD:      '#c9a227',
  DARK_GOLD: '#7a6218',
  LIGHT:     '#e8e3d8',
  GRAY:      '#7a7568',
  LINE:      '#2a2a2a',
};

export const fonts = {
  heading: "'Cinzel', serif",
  body:    "'Cormorant Garamond', serif",
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };
export const radii   = { sm: 4, md: 8, lg: 12 };

/** Standard browsing typography, in pixels. */
export const sizes = { caption: 12, small: 14, body: 16, lead: 18, h3: 20, h2: 26, h1: 34 };

/**
 * What training mode actually ships. Every value here exists so the screen is
 * readable at arm's length, in sunlight, mid-set, with a heart rate of 170.
 */
export const trainingSizes = { repCounter: 80, timer: 64, exerciseName: 24, setReps: 20 };

/**
 * The protocol's stated floors. Note that its figures for the exercise name (18)
 * and set/rep numbers (16) are identical to the browsing sizes, which would mean
 * training mode does not enlarge them at all. trainingSizes clears the floor
 * rather than sitting on it. A floor is not a target.
 */
export const trainingFloors = { repCounter: 80, timer: 64, exerciseName: 18, setReps: 16 };

export const a11y = { contrastBodyText: 4.5, contrastLargeText: 3, touchTargetPx: 44 };

export const layout = { maxWidthPx: 430, navHeightPx: 64, headerHeightPx: 56 };

export default { colours, fonts, spacing, radii, sizes, trainingSizes, trainingFloors, a11y, layout };
