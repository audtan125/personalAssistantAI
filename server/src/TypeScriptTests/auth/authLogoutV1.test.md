import { requestSuccessfulAuthLogout, requestErrorAuthLogout, requestSuccessfulAuthLogin, requestSuccessfulAuthRegister }
  from '../../Helpers/requests/requestAuthHelper';
import { requestClear } from '../../Helpers/requests/requestOtherHelper';
const TOKEN_ERROR = 403;

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

describe('Successful logout', () => {
  test('Test logouts for one instance of registration and one login of a user', () => {
    // authRegister AND authLogin both generate unique tokens
    // so there are 2 tokens for First User
    const authRegisterToken = requestSuccessfulAuthRegister(
      'firstuser@gmail.com', '123456', 'First', 'User'
    ).token;
    const authLoginToken = requestSuccessfulAuthLogin(
      'firstuser@gmail.com', '123456'
    ).token;
    expect(requestSuccessfulAuthLogout(authLoginToken)).toStrictEqual({});
    expect(requestSuccessfulAuthLogout(authRegisterToken)).toStrictEqual({});
  });

  /*
  // Multiple users with multiple tokens.
  test('Test logouts for two users with two tokens each', () => {
    const userTokens = [
      requestSuccessfulAuthRegister('firstuser@gmail.com', '123456', 'First', 'User'),
      requestSuccessfulAuthRegister('seconduser@gmail.com', '123456', 'Second', 'User'),
      requestSuccessfulAuthLogin('firstuser@gmail.com', '123456'),
      requestSuccessfulAuthLogin('seconduser@gmail.com', '123456')
    ];

    for (const userToken of userTokens) {
      expect(requestSuccessfulAuthLogout(userToken.token)).toStrictEqual({});
    }
  });
  */
});

describe('Return error', () => {
  test('Test logout with token that does not exist', () => {
    const authRegisterToken = requestSuccessfulAuthRegister(
      'firstuser@gmail.com', '123456', 'First', 'User'
    ).token;
    expect(requestErrorAuthLogout('A' + authRegisterToken)).toStrictEqual(TOKEN_ERROR);
  });

  test('Test logout with token that is already logged out', () => {
    const authRegisterToken = requestSuccessfulAuthRegister(
      'firstuser@gmail.com', '123456', 'First', 'User'
    ).token;
    requestSuccessfulAuthLogout(authRegisterToken);
    expect(requestErrorAuthLogout(authRegisterToken)).toStrictEqual(TOKEN_ERROR);
  });
});
