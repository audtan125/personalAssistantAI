import { getData } from '../dataStore';

/**
 * Given a user with ID authUserId and a channel with ID channelId,
 * checks whether the user a member of the channel.
 *
 * @param {integer} authUserId - unique identifier for an authorised user.
 * @param {integer} channelId - unique identifier for a channel.
 *
 * @returns {boolean} true - If the user is a member of the channel.
 * @returns {boolean} false - If the user cannot be found in the channel members list.
 */
export function isUserInChannel(authUserId: number, channelId: number): boolean {
  const data = getData();
  const channelMembers = data.channelDetails.find(
    channel => channel.channelId === channelId
  ).details.allMembers;
  const userIndex = channelMembers.findIndex(user => user.uId === authUserId);

  if (userIndex === -1) {
    return false;
  }

  return true;
}

/**
 * Given a channel with ID channelId, checks whether that channel exists.
 *
 * @param {number} channelId - unique identifier for a channel.
 *
 * @returns {boolean} true - If the channel exists in the data object.
 * @returns {boolean} false - If the channel cannot be found in the data object.
 */
export function checkChannelExists(channelId: number): boolean {
  const data = getData();
  const channelIndex = data.channels.findIndex(channel => channel.channelId === channelId);

  if (channelIndex !== -1) {
    return true;
  }

  return false;
}
