import { getData, notification, setData } from './dataStore';
import { user } from './dataStore';
import { getUserId } from './Helpers/getUserId';
import { isTokenInvalid } from './Helpers/tokenHelper';
import { isUserInChannel, checkChannelExists } from './Helpers/channelHelpers';
import { isUserInDm, isUserDmCreator, isDmIdInvalid } from './Helpers/dmHelper';
import HttpError from 'http-errors';
import { doesMessageExist } from './Helpers/messagesHelper';
import { userProfileV1 } from './users';
import { dmDetailsV1 } from './dm';
import { channelDetailsV1 } from './channel';
import { storeNotif } from './Helpers/notificationsHelper';
import {
  addMessageToAllMessages,
  generateMessageId,
} from './Helpers/messagesHelper';
import { isGlobalOwner } from './Helpers/globalOwnerHelper';
import { updateUserStatsIncreaseMsgsSent, updateWorkspaceStatsMessagesExists } from './it4Files/statsHelper';
import { personalAiListenRequest } from './it4Files/personalAssistant';

// Reactions that the front end currently has.
const reactIds = [1];

// Estimated runtime between the passing of timeSent variable
// and the checking of whether it is valid (before current time).
const TIME_ALLOWANCE = 0.5;

/**
 * Given a messageId for a message,
 * this message is removed from the channel/DM.
 *
 * @param {string} token - unique identifier for user's session
 * @param {number} messageId - unique number that identifies the message
 *
 * @returns {} - If successful
 * Throws hhtp error - In all the following cases:
 * - messageId does not refer to a valid message within a channel/DM
 *   that the authorised user has joined.
 * - the message was not sent by the authorised user making this request
 *   and the user does not have owner permissions in the channel/DM.
 * - token is invalid
 */
export function messageRemoveV1(
  token: string,
  messageId: number
): Record<string, never> {
  if (isTokenInvalid(token) === true) {
    throw HttpError(403, 'token is not valid');
  }

  // Search for channel/dm that contains the messageId
  const channelId = getChannelIdOfMessage(messageId);
  const dmId = getDmIdOfMessage(messageId);

  const uId = getUserId(token);

  // Message found in a channel that the user is in
  if (channelId !== -1 && isUserInChannel(uId, channelId)) {
    const data = getData();
    const tokenUserObj = data.users.find((userObj) => userObj.uId === uId);
    const channelDetailsObj = data.channelDetails.find(
      (channelDetails) => channelDetails.channelId === channelId
    );

    // User must be global owner, channel owner or message sender
    if (
      !data.globalOwners.includes(tokenUserObj) &&
      !channelDetailsObj.details.ownerMembers.includes(tokenUserObj) &&
      !isUserMessageSender(uId, messageId)
    ) {
      throw HttpError(403, 'User is not authorised to remove message from channel');
    }

    removeChannelMessage(messageId, channelId);
  } else if (dmId !== -1 && isUserInDm(token, dmId)) {
    // User must be dm creator or message sender
    if (!isUserDmCreator(token, dmId) && !isUserMessageSender(uId, messageId)) {
      throw HttpError(
        403,
        'User is not authorised to remove message from channel'
      );
    }

    removeDmMessage(messageId, dmId);
  } else {
    throw HttpError(400, 'Message does not exist in any channel or dm of user');
  }

  removeAllMessagesMessage(messageId);
  return {};
}

/**
 * Sends a message from authorised user to the DM specified by dmId
 *
 * @param {string} token - string to identify user session
 * @param {number} dmId - number to identify dm
 * @param {string} message - string of what the message being sent contains
 *
 * @returns { messageId: number } - If successful
 * Throws HTTP error - In all the following cases:
 * - dmId does not refer to a valid DM
 * - length of message is less than 1 or over 1000 characters
 * - dmId is valid and the authorised user is not a member of the DM
 * - token is invalid
 */
export function messageSendDm(
  token: string,
  dmId: number,
  message: string
): { messageId: number } {
  const uId = getUserId(token);
  if (uId === -1) {
    throw HttpError(403, 'token is not valid');
  }
  if (message.length < 1 || message.length > 1000) {
    throw HttpError(400, 'message length is invalid');
  }
  const data = getData();
  const dmDetailsObjIndex = data.dmDetails.findIndex(
    (dmDetailsObj) => dmDetailsObj.dmId === dmId
  );
  if (dmDetailsObjIndex === -1) {
    throw HttpError(400, 'dmId is invalid');
  }
  const dmMembers: user[] = data.dmDetails[dmDetailsObjIndex].details.members;

  const memberIndex = dmMembers.findIndex((member) => member.uId === uId);
  if (memberIndex === -1) {
    throw HttpError(403, 'user is not a member of this dm');
  }

  const messageId = generateMessageId();
  addMessageToAllMessages(messageId, uId, message);
  addMessageToDmMessages(dmId, messageId);
  checkForTagInDM(token, uId, message, dmId);

  updateWorkspaceStatsMessagesExists();
  updateUserStatsIncreaseMsgsSent(uId);

  const personalAiChannelObj = data.personalAiDmsState.find(
    dmObj => dmObj.dmId === dmId);
  if (personalAiChannelObj !== undefined) {
    personalAiListenRequest(token, dmId, message);
  }
  return { messageId: messageId };
}

/**
 * Sends a message from the authorised user to the DM specified by dmId
 * automatically at a specified time in the future.
 * The returned messageId will only be considered valid for other actions
 * (editing/deleting/reacting/etc) once it has been sent (i.e. after timeSent).
 * If the DM is removed before the message has sent, the message will not be sent.
 *
 * @param {string} token - string to identify user session
 * @param {number} dmId - number to identify DM
 * @param {string} message - string of what the message being sent contains
 * @param {number} timeSent - number to specify the time for the message to send
 *
 * @returns {messageId: number} - if successful
 * Throws http error for the following conditions:
 * - dmId does not refer to a valid channel.
 * - length of message is less than 1 or over 1000 characters.
 * - timeSent is a time in the past.
 * - dmId is valid and the authorised user is not
 *   a member of the DM they are trying to post to.
 */
export function messageSendLaterDmV1(
  token: string,
  dmId: number,
  message: string,
  timeSent: number
): { messageId: number } {
  // Check if timeSent is in the past
  if (timeSent < (Date.now() / 1000) - TIME_ALLOWANCE) {
    throw HttpError(400, 'Specified time is invalid');
  }

  // Input params check before accessing dataStore
  if (isTokenInvalid(token)) throw HttpError(403, 'Invalid Token');
  if (message.length > 1000 || message.length < 1) {
    throw HttpError(400, 'Invalid message');
  }

  if (isDmIdInvalid(dmId) === true) {
    throw HttpError(400, 'Invalid DM');
  }

  if (isUserInDm(token, dmId) === false) {
    throw HttpError(403, 'User not in DM');
  }

  let timeout = 0;
  if (timeSent - Date.now() / 1000 > 0) {
    timeout = Math.floor(timeSent * 1000 - Date.now());
  }

  const messageId: number = generateMessageId();
  setTimeout(() => {
    const data = getData();
    const uId: number = getUserId(token);
    if (isDmIdInvalid(dmId) === false) {
      addMessageToAllMessages(messageId, uId, message);
      addMessageToDmMessages(dmId, messageId);

      updateWorkspaceStatsMessagesExists();
      updateUserStatsIncreaseMsgsSent(uId);
      setData(data);
    }
  }, timeout);
  return { messageId: messageId };
}

/**
 * Sends a message to a specified channel
 *
 * @param {string} token - string to identify user session
 * @param {number} channelId - number to identify channel
 * @param {string} message - string containing the message being sent
 *
 * @returns {messageId: number} - if successful
 */
export function messageSendV1(
  token: string,
  channelId: number,
  message: string
): { messageId: number } {
  // Input params check before accessing dataStore
  if (isTokenInvalid(token)) throw HttpError(403, 'Invalid Token');
  if (message.length > 1000 || message.length < 1) {
    throw HttpError(400, 'Invalid message');
  }

  const data = getData();
  const uId: number = getUserId(token);

  const channelsObjIndex = data.channels.findIndex(
    (channelsObjIndex) => channelsObjIndex.channelId === channelId
  );
  if (channelsObjIndex === -1) {
    throw HttpError(400, 'Invalid channel');
  }

  if (!isUserInChannel(uId, channelId)) {
    throw HttpError(403, 'User not in channel');
  }

  const messageId: number = generateMessageId();
  addMessageToAllMessages(messageId, uId, message);

  const ChannelMessagesObjIndex = data.channelMessages.findIndex(
    (channelMessageObj) => channelMessageObj.channelId === channelId
  );

  data.channelMessages[ChannelMessagesObjIndex].allMessageIds.unshift(
    messageId
  );
  setData(data);
  checkForTagInCh(token, uId, message, channelId);

  updateWorkspaceStatsMessagesExists();
  updateUserStatsIncreaseMsgsSent(uId);
  return { messageId: messageId };
}

/**
 * Sends a message from the authorised user to the channel
 * specified by channelId automatically at a specified time in the future.
 * The returned messageId will only be considered valid for other actions
 * (editing/deleting/reacting/etc) once it has been sent (i.e. after timeSent).
 *
 * @param {string} token - string to identify user session
 * @param {number} channelId - number to identify channel
 * @param {string} message - string of what the message being sent contains
 * @param {number} timeSent - number to specify the time for the message to send
 *
 * @returns {messageId: number} - if successful
 * Throws http error for the following conditions:
 * - channelId does not refer to a valid channel.
 * - length of message is less than 1 or over 1000 characters.
 * - timeSent is a time in the past.
 * - channelId is valid and the authorised user is not a member of the channel
 *   they are trying to post to.
 */
export function messageSendLaterV1(
  token: string,
  channelId: number,
  message: string,
  timeSent: number
): { messageId: number } {
  // Check if timeSent is in the past
  if (timeSent < (Date.now() / 1000) - TIME_ALLOWANCE) {
    throw HttpError(400, 'Specified time is invalid');
  }

  // Input params check before accessing dataStore
  if (isTokenInvalid(token)) throw HttpError(403, 'Invalid Token');
  if (message.length > 1000 || message.length < 1) {
    throw HttpError(400, 'Invalid message');
  }

  if (checkChannelExists(channelId) === false) {
    throw HttpError(400, 'Invalid channel');
  }

  const uId: number = getUserId(token);
  if (isUserInChannel(uId, channelId) === false) {
    throw HttpError(403, 'User not in channel');
  }

  let timeout = 0;
  if (timeSent - Date.now() / 1000 > 0) {
    timeout = Math.floor(timeSent * 1000 - Date.now());
  }

  const messageId: number = generateMessageId();
  setTimeout(() => {
    const data = getData();
    addMessageToAllMessages(messageId, uId, message);

    const ChannelMessagesObj = data.channelMessages.find(
      (channelMessageObj) => channelMessageObj.channelId === channelId
    );
    ChannelMessagesObj.allMessageIds.unshift(messageId);
    setData(data);
    updateWorkspaceStatsMessagesExists();
    updateUserStatsIncreaseMsgsSent(uId);
  }, timeout);

  return { messageId: messageId };
}

/**
 * Edits an existing message
 *
 * @param {string} token - string to identify user session
 * @param {number} messageId - unique number to identify message
 * @param {string} message - string containing the message being sent
 *
 * @returns {} - if successful
 * Throws http error for the following conditions:
 * - length of message is over 1000 characters
 * - messageId does not refer to a valid message within a channel/DM
 *   that the authorised user has joined.
 * - If the authorised user does not have owner permissions,
 *   and the message was not sent by them.
 */

export function messageEditV1(
  token: string,
  messageId: number,
  message: string
): Record<string, never> {
  const getUserIdReturn = getUserId(token);
  if (getUserIdReturn === -1) {
    throw HttpError(403, 'token is not valid');
  }

  if (message.length > 1000) {
    throw HttpError(400, 'message length is invalid');
  }

  // Search for channel/dm that contains the messageId
  const channelId = getChannelIdOfMessage(messageId);
  const dmId = getDmIdOfMessage(messageId);
  const uId = getUserId(token);

  // Message found in a channel that the user is in
  if (channelId !== -1 && isUserInChannel(uId, channelId)) {
    const data = getData();
    const tokenUserObj = data.users.find((userObj) => userObj.uId === uId);
    const channelDetailsObj = data.channelDetails.find(
      (channelDetails) => channelDetails.channelId === channelId
    );

    // User is global owner, channel owner or message sender
    if (
      !data.globalOwners.includes(tokenUserObj) &&
      !channelDetailsObj.details.ownerMembers.includes(tokenUserObj) &&
      !isUserMessageSender(uId, messageId)
    ) {
      throw HttpError(403, 'User is not authorised to edit message in channel');
    }

    // If new message is empty, remove message
    if (message === '') {
      removeChannelMessage(messageId, channelId);
      removeAllMessagesMessage(messageId);
    } else {
      editMessage(messageId, message);
      // Pass in the message's original sender as the uId
      const msgSenderId = findOriginalMsgSender(messageId);
      checkForTagInCh(token, msgSenderId, message, channelId);
    }
  } else if (dmId !== -1 && isUserInDm(token, dmId)) {
    // User is owner or message sender
    if (!isUserDmCreator(token, dmId) && !isUserMessageSender(uId, messageId)) {
      throw HttpError(403, 'User is not authorised to edit message in channel');
    }

    // If new message is empty, remove message
    if (message === '') {
      removeDmMessage(messageId, dmId);
      removeAllMessagesMessage(messageId);
    } else {
      editMessage(messageId, message);
      // Pass in the message's original sender as the uId
      const msgSenderId = findOriginalMsgSender(messageId);
      checkForTagInDM(token, msgSenderId, message, dmId);
    }
  } else {
    throw HttpError(400, 'Message is not in any channel or dm of user');
  }

  return {};
}

/**
 * Given a message within a channel or DM the authorised user is part of,
 * adds a "react" to that particular message.
 *
 * @param {string} token - string to identify user session
 * @param {number} messageId - unique number to identify message
 * @param {number} reactId - unique number to identify reaction
 *
 * @returns {} - if successful
 * Throws http error for the following conditions:
 * - messageId is not a valid message within a channel or DM
 *   that the authorised user is part of.
 * - reactId is not a valid react ID - currently,
 *   the only valid react ID the frontend has is 1.
 * - the message already contains a react with ID reactId from the authorised user.
 */
export function messageReactV1(
  token: string,
  messageId: number,
  reactId: number
): Record<string, never> {
  if (isTokenInvalid(token) === true) {
    throw HttpError(403, 'token is not valid');
  }

  if (reactIds.includes(reactId) === false) {
    throw HttpError(400, 'reactId is not valid');
  }

  // Search for channel/dm that contains the messageId
  const channelId = getChannelIdOfMessage(messageId);
  const dmId = getDmIdOfMessage(messageId);
  const uId = getUserId(token);

  // Message found in a channel or dm that the user is in
  if (
    (channelId !== -1 && isUserInChannel(uId, channelId)) ||
    (dmId !== -1 && isUserInDm(token, dmId))
  ) {
    const data = getData();
    const messageObj = data.allMessages.find(
      (message) => message.messageId === messageId
    );
    const reactObj = messageObj.reacts.find(
      (react) => react.reactId === reactId
    );

    // This reaction has not been used
    if (reactObj === undefined) {
      messageObj.reacts.push({ reactId: reactId, uIds: [uId] });

      // User has not yet reacted with this reaction
    } else if (reactObj.uIds.includes(uId) === false) {
      reactObj.uIds.push(uId);
    } else {
      throw HttpError(400, 'user already used this reaction');
    }

    // find the user that sent the message Id as they will receive the notif
    const msgSenderUId = messageObj.uId;
    // Check if message sender is still in dm or channel
    if (isUserAMember(msgSenderUId, channelId, dmId)) {
      const reactNotif = generateReactNotif(token, uId, channelId, dmId);
      storeNotif(msgSenderUId, reactNotif);
    }
  } else {
    throw HttpError(400, 'message not in any channel or dm of user');
  }
  return {};
}

/**
 * Given a message within a channel or DM the authorised user is part of,
 * removes a "react" to that particular message.
 *
 * @param {string} token - string to identify user session
 * @param {number} messageId - unique number to identify message
 * @param {number} reactId - unique number to identify reaction
 *
 * @returns {} - if successful
 * Throws http error for the following conditions:
 * - messageId is not a valid message within a channel or DM
 *   that the authorised user is part of.
 * - reactId is not a valid react ID.
 * - the message does not contain a react with ID reactId from the authorised user.
 */
export function messageUnreactV1(
  token: string,
  messageId: number,
  reactId: number
): Record<string, never> {
  if (isTokenInvalid(token) === true) {
    throw HttpError(403, 'token is not valid');
  }

  if (reactIds.includes(reactId) === false) {
    throw HttpError(400, 'reactId is not valid');
  }

  // Search for channel/dm that contains the messageId
  const channelId = getChannelIdOfMessage(messageId);
  const dmId = getDmIdOfMessage(messageId);
  const uId = getUserId(token);

  // Message found in a channel or dm that the user is in
  if (
    (channelId !== -1 && isUserInChannel(uId, channelId)) ||
    (dmId !== -1 && isUserInDm(token, dmId))
  ) {
    const data = getData();
    const messageObj = data.allMessages.find(
      (message) => message.messageId === messageId
    );
    const reactObj = messageObj.reacts.find(
      (react) => react.reactId === reactId
    );

    // This react has not been used by this user
    if (reactObj === undefined || reactObj.uIds.includes(uId) === false) {
      throw HttpError(400, 'user has not used this reaction');
    }

    // Multiple users including this user have used this reaction
    if (reactObj.uIds.includes(uId) && reactObj.uIds.length > 1) {
      const uIdIndex = reactObj.uIds.indexOf(uId);
      reactObj.uIds.splice(uIdIndex, 1);

      // User is the only one that used this reaction
    } else {
      const msgIndex = messageObj.reacts.indexOf({
        reactId: reactId,
        uIds: [uId],
      });
      messageObj.reacts.splice(msgIndex, 1);
    }
  } else {
    throw HttpError(400, 'message not in any channel or dm of user');
  }
  return {};
}

/**
 * Given a message within a channel or DM the authorised user is part of,
 * pins the message
 *
 * @param {string} token - string to identify user session
 * @param {number} messageId - unique number to identify message
 *
 * @returns {} - if successful
 * Throws http error:
 * 403 if token is invalid or authorised user is not part of channel
 * 400 if messageId is invalid or message has already been pinned
 */
export function messagePinV1(
  token: string,
  messageId: number
): Record<string, never> {
  if (isTokenInvalid(token)) {
    throw HttpError(403, 'Token Invalid');
  }

  if (!doesMessageExist(messageId)) {
    throw HttpError(400, 'Invalid MessageId');
  }

  const channelId = getChannelIdOfMessage(messageId);
  const dmId = getDmIdOfMessage(messageId);
  const uId = getUserId(token);

  if (channelId !== -1) {
    if (!isUserAMember(uId, channelId, -1)) {
      throw HttpError(
        400, 'messageId is not a valid message within a channel that the user is part of'
      );
    }
    if (!isUserChannelOwner(uId, channelId) && !isGlobalOwner(uId)) {
      // User is part of channel/dm but not owner
      throw HttpError(403, 'User is not an owner in channel');
    }
  } else if (dmId !== -1) {
    if (!isUserAMember(uId, -1, dmId)) {
      throw HttpError(
        400, 'messageId is not a valid message within a dm that the user is part of'
      );
    }
    if (!isUserDmCreator(token, dmId)) {
      throw HttpError(403, 'Authorised user not creator of dm');
    }
  }

  const data = getData();
  const messageObj = data.allMessages.find(
    (messsageObj) => messsageObj.messageId === messageId
  );
  if (messageObj.isPinned === true) {
    throw HttpError(400, 'Message already pinned');
  } else {
    messageObj.isPinned = true;
  }

  setData(data);
  return {};
}

/**
 * Given a message within a channel or DM the authorised user is part of,
 * pins the message
 *
 * @param {string} token - string to identify user session
 * @param {number} messageId - unique number to identify message
 *
 * @returns {} - if successful
 * Throws http error:
 * 403 if token is invalid or authorised user is not part of channel
 * 400 if messageId is invalid or message has already been pinned
 */
export function messageUnpinV1(
  token: string,
  messageId: number
): Record<string, never> {
  if (isTokenInvalid(token)) {
    throw HttpError(403, 'Token Invalid');
  }

  if (!doesMessageExist(messageId)) {
    throw HttpError(400, 'Invalid MessageId');
  }

  const channelId = getChannelIdOfMessage(messageId);
  const dmId = getDmIdOfMessage(messageId);
  const uId = getUserId(token);

  if (channelId !== -1) {
    if (!isUserAMember(uId, channelId, -1)) {
      throw HttpError(
        400, 'messageId is not a valid message within a channel that the user is part of'
      );
    }
    if (!isUserChannelOwner(uId, channelId) && !isGlobalOwner(uId)) {
      // User is part of channel/dm but not owner
      throw HttpError(403, 'User is not an owner in channel');
    }
  } else if (dmId !== -1) {
    if (!isUserAMember(uId, -1, dmId)) {
      throw HttpError(
        400, 'messageId is not a valid message within a dm that the user is part of'
      );
    }
    if (!isUserDmCreator(token, dmId)) {
      throw HttpError(403, 'Authorised user not creator of dm');
    }
  }

  const data = getData();
  const messageObj = data.allMessages.find(
    (messsageObj) => messsageObj.messageId === messageId
  );
  if (!messageObj.isPinned) {
    throw HttpError(400, 'Message not already pinned');
  } else {
    messageObj.isPinned = false;
  }

  setData(data);
  return {};
}

/**
 * Function that takes an already existing message in a channel or dm
 * and lets user share it to another channel or dm that they are in
 *
 * @param {string} token - string to identify user session
 * @param {number} ogMessageId - unique number to identify original message
 * @param {string} message - string containing the optional message being sent (empty string by default)
 * @param {number} channelId - unique number to identify channel the message is being sent to
 * @param {number} dmId - unique number to identify dm the message is being sent to
 */
export function messageShareV1(
  token: string,
  ogMessageId: number,
  message: string,
  channelId: number,
  dmId: number
): { sharedMessageId: number } {
  if (isTokenInvalid(token)) throw HttpError(403, 'Token Invalid');

  if (message.length > 1000) throw HttpError(400, 'Message length > 1000 characters');

  if (channelId !== -1 && dmId !== -1) throw HttpError(400, 'neither channelId nor dmId are -1');

  if (!doesMessageExist(ogMessageId)) throw HttpError(400, 'ogMessageId is invalid');

  const data = getData();
  const uId = getUserId(token);

  // Handling ogMessage origin.

  // If the ogMessage is from a channel.
  const channelMsgObj = data.channelMessages.find(
    channelMsgObj => channelMsgObj.allMessageIds.includes(ogMessageId)
  );
  if (channelMsgObj !== undefined && isUserInChannel(uId, channelMsgObj.channelId) === false) {
    throw HttpError(400, 'User is not a member of the channel that contains ogMessageId');
  }

  // If the ogMessage is from a dm.
  const dmMsgObj = data.dmMessages.find(
    dmMsgObj => dmMsgObj.allMessageIds.includes(ogMessageId)
  );
  if (dmMsgObj !== undefined && isUserInDm(token, dmMsgObj.dmId) === false) {
    throw HttpError(400, 'User is not a member of the dm that contains ogMessageId');
  }

  // Handling message share destination.

  // If sharing message to a channel.
  if (channelId !== -1) {
    if (!checkChannelExists(channelId)) {
      throw HttpError(400, 'ChannelId is invalid');
    }
  }

  // If sharing message to a dm.
  if (dmId !== -1) {
    if (isDmIdInvalid(dmId)) {
      throw HttpError(400, 'dmId is invalid');
    }
  }

  const ogMessageString = data.allMessages.find(
    (messageObj) => messageObj.messageId === ogMessageId
  ).message;
  const newMessage = ogMessageString + message;
  let sharedMessageId: number;

  if (dmId === -1 && isUserInChannel(uId, channelId) === true) {
    sharedMessageId = messageShareUpdateData(token, channelId, newMessage);
  } else if (channelId === -1 && isUserInDm(token, dmId) === true) {
    sharedMessageId = messageShareUpdateDmData(token, dmId, newMessage);
  } else {
    throw HttpError(
      403, 'the authorised user has not joined the channel or DM they are trying to share the message to'
    );
  }

  updateWorkspaceStatsMessagesExists();
  updateUserStatsIncreaseMsgsSent(uId);
  return { sharedMessageId: sharedMessageId };
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~ messageShare helpers  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~  //

/**
 * Helper function that updates data as if it were messageSendV1 but unlike the original,
 * it does not check if the passed in message is over 1000 chars as the new message
 * being passed in could be a max of 2k (original message length = 1000 and new message length = 1000)
 *
 * @param {string} token - string to identify user session. The user who is sharing the message
 * @param {number} channelId - unique number to identify channel the message is being shared to
 * @param {string} message - string containing the optional message being sent
 *
 * @returns {number} messageId - unique integer Id for the new shared message
 */

function messageShareUpdateData(
  token: string,
  channelId: number,
  message: string
): number {
  const data = getData();
  const uId = getUserId(token);
  const messageId: number = generateMessageId();
  addMessageToAllMessages(messageId, uId, message);

  const ChannelMessagesObjIndex = data.channelMessages.findIndex(
    (channelMessageObj) => channelMessageObj.channelId === channelId
  );

  data.channelMessages[ChannelMessagesObjIndex].allMessageIds.unshift(
    messageId
  );
  setData(data);
  checkForTagInCh(token, uId, message, channelId);

  return messageId;
}

/**
 * Helper function that updates data as if it were messageSendV1 but unlike the original,
 * it does not check if the passed in message is over 1000 chars as the new message
 * being passed in could be a max of 2k (original message length = 1000 and new message length = 1000)
 *
 * @param {string} token - string to identify user session. The user who is sharing the message
 * @param {number} dmId - unique number to identify dm the message is being shared to
 * @param {string} message - string containing the optional message being sent
 *
 * @returns {number} messageId - unique integer Id for the new shared message
 */
function messageShareUpdateDmData(
  token: string,
  dmId: number,
  message: string
): number {
  const uId = getUserId(token);
  const messageId = generateMessageId();
  addMessageToAllMessages(messageId, uId, message);
  addMessageToDmMessages(dmId, messageId);

  checkForTagInDM(token, uId, message, dmId);

  return messageId;
}
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~ messagePin helpers  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~  //

/**
 * Helper function that checks if a given user is the owner for the channel
 * @param {number} uId - unique integer identifier for a user
 * @param {number} channelId - unique integer identifier for a channel
 * @returns {boolean}
 */
export function isUserChannelOwner(uId: number, channelId: number): boolean {
  const data = getData();

  const channelObj = data.channelDetails.find(
    (channelObj) => channelObj.channelId === channelId
  );
  const user = channelObj.details.ownerMembers.find((user) => user.uId === uId);
  if (user === undefined) return false;
  else return true;
}

//  ///////////////////////// messageSendDm Helper functions /////////////////////////////  //

/**
 * Adds message to corresponding dmMessages
 *
 * @param {number} dmId - unique number that identifies the dm
 * @param {number} messageId - unique number that identifies the message
 */
export function addMessageToDmMessages(dmId: number, messageId: number) {
  const data = getData();
  // find the index of the object that matches the dmId which contains the dm's messages
  const dmMessageObjIndex = data.dmMessages.findIndex(
    (dmMessageObj) => dmMessageObj.dmId === dmId
  );

  // add messageId to dmMessages
  // The most recent message Id will appear in index 0
  data.dmMessages[dmMessageObjIndex].allMessageIds.unshift(messageId);
  setData(data);
}

/**
 * Checks if message being sent into dm has tags, and if it does stores the notification
 * for that tag
 *
 * @param {string} token - unique identifier for user session of user
 *  sending message with tag
 * @param {number} uId - unique identifier for user sending message with tag
 * @param  {string} message - message that contains the tag
 * @param {number} dmId - unique identifier for dm that the message belongs to
 *
 * @returns void - in all cases
 */
function checkForTagInDM(
  token: string,
  uId: number,
  message: string,
  dmId: number
) {
  const data = getData();
  if (message.includes('@')) {
    // check if the string includes the handleString of any
    // user(s) in this DM
    const dmDetailsObj = data.dmDetails.find(
      (dmDetailsObj) => dmDetailsObj.dmId === dmId
    );
    const dmMembers = dmDetailsObj.details.members;
    for (const member of dmMembers) {
      // This will only tag each included member once for this message
      // even if they have been tagged multiple times in the one message
      if (message.includes(`@${member.handleStr}`)) {
        const isValid = checkTagIsValid(member, message);
        if (isValid === true) {
          const tagNotif: notification = generateTagNotif(
            token,
            uId,
            -1,
            dmId,
            message
          );
          // uId of person being tagged
          storeNotif(member.uId, tagNotif);
        }
      }
    }
  }
}

/**
 * Checks if tag is valid by checking if the end of the handle is signified by
 * the end of the message, or a non-alphanumeric character.
 *
 * @param {object} member - the user whose handlestring is tagged
 * @param {string} message - the message containing the tag
 *
 * @returns {boolean} true - if tag is valid
 * @returns {boolean} false - if tag is invalid
 */
function checkTagIsValid(member: user, message: string): boolean {
  let isValid = false;
  // If the tag is at the end of the message
  if (message.endsWith(`@${member.handleStr}`)) {
    isValid = true;

    // Check if the character after is not alphanumeric
  } else {
    const indexOfTagStart = message.indexOf(`@${member.handleStr}`);
    // the last index of tax will be (the length of tag - 1) plus the start
    // index of the tag + 1 for the @ symbol
    const indexOfTagEnd = indexOfTagStart + member.handleStr.length;
    // Check if the character following the tag is not alphanumeric
    // only checks for lowercase letters
    if (/^[a-z0-9]+$/.test(message[indexOfTagEnd + 1]) === false) {
      isValid = true;
    }
  }
  return isValid;
}

/**
 * Will generate the notification object for a message tag
 *
 * @param {string} token - unique identifier for user session of who sends the tag message
 * @param {number} uId - unique identifier for user of user who sends the tag message
 * @param {number} channelId - unique identifier for channel that the message belongs to
 * @param {number} dmId - unique identifier for dm that the message belongs to
 *
 * @returns {object} tagNotif - in all cases
 */
function generateTagNotif(
  token: string,
  uId: number,
  channelId: number,
  dmId: number,
  message: string
): notification {
  const handleStr: string = userProfileV1(token, uId).user.handleStr;
  let notifMsg: string;
  // First 20 characters of message
  // The last index of an string with 20 chars will be 19. Slice will not include the end index.
  const first20CharMsg = message.slice(0, 20);
  if (dmId !== -1) {
    const dmName = dmDetailsV1(token, dmId).name;
    notifMsg = `${handleStr} tagged you in ${dmName}: ${first20CharMsg}`;
  } else if (channelId !== -1) {
    const chName = channelDetailsV1(token, channelId).name;
    notifMsg = `${handleStr} tagged you in ${chName}: ${first20CharMsg}`;
  }
  const tagNotif: notification = {
    // either channel or dmId will be -1 if message doesn't belong to one
    channelId: channelId,
    dmId: dmId,
    notificationMessage: notifMsg,
  };
  return tagNotif;
}

//  ///////////////////////// Send message Helper functions /////////////////////////////  //

/**
 * Checks if message being sent into dm has tags, and if it does stores the notification
 * for that tag
 *
 * @param {string} token - unique identifier for user session of user
 *  sending message with tag
 * @param {number} uId - unique identifier for user of user sending message with tag
 * @param  {string} message - message that contains the tag
 * @param {number} channelId - unique identifier for dm that the message belongs to
 *
 * @returns void - in all cases
 */
function checkForTagInCh(
  token: string,
  uId: number,
  message: string,
  channelId: number
) {
  const data = getData();
  if (message.includes('@')) {
    // check if the string includes the handleString of any
    // user(s) in this channel
    const chDetailsObj = data.channelDetails.find(
      (chDetailsObj) => chDetailsObj.channelId === channelId
    );
    const chMembers = chDetailsObj.details.allMembers;
    for (const member of chMembers) {
      // This will only tag each included member once for this message
      // even if they have been tagged multiple times in the one message
      if (message.includes(`@${member.handleStr}`)) {
        const isValid = checkTagIsValid(member, message);
        if (isValid === true) {
          const tagNotif: notification = generateTagNotif(
            token,
            uId,
            channelId,
            -1,
            message
          );
          // uId of person being tagged
          storeNotif(member.uId, tagNotif);
        }
      }
    }
  }
}

//  ///////////////////////// messageRemoveV1 Helper functions /////////////////////////////  //
/**
 * Gets channelId which contains the message.
 *
 * @param {number} messageId - unique identifier of a message
 *
 * @returns {number} channelId - Unique identifier for a channel
 */
function getChannelIdOfMessage(messageId: number): number {
  const data = getData();
  const channelIndex = data.channelMessages.findIndex((channel) =>
    channel.allMessageIds.includes(messageId)
  );

  // Channel found
  if (channelIndex !== -1) {
    return data.channelMessages[channelIndex].channelId;
  }

  return -1;
}

/**
 * Gets dmId which contains the message.
 *
 * @param {number} messageId - unique identifier of a message
 *
 * @returns {number} dmId - Unique identifier for a dm
 */
function getDmIdOfMessage(messageId: number): number {
  const data = getData();
  const dmIndex = data.dmMessages.findIndex((dm) =>
    dm.allMessageIds.includes(messageId)
  );

  // DM found
  if (dmIndex !== -1) {
    return data.dmMessages[dmIndex].dmId;
  }

  return -1;
}

/**
 * Checks if user is the sender of the message.
 *
 * @param {number} uId - unique identifier of a user
 * @param {number} messageId - unique identifier of a message
 *
 * @returns {boolean} true - if user is the message sender
 * @returns {boolean} false - if user is not the message sender
 */
function isUserMessageSender(uId: number, messageId: number): boolean {
  const data = getData();
  const messageObject = data.allMessages.find(
    (message) => message.messageId === messageId
  );

  // User ID matches with ID of sender
  if (messageObject.uId === uId) {
    return true;
  }

  return false;
}

/**
 * Removed message of specified messageId from specified channel.
 *
 * @param {number} messageId - unique identifier of a message
 * @param {number} channelId - the number which identifies the channel
 */
function removeChannelMessage(messageId: number, channelId: number) {
  const data = getData();
  const channelObject = data.channelMessages.find(
    (channel) => channel.channelId === channelId
  );
  const messageIndex = channelObject.allMessageIds.indexOf(messageId);
  channelObject.allMessageIds.splice(messageIndex, 1);
  setData(data);
}

/**
 * Removed message of specified messageId from specified dm.
 *
 * @param {number} messageId - unique identifier of a message
 * @param {number} dmId - the number which identifies the dm
 */
function removeDmMessage(messageId: number, dmId: number) {
  const data = getData();
  const dmObject = data.dmMessages.find((dm) => dm.dmId === dmId);
  const messageIndex = dmObject.allMessageIds.indexOf(messageId);
  dmObject.allMessageIds.splice(messageIndex, 1);
  setData(data);
}

/**
 * Removes message of specified messageId from allMessages array
 * in the data object.
 *
 * @param {number} messageId - the number which identifies the message object
 */
function removeAllMessagesMessage(messageId: number) {
  const data = getData();
  const messageIndex = data.allMessages.findIndex(
    (message) => message.messageId === messageId
  );
  data.allMessages.splice(messageIndex, 1);
  setData(data);
  updateWorkspaceStatsMessagesExists();
}

//  ///////////////////////// messageEditV1 Helper functions /////////////////////////////  //
/**
 * Replaces the content of the message with ID messageId,
 * with the new message string parameter.
 *
 * @param {number} messageId - the number which identifies the dm
 * @param {string} message - string that allows users to stay in a session
 */
function editMessage(messageId: number, message: string) {
  const data = getData();
  const messageObj = data.allMessages.find(
    (message) => message.messageId === messageId
  );
  messageObj.message = message;
  setData(data);
}

/**
 * Finds and returns a message's original sender
 *
 * @param {number} messageId - unique identifier for message
 *
 * @returns {number} uId - in all cases
 */
function findOriginalMsgSender(messageId: number): number {
  const data = getData();
  const msgObj = data.allMessages.find(
    (msgObj) => msgObj.messageId === messageId
  );
  return msgObj.uId;
}

//  ///////////////////////// messageReactV1 Helper functions /////////////////////////////  //

/**
 * Will generate the notification object for a message react
 *
 * @param {string} token - unique identifier for user session of user reacting to message
 * @param {number} uId - unique identifier for user of user reacting to message
 * @param {number} channelId - unique identifier for channel that the message belongs to
 * @param {number} dmId - unique identifier for dm that the message belongs to
 *
 * @returns {object} reactNotif - in all cases
 */
function generateReactNotif(
  token: string,
  uId: number,
  channelId: number,
  dmId: number
): notification {
  const handleStr: string = userProfileV1(token, uId).user.handleStr;
  let notifMsg: string;
  if (dmId !== -1) {
    const dmName = dmDetailsV1(token, dmId).name;
    notifMsg = `${handleStr} reacted to your message in ${dmName}`;
  } else if (channelId !== -1) {
    const chName = channelDetailsV1(token, channelId).name;
    notifMsg = `${handleStr} reacted to your message in ${chName}`;
  }
  const reactNotif: notification = {
    // either channel or dmId will be -1 if message doesn't belong to one
    channelId: channelId,
    dmId: dmId,
    notificationMessage: notifMsg,
  };
  return reactNotif;
}

/**
 * Checks if a given uId is still part of a channel or dm
 * Takes in a uId as opposed to a token that other similar helper functions use
 *
 * @param {number} uId - unique identifier for user
 * @param {number} channelId - unique identifier for channel
 * @param {number} dmId - unique identifier for DM
 *
 * @returns {boolean} true - if user is still a member
 * @returns {boolean} false - if user is not a member
 */
function isUserAMember(uId: number, channelId: number, dmId: number): boolean {
  const data = getData();
  let member: user;
  if (channelId !== -1) {
    const channelDetailsObj = data.channelDetails.find(
      (chDetailsObj) => chDetailsObj.channelId === channelId
    );
    member = channelDetailsObj.details.allMembers.find(
      (member) => member.uId === uId
    );
  } else if (dmId !== -1) {
    const dmDetailsObj = data.dmDetails.find(
      (dmDetailsObj) => dmDetailsObj.dmId === dmId
    );
    member = dmDetailsObj.details.members.find((member) => member.uId === uId);
  }
  if (member !== undefined) {
    return true;
  } else {
    return false;
  }
}
