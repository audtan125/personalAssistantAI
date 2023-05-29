```javascript

import { channelDetailsV1, channelJoinV1 } from '../channel.js';
import { authRegisterV1 } from '../auth.js';
import { channelsCreateV1 } from '../channels.js';
import { clearV1 } from '../other.js';

/**
* channelJoinV1 Specification
*
* Given a channelId of a channel that the authorised user can
* join, adds them to that channel.
*
* Parameters:
* - authUserId:
* - channelId:
*
* No Error Return:
* {}
* Error Return:
* - Return object {error: 'error'} when any of:
*     - channelId does not refer to a valid channel
*     - the authorised user is already a member of the channel
*     - channelId refers to a channel that is private,
*       when the authorised user is not already a channel
*       member and is not a global owner
*     - authUserId is invalid
*/

beforeEach(() => {
  clearV1();
});

test('Test if the return data is empty when successfully joining channel.', () => {
  const userId = authRegisterV1(
    'emailer@gmail.com',
    'password',
    'Test',
    'User'
  ).authUserId;
  const userId2 = authRegisterV1(
    'sadman@gmail.com',
    'password123',
    'Lonely',
    'Man'
  ).authUserId;

  const channelId = channelsCreateV1(
    userId,
    'New Test Channel',
    true
  ).channelId;

  // Checks if joining the channel returns nothing,
  // and if channel details does not return error,
  // indicating a successful join.
  const channelJoin = channelJoinV1(userId2, channelId);
  const channelDetails = channelDetailsV1(userId2, channelId);
  expect(channelJoin).toEqual({});
  expect(channelDetails).not.toHaveProperty('error');
});

test('Test with an invalid user ID.', () => {
  const userId = authRegisterV1(
    'emailer@gmail.com',
    'password',
    'Test',
    'User'
  ).authUserId;

  const channelId = channelsCreateV1(
    userId,
    'New Test Channel',
    true
  ).channelId;

  // Checks if joining channel returns a valid error
  // return value when given a non-existent user id, 3121.
  const channelJoin = channelJoinV1(3121, channelId);
  expect(channelJoin).toStrictEqual({ error: expect.any(String) });
});

test('Test with an invalid channel ID.', () => {
  const userId = authRegisterV1(
    'emailer@gmail.com',
    'password',
    'Test',
    'User'
  ).authUserId;

  const channelReturn = channelsCreateV1(
    userId,
    'New Test Channel',
    true
  );
  expect(channelReturn).toStrictEqual({ channelId: expect.any(Number) });

  // Checks if joining channel returns a valid error
  // return value when given a non-existent channel id, 3121.
  const channelJoin = channelJoinV1(userId, 3121);
  expect(channelJoin).toStrictEqual({ error: expect.any(String) });
});

test('Test where the user is already a member of the requested channel.', () => {
  const userId = authRegisterV1(
    'emailer@gmail.com',
    'password',
    'Test',
    'User'
  ).authUserId;
  const userId2 = authRegisterV1(
    'sadman@gmail.com',
    'password123',
    'Lonely',
    'Man'
  ).authUserId;

  const channelId = channelsCreateV1(
    userId,
    'New Test Channel',
    true
  ).channelId;

  channelJoinV1(userId2, channelId);

  // User 2 tries to join the channel again.
  const channelJoin = channelJoinV1(userId2, channelId);
  expect(channelJoin).toStrictEqual({ error: expect.any(String) });
});

test('Test where the global owner can join a private channel.', () => {
  const globalOwnerId = authRegisterV1(
    'emailer@gmail.com',
    'password',
    'Test',
    'User'
  ).authUserId;
  const userId2 = authRegisterV1(
    'sadman@gmail.com',
    'password123',
    'Lonely',
    'Man'
  ).authUserId;

  const channelId = channelsCreateV1(
    userId2,
    'New Test Channel',
    false
  ).channelId;

  // Checks if joining the channel returns nothing,
  // and if channel details does not return error,
  // indicating a successful join.
  const channelJoin = channelJoinV1(globalOwnerId, channelId);
  const channelDetails = channelDetailsV1(userId2, channelId);
  expect(channelJoin).toEqual({});
  expect(channelDetails).not.toHaveProperty('error');
});

test('Test where a normal user should not be able to join a private channel.', () => {
  const userId = authRegisterV1(
    'emailer@gmail.com',
    'password',
    'Test',
    'User'
  ).authUserId;
  const userId2 = authRegisterV1(
    'sadman@gmail.com',
    'password123',
    'Lonely',
    'Man'
  ).authUserId;

  const channelId = channelsCreateV1(
    userId,
    'New Test Channel',
    false
  ).channelId;

  const channelJoin = channelJoinV1(userId2, channelId);
  expect(channelJoin).toStrictEqual({ error: expect.any(String) });
});
