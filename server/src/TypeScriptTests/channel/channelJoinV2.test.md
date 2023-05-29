import {
  requestSuccessfulChannelDetails,
  requestSuccessfulChannelJoin, requestErrorChannelJoin
} from '../../Helpers/requests/requestChannelHelper';
import { requestSuccessfulAuthRegister } from '../../Helpers/requests/requestAuthHelper';
import { requestSuccessfulChannelsCreate } from '../../Helpers/requests/requestChannelsHelper';
import { requestClear } from '../../Helpers/requests/requestOtherHelper';
import { requestSuccessfulUserProfile } from '../../Helpers/requests/requestUserHelper';

const ERROR = 400;
const TOKEN_ERROR = 403;

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

describe('Success Join Channel', () => {
  /*
  test('The return data must be empty.', () => {
    const firstUser = requestSuccessfulAuthRegister('emailer@gmail.com', 'password', 'Test', 'User');
    const secondUser = requestSuccessfulAuthRegister('sadman@gmail.com', 'password123', 'Lonely', 'Man');

    const channelId = requestSuccessfulChannelsCreate(firstUser.token, 'New Test Channel', true).channelId;

    const channelJoin = requestSuccessfulChannelJoin(secondUser.token, channelId);
    expect(channelJoin).toStrictEqual({});
  });
  */

  test('User is (only) added to the correct channel', () => {
    const firstUser = requestSuccessfulAuthRegister('firstuser@gmail.com', '123456789', 'First', 'User');
    const ch1 = requestSuccessfulChannelsCreate(firstUser.token, 'ch1', false).channelId;
    const secondUser = requestSuccessfulAuthRegister('seconduser@gmail.com', '987654321', 'Second', 'User');

    const ch2 = requestSuccessfulChannelsCreate(firstUser.token, 'ch2', true).channelId;
    const ch3 = requestSuccessfulChannelsCreate(firstUser.token, 'ch3', false).channelId;
    const ch4 = requestSuccessfulChannelsCreate(firstUser.token, 'ch4', true).channelId;

    // List of all channel IDs
    const channels = [ch1, ch2, ch3, ch4];

    const channelJoinReturn = requestSuccessfulChannelJoin(secondUser.token, ch2);
    expect(channelJoinReturn).toStrictEqual({});

    const userProfile = requestSuccessfulUserProfile(firstUser.token, secondUser.authUserId).user;
    // Check contents of ownerMembers and allMembers for all channels created
    for (const ch of channels) {
      const chDetails = requestSuccessfulChannelDetails(firstUser.token, ch);
      // User should only exist in allMembers of this channel
      if (ch === ch2) {
        expect(chDetails.ownerMembers).not.toContainEqual(userProfile);
        expect(chDetails.allMembers).toContainEqual(userProfile);
      } else {
        // Unspecified channels
        expect(chDetails.ownerMembers).not.toContainEqual(userProfile);
        expect(chDetails.allMembers).not.toContainEqual(userProfile);
      }
    }
  });

  test('Test where the global owner (firstUser) can join a private channel.', () => {
    const firstUser = requestSuccessfulAuthRegister('emailer@gmail.com', 'password', 'Test', 'User');
    const secondUser = requestSuccessfulAuthRegister('sadman@gmail.com', 'password123', 'Lonely', 'Man');

    const channelId = requestSuccessfulChannelsCreate(secondUser.token, 'New Test Channel', false).channelId;

    const userProfile = requestSuccessfulUserProfile(firstUser.token, firstUser.authUserId).user;

    const channelJoin = requestSuccessfulChannelJoin(firstUser.token, channelId);
    const channelDetails = requestSuccessfulChannelDetails(firstUser.token, channelId);

    expect(channelJoin).toStrictEqual({});
    expect(channelDetails.allMembers).toContainEqual(userProfile);
    expect(channelDetails.ownerMembers).not.toContainEqual(userProfile);
  });
});

describe('Error return', () => {
  test('Invalid token.', () => {
    const firstUser = requestSuccessfulAuthRegister('emailer@gmail.com', 'password', 'Test', 'User');
    const channelId = requestSuccessfulChannelsCreate(firstUser.token, 'New Test Channel', true).channelId;

    // Checks if joining channel returns a valid error
    // return value when given a non-existent token.
    const channelJoin = requestErrorChannelJoin(firstUser.token + 'RANDOM', channelId);
    expect(channelJoin).toStrictEqual(TOKEN_ERROR);
  });

  test('Invalid channel ID.', () => {
    const firstUser = requestSuccessfulAuthRegister('emailer@gmail.com', 'password', 'Test', 'User');
    const newChannelId = requestSuccessfulChannelsCreate(firstUser.token, 'New Test Channel', true).channelId;

    // Checks if joining channel returns a valid error
    // return value when given a non-existent channel id, newChannelId + 1.
    const channelJoin = requestErrorChannelJoin(firstUser.token, newChannelId + 1);
    expect(channelJoin).toStrictEqual(ERROR);
  });

  test('Test where the user is already a member of the requested channel.', () => {
    const firstUser = requestSuccessfulAuthRegister('emailer@gmail.com', 'password', 'Test', 'User');
    const secondUser = requestSuccessfulAuthRegister('sadman@gmail.com', 'password123', 'Lonely', 'Man');

    const channelId = requestSuccessfulChannelsCreate(firstUser.token, 'New Test Channel', true).channelId;

    requestSuccessfulChannelJoin(secondUser.token, channelId);

    // The second user tries to join the channel again.
    const channelJoin = requestErrorChannelJoin(secondUser.token, channelId);
    expect(channelJoin).toStrictEqual(ERROR);
  });

  test('Test where a non-global owner should not be able to join a private channel.', () => {
    const firstUser = requestSuccessfulAuthRegister('emailer@gmail.com', 'password', 'Test', 'User');
    const secondUser = requestSuccessfulAuthRegister('sadman@gmail.com', 'password123', 'Lonely', 'Man');

    const channelId = requestSuccessfulChannelsCreate(firstUser.token, 'New Test Channel', false).channelId;

    const channelJoin = requestErrorChannelJoin(secondUser.token, channelId);
    expect(channelJoin).toStrictEqual(TOKEN_ERROR);
  });
});
