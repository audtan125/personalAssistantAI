```javascript

import { authRegisterV1, authLoginV1 } from '../auth.js';
import { clearV1 } from '../other.js';

describe('authLoginV1 Tests', () => {
  beforeEach(() => {
    clearV1();
  });

  test('Testing login a registered email with the correct details', () => {
    const registerAuthId = authRegisterV1('thefirstuser@gmail.com', '123456', 'first',
      'last').authUserId;
    const loginAuthId = authLoginV1('thefirstuser@gmail.com', '123456').authUserId;
    expect(loginAuthId).toBe(registerAuthId);
  });

  test('Testing for 2 logins with the correct details', () => {
    const registerAuthId = authRegisterV1('thefirstuser@gmail.com', '123456', 'first',
      'last').authUserId;
    const registerAuthId1 = authRegisterV1('theseconduser@gmail.com', '123456', 'first',
      'lastt').authUserId;
    const loginAuthId = authLoginV1('thefirstuser@gmail.com', '123456').authUserId;
    expect(loginAuthId).toBe(registerAuthId);
    const loginAuthId1 = authLoginV1('theseconduser@gmail.com', '123456').authUserId;
    expect(loginAuthId1).toBe(registerAuthId1);
  });

  test('Test structure of return object is correct', () => {
    const registerAuthId = authRegisterV1('thefirstuser@gmail.com', '123456', 'first',
      'last').authUserId;
    const returnObject = authLoginV1('thefirstuser@gmail.com', '123456');
    expect(returnObject).toStrictEqual({
      authUserId: registerAuthId
    });
  });

  test('Testing for login a unregistered email', () => {
    authRegisterV1('thefirstuser@gmail.com', '123456', 'first',
      'last');
    const userLogin = authLoginV1('theseconduser@gmail.com', '123456');
    expect(userLogin).toStrictEqual({ error: expect.any(String) });
  });

  test('Testing for user login with the wrong password', () => {
    authRegisterV1('thefirstuser@gmail.com', '123456', 'first',
      'last');
    const userLogin = authLoginV1('thefirstuser@gmail.com', 'wrongpassword');
    expect(userLogin).toStrictEqual({ error: expect.any(String) });
  });

  test('Testing for the user inputting the wrong email but the right password', () => {
    authRegisterV1('thefirstuser@gmail.com', '123456', 'first',
      'last');
    const userLogin = authLoginV1('theseconduser@gmail.com', '123456');
    expect(userLogin).toStrictEqual({ error: expect.any(String) });
  });

  test('Testing for login with an empty email', () => {
    authRegisterV1('thefirstuser@gmail.com', '123456', 'first',
      'last');
    const userLogin = authLoginV1('', '123456');
    expect(userLogin).toStrictEqual({ error: expect.any(String) });
  });

  test('Testing for login with an empty pasword', () => {
    authRegisterV1('thefirstuser@gmail.com', '123456', 'first',
      'last');
    const userLogin = authLoginV1('thefirstuser@gmail.com', '');
    expect(userLogin).toStrictEqual({ error: expect.any(String) });
  });

  test('Testing for login when no users have been registered', () => {
    const userLogin = authLoginV1('thefirstuser@gmail.com', '');
    expect(userLogin).toStrictEqual({ error: expect.any(String) });
  });
});
