import {
  requestSuccessfulUserSetName, requestErrorUserSetName,
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

describe('Test cases for sucessfully setting name of the user', () => {
  test('Testing for valid user inputs', () => {
    const userRegister = requestSuccessfulAuthRegister(
      'testeremail@gmail.com', '123456', 'test', 'email'
    );
    expect(requestSuccessfulUserSetName(
      userRegister.token,
      'first',
      'last'
    )).toStrictEqual({});
    const userProfile = requestSuccessfulUserProfile(
      userRegister.token, userRegister.authUserId
    );
    expect(userProfile.user.nameFirst).toStrictEqual('first');
    expect(userProfile.user.nameLast).toStrictEqual('last');
  });

  describe('Test that it updates dms and channels user is a member of', () => {
    let userRegister: {token: string, authUserId: number};
    let userObjectBeforeSetName: user;
    let userObjectAfterSetName: user;
    beforeEach(() => {
      userRegister = requestSuccessfulAuthRegister(
        'testeremail@gmail.com', '123456', 'previous', 'name'
      );

      userObjectBeforeSetName = {
        uId: userRegister.authUserId,
        email: 'testeremail@gmail.com',
        nameFirst: 'previous',
        nameLast: 'name',
        handleStr: 'previousname',
        profileImgUrl: expect.any(String)
      };

      userObjectAfterSetName = {
        uId: userRegister.authUserId,
        email: 'testeremail@gmail.com',
        nameFirst: 'new',
        nameLast: 'names',
        // assume handle string does not regenerate after changing name
        handleStr: 'previousname',
        profileImgUrl: expect.any(String)
      };
    });

    test('1 channel updated, user is the only member', () => {
      const chId1: number = requestSuccessfulChannelsCreate(
        userRegister.token, 'Channel 1', false).channelId;

      expect(requestSuccessfulUserSetName(
        userRegister.token,
        'new',
        'names'
      )).toStrictEqual({});

      const ch1Details: channelDetails = requestSuccessfulChannelDetails(
        userRegister.token, chId1);
      // test owner members and all members has been updated
      expect(ch1Details.ownerMembers).toContainEqual(userObjectAfterSetName);
      expect(ch1Details.ownerMembers).not.toContainEqual(userObjectBeforeSetName);
      expect(ch1Details.ownerMembers.length).toBe(1);
      expect(ch1Details.allMembers).toContainEqual(userObjectAfterSetName);
      expect(ch1Details.allMembers).not.toContainEqual(userObjectBeforeSetName);
      expect(ch1Details.allMembers.length).toBe(1);
    });

    // test('2 channels updated, user is the only member', () => {
    //   const chId1: number = requestSuccessfulChannelsCreate(
    //     userRegister.token, 'Channel 1', false).channelId;
    //   const chId2: number = requestSuccessfulChannelsCreate(
    //     userRegister.token, 'Channel 2', false).channelId;

    //   expect(requestSuccessfulUserSetName(
    //     userRegister.token,
    //     'new',
    //     'names'
    //   )).toStrictEqual({});

    //   const ch1Details: channelDetails = requestSuccessfulChannelDetails(
    //     userRegister.token, chId1);
    //   expect(ch1Details.ownerMembers).toContainEqual(userObjectAfterSetName);
    //   expect(ch1Details.ownerMembers).not.toContainEqual(userObjectBeforeSetName);
    //   expect(ch1Details.ownerMembers.length).toBe(1);
    //   expect(ch1Details.allMembers).toContainEqual(userObjectAfterSetName);
    //   expect(ch1Details.allMembers).not.toContainEqual(userObjectBeforeSetName);
    //   expect(ch1Details.allMembers.length).toBe(1);
    //   // Test channel 2 has also been updated
    //   const ch2Details: channelDetails = requestSuccessfulChannelDetails(
    //     userRegister.token, chId2);
    //   expect(ch2Details.ownerMembers).toContainEqual(userObjectAfterSetName);
    //   expect(ch2Details.ownerMembers).not.toContainEqual(userObjectBeforeSetName);
    //   expect(ch2Details.ownerMembers.length).toBe(1);
    //   expect(ch2Details.allMembers).toContainEqual(userObjectAfterSetName);
    //   expect(ch2Details.allMembers).not.toContainEqual(userObjectBeforeSetName);
    //   expect(ch2Details.allMembers.length).toBe(1);
    // });

    // test('1 channel updated, user is not an owner member', () => {
    //   const secondUser: {
    //     token: string, authUserId: number
    //   } = requestSuccessfulAuthRegister(
    //     'secondtesteremail@gmail.com', '123456', 'previous', 'name'
    //   );
    //   const chId1: number = requestSuccessfulChannelsCreate(
    //     secondUser.token, 'Channel 1', false).channelId;
    //   requestSuccessfulChannelJoin(userRegister.token, chId1);

    //   const secondUserProfileBeforeSetName: user = requestSuccessfulUserProfile(
    //     secondUser.token, secondUser.authUserId).user;

    //   expect(requestSuccessfulUserSetName(
    //     userRegister.token,
    //     'new',
    //     'names'
    //   )).toStrictEqual({});

    //   const ch1Details: channelDetails = requestSuccessfulChannelDetails(
    //     userRegister.token, chId1);
    //   // Owner members doesn't contain the user object and doesn't affect second user
    //   expect(ch1Details.ownerMembers).not.toContainEqual(userObjectAfterSetName);
    //   expect(ch1Details.ownerMembers).not.toContainEqual(userObjectBeforeSetName);
    //   expect(ch1Details.ownerMembers).toContainEqual(secondUserProfileBeforeSetName);
    //   expect(ch1Details.ownerMembers.length).toBe(1);

    //   expect(ch1Details.allMembers).toContainEqual(userObjectAfterSetName);
    //   expect(ch1Details.allMembers).not.toContainEqual(userObjectBeforeSetName);
    //   expect(ch1Details.allMembers).toContainEqual(secondUserProfileBeforeSetName);
    //   expect(ch1Details.allMembers.length).toBe(2);
    // });

    test('2 dms updated, user is the only member', () => {
      const dmId1: number = requestSuccessfulDmCreate(
        userRegister.token, []).dmId;
      const dmId2: number = requestSuccessfulDmCreate(
        userRegister.token, []).dmId;

      expect(requestSuccessfulUserSetName(
        userRegister.token,
        'new',
        'names'
      )).toStrictEqual({});

      const dm1Details: dmDetails = requestSuccessfulDmDetails(
        userRegister.token, dmId1);
      expect(dm1Details.members).toContainEqual(userObjectAfterSetName);
      expect(dm1Details.members).not.toContainEqual(userObjectBeforeSetName);
      expect(dm1Details.members.length).toBe(1);
      // Test dm 2 has also been updated
      const dm2Details: dmDetails = requestSuccessfulDmDetails(
        userRegister.token, dmId2);
      expect(dm2Details.members).toContainEqual(userObjectAfterSetName);
      expect(dm2Details.members).not.toContainEqual(userObjectBeforeSetName);
      expect(dm2Details.members.length).toBe(1);
    });

    // test('1 dm updated, user is not the only member', () => {
    //   const secondUser: {
    //     token: string, authUserId: number
    //   } = requestSuccessfulAuthRegister(
    //     'secondtesteremail@gmail.com', '123456', 'previous', 'name'
    //   );
    //   const dmId1: number = requestSuccessfulDmCreate(
    //     userRegister.token, [secondUser.authUserId]).dmId;
    //   const secondUserProfileBeforeSetName: user = requestSuccessfulUserProfile(
    //     secondUser.token, secondUser.authUserId).user;

    //   expect(requestSuccessfulUserSetName(
    //     userRegister.token,
    //     'new',
    //     'names'
    //   )).toStrictEqual({});

    //   const dm1Details: dmDetails = requestSuccessfulDmDetails(
    //     userRegister.token, dmId1);
    //   expect(dm1Details.members).toContainEqual(userObjectAfterSetName);
    //   expect(dm1Details.members).not.toContainEqual(userObjectBeforeSetName);
    //   expect(dm1Details.members).toContainEqual(secondUserProfileBeforeSetName);
    //   expect(dm1Details.members.length).toBe(2);
    // });
  });

  // test('nameFirst and nameLast are both 1 character long', () => {
  //   const userRegister = requestSuccessfulAuthRegister(
  //     'testeremail@gmail.com', '123456', 'test', 'email'
  //   );
  //   expect(requestSuccessfulUserSetName(
  //     userRegister.token,
  //     'f',
  //     'l'
  //   )).toStrictEqual({});
  //   const userProfile = requestSuccessfulUserProfile(
  //     userRegister.token, userRegister.authUserId
  //   );
  //   expect(userProfile.user.nameFirst).toStrictEqual('f');
  //   expect(userProfile.user.nameLast).toStrictEqual('l');
  // });

  // test('nameFirst and nameLast are both 50 character long', () => {
  //   const userRegister = requestSuccessfulAuthRegister(
  //     'testeremail@gmail.com', '123456', 'test', 'email'
  //   );
  //   expect(requestSuccessfulUserSetName(
  //     userRegister.token,
  //     'ffffffffffffffffffffffffffffffffffffffffffffffffff',
  //     'llllllllllllllllllllllllllllllllllllllllllllllllll'
  //   )).toStrictEqual({});
  //   const userProfile = requestSuccessfulUserProfile(
  //     userRegister.token, userRegister.authUserId
  //   );
  //   expect(userProfile.user.nameFirst).toStrictEqual(
  //     'ffffffffffffffffffffffffffffffffffffffffffffffffff'
  //   );
  //   expect(userProfile.user.nameLast).toStrictEqual(
  //     'llllllllllllllllllllllllllllllllllllllllllllllllll'
  //   );
  // });
});

describe('Test for error return cases', () => {
  test('Test for nameFirst is less than 1', () => {
    const userRegister = requestSuccessfulAuthRegister(
      'testeremail@gmail.com', '123456', 'test', 'email'
    );
    const userSetName = requestErrorUserSetName(
      userRegister.token,
      '',
      'last'
    );
    expect(userSetName).toStrictEqual(ERROR);
  });

  // test('Test for nameLast is less than 1', () => {
  //   const userRegister = requestSuccessfulAuthRegister(
  //     'testeremail@gmail.com', '123456', 'test', 'email'
  //   );
  //   const userSetName = requestErrorUserSetName(
  //     userRegister.token,
  //     'first',
  //     ''
  //   );
  //   expect(userSetName).toStrictEqual(ERROR);
  // });

  // test('Test for nameFirst is 51 characters', () => {
  //   const userRegister = requestSuccessfulAuthRegister(
  //     'testeremail@gmail.com', '123456', 'test', 'email'
  //   );
  //   const userSetName = requestErrorUserSetName(
  //     userRegister.token,
  //     'fffffffffffffffffffffffffffffffffffffffffffffffffff',
  //     'last'
  //   );
  //   expect(userSetName).toStrictEqual(ERROR);
  // });

  // test('Test for nameLast is 51 characters', () => {
  //   const userRegister = requestSuccessfulAuthRegister(
  //     'testeremail@gmail.com', '123456', 'test', 'email'
  //   );
  //   const userSetName = requestErrorUserSetName(
  //     userRegister.token,
  //     'first',
  //     'lllllllllllllllllllllllllllllllllllllllllllllllllll'
  //   );
  //   expect(userSetName).toStrictEqual(ERROR);
  // });

  test('Given an invalid token which does not exists', () => {
    const userRegister = requestSuccessfulAuthRegister(
      'testeremail@gmail.com', '123456', 'test', 'email'
    );
    const userSetName = requestErrorUserSetName(
      userRegister.token + 'AnInvalidToken',
      'first',
      'last'
    );
    expect(userSetName).toStrictEqual(TOKEN_ERROR);
  });

  test('Changing the name while there is no user registered in the system', () => {
    const userSetName = requestErrorUserSetName(
      'AnInvalidToken',
      'first',
      'last'
    );
    expect(userSetName).toStrictEqual(TOKEN_ERROR);
  });
});
