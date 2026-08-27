/**
 * Numbers written as words, for prose that names a count.
 * Screens derive the count rather than stating it, so copy cannot drift out of
 * step with the data the way "four trials" did while The Room held five.
 */
const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven',
               'eight', 'nine', 'ten', 'eleven', 'twelve'];

export const countWord = (n) => WORDS[n] ?? String(n);

export default countWord;
