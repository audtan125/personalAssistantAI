```javascript

import { channelDetailsV1 } from '../channel.js';
import { authRegisterV1 } from '../auth.js';
import { channelsCreateV1 } from '../channels.js';
import { clearV1 } from '../other.js';

/**
* channelDetailsV1 Specification
*
* Given a channel with ID channelId that the authorised user is
* a member of, provides basic details about the channel.
*
* Parameters:
* - authUserId:
* - channelId:
*
* No Error Return:
* { name, isPublic, ownerMembers, allMembers }
* Error Return:
* - Return object {error: 'error'} when any of:
*     - channelId does not refer to a valid channel
*     - channelId is valid and the authorised user is not a member of the channel
*     - authUserId is invalid
*/

beforeEach(() => {
  clearV1();
});

test('Test if the details of the newly created public channel match expected data.', () => {
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

  // Checks if the channel details contain the variables
  // { name, isPublic, ownerMembers, allMembers }
  // and if the values are an exact match.
  const channelDetails = channelDetailsV1(userId, channelId);
  expect(channelDetails).toStrictEqual({
    name: 'New Test Channel',
    isPublic: true,
    ownerMembers: [{
      uId: userId,
      email: 'emailer@gmail.com',
      nameFirst: 'Test',
      nameLast: 'User',
      handleStr: 'testuser',
    }],
    allMembers: [{
      uId: userId,
      email: 'emailer@gmail.com',
      nameFirst: 'Test',
      nameLast: 'User',
      handleStr: 'testuser',
    }],
  });
});

test('Test if the details of the newly created private channel match expected data.', () => {
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

  // Checks if the channel details contain the variables
  // { name, isPublic, ownerMembers, allMembers }
  // and if the values are an exact match.
  const channelDetails = channelDetailsV1(userId, channelId);
  expect(channelDetails).toStrictEqual({
    name: 'New Test Channel',
    isPublic: false,
    ownerMembers: [{
      uId: userId,
      email: 'emailer@gmail.com',
      nameFirst: 'Test',
      nameLast: 'User',
      handleStr: 'testuser',
    }],
    allMembers: [{
      uId: userId,
      email: 'emailer@gmail.com',
      nameFirst: 'Test',
      nameLast: 'User',
      handleStr: 'testuser',
    }],
  });
});

test('Test if the details of the third created channel match expected data requested by the second user.', () => {
  authRegisterV1('firstuser@gmail.com', 'password', 'first', 'user');
  const userId = authRegisterV1(
    'seconduser@gmail.com',
    'password',
    'Test',
    'User'
  ).authUserId;
  authRegisterV1('thirduser@gmail.com', 'password', 'third', 'user');

  channelsCreateV1(userId, 'no sleep gang', true);
  channelsCreateV1(userId, 'did this yesterday', true);
  const channelId = channelsCreateV1(
    userId,
    'New Test Channel',
    true
  ).channelId;

  // Checks if the channel details contain the variables
  // { name, isPublic, ownerMembers, allMembers }
  // and if the values are an exact match.
  const channelDetails = channelDetailsV1(userId, channelId);
  expect(channelDetails).toEqual({
    name: 'New Test Channel',
    isPublic: true,
    ownerMembers: [{
      uId: userId,
      email: 'seconduser@gmail.com',
      nameFirst: 'Test',
      nameLast: 'User',
      handleStr: 'testuser',
    }],
    allMembers: [{
      uId: userId,
      email: 'seconduser@gmail.com',
      nameFirst: 'Test',
      nameLast: 'User',
      handleStr: 'testuser',
    }],
  });
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

  // Checks if the channel details contain a valid error
  // return value when given a non-existent user id, 3121.
  const channelDetails = channelDetailsV1(3121, channelId);
  expect(channelDetails).toStrictEqual({ error: expect.any(String) });
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

  // Checks if the channel details contain a valid error
  // return value when given a non-existent channel id, 3121.
  const channelDetails = channelDetailsV1(userId, 3121);
  expect(channelReturn).toStrictEqual({ channelId: expect.any(Number) });
  expect(channelDetails).toStrictEqual({ error: expect.any(String) });
});

test('Test where the user is not a member of the requested channel.', () => {
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

  // Checks if the channel details contain a valid error
  // return value when given the user id of a user that is
  // not a member of the requested channel.
  const channelDetails = channelDetailsV1(userId2, channelId);
  expect(channelDetails).toStrictEqual({ error: expect.any(String) });
});
