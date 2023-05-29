import { getData, setData, standupChannelObject } from './dataStore';
import { checkChannelExists, isUserInChannel } from './Helpers/channelHelpers';
import { saveToFile } from './save';
import HttpError from 'http-errors';
import { isTokenInvalid } from './Helpers/tokenHelper';
import { getUserId } from './Helpers/getUserId';
import { addMessageToAllMessages, generateMessageId } from './Helpers/messagesHelper';
import { updateUserStatsIncreaseMsgsSent, updateWorkspaceStatsMessagesExists } from './it4Files/statsHelper';

/**
 * Starts standup for a channel. Sends a standup summary message
 * at the end of standup if standups were sent in from the user
 * who started the standup.
 *
 * @param {string} token - hashed string that identifies session
 * @param {number} channelId - unique identifier for channel
 * @param {number} length - number in seconds that standup will last for
 *
 * @returns {object} { timeFinish: number } - when successful
 * 400 Error when any of:
 * channelId does not refer to a valid channel
 * length is a negative integer
 * an active standup is currently running in the channel
 * 403 Error when:
 * channelId is valid and the authorised user is not a member of the channel
 * token is invalid
 */
export function standupStartV1(
  token: string, channelId: number, length: number
): { timeFinish: number } {
  // timeFinish in seconds
  const timeFinish = Math.floor((Date.now() / 1000) + length);
  const data = getData();

  if (isTokenInvalid(token)) {
    throw HttpError(403, 'Token is invalid');
  }

  if (!checkChannelExists(channelId)) {
    throw HttpError(400, 'ChannelId is invalid');
  }

  const uId = getUserId(token);
  if (!isUserInChannel(uId, channelId)) {
    throw HttpError(403, 'User is not a member of this channel!');
  }

  if (length < 0) {
    throw HttpError(400, 'length can not be a negative integer');
  }

  // This standup channel object is created when channel is first created
  // so will always be found
  const standupChannelObjIndex = data.standups.find(standupChannelObject =>
    standupChannelObject.channelId === channelId);
  if (standupChannelObjIndex.isActive === true) {
    throw HttpError(400, 'active standup already running');
  }

  const standupChannelObject = data.standups.find(standupChannelObject =>
    standupChannelObject.channelId === channelId);

  standupChannelObject.creatorId = uId;
  standupChannelObject.timeFinish = timeFinish;
  standupChannelObject.isActive = true;
  setData(data);
  saveToFile();

  setTimeout(() => {
    sendStandUpSummary(uId, channelId, standupChannelObject);
  }, length * 1000);

  return { timeFinish: timeFinish };
}

/**
 * Sends standup summary message by calling messageSend
 * with all buffered messages from standup/send during the active
 * standup length window.
 * Will also reset details of standupChannelObject in dataStore
 *
 * @param {number} uId - unique identifier for user
 * @param {number} channelId - unique identifier for channel
 * @param {object} standupChannelObject - the object in data store
 * containing information about the standup for the corresponding
 * channel
 *
 * @returns void
 */
function sendStandUpSummary(
  uId: number, channelId: number,
  standupChannelObject: standupChannelObject
) {
  const data = getData();

  // Reset standup object for this channel
  standupChannelObject.creatorId = -1;
  standupChannelObject.timeFinish = null;
  standupChannelObject.isActive = false;
  setData(data);
  saveToFile();

  // If there are no standups stored for this channel
  if (standupChannelObject.standupDetails.length === 0) {
    // Don't send any message
    return;
  }

  const standupSummary = generateStandupSummaryMsg(standupChannelObject);

  // remove all standup messages in dataStore
  standupChannelObject.standupDetails = [];

  const messageId: number = generateMessageId();
  addMessageToAllMessages(messageId, uId, standupSummary);

  const ChannelMessagesObjIndex = data.channelMessages.findIndex(
    (channelMessageObj) => channelMessageObj.channelId === channelId
  );

  data.channelMessages[ChannelMessagesObjIndex].allMessageIds.unshift(
    messageId
  );
  setData(data);

  updateWorkspaceStatsMessagesExists();
  updateUserStatsIncreaseMsgsSent(uId);
}

/**
 *  Creates a standup summary based on the standup channel and returns it
 *
 * @param {object} standupChannelObject - the object in data store
 * containing information about the standup for the corresponding
 * @returns {string} - the summary of the standup
 */

function generateStandupSummaryMsg(standupChannelObject: standupChannelObject): string {
  let standupSummary = '';
  // for the last standup message assume no new line should be added on to the end
  let count = 0;
  const lastIndex = standupChannelObject.standupDetails.length - 1;
  for (const standupObject of standupChannelObject.standupDetails) {
    standupSummary += `${standupObject.userHandle}: ${standupObject.standupMsg}`;
    if (count !== lastIndex) {
      standupSummary += '\n';
    }
    count++;
  }
  return standupSummary;
}

/**
 * For a given channel, returns whether a standup is active in it, and what
 * time the standup finishes. If no standup is active, then timeFinish should be null.
 *
 * @param {string} token - unique identifier for user's session
 * @param {number} channelId - unique identifier for channel
 *
 * @returns {object} { isActive: boolean, timeFinish: number } - when successful
 * 400 Error when:
 * channelId does not refer to a valid channel
 * 403 Error when:
 * channelId is valid and the authorised user is not a member of the channel
 * token is invalid
 */
export function standupActiveV1(
  token: string, channelId: number
): { isActive: boolean, timeFinish: number } {
  if (isTokenInvalid(token)) {
    throw HttpError(403, 'Token is invalid');
  }

  if (checkChannelExists(channelId) === false) {
    throw HttpError(400, 'ChannelId is invalid');
  }

  const uId = getUserId(token);
  if (!isUserInChannel(uId, channelId)) {
    throw HttpError(403, 'User is not a member of this channel!');
  }

  const data = getData();
  const standupChannelObject = data.standups.find(standupChannelObject =>
    standupChannelObject.channelId === channelId);

  return {
    isActive: standupChannelObject.isActive,
    timeFinish: standupChannelObject.timeFinish
  };
}

/**
 * For a given channel, if a standup is currently active in the channel,
 * sends a message to get buffered in the standup queue.
 * Note: @ tags should not be parsed as proper tags (i.e. no notification
 * should be triggered on send, or when the standup finishes)
 *
 * @param {string} token - unique identifier for session
 * @param {number} channelId - unqiue identifier for channel
 * @param {string} message - standup message being send
 *
 * @returns {object} {} - when successful
 * 400 Error when any of:
 * channelId does not refer to a valid channel
 * length of message is over 1000 characters
 * an active standup is not currently running in the channel
 * 403 Error when:
 * channelId is valid and the authorised user is not a member of the channel
 * token is invalid
 */
export function standupSendV1(
  token: string, channelId: number, message: string
): Record<string, never> {
  if (isTokenInvalid(token)) {
    throw HttpError(403, 'Token is invalid');
  }

  if (message.length > 1000) {
    throw HttpError(400, 'Message is too long');
  }

  if (checkChannelExists(channelId) === false) {
    throw HttpError(400, 'ChannelId is invalid');
  }

  const uId = getUserId(token);
  if (!isUserInChannel(uId, channelId)) {
    throw HttpError(403, 'User is not a member of this channel!');
  }

  const data = getData();
  const standupChannelObject = data.standups.find(standupChannelObject =>
    standupChannelObject.channelId === channelId);
  if (standupChannelObject.isActive === false) {
    throw HttpError(400, 'No active standup');
  }

  sendStandupMessage(uId, channelId, message, standupChannelObject);

  return {};
}

/**
 * Stores standup message in the dataStore
 *
 * @param {string} token - unique identifier for user session
 * @param {number} channelId - unique identifier for channel
 * @param {string} message - standup message to be sent
 * @param {standupChannelobject} standupChannelObject - the object in data store
 * containing information about the standup for the corresponding
 * channel
 *
 * @returns void
 */
function sendStandupMessage(
  uId: number, channelId: number, message: string,
  standupChannelObject: standupChannelObject
) {
  const data = getData();
  // find handleString
  const user = data.users.find(user => user.uId === uId);
  const handleString = user.handleStr;

  standupChannelObject.standupDetails.push(
    {
      userHandle: handleString,
      standupMsg: message
    }
  );
  setData(data);
  saveToFile();
}
