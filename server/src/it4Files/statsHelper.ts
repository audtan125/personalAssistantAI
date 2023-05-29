import { getData, setData } from '../dataStore';

// Helpers for users stats //

/**
 * Function checks if user is not already part of a channel or dm, if they
 * are not then will store their user id in an array in the data store
 *
 * @param {number} uId - unique identifier for user
 */
export function checkToAddIdToUsersWhoHaveJoinedAChannelOrDm(uId: number) {
  const data = getData();
  if (!data.workspaceStats.usersWhoHaveJoinedAChannelOrDm.includes(uId)) {
    data.workspaceStats.usersWhoHaveJoinedAChannelOrDm.push(uId);
  }
  setData(data);
}

/**
 * Function adds data point to the number of messages that exists
 * Typically called when messages have been updated
 */
export function updateWorkspaceStatsMessagesExists() {
  const data = getData();
  data.workspaceStats.messagesExist.push(
    { numMessagesExist: data.allMessages.length, timeStamp: Date.now() / 1000 }
  );
  setData(data);
}

/**
 * Function adds data point to number of dms that exists in workspace stats
 */
export function updateWorkSpaceStatsDmsExists() {
  const data = getData();
  data.workspaceStats.dmsExist.push(
    { numDmsExist: data.dms.length, timeStamp: Date.now() / 1000 }
  );
  setData(data);
}

/**
 * Function checks if user should be removed from the number of users in a channel
 * or dm
 * Called after they have left a channel or dm or dm is removed
 *
 * @param {number} uId - unique identifier for user
 */
export function workspaceStatsCheckToRemoveNumUsersInChOrDm(uId: number) {
  const data = getData();
  const userStatsObj = data.userStats.find(userStatsObj => userStatsObj.uId === uId);
  if (
    userStatsObj.numDmsJoined === 0 &&
    userStatsObj.numChannelsJoined === 0
  ) {
    const uIdIndex = data.workspaceStats.usersWhoHaveJoinedAChannelOrDm.findIndex(
      storedUid => storedUid === uId);
    data.workspaceStats.usersWhoHaveJoinedAChannelOrDm.splice(uIdIndex, 1);
  }
}

// Helpers for user stats //

/**
 * Function increases the number of messages sent by user in user stats
 *
 * @param {number} uId - unique identifier for user
 */
export function updateUserStatsIncreaseMsgsSent(uId: number) {
  const data = getData();
  const userStatsObj = data.userStats.find(userStatsObj => userStatsObj.uId === uId);
  userStatsObj.numMessagesSent++;
  userStatsObj.messagesSentStats.push(
    { numMessagesSent: userStatsObj.numMessagesSent, timeStamp: Date.now() / 1000 }
  );
  setData(data);
}

/**
 * Function updates the number of dms the user has joined
 *
 * @param {number} uId - unique identifier for the user who has joined, left or been removed from dm
 * @param {boolean} increase - whether to increase the number of dms joined or decrease it
 */
export function updateUserStatsNumDmsJoined(uId: number, increase: boolean) {
  const data = getData();
  const userStatsObj = data.userStats.find(userStatsObj => userStatsObj.uId === uId);

  if (increase === true) {
    userStatsObj.numDmsJoined++;
  } else {
    userStatsObj.numDmsJoined--;
  }

  userStatsObj.dmsJoinedStats.push(
    { numDmsJoined: userStatsObj.numDmsJoined, timeStamp: Date.now() / 1000 }
  );
  setData(data);
}

/**
 * Function updates the number of channels the user has joined
 *
 * @param {number} uId - unique identifier for the user who has joined, left or been removed
 * @param {boolean} increase - whether to increase the number of channels joined or decrease it
 */
export function updateUserStatsNumChsJoined(uId: number, increase: boolean) {
  const data = getData();
  const userStatsObj = data.userStats.find(userStatsObj => userStatsObj.uId === uId);

  if (increase === true) {
    userStatsObj.numChannelsJoined++;
  } else {
    userStatsObj.numChannelsJoined--;
  }

  userStatsObj.channelsJoinedStats.push(
    { numChannelsJoined: userStatsObj.numChannelsJoined, timeStamp: Date.now() / 1000 }
  );
}
