```javascript

import { userProfileV1 } from '../users.js';
import { authRegisterV1 } from '../auth.js';
import { clearV1 } from '../other.js';

beforeEach(() => {
  clearV1();
});

test('Test return object contains the correct fields', () => {
  const authUserId = authRegisterV1(
    'randomname@gmail.com',
    '12345678',
    'Random',
    'Name'
  ).authUserId;

  expect(userProfileV1(authUserId, authUserId)).toStrictEqual({
    user: {
      uId: authUserId,
      email: 'randomname@gmail.com',
      nameFirst: 'Random',
      nameLast: 'Name',
      handleStr: 'randomname',
    }
  });
});

test('Test uId is invalid', () => {
  const authUserId = authRegisterV1(
    'randomname@gmail.com',
    '12345678',
    'Random',
    'Name'
  ).authUserId;
  // uId is meant to be of type integer, so a character is invalid
  expect(userProfileV1(authUserId, 'a')).toStrictEqual({ error: expect.any(String) });
});

test('Test authUserId is invalid', () => {
  const uId = authRegisterV1(
    'randomname@gmail.com',
    '12345678',
    'Random',
    'Name'
  ).authUserId;
  // authUserId is meant to be of type integer, so a character is invalid
  expect(userProfileV1('a', uId)).toStrictEqual({ error: expect.any(String) });
});

test('Test the uId is correct when user looks up their own profile', () => {
  const authUserId = authRegisterV1(
    'randomname@gmail.com',
    '12345678',
    'Random',
    'Name'
  ).authUserId;
  const searchForId = authUserId;
  // uId is meant to be of type integer, so a character is invalid
  const user = userProfileV1(authUserId, searchForId).user;
  expect(user.uId).toBe(searchForId);
});

test("Test the uId is correct when user looks up another's profile", () => {
  const authUserId = authRegisterV1(
    'randomname@gmail.com',
    '12345678',
    'Random',
    'Name'
  ).authUserId;
  const searchForId = authRegisterV1(
    'anotheruser@gmail.com',
    'abcdefgh',
    'Another',
    'User'
  ).authUserId;
  const user = userProfileV1(authUserId, searchForId).user;
  expect(user.uId).toBe(searchForId);
});

test('Test authUserId does not exist in data store', () => {
  // this will have the user ID of '1'
  const searchForId = authRegisterV1(
    'anotheruser@gmail.com',
    'abcdefgh',
    'Another',
    'User'
  ).authUserId;
  // since only one user exists, their Id + 1 will not be a valid Id
  const returnValue = userProfileV1(searchForId + 1, searchForId);
  expect(returnValue).toStrictEqual({ error: expect.any(String) });
});
