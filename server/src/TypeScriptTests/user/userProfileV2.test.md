import { requestSuccessfulUserProfile, requestErrorUserProfile } from '../../Helpers/requests/requestUserHelper';
import { requestSuccessfulAuthRegister } from '../../Helpers/requests/requestAuthHelper';
import { requestClear } from '../../Helpers/requests/requestOtherHelper';
const ERROR = 400;
const AUTH_ERROR = 403;

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

describe('Testing for sucessful retrieval of user profiles', () => {
  test('A valid user profile', () => {
    const userRegister = requestSuccessfulAuthRegister(
      'testeremail@gmail.com', '123456', 'test', 'email'
    );
    const userProfile = requestSuccessfulUserProfile(
      userRegister.token,
      userRegister.authUserId
    );

    expect(userProfile).toStrictEqual({
      user: {
        uId: userRegister.authUserId,
        email: 'testeremail@gmail.com',
        nameFirst: 'test',
        nameLast: 'email',
        handleStr: 'testemail',
        profileImgUrl: expect.any(String)
      }
    });
  });

  test('A test to find two valid user profiles', () => {
    const userRegister1 = requestSuccessfulAuthRegister(
      'testeremail1@gmail.com', '123456', 'first', 'person'
    );
    const userRegister2 = requestSuccessfulAuthRegister(
      'testeremail2@gmail.com', '123456', 'second', 'people'
    );
    const userProfile1 = requestSuccessfulUserProfile(
      userRegister1.token,
      userRegister1.authUserId
    );
    expect(userProfile1).toStrictEqual({
      user: {
        uId: userRegister1.authUserId,
        email: 'testeremail1@gmail.com',
        nameFirst: 'first',
        nameLast: 'person',
        handleStr: 'firstperson',
        profileImgUrl: expect.any(String)
      }
    });

    const userProfile2 = requestSuccessfulUserProfile(
      userRegister2.token,
      userRegister2.authUserId
    );
    expect(userProfile2).toStrictEqual({
      user: {
        uId: userRegister2.authUserId,
        email: 'testeremail2@gmail.com',
        nameFirst: 'second',
        nameLast: 'people',
        handleStr: 'secondpeople',
        profileImgUrl: expect.any(String)
      }
    });
  });
});

describe('Testing for error cases', () => {
  test('given the correct token but uId does not refer to a valid user', () => {
    const userRegister = requestSuccessfulAuthRegister(
      'testeremail@gmail.com', '123456', 'test', 'email'
    );
    const userProfile = requestErrorUserProfile(
      userRegister.token,
      userRegister.authUserId + 5
    );
    expect(userProfile).toStrictEqual(ERROR);
  });

  test('given the correct uId but token given is invalid', () => {
    const userRegister = requestSuccessfulAuthRegister(
      'testeremail@gmail.com', '123456', 'test', 'email'
    );
    const userProfile = requestErrorUserProfile(
      userRegister.token + 'aRandomToken',
      userRegister.authUserId
    );
    expect(userProfile).toStrictEqual(AUTH_ERROR);
  });

  test('Finding a profile with no existing users', () => {
    const userProfile = requestErrorUserProfile(
      'aRandomToken',
      4
    );
    expect(userProfile).toStrictEqual(AUTH_ERROR);
  });
});
