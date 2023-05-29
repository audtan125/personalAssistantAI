import { getData } from '../dataStore';

/**
 * Function that retrieves user Id that matches token passed in
 *
 * @param {string} token - string that allows users to stay in a session
 *
 * @returns {number} uId - if token is valid
 * @returns {number} -1 - if token does not exist
 */
export function getUserId(token: string): number {
  const data = getData();
  // if token is not found in data it will return -1
  const tokenObjIndex = data.tokens.findIndex(tokenObj => tokenObj.token === token);
  if (tokenObjIndex === -1) {
    return -1;
  }
  return data.tokens[tokenObjIndex].uId;
}
