import {
  requestSuccessfulChannelAddOwner,
  requestSuccessfulChannelRemoveOwner, requestErrorChannelRemoveOwner,
  requestSuccessfulChannelDetails, requestSuccessfulChannelJoin
} from '../../Helpers/requests/requestChannelHelper';
import { requestSuccessfulAuthRegister } from '../../Helpers/requests/requestAuthHelper';
import { requestSuccessfulChannelsCreate } from '../../Helpers/requests/requestChannelsHelper';
import { requestClear } from '../../Helpers/requests/requestOtherHelper';
import { user } from '../../dataStore';

const ERROR = 400;
const TOKEN_ERROR = 403;

// For every test, makes a channel with 2 channel owners, one of which is the global owner.
let globalOwner : {token: string, authUserId: number};
let globalOwnerObj : user;
let firstChannelId : number;
let secondUser : {token: string, authUserId: number};
let secondUserObj : user;
beforeEach(() => {
  requestClear();
  globalOwner = requestSuccessfulAuthRegister('emailer@gmail.com', 'password', 'Test', 'User');
  globalOwnerObj = {
    uId: globalOwner.authUserId,
    email: 'emailer@gmail.com',
    nameFirst: 'Test',
    nameLast: 'User',
    handleStr: 'testuser',
    profileImgUrl: expect.any(String)
  };
  firstChannelId = requestSuccessfulChannelsCreate(globalOwner.token, 'New Test Channel', true).channelId;

  secondUser = requestSuccessfulAuthRegister('seconduser@gmail.com', 'password', 'Second', 'User');
  secondUserObj = {
    uId: secondUser.authUserId,
    email: 'seconduser@gmail.com',
    nameFirst: 'Second',
    nameLast: 'User',
    handleStr: 'seconduser',
    profileImgUrl: expect.any(String)
  };
  requestSuccessfulChannelJoin(secondUser.token, firstChannelId);
  requestSuccessfulChannelAddOwner(globalOwner.token, firstChannelId, secondUser.authUserId);
});

afterAll(() => {
  requestClear();
});

describe('Success owner removed', () => {
  /*
  test('The return data must be empty.', () => {
    const removeOwner = requestSuccessfulChannelRemoveOwner(globalOwner.token, firstChannelId, secondUser.authUserId);
    expect(removeOwner).toStrictEqual({});
  });
  */

  test('The owner is removed from the ownerMembers array, but remains a member of the channel.', () => {
    expect(
      requestSuccessfulChannelRemoveOwner(globalOwner.token, firstChannelId, secondUser.authUserId)
    ).toStrictEqual({});
    const channelDetail = requestSuccessfulChannelDetails(globalOwner.token, firstChannelId);

    expect(channelDetail.ownerMembers).toContainEqual(globalOwnerObj);
    expect(channelDetail.ownerMembers).not.toContainEqual(secondUserObj);
    expect(channelDetail.ownerMembers.length).toStrictEqual(1);

    expect(channelDetail.allMembers.length).toStrictEqual(2);
    expect(channelDetail.allMembers).toContainEqual(globalOwnerObj);
    expect(channelDetail.allMembers).toContainEqual(secondUserObj);
  });

  // test('Owner in multiple channels is removed (as an owner) from the correct channel.', () => {
  //   const secondChannelId = requestSuccessfulChannelsCreate(globalOwner.token, 'New Test Channel 2', true).channelId;
  //   const thirdChannelId = requestSuccessfulChannelsCreate(globalOwner.token, 'New Test Channel 3', true).channelId;

  //   requestSuccessfulChannelJoin(secondUser.token, secondChannelId);
  //   requestSuccessfulChannelJoin(secondUser.token, thirdChannelId);
  //   requestSuccessfulChannelAddOwner(globalOwner.token, secondChannelId, secondUser.authUserId);
  //   requestSuccessfulChannelAddOwner(globalOwner.token, thirdChannelId, secondUser.authUserId);

  //   // globalOwner and secondUser are both channel owners in 3 channels.
  //   // Check whether the globalOwner is removed as an owner from the correct channel.
  //   requestSuccessfulChannelRemoveOwner(secondUser.token, secondChannelId, globalOwner.authUserId);

  //   const firstChannelDetail = requestSuccessfulChannelDetails(globalOwner.token, firstChannelId);
  //   const secondChannelDetail = requestSuccessfulChannelDetails(globalOwner.token, secondChannelId);
  //   const thirdChannelDetail = requestSuccessfulChannelDetails(globalOwner.token, thirdChannelId);

  //   expect(firstChannelDetail.ownerMembers).toContainEqual(globalOwnerObj);
  //   expect(secondChannelDetail.ownerMembers).not.toContainEqual(globalOwnerObj);
  //   expect(thirdChannelDetail.ownerMembers).toContainEqual(globalOwnerObj);
  // });
  /*
  test('The third channel owner can remove the first two owners of the channel.', () => {
    const thirdUser = requestSuccessfulAuthRegister('thirduser@gmail.com', 'password', 'Third', 'User');
    const thirdUserObj = {
      uId: thirdUser.authUserId,
      email: 'thirduser@gmail.com',
      nameFirst: 'Third',
      nameLast: 'User',
      handleStr: 'thirduser',
      profileImgUrl: expect.any(String)
    };

    requestSuccessfulChannelJoin(thirdUser.token, firstChannelId);
    requestSuccessfulChannelAddOwner(globalOwner.token, firstChannelId, thirdUser.authUserId);

    // Third user (who is now an owner in the channel) should be able to remove the first two
    // owners as an owner of the channel.
    requestSuccessfulChannelRemoveOwner(thirdUser.token, firstChannelId, globalOwner.authUserId);
    requestSuccessfulChannelRemoveOwner(thirdUser.token, firstChannelId, secondUser.authUserId);

    const channelDetail = requestSuccessfulChannelDetails(globalOwner.token, firstChannelId);

    expect(channelDetail.ownerMembers).not.toContainEqual(globalOwnerObj);
    expect(channelDetail.ownerMembers).not.toContainEqual(secondUserObj);
    expect(channelDetail.ownerMembers).toContainEqual(thirdUserObj);
    expect(channelDetail.ownerMembers.length).toStrictEqual(1);
  });
  */
  // test('One of the owners of a channel removes themself as an owner.', () => {
  //   requestSuccessfulChannelRemoveOwner(secondUser.token, firstChannelId, secondUser.authUserId);
  //   const channelDetail = requestSuccessfulChannelDetails(globalOwner.token, firstChannelId);

  //   expect(channelDetail.ownerMembers).toContainEqual(globalOwnerObj);
  //   expect(channelDetail.ownerMembers).not.toContainEqual(secondUserObj);
  //   expect(channelDetail.ownerMembers.length).toStrictEqual(1);
  // });

  test('The global owner (as a channel member) can remove a channel owner.', () => {
    const thirdUser = requestSuccessfulAuthRegister('thirduser@gmail.com', 'password', 'Third', 'User');

    // Creates a channel with two owners: secondUser and thirdUser. globalOwner is only a member of this channel.
    const secondChannelId = requestSuccessfulChannelsCreate(secondUser.token, 'New Test Channel 2', true).channelId;
    requestSuccessfulChannelJoin(thirdUser.token, secondChannelId);
    requestSuccessfulChannelJoin(globalOwner.token, secondChannelId);
    requestSuccessfulChannelAddOwner(secondUser.token, secondChannelId, thirdUser.authUserId);

    // The globalOwner should be able to remove one of the two owners from the channel owners.
    expect(
      requestSuccessfulChannelRemoveOwner(globalOwner.token, secondChannelId, thirdUser.authUserId)
    ).toStrictEqual({});
  });
});

describe('Return error', () => {
  test('Token is invalid', () => {
    const removeOwner = requestErrorChannelRemoveOwner(
      // Ensures an invalid token.
      globalOwner.token + secondUser.token,
      firstChannelId,
      secondUser.authUserId
    );
    expect(removeOwner).toStrictEqual(TOKEN_ERROR);
  });

  test('channelId is invalid', () => {
    const removeOwner = requestErrorChannelRemoveOwner(
      globalOwner.token,
      firstChannelId + 1,
      secondUser.authUserId
    );
    expect(removeOwner).toStrictEqual(ERROR);
  });

  test('uId is invalid.', () => {
    const removeOwner = requestErrorChannelRemoveOwner(
      globalOwner.token,
      firstChannelId,
      Math.abs(globalOwner.authUserId) + Math.abs(secondUser.authUserId)
    );
    expect(removeOwner).toStrictEqual(ERROR);
  });

  test('uId refers to a user who is not an owner of the channel.', () => {
    const thirdUser = requestSuccessfulAuthRegister('thirduser@gmail.com', 'password', 'Third', 'User');
    requestSuccessfulChannelJoin(thirdUser.token, firstChannelId);

    const removeOwner = requestErrorChannelRemoveOwner(
      globalOwner.token,
      firstChannelId,
      thirdUser.authUserId
    );
    expect(removeOwner).toStrictEqual(ERROR);
  });

  test('uId refers to a user that is currently the only owner of the channel.', () => {
    requestSuccessfulChannelRemoveOwner(secondUser.token, firstChannelId, globalOwner.authUserId);

    const removeOwner = requestErrorChannelRemoveOwner(
      globalOwner.token,
      firstChannelId,
      secondUser.authUserId
    );
    expect(removeOwner).toStrictEqual(ERROR);
  });

  test('User calling removeOwnerV1 does not have owner permissions.', () => {
    const thirdUser = requestSuccessfulAuthRegister('thirduser@gmail.com', 'password', 'Third', 'User');
    requestSuccessfulChannelJoin(thirdUser.token, firstChannelId);

    // thirdUser is only a channel member.
    const removeOwner = requestErrorChannelRemoveOwner(
      thirdUser.token,
      firstChannelId,
      secondUser.authUserId
    );
    expect(removeOwner).toStrictEqual(TOKEN_ERROR);
  });

  test('User calling removeOwnerV1 is a global owner but is not in the channel.', () => {
    // Creates a channel where secondUser and thirdUser are both owners in the channel.
    const secondChannelId = requestSuccessfulChannelsCreate(secondUser.token, 'New Test Channel 2', true).channelId;
    const thirdUser = requestSuccessfulAuthRegister('thirduser@gmail.com', 'password', 'Third', 'User');
    requestSuccessfulChannelJoin(thirdUser.token, secondChannelId);
    requestSuccessfulChannelAddOwner(secondUser.token, secondChannelId, thirdUser.authUserId);

    // Global Owner is not a channel member.
    const removeOwner = requestErrorChannelRemoveOwner(globalOwner.token, secondChannelId, secondUser.authUserId);
    expect(removeOwner).toStrictEqual(TOKEN_ERROR);
  });
});
