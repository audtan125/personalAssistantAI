import { requestSuccessfulAuthRegister, requestErrorAuthRegister } from '../../Helpers/requests/requestAuthHelper';
import { requestClear } from '../../Helpers/requests/requestOtherHelper';
import { requestSuccessfulUserProfile } from '../../Helpers/requests/requestUserHelper';

const ERROR = 400;

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

describe('Successful Register', () => {
  test('Test the structure of the return object is correct', () => {
    const authRegisterReturn = requestSuccessfulAuthRegister(
      'firstuser@gmail.com', '123456', 'First', 'User'
    );
    expect(authRegisterReturn).toStrictEqual({
      token: expect.any(String),
      authUserId: expect.any(Number),
    });
  });

  // test("Test duplicate authUserId's are not generated", () => {
  //   const authRegisterReturn = requestSuccessfulAuthRegister(
  //     'firstuser@gmail.com', '123456', 'First', 'User'
  //   );
  //   const authRegisterReturn2 = requestSuccessfulAuthRegister(
  //     'seconduser@gmail.com', '123456', 'Second', 'User'
  //   );
  //   const authUserId1 = authRegisterReturn.authUserId;
  //   const authUserId2 = authRegisterReturn2.authUserId;
  //   expect(authUserId1).not.toBe(authUserId2);
  // });

  // test('First name is the max length', () => {
  //   // This name is 50 characters
  //   const authRegisterReturn = requestSuccessfulAuthRegister(
  //     'firstuser@gmail.com',
  //     '123456',
  //     'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwx',
  //     'User'
  //   );
  //   expect(authRegisterReturn).toStrictEqual({
  //     token: expect.any(String),
  //     authUserId: expect.any(Number),
  //   });
  // });

  // test('Last name is the max length', () => {
  //   // This name is 50 characters
  //   const authRegisterReturn = requestSuccessfulAuthRegister(
  //     'firstuser@gmail.com',
  //     '123456',
  //     'First',
  //     'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwx'
  //   );
  //   expect(authRegisterReturn).toStrictEqual({
  //     token: expect.any(String),
  //     authUserId: expect.any(Number),
  //   });
  // });

  describe('handlestring length', () => {
    test('handlestring is cut off at 20 characters', () => {
      const firstUser = requestSuccessfulAuthRegister(
        'firstuser@gmail.com',
        '123456',
        'TheLengthOfThisHandleString',
        'IsTooLong'
      );
      expect(firstUser).toStrictEqual({
        token: expect.any(String),
        authUserId: expect.any(Number),
      });
      const secondUser = requestSuccessfulAuthRegister(
        'secondUser@gmail.com',
        '123456',
        'TheLengthOfThisHandleString',
        'IsTooLong'
      );
      expect(secondUser).toStrictEqual({
        token: expect.any(String),
        authUserId: expect.any(Number),
      });
      const firstUserProfile = requestSuccessfulUserProfile(
        firstUser.token, firstUser.authUserId).user;
      expect(firstUserProfile.handleStr).toBe('thelengthofthishandl');
      expect(firstUserProfile.handleStr.length).toBe(20);
      // from spec: The addition of this final number may result in the
      // handle exceeding the 20 character limit
      const secondUserProfile = requestSuccessfulUserProfile(
        secondUser.token, secondUser.authUserId).user;
      expect(secondUserProfile.handleStr).toBe('thelengthofthishandl0');
      expect(secondUserProfile.handleStr.length).toBe(21);
    });
  });

  describe('handle strings with symbols generates correctly', () => {
    test('duplicate handlestrings when first name has a symbol', () => {
      const firstUser = requestSuccessfulAuthRegister(
        'firstuser@gmail.com',
        '123456',
        '漢字First',
        'Name'
      );
      const secondUser = requestSuccessfulAuthRegister(
        'secondUser@gmail.com',
        '123456',
        'Fi漢rst字',
        'Name'
      );
      const firstUserProfile = requestSuccessfulUserProfile(
        firstUser.token, firstUser.authUserId).user;
      // handle string should remove chinese characters
      expect(firstUserProfile.handleStr).toBe('firstname');
      const secondUserProfile = requestSuccessfulUserProfile(
        secondUser.token, secondUser.authUserId).user;
      expect(secondUserProfile.handleStr).toBe('firstname0');
    });

    test('handlestrings are all symbols', () => {
      const firstUser = requestSuccessfulAuthRegister(
        'firstuser@gmail.com',
        '123456',
        '漢字',
        '漢字'
      );
      const secondUser = requestSuccessfulAuthRegister(
        'secondUser@gmail.com',
        '123456',
        '漢字',
        '漢字'
      );
      const firstUserProfile = requestSuccessfulUserProfile(
        firstUser.token, firstUser.authUserId).user;
      // Resulting handlestring is an empty string replaced with default
      expect(firstUserProfile.handleStr).toBe('');
      const secondUserProfile = requestSuccessfulUserProfile(
        secondUser.token, secondUser.authUserId).user;
      expect(secondUserProfile.handleStr).toBe('0');
    });
  });

  describe('handle strings with numbers generates correctly', () => {
    /*
    test('duplicate handlestrings when first name has a number', () => {
      // Name has numbers in it like elon musk's child
      const firstUser = requestSuccessfulAuthRegister(
        'firstuser@gmail.com', '123456', 'Same0', 'Name');
      const secondUser = requestSuccessfulAuthRegister(
        'secondUser@gmail.com', '123456', 'Same0', 'Name');
      const firstUserProfile = requestSuccessfulUserProfile(
        firstUser.token, firstUser.authUserId).user;
      expect(firstUserProfile.handleStr).toBe('same0name');
      const secondUserProfile = requestSuccessfulUserProfile(
        secondUser.token, secondUser.authUserId).user;
      expect(secondUserProfile.handleStr).toBe('same0name0');
    });

    test('duplicate handlestrings when last digit of last name is a number', () => {
      // Name has numbers in it like elon musk's child
      const firstUser = requestSuccessfulAuthRegister(
        'firstuser@gmail.com',
        '123456',
        'Same',
        'Name0'
      );
      const secondUser = requestSuccessfulAuthRegister(
        'secondUser@gmail.com',
        '123456',
        'Same',
        'Name0'
      );
      const firstUserProfile = requestSuccessfulUserProfile(
        firstUser.token, firstUser.authUserId).user;
      expect(firstUserProfile.handleStr).toBe('samename0');
      const secondUserProfile = requestSuccessfulUserProfile(
        secondUser.token, secondUser.authUserId).user;
      // Append number at end so it is not duplicate
      expect(secondUserProfile.handleStr).toBe('samename00');
    });
    */

    test('increments duplicate handlestrings correctly', () => {
      const firstUser = requestSuccessfulAuthRegister(
        'firstuser@gmail.com', '123456', 'Same', 'Name');
      const secondUser = requestSuccessfulAuthRegister(
        'secondUser@gmail.com', '123456', 'Same', 'Name');
      const thirdUser = requestSuccessfulAuthRegister(
        'thirdUser@gmail.com', '123456', 'Same', 'Name');
      const fourthUser = requestSuccessfulAuthRegister(
        'fourthUser@gmail.com', '123456', 'Same', 'Name');
      const firstUserProfile = requestSuccessfulUserProfile(
        firstUser.token, firstUser.authUserId).user;
      expect(firstUserProfile.handleStr).toBe('samename');
      const secondUserProfile = requestSuccessfulUserProfile(
        secondUser.token, secondUser.authUserId).user;
      expect(secondUserProfile.handleStr).toBe('samename0');
      const thirdUserProfile = requestSuccessfulUserProfile(
        thirdUser.token, thirdUser.authUserId).user;
      expect(thirdUserProfile.handleStr).toBe('samename1');
      const fourthUserProfile = requestSuccessfulUserProfile(
        fourthUser.token, fourthUser.authUserId).user;
      expect(fourthUserProfile.handleStr).toBe('samename2');
    });
  });
});

describe('Returns error', () => {
  test('email is a duplicate', () => {
    requestSuccessfulAuthRegister(
      'firstuser@gmail.com', '123456', 'First', 'User'
    );
    // email has already been registered with the above user
    const authRegisterReturn2 = requestErrorAuthRegister(
      'firstuser@gmail.com', '123456', 'Second', 'User'
    );
    expect(authRegisterReturn2).toStrictEqual(ERROR);
  });

  test('email is not an email', () => {
    // Does not have @gmail.com
    const authRegisterReturn = requestErrorAuthRegister(
      'invalidEmail', '123456', 'Second', 'User'
    );
    expect(authRegisterReturn).toStrictEqual(ERROR);
  });

  test('password is 1 character too short', () => {
    // length of password needs to be at least 6 characters
    const authRegisterReturn = requestErrorAuthRegister(
      'firstuser@gmail.com', '12345', 'First', 'User'
    );
    expect(authRegisterReturn).toStrictEqual(ERROR);
  });

  test('First name is too short', () => {
    // First name needs to be at least 1 character
    const authRegisterReturn = requestErrorAuthRegister(
      'firstuser@gmail.com', '123456', '', 'User'
    );
    expect(authRegisterReturn).toStrictEqual(ERROR);
  });

  // test('Last name is too short', () => {
  //   // Last name needs to be at least 1 character
  //   const authRegisterReturn = requestErrorAuthRegister(
  //     'firstuser@gmail.com', '123456', 'First', ''
  //   );
  //   expect(authRegisterReturn).toStrictEqual(ERROR);
  // });

  // test('First name is too long', () => {
  //   // This name is 51 characters
  //   const authRegisterReturn = requestErrorAuthRegister(
  //     'firstuser@gmail.com',
  //     '123456',
  //     'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxy',
  //     'User'
  //   );
  //   expect(authRegisterReturn).toStrictEqual(ERROR);
  // });

  // test('Last name is too long', () => {
  //   // This name is 51 characters
  //   const authRegisterReturn = requestErrorAuthRegister(
  //     'firstuser@gmail.com',
  //     '123456',
  //     'First',
  //     'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxy'
  //   );
  //   expect(authRegisterReturn).toStrictEqual(ERROR);
  // });
});
