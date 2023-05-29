import { requestSuccessfulUserAll, requestErrorUserAll } from '../../Helpers/requests/requestUserHelper';
import { requestSuccessfulAuthRegister, requestSuccessfulAuthLogin } from '../../Helpers/requests/requestAuthHelper';
import { requestClear } from '../../Helpers/requests/requestOtherHelper';

const TOKEN_ERROR = 403;

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

describe('Test cases for successful retrieval of all users and their details', () => {
  test('One user registered with a valid token', () => {
    const userRegister = requestSuccessfulAuthRegister(
      'testeremail@gmail.com', '123456', 'test', 'email'
    );
    const userViewAll = requestSuccessfulUserAll(userRegister.token);
    const userToReturn = {
      uId: userRegister.authUserId,
      email: 'testeremail@gmail.com',
      nameFirst: 'test',
      nameLast: 'email',
      handleStr: 'testemail',
      profileImgUrl: expect.any(String)
    };
    expect(userViewAll).toStrictEqual({ users: [userToReturn] });
  });

  test('Testing 2 user registered with a valid token', () => {
    const userRegister1 = requestSuccessfulAuthRegister(
      'testeremail1@gmail.com', '123456', 'first', 'email'
    );
    const userRegister2 = requestSuccessfulAuthRegister(
      'testeremail2@gmail.com', '123456', 'second', 'email'
    );
    const userViewAll1 = requestSuccessfulUserAll(userRegister1.token);
    const userToReturn1 = {
      uId: userRegister1.authUserId,
      email: 'testeremail1@gmail.com',
      nameFirst: 'first',
      nameLast: 'email',
      handleStr: 'firstemail',
      profileImgUrl: expect.any(String)
    };
    const userViewAll2 = requestSuccessfulUserAll(userRegister2.token);
    const userToReturn2 = {
      uId: userRegister2.authUserId,
      email: 'testeremail2@gmail.com',
      nameFirst: 'second',
      nameLast: 'email',
      handleStr: 'secondemail',
      profileImgUrl: expect.any(String)
    };
    expect(userViewAll1).toStrictEqual({ users: [{ ...userToReturn1 }, { ...userToReturn2 }] });
    expect(userViewAll2).toStrictEqual({ users: [{ ...userToReturn1 }, { ...userToReturn2 }] });
  });

  test('Testing for the same user with a different token', () => {
    const userRegister = requestSuccessfulAuthRegister(
      'testeremail@gmail.com', '123456', 'test', 'email'
    );
    const userLogin = requestSuccessfulAuthLogin('testeremail@gmail.com', '123456');
    const userToReturn = {
      uId: userRegister.authUserId,
      email: 'testeremail@gmail.com',
      nameFirst: 'test',
      nameLast: 'email',
      handleStr: 'testemail',
      profileImgUrl: expect.any(String)
    };
    const userRegisterViewAll = requestSuccessfulUserAll(userRegister.token);
    const userLoginViewAll = requestSuccessfulUserAll(userLogin.token);
    expect(userRegisterViewAll).toStrictEqual({ users: [userToReturn] });
    expect(userLoginViewAll).toStrictEqual({ users: [userToReturn] });
  });
});

describe('Test for error return cases', () => {
  test('Test for invalid token', () => {
    const userRegister = requestSuccessfulAuthRegister(
      'testeremail@gmail.com', '123456', 'test', 'email'
    );
    const userViewAll = requestErrorUserAll(userRegister.token + 'invalidToken');
    expect(userViewAll).toStrictEqual(TOKEN_ERROR);
  });

  test('Test for viewing when there is no users in the dataSet', () => {
    const userViewAll = requestErrorUserAll('aRandomToken');
    expect(userViewAll).toStrictEqual(TOKEN_ERROR);
  });
});
