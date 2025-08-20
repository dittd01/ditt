
/**
 * Calculates the quadratic cost of a given number of votes.
 * The cost is the square of the number of votes.
 * @param votes - The number of votes.
 * @returns The quadratic cost.
 */
export function calculateQVCost(votes: number): number {
  return votes * votes;
}

/**
 * Calculates the maximum number of votes a user can cast
 * with a given number of voice credits.
 * @param credits - The number of available voice credits.
 * @returns The maximum number of votes.
 */
export function getMaxVotes(credits: number): number {
  if (credits < 0) return 0;
  return Math.floor(Math.sqrt(credits));
}
