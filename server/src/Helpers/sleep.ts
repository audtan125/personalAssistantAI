
/**
 * Function that delays time in our typescript tests
 * Helps with testing for functions that perform actions
 * asynchronously
 *
 * @param {number} s - seconds to 'delay' time by
 */
export function sleep(s: number) {
  const startTime = Date.now();
  let currTime = startTime;
  while (currTime < startTime + s * 1000) {
    currTime = Date.now();
  }
}
