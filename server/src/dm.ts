import { getData, setData, dmDetails, user, dm, messageReturn, message } from './dataStore';
import { isTokenInvalid } from './Helpers/tokenHelper';
import { getUserId } from './Helpers/getUserId';
import { doIsUserReacted, generateEnd, getMessagesSubarray } from './Helpers/messagesHelper';
import { isUserInDm, isUserDmCreator, isDmIdInvalid } from './Helpers/dmHelper';
import HttpError from 'http-errors';
import { userProfileV1 } from './users';
import { notification } from './dataStore';
import { storeNotif } from './Helpers/notificationsHelper';
import { checkToAddIdToUsersWhoHaveJoinedAChannelOrDm, updateWorkspaceStatsMessagesExists, updateWorkSpaceStatsDmsExists, updateUserStatsNumDmsJoined, workspaceStatsCheckToRemoveNumUsersInChOrDm } from './it4Files/statsHelper';

/**
 * Creates a dm with an auto-generated name
 *
 * @param {string} token - string that allows users to stay in a session
 * @param {array} uIds - uIds contains the user(s) that this DM is directed to,
 * and will not include the creator.
 * An empty uIds list indicates the creator is the only member of the DM.
 *
 * @returns {dmId: number} - on success
 * Throws http error - on any of the following conditions:
 *      - any uId in uIds does not refer to a valid user
 *      - there are duplicate 'uId's in uIds
 *      - token is invalid
 */
export function dmCreateV1(token: string, uIds: number[]
): {dmId: number} {
  if (isTokenInvalid(token) === true) {
    throw HttpError(403, 'token is not valid');
  }
  // Copies array by value not by reference (which is the default)
  const uIdsWithoutCreator = uIds.slice();
  // anyUIdDoesNotExist helper function adds creator uId to uIds array
  if (anyUIdDoesNotExist(token, uIds) === true) {
    throw HttpError(400, 'uId is not valid');
  }
  if (hasDuplicateUIds(uIds) === true) {
    // this is a multi-line string (using back-ticks) for style purposes
    // otherwise would be a really long line
    throw HttpError(400, `error: duplicate Id entered in \n 
    Note: the creator should not pass in their own uId`);
  }

  const dmId = generateDmId();
  const { handleStringsArray, members } = createHandleStrAndMembersArray(uIds);
  const dmName: string = generateDmName(handleStringsArray);
  const creatorId = getUserId(token);
  updateDmData(dmId, creatorId, dmName, members);

  // If there are other members in the DM, notify them
  if (uIdsWithoutCreator.length !== 0) {
    for (const addedUId of uIdsWithoutCreator) {
      const uId = getUserId(token);
      const addNotif = generateDmAddNotif(token, uId, dmId);
      storeNotif(addedUId, addNotif);
    }
  }

  // Update workspaceStats
  const data = getData();
  data.workspaceStats.dmsExist.push(
    { numDmsExist: data.dms.length, timeStamp: Date.now() / 1000 }
  );
  // uIds includes the creator uId now
  for (const memberId of uIds) {
    checkToAddIdToUsersWhoHaveJoinedAChannelOrDm(memberId);
    updateUserStatsNumDmsJoined(memberId, true);
  }

  return { dmId: dmId };
}

/**
 *
 * Given a DM with ID that the authorised user is a member of,
 * provide basic details about the DM.
 *
 * @param {string} token - string that allows users to stay in a session
 * @param {number} dmId - unique identifier for a dm
 *
 * @returns {name: string, members: user[]} - on success
 * Throws http error on any of the following conditions:
 *      - dmId does not refer to a valid DM
 *      - dmId is valid and the authorised user is not a member of the DM
 *      - token is invalid
 */
export function dmDetailsV1(token: string, dmId: number): dmDetails {
  if (isTokenInvalid(token) === true) {
    throw HttpError(403, 'token is not valid');
  }

  if (isDmIdInvalid(dmId) === true) {
    throw HttpError(400, 'dmId is not valid');
  }

  if (isUserInDm(token, dmId) === false) {
    throw HttpError(403, 'User is not a member of the dm');
  }

  return getDmDetails(dmId);
}

/**
 *
 * Returns the list of DMs that the user is a member of.
 *
 * @param {string} token - string that allows users to stay in a session
 *
 * @returns {dms: dm[]} - on success
 * Throws http error when token is invalid
 */
export function dmListV1(token: string): {dms: dm[]} {
  if (isTokenInvalid(token) === true) {
    throw HttpError(403, 'token is not valid');
  }

  const data = getData();
  const dmList = [];
  const userId = getUserId(token);

  for (const dm of data.dmDetails) {
    const userIndex = dm.details.members.findIndex(member => member.uId === userId);

    // Current dm contains user
    if (userIndex !== -1) {
      dmList.push({ dmId: dm.dmId, name: dm.details.name });
    }
  }

  return { dms: dmList };
}

/**
 *
 * Remove an existing DM, so all members are no longer in the DM.
 * This can only be done by the original creator of the DM.
 *
 * @param {string} token - string that allows users to stay in a session.
 * @param {number} dmId - unique identifier for a dm.
 *
 * @returns {dms: dm[]} - on success
 * Throw HTTP Error - on any of the following conditions:
 *      - dmId does not refer to a valid DM
 *      - dmId is valid and the authorised user is not the original DM creator
 *      - dmId is valid and the authorised user is no longer in the DM
 *      - token is invalid
 */
export function dmRemoveV1(token: string, dmId: number):
  Record<string, never> {
  if (isTokenInvalid(token)) {
    throw HttpError(403, 'token is not valid');
  }

  if (isDmIdInvalid(dmId)) {
    throw HttpError(400, 'dmId is not valid');
  }

  if (!isUserInDm(token, dmId)) {
    throw HttpError(403, 'authorised user is not in DM');
  }

  if (!isUserDmCreator(token, dmId)) {
    throw HttpError(403, 'user is not the creator of the DM');
  }

  removeDm(dmId);
  return {};
}
/**
 *
 * Given a DM ID, the user is removed as a member of this DM.
 * The creator is allowed to leave and the DM will still exist if this happens.
 * This does not update the name of the DM.
 *
 * @param {string} token - string that allows users to stay in a session
 * @param {number} dmId - unique identifier for a dm
 *
 * @returns {} - on success
 * Throws http error on any of the following conditions:
 *      - dmId does not refer to a valid DM
 *      - dmId is valid and the authorised user is not a member of the DM
 *      - token is invalid
 */
export function dmLeaveV1(token: string, dmId: number): Record<string, never> {
  if (isTokenInvalid(token) === true) {
    throw HttpError(403, 'token is not valid');
  }

  if (isDmIdInvalid(dmId)) {
    throw HttpError(400, 'dmId is not valid');
  }

  if (!isUserInDm(token, dmId)) {
    throw HttpError(403, 'User is not in dm');
  }

  removeUserFromDm(token, dmId);
  return {};
}

/**
 * Function that displays messages in selected dm with pagination
 *
 * @param {string} token - unique identifier for user's session
 * @param {number} dmId - unqiue identifier for dms
 * @param {number} start - starting message index for messages displayed
 *
 * @returns {object} { messages, start, end } if successful
 * Throws http error in all the following cases:
 * - dmId does not refer to a valid DM
 * - start is greater than the total number of messages in the channel
 * - dmId is valid and the authorised user is not a member of the DM
 * - token is invalid
 */
export function dmMessagesV1(token: string, dmId: number, start: number):
{ messages: messageReturn[], start: number, end: number } {
  if (isTokenInvalid(token) === true) {
    throw HttpError(403, 'token is invalid');
  }
  if (isDmIdInvalid(dmId) === true) {
    throw HttpError(400, 'DM Id is invalid');
  }
  if (isUserInDm(token, dmId) === false) {
    throw HttpError(403, 'User is not part of this dm');
  }

  const data = getData();
  // find the corresponding dm
  const dmIndex = data.dmMessages.findIndex(dm => dm.dmId === dmId);

  // get the list of messageIds
  // start from the index specified by the 'start' number passed in
  const dmMsgIdArray: number[] = data.dmMessages[dmIndex].allMessageIds;
  // The index 'start' can not equal the length of the array
  if (start > dmMsgIdArray.length || start < 0) {
    throw HttpError(400, 'start is invalid');
  }
  if (start === dmMsgIdArray.length) {
    return {
      messages: [],
      start: start,
      end: -1,
    };
  }

  const messages: message[] = getMessagesSubarray(dmMsgIdArray, start);

  // For reaction in each message, finds whether uId has reacted with isThisUserReacted.
  const messagesReturnArray: messageReturn[] = [];
  const uId = getUserId(token);
  for (const message of messages) {
    const messageReturnObj: messageReturn = {
      messageId: message.messageId,
      uId: message.uId,
      message: message.message,
      timeSent: message.timeSent,
      reacts: doIsUserReacted(uId, message.reacts),
      isPinned: message.isPinned
    };

    messagesReturnArray.push(messageReturnObj);
  }
  return {
    messages: messagesReturnArray,
    start: start,
    end: generateEnd(start, dmMsgIdArray)
  };
}

// ///////////////////// dmCreate Helper functions ///////////////////////// //
/**
 * Takes in list of uIds and checks that each of them are valid
 * ie are found in our data store
 *
 * @param {string} token - string that allows users to stay in a session
 * @param {number[]} uIds - array of uIds passed in
 *
 * @returns true - if any uId does not exist
 * @returns false - if all uIds exist
 */
function anyUIdDoesNotExist(token: string, uIds: number[]): boolean {
  const data = getData();

  // find the uId of the dm's creator
  const tokenObjIndex = data.tokens.findIndex(tokenObj => tokenObj.token === token);
  const creatorUId = data.tokens[tokenObjIndex].uId;
  // insert the creator's uId into the uIds array because if the creator's
  // uId is already passed in we want our function to return error
  uIds.push(creatorUId);

  // for each uId passed in - including the creator
  for (const uId of uIds) {
    // If uId does not exist in our data
    const userIndex = data.users.findIndex(user => user.uId === uId);
    if (userIndex === -1) {
      return true;
    }
  }
  return false;
}

/**
 * checks for duplicate uIds passed in to dmCreateV1
 *
 * @param { array } uIds - array of uIds passed in including the creator of dm
 *
 * @returns {boolean} true - if there are duplicate uIds
 * @returns {boolean} false - if there are not
 */
function hasDuplicateUIds(uIds: number[]): boolean {
  // Convert array into a set (a collection of unique values)
  // if array set length is not the same then there were duplicates
  if ((new Set(uIds)).size !== uIds.length) {
    return true;
  }
  return false;
}

/**
 * Function generates new unique dm Id
 *
 * @returns { number } dmId - the identifying number of a dm
 */
function generateDmId(): number {
  const data = getData();
  let dmId = 1;
  if (data.dms.length !== 0) {
    // the largest id value will the the id of the last dm added to the array
    // we will add one to this id to generate a new untaken id
    const idOfLastDm = data.dms[data.dms.length - 1].dmId;
    dmId = idOfLastDm + 1;
  }
  return dmId;
}

/**
 * Function that generates array with all the users' handlestrings and sorts it,
 * and also generates an array with all the members in the dm
 *
 * @param { array } uIds - array of uIds passed in including the creator of dm
 *
 * @returns { object } - in all cases
 */
function createHandleStrAndMembersArray(uIds: number[]
): { handleStringsArray: string[], members: user[] } {
  const data = getData();
  // get the handlestring of each user and append it to handleStringsArray
  // and push each user into members array
  const handleStringsArray: string[] = [];
  const members: user[] = [];
  for (const uId of uIds) {
    for (const user of data.users) {
      if (user.uId === uId) {
        handleStringsArray.push(user.handleStr);
        members.push(user);
      }
    }
  }
  // sort handlestrings array - sort method sorts alphabetically by default
  handleStringsArray.sort();
  return { handleStringsArray: handleStringsArray, members: members };
}

/**
 * Function that generates the name of the dm based on handlestrings
 *
 * @param handleStringsArray array with all the users' handlestrings in sorted
 * order indluding the creator of the dm
 * @returns {string} dmName - in all cases
 */
function generateDmName(handleStringsArray: string[]): string {
  let dmName = '';
  for (const handlestring of handleStringsArray) {
    if (dmName === '') {
      dmName = handlestring;
    } else {
      dmName = dmName + ', ' + handlestring;
    }
  }
  return dmName;
}

/**
 * Updates our data store list of dms and dmDetails to include this
 * newly generated dm
 *
 * @param {number} creatorId - the number which identifies the creator of DM
 * @param {number} dmId - the number which identifies the dm
 * @param {string} dmName - the generated name of the dm that is sorted combination of
 * members' handlestrings
 * @param {user[]} members - array of users and their details
 *
 * @returns nothing
 */
function updateDmData(dmId: number, creatorId: number, dmName: string, members: user[]) {
  const data = getData();
  data.dms.push(
    {
      dmId: dmId,
      name: dmName
    }
  );
  data.dmDetails.push(
    {
      dmId: dmId,
      creatorId: creatorId,
      details: {
        name: dmName,
        members: members
      }
    }
  );
  data.dmMessages.push(
    {
      dmId: dmId,
      allMessageIds: [],
    }
  );
}

/**
 * Generates notification when user is invited to dm
 *
 * @param {string} token - token of the user that is creating the DM
 * @param {number} uId - uId of the user that is creating the DM
 * @param {number} dmId - unique identifier for the dm
 *
 * @returns {object} addNotif - notification that user has been added to dm
 */
function generateDmAddNotif(token: string, uId: number, dmId: number): notification {
  const handleStr: string = userProfileV1(token, uId).user.handleStr;
  const dmName = dmDetailsV1(token, dmId).name;
  const notifMsg = `${handleStr} added you to ${dmName}`;

  const addNotif: notification = {
    channelId: -1,
    dmId: dmId,
    notificationMessage: notifMsg
  };
  return addNotif;
}

//  ///////////////////////// dmRemoveV1 Helper functions /////////////////////////////  //

/**
 * Removes all data associated with a specified DM
 * @param {number} dmId - a unique indentifier of a particular dm
 * @returns {object} - {} in all cases
 */

export function removeDm(dmId: number): Record<string, never> {
  const data = getData();
  const dmsIndex = data.dms.findIndex(dm => dm.dmId === dmId);
  const dmDetailsIndex = data.dmDetails.findIndex(dmDetail => dmDetail.dmId === dmId);
  const dmMessagesIndex = data.dmMessages.findIndex(messages => messages.dmId === dmId);

  // for each member of the dm, update stats for the number of dms they are a part of
  const dmMembersArray = data.dmDetails[dmDetailsIndex].details.members;
  for (const member of dmMembersArray) {
    // Decrease num dms joined
    updateUserStatsNumDmsJoined(member.uId, false);
    workspaceStatsCheckToRemoveNumUsersInChOrDm(member.uId);
  }

  data.dms.splice(dmsIndex, 1);
  data.dmDetails.splice(dmDetailsIndex, 1);

  // Iterate through the message IDs and remove corresponding message in allMesssages
  for (const messageId of data.dmMessages[dmMessagesIndex].allMessageIds) {
    const messageIndex = data.allMessages.findIndex(message => message.messageId === messageId);
    data.allMessages.splice(messageIndex, 1);
  }

  data.dmMessages.splice(dmMessagesIndex, 1);
  setData(data);

  updateWorkSpaceStatsDmsExists();
  updateWorkspaceStatsMessagesExists();
  return {};
}

// ////////////////////// dmDetails Helper Functions /////////////////////// //
/**
 * Returns details of dmId
 *
 * @param {number} dmId - the number which identifies the dm
 *
 * @returns {boolean} true - if dm does not exist
 * @returns {boolean} false - if dm exists
 */
function getDmDetails(dmId: number): dmDetails {
  const data = getData();
  const dmIndex = data.dmDetails.findIndex(dm => dm.dmId === dmId);
  const dm = data.dmDetails[dmIndex].details;
  const details = { name: dm.name, members: dm.members };
  return details;
}

//  ///////////////////////// dmLeaveV1 Helper functions /////////////////////////////  //

/**
 * Removes a user from a particular dm
 *
 * @param {string} token a unique identifier for user's active session
 * @param {number} dmId - a unique indentifier for a particular dm
 * @returns {object} - {} in all cases
 */

function removeUserFromDm(token: string, dmId: number): Record<string, never> {
  const data = getData();

  const uId = getUserId(token);
  const members = data.dmDetails.find(dm => dm.dmId === dmId).details.members;

  // Removing the last user from DM will not delete it.
  const memberIndex = members.findIndex(member => member.uId === uId);
  members.splice(memberIndex, 1);
  // Decrease num dms joined
  updateUserStatsNumDmsJoined(uId, false);
  workspaceStatsCheckToRemoveNumUsersInChOrDm(uId);

  // // Removing the last user from DM will delete it.
  // if (members.length === 1) {
  //   removeDm(dmId);
  // } else {
  //   const memberIndex = members.findIndex(member => member.uId === uId);
  //   members.splice(memberIndex, 1);
  // }

  setData(data);
  return {};
}
