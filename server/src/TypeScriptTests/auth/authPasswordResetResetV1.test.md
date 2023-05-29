import {
  requestErrorAuthPasswordResetReset,
} from '../../Helpers/requests/requestAuthHelper';
import { requestClear } from '../../Helpers/requests/requestOtherHelper';

const ERROR = 400;

beforeAll(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

describe('Error password reset', () => {
  test('Invalid reset code', () => {
    expect(requestErrorAuthPasswordResetReset('something', 'newValidPassword')).toStrictEqual(ERROR);
  });

  test('Invalid password length (length < 6)', () => {
    expect(requestErrorAuthPasswordResetReset('something', '12345')).toStrictEqual(ERROR);
  });
});
