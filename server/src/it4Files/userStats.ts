import { getData, userStatsReturn, workspaceStats } from '../dataStore';
import { getUserId } from '../Helpers/getUserId';
import { isTokenInvalid } from '../Helpers/tokenHelper';
import HttpError from 'http-errors';

/**
 * Fetches the required statistics about this workspace's use of UNSW Memes.
 *
 * @param {string} token - unique identifier for the user's session
 * @returns {object} {userStats} - on success
 * Throws http error when token is invalid
 */
export function usersStatsV1(token: string): { workspaceStats: workspaceStats } {
  if (isTokenInvalid(token) === true) {
    throw HttpError(403, 'Token is invalid');
  }

  const data = getData();

  // Calculate utilizationRate
  const numUsersWhoHaveJoinedAtLeastOneChannelOrDm = data.workspaceStats.usersWhoHaveJoinedAChannelOrDm.length;
  const numUsers = data.users.length;
  const utilizationRate = numUsersWhoHaveJoinedAtLeastOneChannelOrDm / numUsers;

  // data.workspaceStats.channelsExist

  return {
    workspaceStats: {
      channelsExist: data.workspaceStats.channelsExist,
      dmsExist: data.workspaceStats.dmsExist,
      messagesExist: data.workspaceStats.messagesExist,
      utilizationRate: utilizationRate
    }
  };
}

/**
 * Fetches the required statistics about this user's use of UNSW Memes.
 *
 * @param {string} token - unique identifier for the user's session
 * @returns {object} {userStats} - on success
 * Throws http error when token is invalid
 */
export function userStatsV1(token: string): { userStats: userStatsReturn} {
  if (isTokenInvalid(token) === true) {
    throw HttpError(403, 'Token is invalid');
  }

  const data = getData();

  // Find user stats object that corresponds with token
  const uId = getUserId(token);
  const userStatObj = data.userStats.find(userStatsObj => userStatsObj.uId === uId);
  const numChannels = data.channels.length;
  const numDms = data.dms.length;
  const numMsgs = data.allMessages.length;

  let involvementRate;
  if (numChannels + numDms + numMsgs === 0) {
    involvementRate = 0;
  } else {
    involvementRate = (
      userStatObj.numChannelsJoined +
      userStatObj.numDmsJoined +
      userStatObj.numMessagesSent
    ) / (
      numChannels + numDms + numMsgs
    );

    // Cap involvement rate at 1
    if (involvementRate > 1) {
      involvementRate = 1;
    }
  }

  return {
    userStats: {
      channelsJoined: userStatObj.channelsJoinedStats,
      dmsJoined: userStatObj.dmsJoinedStats,
      messagesSent: userStatObj.messagesSentStats,
      involvementRate: involvementRate
    }
  };
}
