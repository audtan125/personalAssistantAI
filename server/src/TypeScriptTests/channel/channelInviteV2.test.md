import {
  requestSuccessfulChannelDetails, requestSuccessfulChannelInvite,
  requestErrorChannelInvite
} from '../../Helpers/requests/requestChannelHelper';
import { requestSuccessfulAuthRegister } from '../../Helpers/requests/requestAuthHelper';
import { requestSuccessfulChannelsCreate } from '../../Helpers/requests/requestChannelsHelper';
import { requestSuccessfulUserProfile } from '../../Helpers/requests/requestUserHelper';
import { requestClear } from '../../Helpers/requests/requestOtherHelper';

const ERROR = 400;
const TOKEN_ERROR = 403;

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

describe('Success user added to channel', () => {
  // Valid input: Main functionality test
  // Channel owner invites an invitee to the channel.
  // Invitee must be in allMembers and NOT ownerMembers.
  // Invitee must only exist in channel specified by invite.
  test('Test presence of invitee in channels NOT specified by invite', () => {
    const firstUser = requestSuccessfulAuthRegister('firstuser@gmail.com', '123456789', 'First', 'User');
    const ch1 = requestSuccessfulChannelsCreate(firstUser.token, 'ch1', false).channelId;
    const UserId = requestSuccessfulAuthRegister('seconduser@gmail.com', '987654321', 'Second', 'User').authUserId;

    const ch2 = requestSuccessfulChannelsCreate(firstUser.token, 'ch2', true).channelId;
    const ch3 = requestSuccessfulChannelsCreate(firstUser.token, 'ch3', false).channelId;
    const ch4 = requestSuccessfulChannelsCreate(firstUser.token, 'ch4', true).channelId;

    // List of all channel IDs
    const channels = [ch1, ch2, ch3, ch4];

    const channelInvite = requestSuccessfulChannelInvite(firstUser.token, ch2, UserId);
    expect(channelInvite).toStrictEqual({});

    const userProfile = requestSuccessfulUserProfile(firstUser.token, UserId).user;
    // Check contents of ownerMembers and allMembers for all channels created
    for (const ch of channels) {
      const chDetails = requestSuccessfulChannelDetails(firstUser.token, ch);
      // Invitee should only exist in allMembers of this channel
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

  /*
  test('First user (Channel owner) invites a second user who invites a third user.', () => {
    const firstUser = requestSuccessfulAuthRegister('firstuser@gmail.com', '123456789', 'First', 'User');
    const ch1 = requestSuccessfulChannelsCreate(firstUser.token, 'ch1', false).channelId;

    const secondUser = requestSuccessfulAuthRegister('seconduser@gmail.com', '987654321', 'Second', 'User');
    const thirdUser = requestSuccessfulAuthRegister('thirduser@gmail.com', 'ABC39234', 'Third', 'User');

    requestSuccessfulChannelInvite(firstUser.token, ch1, secondUser.authUserId);
    requestSuccessfulChannelInvite(secondUser.token, ch1, thirdUser.authUserId);
    const secondUserProfile = requestSuccessfulUserProfile(firstUser.token, secondUser.authUserId).user;
    const thirdUserProfile = requestSuccessfulUserProfile(firstUser.token, thirdUser.authUserId).user;
    // Check contents of ownerMembers and allMembers for the created channel
    const chDetails = requestSuccessfulChannelDetails(firstUser.token, ch1);
    expect(chDetails.ownerMembers).not.toContainEqual(secondUserProfile);
    expect(chDetails.ownerMembers).not.toContainEqual(thirdUserProfile);
    expect(chDetails.allMembers).toContainEqual(secondUserProfile);
    expect(chDetails.allMembers).toContainEqual(thirdUserProfile);
  });
  */
});

// Invalid inputs, return {error: expect.any(String) } for the remaining tests:
describe('Error return', () => {
  test('channelId does not refer to a valid channel', () => {
    const firstUser = requestSuccessfulAuthRegister('firstuser@gmail.com', '123456789', 'First', 'User');
    const ch1 = requestSuccessfulChannelsCreate(firstUser.token, 'ch1', false).channelId;

    const seconduId = requestSuccessfulAuthRegister('seconduser@gmail.com', '987654321', 'Second', 'User').authUserId;

    // Since the only valid channelId is ch1, ch1 - 1 and ch1 + 1 must be invalid.
    expect(requestErrorChannelInvite(firstUser.token, ch1 - 1, seconduId)).toStrictEqual(ERROR);
    expect(requestErrorChannelInvite(firstUser.token, ch1 + 1, seconduId)).toStrictEqual(ERROR);
  });

  test('uId does not refer to a valid user', () => {
    const firstUser = requestSuccessfulAuthRegister('firstuser@gmail.com', '123456789', 'First', 'User');
    const ch1 = requestSuccessfulChannelsCreate(firstUser.token, 'ch1', false).channelId;
    expect(requestErrorChannelInvite(firstUser.token, ch1, firstUser.authUserId + 1)).toStrictEqual(ERROR);
  });

  test('uId refers to a user who is already a member of the channel', () => {
    const firstUser = requestSuccessfulAuthRegister('firstuser@gmail.com', '123456789', 'First', 'User');
    const ch1 = requestSuccessfulChannelsCreate(firstUser.token, 'ch1', false).channelId;

    const seconduId = requestSuccessfulAuthRegister('seconduser@gmail.com', '987654321', 'Second', 'User').authUserId;
    requestSuccessfulChannelInvite(firstUser.token, ch1, seconduId);
    // UserId is already in the channel specified, so this invite must be invalid.
    expect(requestErrorChannelInvite(firstUser.token, ch1, seconduId)).toStrictEqual(ERROR);
  });

  test('Test if the inviter is not a member of the channel', () => {
    const firstUser = requestSuccessfulAuthRegister('firstuser@gmail.com', '123456789', 'First', 'User');
    const ch1 = requestSuccessfulChannelsCreate(firstUser.token, 'ch1', false).channelId;

    const nonMemberToken = requestSuccessfulAuthRegister('test@gmail.com', '12345678', 'NON', 'User').token;
    const seconduId = requestSuccessfulAuthRegister('seconduser@gmail.com', '987654321', 'Second', 'User').authUserId;

    // nonMemberuId is not in the channel, therefore cannot invite.
    expect(requestErrorChannelInvite(nonMemberToken, ch1, seconduId)).toStrictEqual(TOKEN_ERROR);
  });

  test('Test if the inviter token is invalid', () => {
    const firstUser = requestSuccessfulAuthRegister('firstuser@gmail.com', '123456789', 'First', 'User');
    const ch1 = requestSuccessfulChannelsCreate(firstUser.token, 'ch1', false).channelId;

    const nonMemberuId = requestSuccessfulAuthRegister('seconduser@gmail.com', '987654321', 'Second', 'User').authUserId;
    expect(requestErrorChannelInvite(firstUser.token + 'RANDOM', ch1, nonMemberuId)).toStrictEqual(TOKEN_ERROR);
  });
});
