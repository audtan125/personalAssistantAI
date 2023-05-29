```javascript

import { channelsListV1 } from '../channels.js';
import { authRegisterV1 } from '../auth.js';
import { channelsCreateV1 } from '../channels.js';
import { clearV1 } from '../other.js';
import { channelInviteV1 } from '../channel.js';

beforeEach(() => {
  clearV1();
});

describe('channelsListV1 tests', () => {
  test('check that the object returned is an array', () => {
    const authUserId = authRegisterV1(
      'iceOnMyWrist@gmail.com',
      'passwordLMFAO',
      'Edsger',
      'Dijkstra'
    ).authUserId;

    channelsCreateV1(authUserId, 'Bruh', true);
    const output = channelsListV1(authUserId);

    expect(Array.isArray(output.channels)).toEqual(true);
  });

  test('authUserId exists but is not part of any channels', () => {
    const authUserId = authRegisterV1(
      'iceOnMyWrist@gmail.com',
      'passwordLMFAO',
      'Edsger',
      'Dijkstra'
    ).authUserId;
    const authUserIdSecond = authRegisterV1(
      'trenythingIsPossible@gmail.com',
      'passwordLMFAOx2',
      'Tesla',
      'Convertible'
    ).authUserId;
    channelsCreateV1(authUserIdSecond, 'Bruh', true);
    const output = channelsListV1(authUserId);

    expect(output).toStrictEqual({ channels: [] });
  });

  test('invalid authUserId', () => {
    let authUserId = authRegisterV1(
      'iceOnMyWrist@gmail.com',
      'passwordLMFAO',
      'Edsger',
      'Dijkstra'
    ).authUserId;

    // this user Id will no longer be valid because it is different
    // from the only user Id that exists
    authUserId++;
    const output = channelsListV1(authUserId);

    expect(output).toEqual({ error: expect.any(String) });
  });

  test('returned object is exactly what is expected', () => {
    const authUserId = authRegisterV1(
      'iceOnMyWrist@gmail.com',
      'passwordLMFAO',
      'Edsger',
      'Dijkstra'
    ).authUserId;
    const chId = channelsCreateV1(authUserId, 'Bruh', true).channelId;
    const output = channelsListV1(authUserId);
    expect(output).toStrictEqual({
      channels: [{ channelId: chId, name: 'Bruh' }],
    });
  });

  test('only lists channels user is part of when other channels exist', () => {
    const authUserId = authRegisterV1(
      'iceOnMyWrist@gmail.com',
      'passwordLMFAO',
      'Edsger',
      'Dijkstra'
    ).authUserId;

    const authUserIdSecond = authRegisterV1(
      'trenythingIsPossible@gmail.com',
      'passwordLMFAOx2',
      'Tesla',
      'Convertible'
    ).authUserId;

    const chId = channelsCreateV1(authUserId, 'Bruh', true).channelId;
    channelsCreateV1(authUserIdSecond, 'Bruhx2', true);

    const output = channelsListV1(authUserId);

    expect(output).toStrictEqual({
      channels: [{ channelId: chId, name: 'Bruh' }],
    });
  });

  test('channel returned when channel is private and user is part of it', () => {
    const authUserId = authRegisterV1(
      'iceOnMyWrist@gmail.com',
      'passwordLMFAO',
      'Edsger',
      'Dijkstra'
    ).authUserId;

    const chId = channelsCreateV1(authUserId, 'Bruh', false).channelId;
    const output = channelsListV1(authUserId);

    expect(output).toStrictEqual({
      channels: [{ channelId: chId, name: 'Bruh' }],
    });
  });

  test('multiple channels returned when user is part of more than one channel', () => {
    const authUserId = authRegisterV1(
      'iceOnMyWrist@gmail.com',
      'passwordLMFAO',
      'Edsger',
      'Dijkstra'
    ).authUserId;

    const chId = channelsCreateV1(authUserId, 'Bruh', true).channelId;
    const chId2 = channelsCreateV1(authUserId, 'TescoValueChicken', true).channelId;

    const output = channelsListV1(authUserId);

    expect(output).toStrictEqual({
      channels: [
        { name: 'Bruh', channelId: chId },
        { channelId: chId2, name: 'TescoValueChicken' },
      ],
    });
  });

  test('Lists a channel for members that are not channel owners', () => {
    const authUserId = authRegisterV1(
      'iceOnMyWrist@gmail.com',
      'passwordLMFAO',
      'Edsger',
      'Dijkstra'
    ).authUserId;
    const authUserIdSecond = authRegisterV1(
      'trenythingIsPossible@gmail.com',
      'passwordLMFAOx2',
      'Tesla',
      'Convertible'
    ).authUserId;

    const chId = channelsCreateV1(authUserId, 'Bruh', true).channelId;
    channelInviteV1(authUserId, chId, authUserIdSecond);

    // user that did not create the channel and is not a channel owner calls
    // the channelsList function
    const output = channelsListV1(authUserIdSecond);

    expect(output).toStrictEqual({
      channels: [
        { name: 'Bruh', channelId: chId },
      ],
    });
  });

  test('Lists multiple channels for non channel owner members', () => {
    const authUserId = authRegisterV1(
      'iceOnMyWrist@gmail.com',
      'passwordLMFAO',
      'Edsger',
      'Dijkstra'
    ).authUserId;
    const authUserIdSecond = authRegisterV1(
      'trenythingIsPossible@gmail.com',
      'passwordLMFAOx2',
      'Tesla',
      'Convertible'
    ).authUserId;

    // The first user creates two channels
    const chId = channelsCreateV1(authUserId, 'Bruh', true).channelId;
    const chId2 = channelsCreateV1(authUserId, 'TescoValueChicken', true).channelId;
    channelInviteV1(authUserId, chId, authUserIdSecond);
    channelInviteV1(authUserId, chId2, authUserIdSecond);

    // user that did not create the channel and is not a channel owner calls
    // the channelsList function
    const output = channelsListV1(authUserIdSecond);

    expect(output).toStrictEqual({
      channels: [
        { name: 'Bruh', channelId: chId },
        { channelId: chId2, name: 'TescoValueChicken' },
      ],
    });
  });

  test('Mix of user being a channel owner of and just a member', () => {
    const authUserId = authRegisterV1(
      'iceOnMyWrist@gmail.com',
      'passwordLMFAO',
      'Edsger',
      'Dijkstra'
    ).authUserId;
    const authUserIdSecond = authRegisterV1(
      'trenythingIsPossible@gmail.com',
      'passwordLMFAOx2',
      'Tesla',
      'Convertible'
    ).authUserId;

    // Second user creates one channel so is a channel owner
    // and invited to the second one so is just a member
    const chId = channelsCreateV1(authUserId, 'Bruh', true).channelId;
    const chId2 = channelsCreateV1(authUserIdSecond, 'TescoValueChicken', true).channelId;
    channelInviteV1(authUserId, chId, authUserIdSecond);

    // user that did not create the channel and is not a channel owner calls
    // the channelsList function
    const output = channelsListV1(authUserIdSecond);

    expect(output).toStrictEqual({
      channels: [
        { name: 'Bruh', channelId: chId },
        { channelId: chId2, name: 'TescoValueChicken' },
      ],
    });
  });
});
