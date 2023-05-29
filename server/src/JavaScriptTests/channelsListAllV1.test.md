```javascript

import { channelsListAllV1, channelsCreateV1 } from '../channels.js';
import { authRegisterV1 } from '../auth.js';
import { clearV1 } from '../other.js';

beforeEach(() => {
  clearV1();
});

// channelsListAllV1(authUserId)
describe('channelsListAll valid returns', () => {
  test('Test for mixture of public and private channels', () => {
    const auid = authRegisterV1(
      'firstuser@gmail.com',
      '123456789',
      'First',
      'User'
    ).authUserId;

    const ch1 = channelsCreateV1(auid, 'testChannel1', false).channelId;
    const ch2 = channelsCreateV1(auid, 'testChannel2', true).channelId;
    const ch3 = channelsCreateV1(auid, 'testChannel3', true).channelId;
    const ch4 = channelsCreateV1(auid, 'testChannel4', false).channelId;
    const ch5 = channelsCreateV1(auid, 'testChannel5', false).channelId;

    const chId = [ch1, ch2, ch3, ch4, ch5];
    const chName = ['testChannel1', 'testChannel2', 'testChannel3', 'testChannel4', 'testChannel5'];
    const allChannelList = channelsListAllV1(auid).channels;

    // For each index 0 to 4, check if allChannelList contains {chId[index], chName[index]}.
    for (const ch in chId) {
      expect(allChannelList).toContainEqual({ channelId: chId[ch], name: chName[ch] });
    }
  });

  test('Test for all channels public', () => {
    const auid = authRegisterV1(
      'firstuser@gmail.com',
      '123456789',
      'First',
      'User'
    ).authUserId;

    // isPublic = true
    const ch1 = channelsCreateV1(auid, 'testChannel1', true).channelId;
    const ch2 = channelsCreateV1(auid, 'testChannel2', true).channelId;
    const ch3 = channelsCreateV1(auid, 'testChannel3', true).channelId;
    const ch4 = channelsCreateV1(auid, 'testChannel4', true).channelId;
    const ch5 = channelsCreateV1(auid, 'testChannel5', true).channelId;

    const chId = [ch1, ch2, ch3, ch4, ch5];
    const chName = ['testChannel1', 'testChannel2', 'testChannel3', 'testChannel4', 'testChannel5'];
    const allChannelList = channelsListAllV1(auid).channels;

    // For each index 0 to 4, check if allChannelList contains corresponding channel id and channel name.
    for (const ch in chId) {
      expect(allChannelList).toContainEqual({ channelId: chId[ch], name: chName[ch] });
    }
  });

  test('Test for all channels private', () => {
    const auid = authRegisterV1(
      'firstuser@gmail.com',
      '123456789',
      'First',
      'User'
    ).authUserId;

    // isPublic = false
    const ch1 = channelsCreateV1(auid, 'testChannel1', false).channelId;
    const ch2 = channelsCreateV1(auid, 'testChannel2', false).channelId;
    const ch3 = channelsCreateV1(auid, 'testChannel3', false).channelId;
    const ch4 = channelsCreateV1(auid, 'testChannel4', false).channelId;
    const ch5 = channelsCreateV1(auid, 'testChannel5', false).channelId;

    const chId = [ch1, ch2, ch3, ch4, ch5];
    const chName = ['testChannel1', 'testChannel2', 'testChannel3', 'testChannel4', 'testChannel5'];
    const allChannelList = channelsListAllV1(auid).channels;

    // For each index 0 to 4, check if allChannelList contains corresponding channel id and channel name.
    for (const ch in chId) {
      expect(allChannelList).toContainEqual({ channelId: chId[ch], name: chName[ch] });
    }
  });

  test('Test for no channels', () => {
    const auid = authRegisterV1(
      'firstuser@gmail.com',
      '123456789',
      'First',
      'User'
    ).authUserId;

    // Should be object containing empty list
    expect(channelsListAllV1(auid)).toStrictEqual({ channels: [] });
  });

  test('Test for users that are not global owners', () => {
    // we assume that any user can call channelsListAll not just global owners
    // First user automatically added to globalOwners
    const uid1 = authRegisterV1(
      'firstuser@gmail.com',
      '123456789',
      'First',
      'User'
    ).authUserId;

    const uid2 = authRegisterV1(
      'seconduser@gmail.com',
      '123456789',
      'Second',
      'User'
    ).authUserId;

    const uid3 = authRegisterV1(
      'thirduser@gmail.com',
      '123456789',
      'Third',
      'User'
    ).authUserId;

    const ch1 = channelsCreateV1(uid1, 'testChannel1', false).channelId;
    const ch2 = channelsCreateV1(uid1, 'testChannel2', true).channelId;

    // will list all channels normally
    expect(channelsListAllV1(uid2)).toStrictEqual({
      channels: [
        {
          channelId: ch1,
          name: 'testChannel1',
        },
        {
          channelId: ch2,
          name: 'testChannel2',
        },
      ]
    });
    expect(channelsListAllV1(uid3)).toStrictEqual({
      channels: [
        {
          channelId: ch1,
          name: 'testChannel1',
        },
        {
          channelId: ch2,
          name: 'testChannel2',
        },
      ]
    });
  });

  test('Test return object structure is correct', () => {
    const auid = authRegisterV1(
      'firstuser@gmail.com',
      '123456789',
      'First',
      'User'
    ).authUserId;

    const ch1 = channelsCreateV1(auid, 'testChannel1', false).channelId;
    const ch2 = channelsCreateV1(auid, 'testChannel2', true).channelId;
    const returnObject = channelsListAllV1(auid);

    expect(returnObject).toStrictEqual({
      channels: [
        {
          channelId: ch1,
          name: 'testChannel1',
        },
        {
          channelId: ch2,
          name: 'testChannel2',
        },
      ]
    });
  });
});

describe('channelsListAll return error', () => {
  test('Test if authUserId does not exist', () => {
    const uid1 = authRegisterV1(
      'firstuser@gmail.com',
      '123456789',
      'First',
      'User'
    ).authUserId;

    const uid2 = authRegisterV1(
      'seconduser@gmail.com',
      '123456789',
      'Second',
      'User'
    ).authUserId;

    const uid3 = authRegisterV1(
      'thirduser@gmail.com',
      '123456789',
      'Third',
      'User'
    ).authUserId;

    channelsCreateV1(uid1, 'testChannel1', false);
    channelsCreateV1(uid1, 'testChannel2', true);

    // Since we have only created 3 users, and this loop iterates 5 times,
    // there are at least 2 and at most 5 iterations with invalid userIDs.
    for (let random = 1; random !== 6; random++) {
      // Expect error if index of current iteration is not a valid user
      if (random !== uid1 && random !== uid2 && random !== uid3) {
        expect(channelsListAllV1(random)).toStrictEqual({ error: expect.any(String) });
      }
    }
  });
});
