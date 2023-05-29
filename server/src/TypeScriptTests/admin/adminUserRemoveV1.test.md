import { requestSuccessfulAuthPasswordResetRequest, requestSuccessfulAuthRegister }
  from '../../Helpers/requests/requestAuthHelper';
import { requestClear } from '../../Helpers/requests/requestOtherHelper';
import {
  requestSuccessfulAdminUserRemove, requestErrorAdminUserRemove,
  requestSuccessfulAdminUserPermissionChange
} from '../../Helpers/requests/requestAdminHelper';
import { requestSuccessfulChannelsCreate } from '../../Helpers/requests/requestChannelsHelper';
import { requestSuccessfulChannelDetails, requestSuccessfulChannelJoin, requestSuccessfulChannelMessages } from '../../Helpers/requests/requestChannelHelper';
import { requestSuccessfulDmCreate, requestSuccessfulDmDetails } from '../../Helpers/requests/requestDmHelper';
import { requestSuccessfulUserAll, requestSuccessfulUserProfile } from '../../Helpers/requests/requestUserHelper';
import { requestSuccessfulSendDm, requestSuccessfulSendMessage } from '../../Helpers/requests/requestMessageHelper';
import { requestSuccessfulDmMessages } from '../../Helpers/requests/requestDmHelper';

const ERROR = 400;
const TOKEN_ERROR = 403;

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

describe('Successful admin user remove', () => {
  // test('Remove a user that is not in any channel or dm and check that their profile is still retrievable', () => {
  //   const userRegister = requestSuccessfulAuthRegister(
  //     'testeremail@gmail.com', '123456', 'test', 'email'
  //   );
  //   const userRegister2 = requestSuccessfulAuthRegister(
  //     'testeremail2@gmail.com', '123456', 'second', 'user'
  //   );

  //   const userRemoved = requestSuccessfulUserProfile(userRegister2.token, userRegister2.authUserId);
  //   requestSuccessfulAdminUserRemove(userRegister.token, userRegister2.authUserId);

  //   const allUsers = requestSuccessfulUserAll(userRegister.token).users;
  //   expect(allUsers).not.toContainEqual(userRemoved);
  //   expect(allUsers.length).toStrictEqual(1);

  //   const profile = requestSuccessfulUserProfile(userRegister.token, userRegister2.authUserId).user;
  //   expect(profile).toStrictEqual(
  //     {
  //       uId: userRegister2.authUserId,
  //       nameFirst: 'Removed',
  //       nameLast: 'user',
  //       profileImgUrl: expect.any(String),
  //     }
  //   );

  //   expect(profile.email).toStrictEqual(undefined);
  //   expect(profile.handleStr).toStrictEqual(undefined);
  // });
  /*
  test('Remove a user that is in a channel', () => {
    const userRegister = requestSuccessfulAuthRegister(
      'testeremail@gmail.com', '123456', 'test', 'email'
    );
    const userRegister2 = requestSuccessfulAuthRegister(
      'testeremail2@gmail.com', '123456', 'second', 'user'
    );

    const chId1: number = requestSuccessfulChannelsCreate(
      userRegister.token, 'Channel 1', true).channelId;
    requestSuccessfulChannelJoin(userRegister2.token, chId1);

    const userRemoved = requestSuccessfulUserProfile(userRegister2.token, userRegister2.authUserId);
    requestSuccessfulAdminUserRemove(userRegister.token, userRegister2.authUserId);

    const chDetails1 = requestSuccessfulChannelDetails(userRegister.token, chId1);

    // Checks that user is no longer in channel
    expect(chDetails1.allMembers).not.toContainEqual(userRemoved);
    expect(chDetails1.ownerMembers).not.toContainEqual(userRemoved);

    // Ensures the other user did not get removed
    expect(chDetails1.allMembers.length).toStrictEqual(1);
    expect(chDetails1.ownerMembers.length).toStrictEqual(1);
  });
  */
  /*
  test('Remove a user that is in a DM with another user', () => {
    const userRegister = requestSuccessfulAuthRegister(
      'testeremail@gmail.com', '123456', 'test', 'email'
    );
    const userRegister2 = requestSuccessfulAuthRegister(
      'testeremail2@gmail.com', '123456', 'second', 'user'
    );

    const dmId: number = requestSuccessfulDmCreate(
      userRegister.token, [userRegister2.authUserId]).dmId;

    const userRemoved = requestSuccessfulUserProfile(userRegister2.token, userRegister2.authUserId);
    requestSuccessfulAdminUserRemove(userRegister.token, userRegister2.authUserId);

    const dmDetails1 = requestSuccessfulDmDetails(userRegister.token, dmId);

    // Checks that user is no longer in DM
    expect(dmDetails1.members).not.toContainEqual(userRemoved);

    // Ensures the other user did not get removed
    expect(dmDetails1.members.length).toStrictEqual(1);
  });
  */

  test('Remove user that is in 2 channels and 2 DMs, user is a creator of a DM and channel.', () => {
    const userRegister = requestSuccessfulAuthRegister(
      'testeremail@gmail.com', '123456', 'test', 'email'
    );
    const userRegister2 = requestSuccessfulAuthRegister(
      'testeremail2@gmail.com', '123456', 'second', 'user'
    );

    const chId1: number = requestSuccessfulChannelsCreate(
      userRegister.token, 'Channel 1', true).channelId;
    requestSuccessfulChannelJoin(userRegister2.token, chId1);

    const chId2: number = requestSuccessfulChannelsCreate(
      userRegister2.token, 'Channel 2', true).channelId;
    requestSuccessfulChannelJoin(userRegister.token, chId2);

    const dmId1: number = requestSuccessfulDmCreate(
      userRegister.token, [userRegister2.authUserId]).dmId;

    const dmId2: number = requestSuccessfulDmCreate(
      userRegister2.token, [userRegister.authUserId]).dmId;

    const userRemoved = requestSuccessfulUserProfile(userRegister2.token, userRegister2.authUserId);
    requestSuccessfulAdminUserRemove(userRegister.token, userRegister2.authUserId);

    const chDetails1 = requestSuccessfulChannelDetails(userRegister.token, chId1);
    const chDetails2 = requestSuccessfulChannelDetails(userRegister.token, chId2);
    const dmDetails1 = requestSuccessfulDmDetails(userRegister.token, dmId1);
    const dmDetails2 = requestSuccessfulDmDetails(userRegister.token, dmId2);

    const channelsAndDms = [chDetails1.allMembers, chDetails1.ownerMembers, chDetails2.allMembers, dmDetails1.members, dmDetails2.members];
    for (const memberArr of channelsAndDms) {
      expect(memberArr).not.toContainEqual(userRemoved);
      expect(memberArr.length).toStrictEqual(1);
    }

    // Removed user was the owner of this channel
    expect(chDetails2.ownerMembers).not.toContainEqual(userRemoved);
    expect(chDetails2.ownerMembers.length).toStrictEqual(0);
  });

  test('Removed user that has sent a message in a DM and a channel', () => {
    const userRegister = requestSuccessfulAuthRegister(
      'testeremail@gmail.com', '123456', 'test', 'email'
    );
    const userRegister2 = requestSuccessfulAuthRegister(
      'testeremail2@gmail.com', '123456', 'second', 'user'
    );

    const chId1: number = requestSuccessfulChannelsCreate(
      userRegister.token, 'Channel 1', true).channelId;
    requestSuccessfulChannelJoin(userRegister2.token, chId1);

    const dmId1: number = requestSuccessfulDmCreate(
      userRegister.token, [userRegister2.authUserId]).dmId;

    // Both users each send a message to the channel and DM
    requestSuccessfulSendMessage(userRegister.token, chId1, 'channel message one');
    requestSuccessfulSendMessage(userRegister2.token, chId1, 'channel message two');
    requestSuccessfulSendDm(userRegister2.token, dmId1, 'dm message two');
    requestSuccessfulSendDm(userRegister.token, dmId1, 'dm message one');

    requestSuccessfulAdminUserRemove(userRegister.token, userRegister2.authUserId);

    const chMsgs1 = requestSuccessfulChannelMessages(userRegister.token, chId1, 0).messages;
    const dmMsgs1 = requestSuccessfulDmMessages(userRegister.token, dmId1, 0).messages;
    const allMsgs = chMsgs1.concat(dmMsgs1);

    for (const msg of allMsgs) {
      if (msg.uId === userRegister2.authUserId) {
        expect(msg.message).toStrictEqual('Removed user');
      } else {
        expect(msg.message).not.toStrictEqual('Removed user');
      }
    }
  });

  // test('Creating new user with email and handle string as removed user', () => {
  //   const userRegister = requestSuccessfulAuthRegister(
  //     'testeremail@gmail.com', '123456', 'test', 'email'
  //   );
  //   const userRegister2 = requestSuccessfulAuthRegister(
  //     'testeremail2@gmail.com', '123456', 'second', 'user'
  //   );

  //   requestSuccessfulAdminUserRemove(userRegister.token, userRegister2.authUserId);

  //   const userRegisterDuplicate = requestSuccessfulAuthRegister(
  //     'testeremail2@gmail.com', '123456', 'second', 'user'
  //   );
  //   const userDuplicate = requestSuccessfulUserProfile(userRegisterDuplicate.token, userRegisterDuplicate.authUserId);
  //   expect(userDuplicate.user.handleStr).toStrictEqual('seconduser');
  //   expect(userDuplicate.user.email).toStrictEqual('testeremail2@gmail.com');
  // });
  /*
  test('Remove a user that is in a DM by themselves', () => {
    const userRegister = requestSuccessfulAuthRegister(
      'testeremail@gmail.com', '123456', 'test', 'email'
    );
    const userRegister2 = requestSuccessfulAuthRegister(
      'testeremail2@gmail.com', '123456', 'second', 'user'
    );

    const userRemove = requestSuccessfulAdminUserRemove(userRegister.token, userRegister2.authUserId);
    expect(userRemove).toStrictEqual({});
  });
  */
  test('An owner removing another owner', () => {
    const userRegister = requestSuccessfulAuthRegister(
      'testeremail@gmail.com', '123456', 'test', 'email'
    );
    const userRegister2 = requestSuccessfulAuthRegister(
      'testeremail2@gmail.com', '123456', 'second', 'user'
    );
    const profile = requestSuccessfulUserProfile(userRegister.token, userRegister2.authUserId).user;
    // Make user 2 global owner
    // Permission of ID = Owner
    requestSuccessfulAdminUserPermissionChange(userRegister.token, userRegister2.authUserId, 1);
    requestSuccessfulAdminUserRemove(userRegister.token, userRegister2.authUserId);

    expect(requestSuccessfulUserAll(userRegister.token).users).not.toContainEqual(profile);
  });

  test("Removing a user invalidates that user's reset codes", () => {
    const userRegister = requestSuccessfulAuthRegister(
      'testeremail@gmail.com', '123456', 'test', 'email'
    );
    const userRegister2 = requestSuccessfulAuthRegister(
      'boostf15b@gmail.com', '123456', 'second', 'user'
    );

    requestSuccessfulAuthPasswordResetRequest('boostf15b@gmail.com');
    requestSuccessfulAuthPasswordResetRequest('boostf15b@gmail.com');

    const userRemove = requestSuccessfulAdminUserRemove(userRegister.token, userRegister2.authUserId);
    expect(userRemove).toStrictEqual({});
  });

  test('DM is deleted after the remaining user is removed.', () => {
    const userRegister = requestSuccessfulAuthRegister(
      'testeremail@gmail.com', '123456', 'test', 'email'
    );
    const userRegister2 = requestSuccessfulAuthRegister(
      'testeremail2@gmail.com', '123456', 'another', 'email'
    );
    requestSuccessfulDmCreate(userRegister2.token, []);
    expect(
      requestSuccessfulAdminUserRemove(userRegister.token, userRegister2.authUserId)
    ).toStrictEqual({});
  });
});

describe('error cases', () => {
  test('Invalid token', () => {
    const userRegister = requestSuccessfulAuthRegister(
      'testeremail@gmail.com', '123456', 'test', 'email'
    );

    const errorReturn = requestErrorAdminUserRemove(
      userRegister.token + 1, userRegister.authUserId
    );
    expect(errorReturn).toStrictEqual(TOKEN_ERROR);
  });

  test('uId does not refer to a valid user', () => {
    const userRegister = requestSuccessfulAuthRegister(
      'testeremail@gmail.com', '123456', 'test', 'email'
    );
    const userRegister2 = requestSuccessfulAuthRegister(
      'testeremail2@gmail.com', '123456', 'second', 'user'
    );

    const errorReturn = requestErrorAdminUserRemove(
      userRegister.token, userRegister.authUserId + userRegister2.authUserId + 100
    );
    expect(errorReturn).toStrictEqual(ERROR);
  });

  test('the authorized user is not a global owner', () => {
    const userRegister = requestSuccessfulAuthRegister(
      'testeremail@gmail.com', '123456', 'test', 'email'
    );
    const userRegister2 = requestSuccessfulAuthRegister(
      'testeremail2@gmail.com', '123456', 'second', 'user'
    );

    const errorReturn = requestErrorAdminUserRemove(userRegister2.token, userRegister.authUserId);
    expect(errorReturn).toStrictEqual(TOKEN_ERROR);
  });

  test('uId refers to the only global owner', () => {
    const userRegister = requestSuccessfulAuthRegister(
      'testeremail@gmail.com', '123456', 'test', 'email'
    );
    requestSuccessfulAuthRegister(
      'testeremail2@gmail.com', '123456', 'second', 'user'
    );

    const errorReturn = requestErrorAdminUserRemove(userRegister.token, userRegister.authUserId);
    expect(errorReturn).toStrictEqual(ERROR);
  });
});
