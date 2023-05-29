import { getData } from './../dataStore';
import { getUserId } from './getUserId';

/**
 * Checks if user of specified token belongs in specified dm.
 *
 *
 * @param {string} token - string that allows users to stay in a session
 * @param {number} dmId - the number which identifies the dm
 *
 * @returns {boolean} true - if user of token is in dm
 * @returns {boolean} false - if user of token is not in dm
 */
export function isUserInDm(token: string, dmId: number): boolean {
  const data = getData();

  // Get members array of dmId
  const dmObject = data.dmDetails.find(dm => dm.dmId === dmId);
  const dmMembers = dmObject.details.members;

  // Check if ID of user is in members array
  const userId = getUserId(token);
  const memberIndex = dmMembers.findIndex(member => member.uId === userId);

  // user not found
  if (memberIndex === -1) {
    return false;
  }

  return true;
}

/**
 * Checks if specified user is the creator of specified dm.
 *
 * @param {string} token - string that allows users to stay in a session
 * @param {number} dmId - the number which identifies the dm
 *
 * @returns {boolean} true - if user of token is the creator of dmId
 * @returns {boolean} false - if user of token is not the creator of dmId
 */
export function isUserDmCreator(token: string, dmId: number): boolean {
  const data = getData();
  const uId = getUserId(token);
  const dmObject = data.dmDetails.find(dm => dm.dmId === dmId);

  if (dmObject.creatorId === uId) {
    return true;
  }
  return false;
}

/**
 * Checks if dm of dmId exists
 *
 * @param {number} dmId - the number which identifies the dm
 *
 * @returns {boolean} true - if dm does not exist
 * @returns {boolean} false - if dm exists
 */
export function isDmIdInvalid(dmId: number): boolean {
  const data = getData();
  const dmIndex = data.dms.findIndex(dm => dm.dmId === dmId);

  // DM not found
  if (dmIndex === -1) {
    return true;
  }

  return false;
}
