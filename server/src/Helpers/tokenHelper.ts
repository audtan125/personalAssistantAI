import { getData } from '../dataStore';

/**
 * Function that checks if the token is invalid ie if it is not in our data store
 *
 * @param {string} token - string that allows users to stay in a session
 *
 * @returns {boolean} true - if token is invalid
 * @returns {boolean} false - if not
 */
export function isTokenInvalid(token: string): boolean {
  const data = getData();
  // if token is not found in data it will return -1
  const tokenObjIndex = data.tokens.findIndex(tokenObj => tokenObj.token === token);
  if (tokenObjIndex === -1) {
    return true;
  }
  return false;
}

export default { isTokenInvalid };
