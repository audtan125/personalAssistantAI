```javascript

import { channelsCreateV1 } from '../channels.js';
import { authRegisterV1 } from '../auth.js';
import { channelDetailsV1 } from '../channel.js';
import { clearV1 } from '../other.js';
import { userProfileV1 } from '../users.js';

// We shall proceed using the authRegister function for cases
// where authUserId is not an error

describe('channelsCreateV1 Tests', () => {
  beforeEach(() => {
    clearV1();
  });

  test('return object after creating channel is an integer', () => {
    // since the return from the function is an integer
    // we use the % operator to check if it is an integer
    // alt sol:
    // const isNumber = Number.isInteger(newChannel);
    // expect(isNumber).toEqual(true)

    const name = 'Kang Seulgi'; const isPublic = true;
    const authUserId = authRegisterV1(
      'iceOnMyWrist@gmail.com',
      'passwordLMFAO',
      'Edsger',
      'Dijkstra'
    ).authUserId;

    const newChannelId = channelsCreateV1(authUserId, name, isPublic);

    expect(Number.isInteger(newChannelId.channelId)).toEqual(true);
  });

  test('channels have unique channelIds', () => {
    const name1 = 'Giorno Giovanna'; const name2 = 'Bunnings Snag'; const isPublic = true;
    const authUserId = authRegisterV1(
      'iceOnMyWrist@gmail.com',
      'passwordLMFAO',
      'Edsger',
      'Dijkstra'
    ).authUserId;

    const newChannel1 = channelsCreateV1(authUserId, name1, isPublic);
    const newChannel2 = channelsCreateV1(authUserId, name2, isPublic);

    expect(newChannel1.channelId).not.toEqual(newChannel2.channelId);
  });

  test('user creates 2 channels with the same name', () => {
    const name = 'I HATE JAVASCRIPT'; const isPublic = true;
    const authUserId = authRegisterV1(
      'iceOnMyWrist@gmail.com',
      'passwordLMFAO',
      'Edsger',
      'Dijkstra'
    ).authUserId;

    const newChannel = channelsCreateV1(authUserId, name, isPublic);
    const newChannelDuplicate = channelsCreateV1(authUserId, name, isPublic);

    expect(newChannelDuplicate).toStrictEqual({ channelId: expect.any(Number) });
    expect(newChannel.channelId).not.toEqual(newChannelDuplicate.channelId);
  });

  test('dataStore was updated with the input data', () => {
    const name = 'JScript'; const isPublic = true;
    const authUserId = authRegisterV1(
      'iceOnMyWrist@gmail.com',
      'passwordLMFAO',
      'Edsger',
      'Dijkstra'
    ).authUserId;

    const newChannel = channelsCreateV1(authUserId, name, isPublic).channelId;
    const channelDetails = channelDetailsV1(authUserId, newChannel);

    expect(channelDetails.name).toEqual(name);
    expect(channelDetails.isPublic).toEqual(isPublic);

    let isAuthUserIdOwner = false;
    for (const owners of channelDetails.ownerMembers) {
      if (owners.uId === authUserId) {
        isAuthUserIdOwner = true;
        break;
      }
    }
    expect(isAuthUserIdOwner).toEqual(true);
  });

  test('authUserId is invalid', () => {
    const authUserId = { error: 'error' };
    const name = 'Joe Biden'; const isPublic = true;

    const newChannel = channelsCreateV1(authUserId, name, isPublic);

    expect(newChannel).toStrictEqual({ error: expect.any(String) });
  });

  test('name is less than 1 character', () => {
    const name = ''; const isPublic = true;
    const authUserId = authRegisterV1(
      'iceOnMyWrist@gmail.com',
      'passwordLMFAO',
      'Edsger',
      'Dijkstra'
    ).authUserId;

    const newChannel = channelsCreateV1(authUserId, name, isPublic);

    expect(newChannel).toStrictEqual({ error: expect.any(String) });
  });

  test('name is more than 20 character', () => {
    const name = 'SenbonzakuraKageyoshi'; const isPublic = true;
    const authUserId = authRegisterV1(
      'iceOnMyWrist@gmail.com',
      'passwordLMFAO',
      'Edsger',
      'Dijkstra'
    ).authUserId;

    const newChannel = channelsCreateV1(authUserId, name, isPublic);
    expect(newChannel).toStrictEqual({ error: expect.any(String) });
  });

  test('channel is private', () => {
    const userId = authRegisterV1(
      'emailer@gmail.com',
      'password',
      'Test',
      'User'
    ).authUserId;

    const channelId = channelsCreateV1(
      userId,
      'New Test Channel',
      false
    ).channelId;

    const channelDetail = channelDetailsV1(userId, channelId);
    expect(channelDetail.isPublic).toEqual(false);
  });

  test('Invalid: authUserId does not exist', () => {
    const newChannel = channelsCreateV1(
      1,
      'New Test Channel',
      true
    );
    expect(newChannel).toStrictEqual({ error: expect.any(String) });
  });

  test('function has correct return object structure', () => {
    const name = 'Kang Seulgi'; const isPublic = true;
    const authUserId = authRegisterV1(
      'iceOnMyWrist@gmail.com',
      'passwordLMFAO',
      'Edsger',
      'Dijkstra'
    ).authUserId;

    const returnObject = channelsCreateV1(authUserId, name, isPublic);

    expect(returnObject).toStrictEqual({
      channelId: returnObject.channelId,
    });
  });

  test('Adds user who created channel to ownerMembers', () => {
    const name = 'Kang Seulgi'; const isPublic = true;
    const authUserId = authRegisterV1(
      'iceOnMyWrist@gmail.com',
      'passwordLMFAO',
      'Edsger',
      'Dijkstra'
    ).authUserId;
    const user = userProfileV1(authUserId, authUserId).user;

    const channelId = channelsCreateV1(authUserId, name, isPublic).channelId;

    const ownerMembersArray = channelDetailsV1(authUserId, channelId).ownerMembers;
    expect(ownerMembersArray).toContain(user);
  });
});
