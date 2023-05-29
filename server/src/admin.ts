import { getData, Data, setData, user, tokenObject } from './dataStore';
import { authLogoutV1 } from './auth';
import { isGlobalOwner } from './Helpers/globalOwnerHelper';
import { removeDm } from './dm';
import HttpError from 'http-errors';
import { workspaceStatsCheckToRemoveNumUsersInChOrDm } from './it4Files/statsHelper';
const ERROR = 400;
const TOKEN_ERROR = 403;

/**
 * Removes user of uId from Memes.
 *
 * @param {string} token - unique identifier for an active session.
 * @param {number} uId - unique identifier for the user to be removed.
 *
 * @returns {object} {} - if user is successfully removed.
 * Throw http error - in all the following cases:
 * - uId does not refer to a valid user.
 * - uId refers to a user who is the only global owner.
 * - The authorised user is not a global owner.
 */
export function adminUserRemoveV1(token: string, uId: number
): Record<string, never> {
  let data: Data = getData();
  const tokenUserUid = data.tokens.find(tokenObject => tokenObject.token === token);
  if (tokenUserUid === undefined) {
    throw HttpError(403, 'token is invalid');
  }

  const authuId = tokenUserUid.uId;
  if (isGlobalOwner(authuId) === false) {
    throw HttpError(403, 'the authorised user is not a global owner');
  }

  const userProfile = data.users.find(user => user.uId === uId);
  if (userProfile === undefined) {
    throw HttpError(400, 'uId is not valid');
  }

  if (isGlobalOwner(uId) === true && data.globalOwners.length === 1) {
    throw HttpError(400, 'uId refers to a user who is the only global owner');
  }

  // Get array of channels that user is in
  const userChannels = data.channelDetails.filter(
    channel => channel.details.allMembers.includes(userProfile)
  );

  // Remove user from all channels
  for (const channel of userChannels) {
    // Remove from ownerMembers if user is owner
    const ownerIndex = channel.details.ownerMembers.indexOf(userProfile);
    if (ownerIndex !== -1) {
      channel.details.ownerMembers.splice(ownerIndex, 1);
    }

    // Remove from allMembers
    const memberIndex = channel.details.allMembers.indexOf(userProfile);
    channel.details.allMembers.splice(memberIndex, 1);
  }

  // Get array of DMs that user is in
  const userDms = data.dmDetails.filter(
    dm => dm.details.members.includes(userProfile)
  );

  // Remove user from all DMs
  for (const dm of userDms) {
    // Last user in DM, delete DM.
    if (dm.details.members.length === 1) {
      removeDm(dm.dmId);
    } else {
      const memberIndex = dm.details.members.indexOf(userProfile);
      dm.details.members.splice(memberIndex, 1);
    }
  }

  // Replace contents of all messages sent by user
  const userMessages = data.allMessages.filter(message => message.uId === uId);
  for (const message of userMessages) {
    message.message = 'Removed user';
  }

  // Remove user instance in global if they were a global
  if (isGlobalOwner(uId) === true) {
    const ownerIndex = data.globalOwners.findIndex(owner => owner.uId === uId);
    data.globalOwners.splice(ownerIndex, 1);
  }

  // Logs out the user from all sessions.
  const userTokenObjArray: tokenObject[] = data.tokens.filter(tokenObj => tokenObj.uId === uId);
  for (const tokenObj of userTokenObjArray) {
    authLogoutV1(tokenObj.token);
  }

  // Removed all resetCodes of user
  let resetPasswordObjIndex = data.resetCodes.findIndex(
    resetPasswordObj => resetPasswordObj.uId === uId
  );

  while (resetPasswordObjIndex !== -1) {
    // Invalidates the reset code.
    data.resetCodes.splice(resetPasswordObjIndex, 1);

    resetPasswordObjIndex = data.resetCodes.findIndex(
      resetPasswordObj => resetPasswordObj.uId === uId
    );
  }

  // Changing the nameFirst and nameLast of userProfile to 'remove' 'user' respectively
  // and making their email and handleStr undefined so it can be reused.
  userProfile.nameFirst = 'Removed';
  userProfile.nameLast = 'user';
  userProfile.email = undefined;
  userProfile.handleStr = undefined;
  setData(data);

  // update stats
  data = getData();
  const timeNow = Date.now() / 1000;
  const userStatsObj = data.userStats.find(userStatsObj => userStatsObj.uId === uId);
  userStatsObj.numChannelsJoined = 0;
  userStatsObj.numDmsJoined = 0;
  userStatsObj.channelsJoinedStats.push(
    { numChannelsJoined: userStatsObj.numChannelsJoined, timeStamp: timeNow }
  );
  userStatsObj.dmsJoinedStats.push(
    { numDmsJoined: userStatsObj.numDmsJoined, timeStamp: timeNow }
  );
  setData(data);
  workspaceStatsCheckToRemoveNumUsersInChOrDm(uId);
  return {};
}

/**
 *
 * Changes the permission level of the user based on the permissionId.
 *
 * @param {string} token - hashed string that identifies session
 * @param {number} uId - unique identifer of user that is being changed in permission
 * @param {number} permissionId - unique number which indicates what permission level to change
 * @returns {} - when successful
 * 400 Error when any of:
 * permissionId is invalid
 * uId refers to a user who is the only global owner and they are being demoted to a user
 * uId is not valid
 * 403 Error when:
 * Given token does not exists
 */

export function adminUserPermissionChangeV1(
  token: string, uId: number, permissionId: number
): Record<string, never> {
  if (permissionId < 1 || permissionId > 2) { throw HttpError(ERROR, 'permissionId is invalid'); }

  const data: Data = getData();

  const authObj = data.tokens.find(tokenObject => tokenObject.token === token);
  if (authObj === undefined) throw HttpError(TOKEN_ERROR, 'Given token does not exist');
  const authuId = authObj.uId;

  if (!isGlobalOwner(authuId)) {
    throw HttpError(TOKEN_ERROR, 'Given token is not authorized');
  }

  if (isGlobalOwner(uId) && data.globalOwners.length === 1 && permissionId === 2) {
    throw HttpError(ERROR, 'uId refers to a user who is the only global owner and they are being demoted to a user');
  }

  const userToChange = data.users.find(user => user.uId === uId);
  if (userToChange === undefined) throw HttpError(ERROR, 'uId given is not a valid user');

  changingUserType(userToChange, permissionId);
  return {};
}

/**
 * Changes the permission level of the user based on the permissionId
 * and whether the user is a global owner or not
 * @param {user} userToChange - A object user which needs to be changed
 * @param {number} permissionId - the unique Id which used to change to either a owner or a user
 * @returns  {} - when successful
 * 400 ERROR when the user is trying to change permission to a permission level
 * which the user is already in.
 */

function changingUserType(userToChange: user, permissionId: number): Record<string, never> {
  if (permissionId === 1 && !isGlobalOwner(userToChange.uId)) {
    userToOwner(userToChange);
  } else if (permissionId === 2 && isGlobalOwner(userToChange.uId)) {
    OwnerToUser(userToChange);
  } else throw HttpError(ERROR, 'user is already in the correct permission level');
  return {};
}

/**
 * Changes the user to a global owner by adding the user given to the
 * global owner users.
 * @param {user} userToChange - A object user which needs to be changed to owner
 * @returns {}
 *
 */

function userToOwner(userToChange: user): Record<string, never> {
  const data: Data = getData();
  data.globalOwners.push(userToChange);
  setData(data);
  return {};
}

/**
 * Changes a global owner to a user by removing a global owner in global owner dataset.
 * @param {user} userToChange - A object user which needs to be changed to owner
 * @returns
 */

function OwnerToUser(userToChange: user): Record<string, never> {
  const data: Data = getData();
  const userToRemoveIndex = data.globalOwners.findIndex(user => user === userToChange);
  data.globalOwners.splice(userToRemoveIndex, 1);
  setData(data);
  return {};
}
