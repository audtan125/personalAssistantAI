
import { requestSuccessfulAuthLogin, requestErrorAuthLogin, requestSuccessfulAuthRegister }
  from '../../Helpers/requests/requestAuthHelper';
import { requestClear } from '../../Helpers/requests/requestOtherHelper';

const ERROR = 400;

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

describe('Successful Login', () => {
  /*
  test('Test the structure of the return object is correct', () => {
    requestSuccessfulAuthRegister('firstuser@gmail.com', '123456', 'First', 'User');
    const authLoginReturn = requestSuccessfulAuthLogin('firstuser@gmail.com', '123456');
    expect(authLoginReturn).toStrictEqual({
      token: expect.any(String),
      authUserId: expect.any(Number),
    });
  });
  */

  test('Test the authUserId match', () => {
    const authRegisterReturn = requestSuccessfulAuthRegister(
      'firstuser@gmail.com', '123456', 'First', 'User'
    );

    const authLoginReturn = requestSuccessfulAuthLogin('firstuser@gmail.com', '123456');
    expect(authLoginReturn).toStrictEqual({
      token: expect.any(String),
      authUserId: authRegisterReturn.authUserId,
    });
  });

  test('Test the same user can log in twice and generate different tokens', () => {
    requestSuccessfulAuthRegister('firstuser@gmail.com', '123456', 'First', 'User');
    const authLoginReturn = requestSuccessfulAuthLogin('firstuser@gmail.com', '123456');
    const authLoginReturn2 = requestSuccessfulAuthLogin('firstuser@gmail.com', '123456');

    // Same user logging in twice should not throw an error
    expect(authLoginReturn2).toStrictEqual({
      token: expect.any(String),
      authUserId: expect.any(Number),
    });

    // Both login instances must have different tokens
    const token = authLoginReturn.token;
    const token2 = authLoginReturn2.token;
    expect(token).not.toBe(token2);
  });
});

describe('Return error', () => {
  describe('invalid email', () => {
    test('login when no existing users', () => {
      const authLoginReturn = requestErrorAuthLogin('firstuser@gmail.com', '123456');
      expect(authLoginReturn).toStrictEqual(ERROR);
    });

    test("existing user but email doesn't match", () => {
      requestSuccessfulAuthRegister(
        'firstuser@gmail.com', '123456', 'First', 'User'
      );
      const authLoginReturn = requestErrorAuthLogin('seconduser@gmail.com', '123456');
      expect(authLoginReturn).toStrictEqual(ERROR);
    });
  });

  describe('password is not correct', () => {
    test('login when no existing users', () => {
      const authLoginReturn = requestErrorAuthLogin('firstuser@gmail.com', '123456');
      expect(authLoginReturn).toStrictEqual(ERROR);
    });

    test("existing user but password doesn't match", () => {
      requestSuccessfulAuthRegister(
        'firstuser@gmail.com', '123456', 'First', 'User'
      );
      const authLoginReturn = requestErrorAuthLogin('firstuser@gmail.com', 'abcdef');
      expect(authLoginReturn).toStrictEqual(ERROR);
    });
  });
});
