import { getData, setData, message, react, reactReturn } from '../dataStore';

/**
 * From the data object, retrieves messages with messageIds corresponding to
 * elements [start, start + 50] in the given array msgIdArray. Assumes that
 * start is less than the length of the given array.
 *
 * @param {number[]} msgIdArray - array of message Ids
 * @param {number} start - Index for the starting message
 *
 * @returns {message[]} messageObjArray - In all cases.
 */
export function getMessagesSubarray(msgIdArray: number[], start: number): message[] {
  const slicedMessageIds = msgIdArray.slice(start, start + 50);
  const data = getData();

  const messageObjArray : message[] = [];
  for (const msgId of slicedMessageIds) {
    const currMsgObj = data.allMessages.find(msgObj => msgObj.messageId === msgId);
    messageObjArray.push(currMsgObj);
  }

  return messageObjArray;
}

/**
 * Given a uId and an array of reactions for a message, for each reaction,
 * finds whether the given uId is in the array of uIds in that reaction.
 *
 * @param {number} uId - Unique identifier for a user
 * @param {react[]} reactArray - Array of objects of type: react
 *
 * @returns {reactReturn[]} - In all cases.
 */
export function doIsUserReacted(uId: number, reactArray: react[]): reactReturn[] {
  const reactReturnArray: reactReturn[] = [];
  for (const currReact of reactArray) {
    if (currReact.uIds.includes(uId)) {
      reactReturnArray.push(
        {
          reactId: currReact.reactId,
          uIds: currReact.uIds,
          isThisUserReacted: true
        }
      );
    } else {
      reactReturnArray.push(
        {
          reactId: currReact.reactId,
          uIds: currReact.uIds,
          isThisUserReacted: false
        }
      );
    }
  }

  return reactReturnArray;
}

/**
 * Generates the 'end' number which will indicate if there are more
 * messages to load or not
 *
 * @param {number} start - starting message index for messages displayed
 * @param {number[]} dmMsgIdArray - array of the 50 message Ids that will
 * be displayed inside this dm
 * @param {number} dmIndex - index of dmObject in dmMessages (refer to dataStore)
 *
 * @returns {number} end - in all cases
 */
export function generateEnd(start: number, dmMsgIdArray: number[]
): number {
  let end;
  // This function is called before dmMsgIdArray is sliced off, so dmMsgIdArray
  // length will be the length of all the messages in dm not just the page's 50

  // If the index of the last message on the page (start + 49) is more than the
  // index of the last message in the dm, then there are no more messages
  if (start + 49 >= dmMsgIdArray.length - 1) {
    end = -1;
  } else {
    end = start + 50;
  }
  return end;
}

/**
 * Function that searches the database to verify if the given messageId exists
 * @param {number} messageId
 * @returns {boolean} true - if messages exists
 * @returns {boolean} false - if messages does not exists
 */
export function doesMessageExist(messageId: number): boolean {
  const data = getData();
  const messageObj = data.allMessages.find(
    (messageObj) => messageObj.messageId === messageId
  );
  if (messageObj === undefined) {
    return false;
  }
  return true;
}

/**
 * Adds message to all messages array in the dataStore
 *
 * @param {number} messageId - unique number that identifies the message
 * @param {number} uId - unqiue number that identifies the user
 * @param {string} message - string of what the message contains
 */
export function addMessageToAllMessages(
  messageId: number,
  uId: number,
  message: string
) {
  const data = getData();
  const timeSentInSec = Math.floor(Date.now() / 1000);
  // Unshift so that the most recent message is in index 0
  data.allMessages.unshift({
    messageId: messageId,
    uId: uId,
    message: message,
    timeSent: timeSentInSec,
    reacts: [],
    isPinned: false
  });

  setData(data);
}

/**
 * Generates a unique message Id
 *
 * @returns {number} messageId - in all cases
 */
export function generateMessageId(): number {
  const data = getData();
  const messageId = data.messageIdCounter;
  data.messageIdCounter++;
  setData(data);
  return messageId;
}
