import { getUserId } from './Helpers/getUserId';
import { channelsListV1 } from './channels';
import { message, channel, messageReturn } from './dataStore';
import HttpError from 'http-errors';
import { dmListV1 } from './dm';
import { channelMessagesV1 } from './channel';
import { dmMessagesV1 } from './dm';
import { doIsUserReacted } from './Helpers/messagesHelper';

/**
 * Returns a collection of messages in all of the channels/DMs that the user has joined
 * that contain the given parameter: queryStr (case-insensitive).
 *
 * @param {string} token - unique identifier for an active session.
 * @param {string} queryStr - string used to search for matching messages.
 *
 * @returns {messages: message[]} - if the query is successful.
 * Throw http error - in all the following cases:
 *      Invalid token
 *      Invalid queryStr length
 */
export function searchV1(token: string, queryStr: string): {messages: message[]} {
  // Attempts to retrieve a userId that corresponds to the token parameter.
  const tokenUserId = getUserId(token);
  if (tokenUserId === -1) {
    throw HttpError(403, 'Invalid token');
  }
  if (queryStr.length < 1 || queryStr.length > 1000) {
    throw HttpError(400, 'Invalid queryStr length');
  }

  const channelsList: channel[] = channelsListV1(token).channels;
  const channelIdList: number[] = channelsList.map(ch => ch.channelId);

  const dmsList = dmListV1(token).dms;
  const dmIdList: number[] = dmsList.map(dm => dm.dmId);

  const msgObjList: message[] = getMessagesFromChannelsAndDms(token, channelIdList, dmIdList);

  // Only keeps the messages that contains the queryStr.
  const queryMsgObjList = [];
  for (const msgObj of msgObjList) {
    if (msgObj.message.toLowerCase().includes(queryStr.toLowerCase())) {
      queryMsgObjList.push(msgObj);
    }
  }

  // Gets isUserReacted for each of the messages that contain the queryStr.
  const messagesReturnArray: messageReturn[] = [];
  for (const message of queryMsgObjList) {
    const messageReturnObj: messageReturn = {
      messageId: message.messageId,
      uId: message.uId,
      message: message.message,
      timeSent: message.timeSent,
      reacts: doIsUserReacted(tokenUserId, message.reacts),
      isPinned: message.isPinned
    };

    messagesReturnArray.push(messageReturnObj);
  }

  return { messages: queryMsgObjList };
}

/**
 * Given a list of channelIds and dmIds, returns an array of message objects for
 * all messages in the given channels and dms.
 *
 * @param {string} token - unique identifier for an active session.
 * @param {number[] | undefined} channelIdList - List of channelIds.
 * @param {number[] | undefined} dmIdList - List of dmIds.
 *
 * @returns {message[]} msgObjList - an array of objects of type: message
 */
function getMessagesFromChannelsAndDms(token: string, channelIdList: number[] | undefined,
  dmIdList: number[] | undefined): message[] {
  let msgObjList: message[] = [];
  if (channelIdList !== undefined) {
    // For each channel, get all messages.
    for (const channelId of channelIdList) {
      let start = 0;
      let end = 0;
      while (end !== -1) {
        const channelMessages = channelMessagesV1(token, channelId, start);
        start += 50;
        end = channelMessages.end;
        msgObjList = msgObjList.concat(channelMessages.messages);
      }
    }
  }

  if (dmIdList !== undefined) {
    // For each dm, get all messages.
    for (const dmId of dmIdList) {
      let start = 0;
      let end = 0;
      while (end !== -1) {
        const dmMessages = dmMessagesV1(token, dmId, start);
        start += 50;
        end = dmMessages.end;
        msgObjList = msgObjList.concat(dmMessages.messages);
      }
    }
  }

  return msgObjList;
}
