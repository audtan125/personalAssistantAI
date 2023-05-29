import {
  requestSuccessfulUserSetEmail,
  requestErrorUserSetEmail,
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

describe('Test cases for successful changes to email of a valid user', () => {
  test('test case for user with valid token and email', () => {
    const userRegister = requestSuccessfulAuthRegister(
      'testeremail@gmail.com', '123456', 'test', 'email'
    );
    expect(requestSuccessfulUserSetEmail(
      userRegister.token,
      'avalidemail@gmail.com'
    )).toStrictEqual({});
    const userProfile = requestSuccessfulUserProfile(
      userRegister.token,
      userRegister.authUserId
    );
    expect(userProfile.user.email).toStrictEqual('avalidemail@gmail.com');
  });

  describe('Test that it updates dms and channels user is a member of', () => {
    let userRegister: {token: string, authUserId: number};
    let userObjectBeforeSetEmail: user;
    let userObjectAfterSetEmail: user;
    beforeEach(() => {
      userRegister = requestSuccessfulAuthRegister(
        'previousemail@gmail.com', '123456', 'first', 'user'
      );

      userObjectBeforeSetEmail = {
        uId: userRegister.authUserId,
        email: 'previousemail@gmail.com',
        nameFirst: 'first',
        nameLast: 'user',
        handleStr: 'firstuser',
        profileImgUrl: expect.any(String)
      };

      userObjectAfterSetEmail = {
        uId: userRegister.authUserId,
        email: 'newemail@gmail.com',
        nameFirst: 'first',
        nameLast: 'user',
        handleStr: 'firstuser',
        profileImgUrl: expect.any(String)
      };
    });

    test('2 channels updated, user is the only member', () => {
      const chId1: number = requestSuccessfulChannelsCreate(
        userRegister.token, 'Channel 1', false).channelId;
      const chId2: number = requestSuccessfulChannelsCreate(
        userRegister.token, 'Channel 2', false).channelId;

      expect(requestSuccessfulUserSetEmail(
        userRegister.token,
        'newemail@gmail.com'
      )).toStrictEqual({});

      const ch1Details: channelDetails = requestSuccessfulChannelDetails(
        userRegister.token, chId1);
      expect(ch1Details.ownerMembers).toContainEqual(userObjectAfterSetEmail);
      expect(ch1Details.ownerMembers).not.toContainEqual(userObjectBeforeSetEmail);
      expect(ch1Details.ownerMembers.length).toBe(1);
      expect(ch1Details.allMembers).toContainEqual(userObjectAfterSetEmail);
      expect(ch1Details.allMembers).not.toContainEqual(userObjectBeforeSetEmail);
      expect(ch1Details.allMembers.length).toBe(1);
      // Test channel 2 has also been updated
      const ch2Details: channelDetails = requestSuccessfulChannelDetails(
        userRegister.token, chId2);
      expect(ch2Details.ownerMembers).toContainEqual(userObjectAfterSetEmail);
      expect(ch2Details.ownerMembers).not.toContainEqual(userObjectBeforeSetEmail);
      expect(ch2Details.ownerMembers.length).toBe(1);
      expect(ch2Details.allMembers).toContainEqual(userObjectAfterSetEmail);
      expect(ch2Details.allMembers).not.toContainEqual(userObjectBeforeSetEmail);
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

    //   const secondUserProfileBeforeSetName: user = requestSuccessfulUserProfile(
    //     secondUser.token, secondUser.authUserId).user;

    //   expect(requestSuccessfulUserSetEmail(
    //     userRegister.token,
    //     'newemail@gmail.com'
    //   )).toStrictEqual({});

    //   const ch1Details: channelDetails = requestSuccessfulChannelDetails(
    //     userRegister.token, chId1);
    //   // Owner members doesn't affect second user
    //   expect(ch1Details.ownerMembers).toContainEqual(secondUserProfileBeforeSetName);
    //   expect(ch1Details.ownerMembers.length).toBe(1);

    //   expect(ch1Details.allMembers).toContainEqual(userObjectAfterSetEmail);
    //   expect(ch1Details.allMembers).not.toContainEqual(userObjectBeforeSetEmail);
    //   expect(ch1Details.allMembers).toContainEqual(secondUserProfileBeforeSetName);
    //   expect(ch1Details.allMembers.length).toBe(2);
    // });

    test('2 dms updated, user is the only member', () => {
      const dmId1: number = requestSuccessfulDmCreate(
        userRegister.token, []).dmId;
      const dmId2: number = requestSuccessfulDmCreate(
        userRegister.token, []).dmId;

      expect(requestSuccessfulUserSetEmail(
        userRegister.token,
        'newemail@gmail.com'
      )).toStrictEqual({});

      const dm1Details: dmDetails = requestSuccessfulDmDetails(
        userRegister.token, dmId1);
      expect(dm1Details.members).toContainEqual(userObjectAfterSetEmail);
      expect(dm1Details.members).not.toContainEqual(userObjectBeforeSetEmail);
      expect(dm1Details.members.length).toBe(1);
      // Test dm 2 has also been updated
      const dm2Details: dmDetails = requestSuccessfulDmDetails(
        userRegister.token, dmId2);
      expect(dm2Details.members).toContainEqual(userObjectAfterSetEmail);
      expect(dm2Details.members).not.toContainEqual(userObjectBeforeSetEmail);
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

    //   expect(requestSuccessfulUserSetEmail(
    //     userRegister.token,
    //     'newemail@gmail.com'
    //   )).toStrictEqual({});

    //   const dm1Details: dmDetails = requestSuccessfulDmDetails(
    //     userRegister.token, dmId1);
    //   expect(dm1Details.members).toContainEqual(userObjectAfterSetEmail);
    //   expect(dm1Details.members).not.toContainEqual(userObjectBeforeSetEmail);
    //   expect(dm1Details.members).toContainEqual(secondUserProfileBeforeSetName);
    //   expect(dm1Details.members.length).toBe(2);
    // });
  });

  test('test case for a user changing email and another using the old email of the previous user', () => {
    const userRegister = requestSuccessfulAuthRegister(
      'testeremail@gmail.com', '123456', 'test', 'email'
    );
    // first user changes his email to new one
    expect(requestSuccessfulUserSetEmail(
      userRegister.token,
      'avalidemail@gmail.com'
    )).toStrictEqual({});
    const userProfile = requestSuccessfulUserProfile(
      userRegister.token,
      userRegister.authUserId
    );
    const userRegister2 = requestSuccessfulAuthRegister(
      'testeremail2@gmail.com', '123456', 'test', 'email'
    );
    // second user can change email to first user's old email
    expect(requestSuccessfulUserSetEmail(
      userRegister2.token,
      'testeremail@gmail.com'
    )).toStrictEqual({});
    const userProfile2 = requestSuccessfulUserProfile(
      userRegister2.token,
      userRegister2.authUserId
    );
    expect(userProfile.user.email).not.toStrictEqual(userProfile2.user.email);
  });
});

describe('Test cases for error returns', () => {
  test('Test for invalid email', () => {
    const userRegister = requestSuccessfulAuthRegister(
      'testeremail@gmail.com', '123456', 'test', 'email'
    );
    const userSetEmail = requestErrorUserSetEmail(
      userRegister.token,
      'username@yes'
    );
    expect(userSetEmail).toStrictEqual(ERROR);
  });

  test('Test for error if changing to email that is already in use', () => {
    requestSuccessfulAuthRegister(
      'testeremail@gmail.com', '123456', 'test', 'email'
    );
    const userRegister2 = requestSuccessfulAuthRegister(
      'testeremail2@gmail.com', '123456', 'test', 'email'
    );
    const userSetEmail2 = requestErrorUserSetEmail(
      userRegister2.token,
      'testeremail@gmail.com'
    );
    expect(userSetEmail2).toStrictEqual(ERROR);
  });

  test('Test for invalid token', () => {
    const userRegister = requestSuccessfulAuthRegister(
      'testeremail@gmail.com', '123456', 'test', 'email'
    );
    const userSetEmail = requestErrorUserSetEmail(
      userRegister.token + 'aInvalidToken',
      'randomemail@gmail.com'
    );
    expect(userSetEmail).toStrictEqual(TOKEN_ERROR);
  });
});
