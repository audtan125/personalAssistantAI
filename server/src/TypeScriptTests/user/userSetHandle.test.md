import {
  requestSuccessfulUserSetHandle,
  requestErrorUserSetHandle,
  requestSuccessfulUserProfile
} from '../../Helpers/requests/requestUserHelper';
import { requestSuccessfulAuthRegister } from '../../Helpers/requests/requestAuthHelper';
import { requestClear } from '../../Helpers/requests/requestOtherHelper';
import { requestSuccessfulChannelsCreate } from '../../Helpers/requests/requestChannelsHelper';
import { requestSuccessfulChannelDetails } from '../../Helpers/requests/requestChannelHelper';
// import { requestSuccessfulChannelDetails, requestSuccessfulChannelJoin } from '../../Helpers/requests/requestChannelHelper';
import { user, channelDetails, dmDetails } from '../../dataStore';
import { requestSuccessfulDmCreate, requestSuccessfulDmDetails } from '../../Helpers/requests/requestDmHelper';

const ERROR = 400;
const TOKEN_ERROR = 403;

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

describe('Test cases for successful changes to handle of a valid user', () => {
  test('test case for user with valid token and email', () => {
    const userRegister = requestSuccessfulAuthRegister(
      'testeremail@gmail.com', '123456', 'test', 'email'
    );
    expect(requestSuccessfulUserSetHandle(
      userRegister.token,
      'newhandle'
    )).toStrictEqual({});
    const userProfile = requestSuccessfulUserProfile(
      userRegister.token,
      userRegister.authUserId
    );
    expect(userProfile.user.handleStr).toStrictEqual('newhandle');
  });

  describe('Test that it updates dms and channels user is a member of', () => {
    let userRegister: {token: string, authUserId: number};
    let userObjectBeforeSetHandle: user;
    let userObjectAfterSetHandle: user;
    beforeEach(() => {
      userRegister = requestSuccessfulAuthRegister(
        'testemail@gmail.com', '123456', 'first', 'user'
      );

      userObjectBeforeSetHandle = {
        uId: userRegister.authUserId,
        email: 'testemail@gmail.com',
        nameFirst: 'first',
        nameLast: 'user',
        handleStr: 'oldhandle',
        profileImgUrl: expect.any(String)
      };

      userObjectAfterSetHandle = {
        uId: userRegister.authUserId,
        email: 'testemail@gmail.com',
        nameFirst: 'first',
        nameLast: 'user',
        handleStr: 'newhandle',
        profileImgUrl: expect.any(String)
      };
    });

    test('2 channels updated, user is the only member', () => {
      const chId1: number = requestSuccessfulChannelsCreate(
        userRegister.token, 'Channel 1', false).channelId;
      const chId2: number = requestSuccessfulChannelsCreate(
        userRegister.token, 'Channel 2', false).channelId;

      expect(requestSuccessfulUserSetHandle(
        userRegister.token,
        'newhandle'
      )).toStrictEqual({});

      const ch1Details: channelDetails = requestSuccessfulChannelDetails(
        userRegister.token, chId1);
      expect(ch1Details.ownerMembers).toContainEqual(userObjectAfterSetHandle);
      expect(ch1Details.ownerMembers).not.toContainEqual(userObjectBeforeSetHandle);
      expect(ch1Details.ownerMembers.length).toBe(1);
      expect(ch1Details.allMembers).toContainEqual(userObjectAfterSetHandle);
      expect(ch1Details.allMembers).not.toContainEqual(userObjectBeforeSetHandle);
      expect(ch1Details.allMembers.length).toBe(1);
      // Test channel 2 has also been updated
      const ch2Details: channelDetails = requestSuccessfulChannelDetails(
        userRegister.token, chId2);
      expect(ch2Details.ownerMembers).toContainEqual(userObjectAfterSetHandle);
      expect(ch2Details.ownerMembers).not.toContainEqual(userObjectBeforeSetHandle);
      expect(ch2Details.ownerMembers.length).toBe(1);
      expect(ch2Details.allMembers).toContainEqual(userObjectAfterSetHandle);
      expect(ch2Details.allMembers).not.toContainEqual(userObjectBeforeSetHandle);
      expect(ch2Details.allMembers.length).toBe(1);
    });

    // test('1 channel updated, user is not an owner member', () => {
    //   const secondUser: {
    //     token: string, authUserId: number
    //   } = requestSuccessfulAuthRegister(
    //     'secondtesteremail@gmail.com', '123456', 'previous', 'name'
    //   );
    //   const chId1: number = requestSuccessfulChannelsCreate(
    //     secondUser.token, 'Channel 1', false).channelId;
    //   requestSuccessfulChannelJoin(userRegister.token, chId1);

    //   const secondUserProfileBeforeSetHandle: user = requestSuccessfulUserProfile(
    //     secondUser.token, secondUser.authUserId).user;

    //   expect(requestSuccessfulUserSetHandle(
    //     userRegister.token,
    //     'newhandle'
    //   )).toStrictEqual({});

    //   const ch1Details: channelDetails = requestSuccessfulChannelDetails(
    //     userRegister.token, chId1);
    //   // Owner members doesn't affect second user
    //   expect(ch1Details.ownerMembers).toContainEqual(secondUserProfileBeforeSetHandle);
    //   expect(ch1Details.ownerMembers.length).toBe(1);

    //   expect(ch1Details.allMembers).toContainEqual(userObjectAfterSetHandle);
    //   expect(ch1Details.allMembers).not.toContainEqual(userObjectBeforeSetHandle);
    //   expect(ch1Details.allMembers).toContainEqual(secondUserProfileBeforeSetHandle);
    //   expect(ch1Details.allMembers.length).toBe(2);
    // });

    test('2 dms updated, user is the only member', () => {
      const dmId1: number = requestSuccessfulDmCreate(
        userRegister.token, []).dmId;
      const dmId2: number = requestSuccessfulDmCreate(
        userRegister.token, []).dmId;

      expect(requestSuccessfulUserSetHandle(
        userRegister.token,
        'newhandle'
      )).toStrictEqual({});

      const dm1Details: dmDetails = requestSuccessfulDmDetails(
        userRegister.token, dmId1);
      expect(dm1Details.members).toContainEqual(userObjectAfterSetHandle);
      expect(dm1Details.members).not.toContainEqual(userObjectBeforeSetHandle);
      expect(dm1Details.members.length).toBe(1);
      // Test dm 2 has also been updated
      const dm2Details: dmDetails = requestSuccessfulDmDetails(
        userRegister.token, dmId2);
      expect(dm2Details.members).toContainEqual(userObjectAfterSetHandle);
      expect(dm2Details.members).not.toContainEqual(userObjectBeforeSetHandle);
      expect(dm2Details.members.length).toBe(1);
    });

    // test('1 dm updated, user is not the only member', () => {
    //   const secondUser: {
    //     token: string, authUserId: number
    //   } = requestSuccessfulAuthRegister(
    //     'secondtesteremail@gmail.com', '123456', 'second', 'user'
    //   );
    //   const dmId1: number = requestSuccessfulDmCreate(
    //     userRegister.token, [secondUser.authUserId]).dmId;
    //   const secondUserProfileBeforeSetName: user = requestSuccessfulUserProfile(
    //     secondUser.token, secondUser.authUserId).user;

    //   expect(requestSuccessfulUserSetHandle(
    //     userRegister.token,
    //     'newhandle'
    //   )).toStrictEqual({});

    //   const dm1Details: dmDetails = requestSuccessfulDmDetails(
    //     userRegister.token, dmId1);
    //   expect(dm1Details.members).toContainEqual(userObjectAfterSetHandle);
    //   expect(dm1Details.members).not.toContainEqual(userObjectBeforeSetHandle);
    //   expect(dm1Details.members).toContainEqual(secondUserProfileBeforeSetName);
    //   expect(dm1Details.members.length).toBe(2);
    // });
  });

  test('test case for a user changing handle and another using the old handle of the previous user', () => {
    // first user's handle is oldhandle
    const userRegister = requestSuccessfulAuthRegister(
      'testeremail@gmail.com', '123456', 'old', 'handle'
    );
    // first user changes their handle
    expect(requestSuccessfulUserSetHandle(
      userRegister.token,
      'newhandle'
    )).toStrictEqual({});
    const userProfile = requestSuccessfulUserProfile(
      userRegister.token,
      userRegister.authUserId
    );
    const userRegister2 = requestSuccessfulAuthRegister(
      'testeremail2@gmail.com', '123456', 'second', 'user'
    );
    // second user can change handle to first user's old handle
    expect(requestSuccessfulUserSetHandle(
      userRegister2.token,
      'oldhandle'
    )).toStrictEqual({});
    const userProfile2 = requestSuccessfulUserProfile(
      userRegister2.token,
      userRegister2.authUserId
    );
    expect(userProfile.user.handleStr).not.toStrictEqual(userProfile2.user.handleStr);
  });

  // test('handle is minimum viable length', () => {
  //   const userRegister = requestSuccessfulAuthRegister(
  //     'testeremail@gmail.com', '123456', 'old', 'handle'
  //   );
  //   // handle must be at least 3 characters
  //   expect(requestSuccessfulUserSetHandle(
  //     userRegister.token,
  //     '123'
  //   )).toStrictEqual({});
  //   const userProfile = requestSuccessfulUserProfile(
  //     userRegister.token,
  //     userRegister.authUserId
  //   );
  //   expect(userProfile.user.handleStr).toStrictEqual('123');
  // });

  // test('handle is maximum viable length', () => {
  //   const userRegister = requestSuccessfulAuthRegister(
  //     'testeremail@gmail.com', '123456', 'old', 'handle'
  //   );
  //   // handle string is 20 characters
  //   expect(requestSuccessfulUserSetHandle(
  //     userRegister.token,
  //     'abcdefghijklmnopqrst'
  //   )).toStrictEqual({});
  //   const userProfile = requestSuccessfulUserProfile(
  //     userRegister.token,
  //     userRegister.authUserId
  //   );
  //   expect(userProfile.user.handleStr).toStrictEqual('abcdefghijklmnopqrst');
  // });
});

describe('Test cases for error returns', () => {
  describe('invalid handle', () => {
    test('handle is 2 characters long', () => {
      // handle must be at least 3 characters
      const userRegister = requestSuccessfulAuthRegister(
        'testeremail@gmail.com', '123456', 'old', 'handle'
      );
      const userSetHandle = requestErrorUserSetHandle(
        userRegister.token,
        'ab'
      );
      expect(userSetHandle).toStrictEqual(ERROR);
    });

    // test('handle is 21 characters long', () => {
    //   const userRegister = requestSuccessfulAuthRegister(
    //     'testeremail@gmail.com', '123456', 'old', 'handle'
    //   );
    //   // handle must be max 20 characters
    //   const userSetHandle = requestErrorUserSetHandle(
    //     userRegister.token,
    //     'abcdefghijklmnopqrst1'
    //   );
    //   expect(userSetHandle).toStrictEqual(ERROR);
    // });

    test('handle contains symbols', () => {
      const userRegister = requestSuccessfulAuthRegister(
        'testeremail@gmail.com', '123456', 'old', 'handle'
      );
      const userSetHandle = requestErrorUserSetHandle(
        userRegister.token,
        'arandomhandle@'
      );
      expect(userSetHandle).toStrictEqual(ERROR);
    });
  });

  test('Test for error if changing to handle that is already in use', () => {
    // First user's handle will be handlebeingused
    requestSuccessfulAuthRegister(
      'testeremail@gmail.com', '123456', 'handle', 'beingused'
    );
    const userRegister2 = requestSuccessfulAuthRegister(
      'testeremail2@gmail.com', '123456', 'old', 'handle'
    );
    // Second user sets handle to first user's handle
    const userSetHandle2 = requestErrorUserSetHandle(
      userRegister2.token,
      'handlebeingused'
    );
    expect(userSetHandle2).toStrictEqual(ERROR);
  });

  test('Test for invalid token', () => {
    const userRegister = requestSuccessfulAuthRegister(
      'testeremail@gmail.com', '123456', 'old', 'handle'
    );
    const userSetHandle = requestErrorUserSetHandle(
      userRegister.token + 'aInvalidToken',
      'newhandle'
    );
    expect(userSetHandle).toStrictEqual(TOKEN_ERROR);
  });
});
