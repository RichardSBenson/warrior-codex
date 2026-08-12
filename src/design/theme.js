import { colours, fonts, sizes, trainingSizes, spacing, radii, a11y, layout } from './tokens.js';

/**
 * Two modes, and only two.
 *   browsing — menus, library, profile, reading.
 *   training — mid-session. Oversized, high contrast, nothing decorative.
 * Screens do not invent their own sizes. They ask the theme.
 */

export const browsingMode = {
  name: 'browsing',
  colours, fonts, spacing, radii, layout,
  type: {
    h1:           { font: fonts.heading, size: sizes.h1,      weight: 700, colour: colours.LIGHT },
    h2:           { font: fonts.heading, size: sizes.h2,      weight: 600, colour: colours.LIGHT },
    h3:           { font: fonts.heading, size: sizes.h3,      weight: 600, colour: colours.LIGHT },
    body:         { font: fonts.body,    size: sizes.body,    weight: 400, colour: colours.LIGHT },
    caption:      { font: fonts.body,    size: sizes.caption, weight: 400, colour: colours.GRAY },
    repCounter:   { font: fonts.heading, size: sizes.h1,      weight: 700, colour: colours.GOLD },
    timer:        { font: fonts.heading, size: sizes.h2,      weight: 700, colour: colours.GOLD },
    exerciseName: { font: fonts.heading, size: sizes.lead,    weight: 600, colour: colours.LIGHT },
    setReps:      { font: fonts.body,    size: sizes.body,    weight: 600, colour: colours.LIGHT },
  },
};

export const trainingMode = {
  ...browsingMode,
  name: 'training',
  type: {
    ...browsingMode.type,
    repCounter:   { font: fonts.heading, size: trainingSizes.repCounter,   weight: 700, colour: colours.GOLD },
    timer:        { font: fonts.heading, size: trainingSizes.timer,        weight: 700, colour: colours.GOLD },
    exerciseName: { font: fonts.heading, size: trainingSizes.exerciseName, weight: 700, colour: colours.LIGHT },
    setReps:      { font: fonts.body,    size: trainingSizes.setReps,      weight: 600, colour: colours.LIGHT },
  },
};

export const themes = { browsing: browsingMode, training: trainingMode };
export const TRAINING_ENLARGED_KEYS = ['repCounter', 'timer', 'exerciseName', 'setReps'];
export const MIN_TOUCH_TARGET = a11y.touchTargetPx;

export default themes;
