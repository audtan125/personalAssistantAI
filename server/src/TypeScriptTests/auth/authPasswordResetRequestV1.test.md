
import {
  requestSuccessfulAuthRegister, requestSuccessfulAuthPasswordResetRequest, requestSuccessfulAuthLogin,
  requestErrorAuthLogout
} from '../../Helpers/requests/requestAuthHelper';
import { requestClear } from '../../Helpers/requests/requestOtherHelper';

const TOKEN_ERROR = 403;

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

test('Email address does not belong to a registered user', () => {
  expect(requestSuccessfulAuthPasswordResetRequest('firstuser@gmail.com')).toStrictEqual({});
});

test('Email address belongs to a registered user', () => {
  requestSuccessfulAuthRegister('boostf15b@gmail.com', '123456', 'First', 'User');
  expect(requestSuccessfulAuthPasswordResetRequest('boostf15b@gmail.com')).toStrictEqual({});
});

test('User is logged out of all current sessions', () => {
  // Creates multiple sessions for a single user.
  const tokenArray: string[] = [];
  tokenArray.push(requestSuccessfulAuthRegister('boostf15b@gmail.com', '123456', 'First', 'User').token);
  for (let i = 0; i < 2; i++) {
    tokenArray.push(requestSuccessfulAuthLogin('boostf15b@gmail.com', '123456').token);
  }

  requestSuccessfulAuthPasswordResetRequest('boostf15b@gmail.com');

  // Checks that all sessions/tokens have been invalidated.
  for (const token of tokenArray) {
    expect(requestErrorAuthLogout(token)).toStrictEqual(TOKEN_ERROR);
  }
});
