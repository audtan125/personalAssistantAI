import {
  channelDetailObjects,
  getData,
  setData,
  channel,
} from './dataStore';
import { userProfileV1 } from './users';
import { isTokenInvalid } from './Helpers/tokenHelper';
import { getUserId } from './Helpers/getUserId';
import HttpError from 'http-errors';
import { checkToAddIdToUsersWhoHaveJoinedAChannelOrDm, updateUserStatsNumChsJoined } from './it4Files/statsHelper';

/**
 * Creates a channel that is either public or private and assigns a name and
 * adds the user who created it to the channel as the owner
 *
 * @param {string} token - String that identifies a user
 * @param {string} name - The name that the channel should be called
 * @param {boolean} isPublic - Public or private status of the channel
 *
 * @returns {integer} {channelId} - An integer identifier for channels
 * http exceptions thrown:
 * 403 Error when:
 * invalid token
 * 400 Error when:
 * length of name is less than 1 or more than 20 characters
 */
export function channelsCreateV1(
  token: string,
  name: string,
  isPublic: boolean
): { channelId: number } {
  const data = getData();
  if (isTokenInvalid(token)) {
    throw HttpError(403, 'Invalid token');
  }
  if (name.length < 1 || name.length > 20) {
    throw HttpError(400, 'Invalid name');
  }
  // Array only containing the user matching the token
  const userArray = data.tokens.filter((obj) => obj.token === token);
  const userObj = userArray[0];

  const newChannelId = data.channelDetails.length + 1;

  // Since it is confirmed that the user exists, userProfileV1 will
  // not return an error.
  // Use token in data store and get uid from there
  const userReturn = userProfileV1(userObj.token, userObj.uId);

  if ('user' in userReturn) {
    const newChannel: channelDetailObjects = {
      channelId: newChannelId,
      details: {
        name: name,
        isPublic: isPublic,
        ownerMembers: [userReturn.user],
        allMembers: [userReturn.user],
      },
    };
    data.channelDetails.push(newChannel);
    data.channels.push({ channelId: newChannelId, name: name });
    data.channelMessages.push({ channelId: newChannelId, allMessageIds: [] });
    data.standups.push(
      {
        creatorId: -1,
        channelId: newChannelId,
        isActive: false,
        timeFinish: null,
        standupDetails: []
      }
    );

    // Update stats
    data.workspaceStats.channelsExist.push(
      { numChannelsExist: data.channels.length, timeStamp: Date.now() / 1000 }
    );
    checkToAddIdToUsersWhoHaveJoinedAChannelOrDm(userObj.uId);
    updateUserStatsNumChsJoined(userObj.uId, true);
  }
  setData(data);
  return { channelId: newChannelId };
}

/**
 * Provides an array of all channels (and their associated details) that
 * the authorised user is part of.
 *
 * @param {string} token - String that identifies a user
 *
 * @returns {object} {channels} - if authUserId is valid
 * http exceptions thrown:
 * 403 Error when:
 * invalid token
 */
export function channelsListV1(
  token: string
): { channels: Array<channel> } {
  const data = getData();
  const joinedChannelDetails = [];
  const userJoinedChannels = [];

  if (isTokenInvalid(token)) throw HttpError(403, 'Invalid token');
  const authUserId = getUserId(token);

  // Access allMembers array and if authUserId is part of channel then
  // add to the new joined channels array
  for (const details of data.channelDetails) {
    for (const members of details.details.allMembers) {
      if (members.uId === authUserId) joinedChannelDetails.push(details);
    }
  }

  // using the joined channels array, make a new array that matches channelId
  // to the channels array (different from channelDetails)
  for (const joinedChannel of joinedChannelDetails) {
    for (const allChannels of data.channels) {
      if (allChannels.channelId === joinedChannel.channelId) {
        userJoinedChannels.push(allChannels);
      }
    }
  }
  return { channels: userJoinedChannels };
}

/**
 * Lists all the channels that exist in the database, including private
 * channels
 *
 * @param {string} token - String that identifies a user
 *
 * @returns {object} {channels} - Object containing array of all channels
 * http exceptions thrown:
 * 403 Error when:
 * invalid token
 */
export function channelsListAllV1(
  token: string
): { channels: Array<channel> } {
  if (isTokenInvalid(token)) throw HttpError(403, 'Invalid token');
  const data = getData();

  return { channels: data.channels };
}
