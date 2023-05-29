import { userProfileV1 } from './users';
import { getData, setData, channelDetails, message, messageReturn } from './dataStore';
import { doIsUserReacted, generateEnd, getMessagesSubarray } from './Helpers/messagesHelper';
import { isUserInChannel, checkChannelExists } from './Helpers/channelHelpers';
import { getUserId } from './Helpers/getUserId';
import { isGlobalOwner } from './Helpers/globalOwnerHelper';
import HttpError from 'http-errors';
import { notification } from './dataStore';
import { storeNotif } from './Helpers/notificationsHelper';
import { checkToAddIdToUsersWhoHaveJoinedAChannelOrDm, updateUserStatsNumChsJoined, workspaceStatsCheckToRemoveNumUsersInChOrDm } from './it4Files/statsHelper';

/**
 * Invites a user with id: uId to a channel with id: channelId.
 *
 * @param {string} token - unique identifier for an active session.
 * @param {number} channelId - unique identifier for a channel.
 * @param {number} uId - unique identifier for the invitee.
 *
 * @returns {object} {} - If the invite is successful.
 * Throw http error - in all the following cases:
 *      Invalid token
 *      Invalid uId
 *      Invalid channelId
 *      Inviter is not in channel
 *      Invitee is already in channel
 */
export function channelInviteV1(token: string, channelId: number, uId: number
): Record<string, never> {
  // Attempts to retrieve a userId that corresponds to the token parameter.
  const tokenUserId = getUserId(token);
  if (tokenUserId === -1) {
    throw HttpError(403, 'Invalid token');
  }

  // Attempts to retrieve an object of type: user, which corresponds to the parameter: uId.
  const data = getData();
  const uIdUserObj = data.users.find(userObj => userObj.uId === uId);
  if (uIdUserObj === undefined) {
    throw HttpError(400, 'Invalid uId');
  }

  // Attempts to retrieve the index for the channelDetails object of channelId.
  const channelDetailsIndex = data.channelDetails.findIndex(
    channelDetailsObj => channelDetailsObj.channelId === channelId
  );
  if (channelDetailsIndex === -1) {
    throw HttpError(400, 'Invalid channelId');
  }

  // Check whether the inviter not in channel or invitee is already part of the channel.
  const inviterInChannelCheck = isUserInChannel(tokenUserId, channelId);
  const inviteeInChannelCheck = isUserInChannel(uId, channelId);
  if (inviterInChannelCheck === false) {
    throw HttpError(403, 'Inviter is not in channel');
  }
  if (inviteeInChannelCheck === true) {
    throw HttpError(400, 'Invitee is already in channel');
  }

  // Retrieves and adds the user's information to the channel.
  addUserToMembers(token, uId, channelDetailsIndex);
  const inviteNotif = generateInviteNotif(token, tokenUserId, channelId);
  storeNotif(uId, inviteNotif);

  // Update stats
  checkToAddIdToUsersWhoHaveJoinedAChannelOrDm(uId);
  updateUserStatsNumChsJoined(uId, true);
  return {};
}

/**
 * Given a valid channelID and authUserId, the function returns messages from start
 * up to start + 50. If the function has returned the last message in the channel,
 * the end variable inside the returned object will be equals -1 to indicate there
 * are no more messages need to be returned.
 *
 * @param {string} token - unique identifier for an active session.
 * @param {number} channelId - unique identifier for a channel.
 * @param {number} start - the index for the first element in the page.
 *
 * @returns {object} { messages, start, end } - If the user and channel are valid, and
 * there are messages to be returned.
 * Throw http error - in all the following cases:
 *      start is negative
 *      Invalid token
 *      Invalid channelId
 *      User is not in channel
 *      start > total number of channel messages
 */
export function channelMessagesV1(
  token: string, channelId: number, start: number
): { messages: messageReturn[], start: number, end: number } {
  if (start < 0) {
    throw HttpError(400, 'start is negative');
  }

  // Attempts to retrieve a userId that corresponds to the token parameter.
  const tokenUserId = getUserId(token);
  if (tokenUserId === -1) {
    throw HttpError(403, 'Invalid token');
  }

  if (checkChannelExists(channelId) === false) {
    throw HttpError(400, 'Invalid channelId');
  }

  if (isUserInChannel(tokenUserId, channelId) === false) {
    throw HttpError(403, 'Token refers to a user who is not in the channel');
  }

  const data = getData();
  const channelMessagesObj = data.channelMessages.find(
    channelMessagesObj => channelMessagesObj.channelId === channelId
  );

  if (start > channelMessagesObj.allMessageIds.length) {
    throw HttpError(400, 'Start is greater than the total number of messages in channel');
  } else if (start === channelMessagesObj.allMessageIds.length) {
    return { messages: [], start: start, end: -1 };
  }

  const messageObjArray : message[] = getMessagesSubarray(channelMessagesObj.allMessageIds, start);

  // For reaction in each message, finds whether uId has reacted with isThisUserReacted.
  const messagesReturnArray: messageReturn[] = [];
  const uId = getUserId(token);
  for (const message of messageObjArray) {
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
    end: generateEnd(start, channelMessagesObj.allMessageIds)
  };
}

/**
 * Given a channelId of a channel that the authorised user can join, adds them to that channel.
 *
 * @param {string} token - unique identifier for an active session.
 * @param {number} channelId - unique identifier for a channel.
 *
 * @returns {object} {} - If the user is successfully added to the channel.
 * Throw http error - in all the following cases:
 *      Invalid token
 *      Invalid channelId
 *      User is already in channel
 *      Channel is private and user is not a global owner
 */
export function channelJoinV1(token: string, channelId: number): Record<string, never> {
  // Attempts to retrieve a userId that corresponds to the token parameter.
  const tokenUserId = getUserId(token);
  if (tokenUserId === -1) {
    throw HttpError(403, 'Invalid token');
  }

  // Attempts to retrieve the index for the channelDetails object of channelId.
  const data = getData();
  const channelDetailsIndex = data.channelDetails.findIndex(
    channelDetailsObj => channelDetailsObj.channelId === channelId
  );
  if (channelDetailsIndex === -1) {
    throw HttpError(400, 'Invalid channelId');
  }

  if (isUserInChannel(tokenUserId, channelId) === true) {
    throw HttpError(400, 'User is already in channel');
  }

  // If the channel is private, the user must be a global owner to join.
  if (
    data.channelDetails[channelDetailsIndex].details.isPublic === false &&
    isGlobalOwner(tokenUserId) === false
  ) {
    throw HttpError(403, 'Channel is private and user is not a global owner');
  }

  // Retrieves and adds the user's information to the channel.
  // If successful, returns an empty object. Otherwise, returns an error object.
  addUserToMembers(token, tokenUserId, channelDetailsIndex);

  // Update stats
  checkToAddIdToUsersWhoHaveJoinedAChannelOrDm(tokenUserId);
  updateUserStatsNumChsJoined(tokenUserId, true);
  return {};
}

/**
 * Given a channel with ID channelId that the authorised user is a member of, provides
 * basic details about the channel.
 *
 * @param {string} token - unique identifier for an active session.
 * @param {number} channelId - unique identifier for a channel.
 *
 * @returns {object} { name, isPublic, ownerMembers, allMembers } - If the authorised
 * user is in the channel.
 * Throw http error - in all the following cases:
 *      Invalid token
 *      Invalid channelId
 *      User is not in channel
 */
export function channelDetailsV1(token: string, channelId: number): channelDetails {
  // Attempts to retrieve a userId that corresponds to the token parameter.
  const tokenUserId = getUserId(token);
  if (tokenUserId === -1) {
    throw HttpError(403, 'Invalid token');
  }

  const data = getData();
  const channelDetailsObj = data.channelDetails.find(
    channelDetailsObj => channelDetailsObj.channelId === channelId
  );
  if (channelDetailsObj === undefined) {
    throw HttpError(400, 'Invalid channelId');
  }

  if (isUserInChannel(tokenUserId, channelId) === false) {
    throw HttpError(403, 'User is not a member of the channel');
  }

  return channelDetailsObj.details;
}

/**
 * Makes a channel member with id: uId an owner of a channel with id:
 * channelId.
 *
 * @param {string} token - unique identifier for an active session.
 * @param {number} channelId - unique identifier for a channel.
 * @param {number} uId - unique identifier for the user to be made an owner.
 *
 * @returns {object} {} - If the channel member has successfully been made a channel owner.
 * Throw http error - in all the following cases:
 *      Invalid token
 *      Invalid uId
 *      Invalid channelId
 *      uId is not in channel
 *      uId is already an owner in channel
 *      Token refers to a user who is not in the channel
 *      Token refers to a user that does not have owner permissions in the channel
 */
export function channelAddOwnerV1(token: string, channelId: number, uId: number
): Record<string, never> {
  // Attempts to retrieve a userId that corresponds to the token parameter.
  const tokenUserId = getUserId(token);
  if (tokenUserId === -1) {
    throw HttpError(403, 'Invalid token');
  }

  // Attempts to retrieve an object of type: user, which corresponds to the parameter: uId.
  const data = getData();
  const uIdUserObj = data.users.find(userObj => userObj.uId === uId);
  if (uIdUserObj === undefined) {
    throw HttpError(400, 'Invalid uId');
  }

  // Attempts to retrieve an object of type: channelDetailObjects, which corresponds to the
  // parameter: channelId.
  const channelDetailsObj = data.channelDetails.find(
    channelDetails => channelDetails.channelId === channelId
  );
  if (channelDetailsObj === undefined) {
    throw HttpError(400, 'Invalid channelId');
  }

  if (isUserInChannel(uId, channelId) === false) {
    throw HttpError(400, 'uId is not a member of the channel');
  }

  if (channelDetailsObj.details.ownerMembers.includes(uIdUserObj)) {
    throw HttpError(400, 'uId is already an owner of the channel');
  }

  // Checks whether the user corresponding to the token parameter has owner permissions.
  // User must:
  // - Be a member of the channel
  // - Be a global owner or a channel owner in the target channel.
  const tokenUserObj = data.users.find(userObj => userObj.uId === tokenUserId);
  if (isUserInChannel(tokenUserId, channelId) === false) {
    throw HttpError(403, 'Token refers to a user who is not in the channel');
  }
  if (
    isGlobalOwner(tokenUserId) === false &&
    channelDetailsObj.details.ownerMembers.includes(tokenUserObj) === false
  ) {
    throw HttpError(
      403, 'Token refers to a user that does not have owner permissions in the channel'
    );
  }

  channelDetailsObj.details.ownerMembers.push(uIdUserObj);
  setData(data);

  return {};
}

/**
 * Remove user with user id uId as an owner of the channel channelId.
 *
 * @param {string} token - unique identifier for an active session.
 * @param {number} channelId - unique identifier for a channel.
 * @param {number} uId - unique identifier for the user to be made an owner.
 *
 * @returns {object} {} - If uId has successfully been removed a channel owner from the channel.
 * Throw http error - in all the following cases:
 *      Invalid token
 *      Invalid uId
 *      Invalid channelId
 *      uId is not an owner of the channel
 *      uId is the only owner of the channel
 *      Token refers to a user who is not in the channel
 *      Token refers to a user that does not have owner permissions in the channel
 */
export function channelRemoveOwnerV1(token: string, channelId: number, uId: number
): Record<string, never> {
  // Attempts to retrieve a userId that corresponds to the token parameter.
  const tokenUserId = getUserId(token);
  if (tokenUserId === -1) {
    throw HttpError(403, 'Invalid token');
  }

  // Attempts to retrieve an object of type: user, which corresponds to the parameter: uId.
  const data = getData();
  const uIdUserObj = data.users.find(userObj => userObj.uId === uId);
  if (uIdUserObj === undefined) {
    throw HttpError(400, 'Invalid uId');
  }

  // Attempts to retrieve an object of type: channelDetailObjects, which corresponds to the
  // parameter: channelId.
  const channelDetailsObj = data.channelDetails.find(
    channelDetails => channelDetails.channelId === channelId
  );
  if (channelDetailsObj === undefined) {
    throw HttpError(400, 'Invalid channelId');
  }

  if (channelDetailsObj.details.ownerMembers.includes(uIdUserObj) === false) {
    throw HttpError(400, 'uId is not an owner of the channel');
  }

  if (channelDetailsObj.details.ownerMembers.length === 1) {
    throw HttpError(400, 'uId is the only owner of the channel');
  }

  // Checks whether the user corresponding to the token parameter has owner permissions.
  // User must:
  // - Be a member of the channel
  // - Be a global owner or a channel owner in the target channel.
  const tokenUserObj = data.users.find(userObj => userObj.uId === tokenUserId);
  if (isUserInChannel(tokenUserId, channelId) === false) {
    throw HttpError(403, 'Token refers to a user who is not in the channel');
  }
  if (
    isGlobalOwner(tokenUserId) === false &&
    channelDetailsObj.details.ownerMembers.includes(tokenUserObj) === false
  ) {
    throw HttpError(
      403, 'Token refers to a user that does not have owner permissions in the channel'
    );
  }

  // Finds the index of the user to be removed in the ownerMembers array of the specified channel.
  const uIdIndex = channelDetailsObj.details.ownerMembers.findIndex(
    ownerMember => ownerMember.uId === uId
  );
  // Removes uId's user object from the ownerMembers array using the index located.
  channelDetailsObj.details.ownerMembers.splice(uIdIndex, 1);
  setData(data);

  return {};
}

/**
 * Given a channel with ID channelId that the authorised user is a member of, remove them as a
 * member of the channel.
 *
 * @param {string} token - unique identifier for an active session.
 * @param {number} channelId - unique identifier for a channel.
 *
 * @returns {object} {} - If the user has successfully been removed from the channel.
 * Throw http error - in all the following cases:
 *      Invalid token
 *      Invalid channelId
 *      Token refers to a user who is not a member of the channel
 */
export function channelLeaveV1(token: string, channelId: number
): Record<string, never> {
  // Attempts to retrieve a userId that corresponds to the token parameter.
  const tokenUserId = getUserId(token);
  if (tokenUserId === -1) {
    throw HttpError(403, 'Invalid token');
  }

  // Attempts to retrieve an object of type: channelDetailObjects, which corresponds to the
  // channelId parameter.
  const data = getData();
  const channelDetailsObj = data.channelDetails.find(
    channelDetails => channelDetails.channelId === channelId
  );
  if (channelDetailsObj === undefined) {
    throw HttpError(400, 'Invalid channelId');
  }

  const standupChannelObj = data.standups.find(standupChannelObject =>
    standupChannelObject.channelId === channelId);
  // If standup is not active, creatorId = -1, which is an invalid userId.
  if (standupChannelObj.creatorId === tokenUserId) {
    throw HttpError(400, 'user is the starter of an active standup in the channel');
  }

  if (isUserInChannel(tokenUserId, channelId) === false) {
    throw HttpError(403, 'Token refers to a user who is not a member of the channel');
  }

  // Attempts to retrieve the index for the user in the ownerMembers array of a channel.
  // If the token refers to a user who is an owner in the channel, also removes the user object
  // from the ownerMembers array.
  let userIndex = channelDetailsObj.details.ownerMembers.findIndex(
    ownerMember => ownerMember.uId === tokenUserId
  );
  if (userIndex !== -1) {
    channelDetailsObj.details.ownerMembers.splice(userIndex, 1);
  }
  // Retrieves the position of the user in allMembers and removes them from the array.
  userIndex = channelDetailsObj.details.allMembers.findIndex(member => member.uId === tokenUserId);
  channelDetailsObj.details.allMembers.splice(userIndex, 1);

  updateUserStatsNumChsJoined(tokenUserId, false);
  workspaceStatsCheckToRemoveNumUsersInChOrDm(tokenUserId);
  setData(data);

  return {};
}

// ~~~~~~~~~~~~~~~~~~~~~~~~ HELPER FUNCTIONS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

/**
 * Attempts to retrieve and add the profile of user uId to the members list
 * of the channel at the specified index (channelDetailsIndex) in the data object.
 *
 * @param {string} token - unique identifier for an active session.
 * @param {number} uId - unique identifier for a user.
 * @param {number} channelDetailsIndex - The index of a channel in the data object.
 *
 * @returns void
 */
function addUserToMembers(token: string, uId: number, channelDetailsIndex: number) {
  const userDetails = userProfileV1(token, uId);
  const data = getData();
  data.channelDetails[channelDetailsIndex].details.allMembers.push(userDetails.user);
  setData(data);
}

/**
 * Generates notification when user is invited to channel
 *
 * @param {string} token - token of the user that is sending the invitiation
 * @param {number} uId - uId of the user that is sending the invitiation
 * @param {number} channelId - unique identifier for the channel
 *
 * @returns {object} addNotif - notification that user has been added to channel
 */
function generateInviteNotif(token: string, uId: number, channelId: number): notification {
  const handleStr: string = userProfileV1(token, uId).user.handleStr;
  const chName = channelDetailsV1(token, channelId).name;
  const notifMsg = `${handleStr} added you to ${chName}`;

  const addNotif: notification = {
    channelId: channelId,
    dmId: -1,
    notificationMessage: notifMsg
  };
  return addNotif;
}
