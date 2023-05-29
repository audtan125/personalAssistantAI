import { getData } from '../dataStore';

/**
 * Function that checks whether userId corresponds to a user who
 * is a global owner.
 *
 * @param {number} uId - unique identifier for a user.
 *
 * @returns {boolean} true - if the user is a global owner
 * @returns {boolean} false - if the user is not a global owner
 */
export function isGlobalOwner(uId: number): boolean {
  const data = getData();
  const globalOwnerIndex = data.globalOwners.findIndex(userObj => userObj.uId === uId);
  if (globalOwnerIndex === -1) {
    return false;
  }
  return true;
}
