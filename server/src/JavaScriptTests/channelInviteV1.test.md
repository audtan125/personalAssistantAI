```javascript

import { channelInviteV1, channelDetailsV1 } from '../channel.js';
import { authRegisterV1 } from '../auth.js';
import { channelsCreateV1 } from '../channels.js';
import { userProfileV1 } from '../users.js';
import { clearV1 } from '../other.js';

beforeEach(() => {
  clearV1();
});

// channelInviteV1(authUserId, channelId, uId)

// Valid input: Main functionality test
// Invitee must be in allMembers and NOT ownerMembers.
// Invitee must only exist in channel specified by invite.
test('Test presence of invitee in channels NOT specified by invite', () => {
  const authUserId = authRegisterV1(
    'firstuser@gmail.com',
    '123456789',
    'First',
    'User'
  ).authUserId;

  const UserId = authRegisterV1(
    'seconduser@gmail.com',
    '987654321',
    'Second',
    'User'
  ).authUserId;

  const ch1 = channelsCreateV1(authUserId, 'ch1', false).channelId;
  const ch2 = channelsCreateV1(authUserId, 'ch2', true).channelId;
  const ch3 = channelsCreateV1(authUserId, 'ch3', false).channelId;
  const ch4 = channelsCreateV1(authUserId, 'ch4', true).channelId;

  // List of all channel IDs
  const channels = [ch1, ch2, ch3, ch4];

  channelInviteV1(authUserId, ch2, UserId);
  const userProfile = userProfileV1(UserId, UserId).user;

  // Check contents of ownerMembers and allMembers for all channels created
  for (const ch of channels) {
    const chDetails = channelDetailsV1(authUserId, ch);
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

// Invalid inputs, return {error: 'error'} for the remaining tests:
describe('ChannelInvite return error', () => {
  beforeEach(() => {
    clearV1();
  });

  test('Test if channelId does not refer to a valid channel', () => {
    const authUserId = authRegisterV1(
      'firstuser@gmail.com',
      '123456789',
      'First',
      'User'
    ).authUserId;

    const UserId = authRegisterV1(
      'seconduser@gmail.com',
      '987654321',
      'Second',
      'User'
    ).authUserId;

    const ch1 = channelsCreateV1(authUserId, 'ch1', false).channelId;

    // Since the only valid channelId is ch1, ch1 - 1 and ch1 + 1 must be invalid.
    expect(channelInviteV1(authUserId, ch1 - 1, UserId)).toStrictEqual({ error: expect.any(String) });
    expect(channelInviteV1(authUserId, ch1 + 1, UserId)).toStrictEqual({ error: expect.any(String) });
  });

  test('Test if uId does not refer to a valid user', () => {
    const authUserId = authRegisterV1(
      'firstuser@gmail.com',
      '123456789',
      'First',
      'User'
    ).authUserId;

    const UserId = authRegisterV1(
      'seconduser@gmail.com',
      '987654321',
      'Second',
      'User'
    ).authUserId;

    const ch1 = channelsCreateV1(authUserId, 'ch1', false).channelId;

    // Since we have only created 2 users, and this loop iterates 5 times,
    // there are at least 3 and at most 5 iterations with invalid userIDs.
    for (let random = 1; random !== 6; random++) {
      // Expect error if index of current iteration is not a valid user
      if (random !== authUserId && random !== UserId) {
        expect(channelInviteV1(authUserId, ch1, random)).toStrictEqual({ error: expect.any(String) });
      }
    }
  });

  test('Test if uId refers to a user who is already a member of the channel', () => {
    const authUserId = authRegisterV1(
      'firstuser@gmail.com',
      '123456789',
      'First',
      'User'
    ).authUserId;

    const UserId = authRegisterV1(
      'seconduser@gmail.com',
      '987654321',
      'Second',
      'User'
    ).authUserId;

    const ch1 = channelsCreateV1(authUserId, 'ch1', false).channelId;
    channelInviteV1(authUserId, ch1, UserId);

    // UserId is already in the channel specified
    expect(channelInviteV1(authUserId, ch1, UserId)).toStrictEqual({ error: expect.any(String) });
  });

  test('Test if authorised user is not a member of the channel', () => {
    const authUserId = authRegisterV1(
      'firstuser@gmail.com',
      '123456789',
      'First',
      'User'
    ).authUserId;

    const NOTauthUserId = authRegisterV1(
      'test@gmail.com',
      '12345678',
      'NON',
      'User'
    ).authUserId;

    const UserId = authRegisterV1(
      'seconduser@gmail.com',
      '987654321',
      'Second',
      'User'
    ).authUserId;

    const ch1 = channelsCreateV1(authUserId, 'ch1', false).channelId;

    // NotauthUserId is not in the the channel, therefore cannot invite.
    expect(channelInviteV1(NOTauthUserId, ch1, UserId)).toStrictEqual({ error: expect.any(String) });
  });

  test('Test if authUserId is invalid', () => {
    const authUserId = authRegisterV1(
      'firstuser@gmail.com',
      '123456789',
      'First',
      'User'
    ).authUserId;

    const UserId = authRegisterV1(
      'seconduser@gmail.com',
      '987654321',
      'Second',
      'User'
    ).authUserId;

    const ch1 = channelsCreateV1(authUserId, 'ch1', false).channelId;

    // Since we have only created 2 users, and this loop iterates 5 times,
    // there are at least 3 and at most 5 iterations with invalid authUserIDs.
    for (let random = 1; random !== 6; random++) {
      if (random !== authUserId && random !== UserId) {
        expect(channelInviteV1(random, ch1, UserId)).toStrictEqual({ error: expect.any(String) });
      }
    }
  });

  test("Test user can't invite themself", () => {
    const authUserId = authRegisterV1(
      'firstuser@gmail.com',
      '123456789',
      'First',
      'User'
    ).authUserId;

    const NOTauthUserId = authRegisterV1(
      'test@gmail.com',
      '12345678',
      'NON',
      'User'
    ).authUserId;

    const authReturn = authRegisterV1(
      'seconduser@gmail.com',
      '987654321',
      'Second',
      'User'
    );
    expect(authReturn).toStrictEqual({ authUserId: expect.any(Number) });

    const ch1 = channelsCreateV1(authUserId, 'ch1', false).channelId;

    // authUserId is in the channel and invites themself
    expect(channelInviteV1(authUserId, ch1, authUserId)).toStrictEqual({ error: expect.any(String) });
    // NotauthUserId is not in the the channel and invites themself
    expect(channelInviteV1(NOTauthUserId, ch1, NOTauthUserId)).toStrictEqual({ error: expect.any(String) });
  });
});
