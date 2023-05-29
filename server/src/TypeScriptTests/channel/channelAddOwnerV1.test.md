import {
  requestSuccessfulChannelAddOwner, requestErrorChannelAddOwner,
  requestSuccessfulChannelDetails, requestSuccessfulChannelJoin
} from '../../Helpers/requests/requestChannelHelper';
import { requestSuccessfulAuthRegister } from '../../Helpers/requests/requestAuthHelper';
import { requestSuccessfulChannelsCreate } from '../../Helpers/requests/requestChannelsHelper';
import { requestClear } from '../../Helpers/requests/requestOtherHelper';

const ERROR = 400;
const TOKEN_ERROR = 403;

// For every test, makes a channel with 2 members: the channel owner and a normal member
let globalOwner : {token: string, authUserId: number};
let globalOwnerObj : {
  uId: number,
  email: string,
  nameFirst: string,
  nameLast: string,
  handleStr: string,
  profileImgUrl: string
};
let firstChannelId : number;
let secondUser : {token: string, authUserId: number};
let secondUserObj : {
  uId: number,
  email: string,
  nameFirst: string,
  nameLast: string,
  handleStr: string,
  profileImgUrl: string
};
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
});

afterAll(() => {
  requestClear();
});

describe('Success owner added', () => {
  /*
  test('The return data must be empty.', () => {
    const addOwner = requestSuccessfulChannelAddOwner(globalOwner.token, firstChannelId, secondUser.authUserId);
    expect(addOwner).toStrictEqual({});
  });
  */

  test('Correct channel member added to ownerMembers array.', () => {
    const thirdUser = requestSuccessfulAuthRegister('thirduser@gmail.com', 'password', 'Third', 'User');
    requestSuccessfulChannelJoin(thirdUser.token, firstChannelId);

    expect(
      requestSuccessfulChannelAddOwner(globalOwner.token, firstChannelId, secondUser.authUserId)
    ).toStrictEqual({});
    const channelDetail = requestSuccessfulChannelDetails(globalOwner.token, firstChannelId);

    expect(channelDetail.ownerMembers).toContainEqual(globalOwnerObj);
    expect(channelDetail.ownerMembers).toContainEqual(secondUserObj);
    expect(channelDetail.ownerMembers.length).toEqual(2);
  });
  /*
  test('Channel member added as an owner can make a third member an owner.', () => {
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

    requestSuccessfulChannelAddOwner(globalOwner.token, firstChannelId, secondUser.authUserId);
    requestSuccessfulChannelAddOwner(secondUser.token, firstChannelId, thirdUser.authUserId);
    const channelDetail = requestSuccessfulChannelDetails(globalOwner.token, firstChannelId);

    expect(channelDetail.ownerMembers).toContainEqual(globalOwnerObj);
    expect(channelDetail.ownerMembers).toContainEqual(secondUserObj);
    expect(channelDetail.ownerMembers).toContainEqual(thirdUserObj);
    expect(channelDetail.ownerMembers.length).toEqual(3);
  });
  */
  // test('Channel member added as an owner to the correct channel.', () => {
  //   const secondChannelId = requestSuccessfulChannelsCreate(globalOwner.token, 'New Test Channel 2', true).channelId;
  //   const thirdChannelId = requestSuccessfulChannelsCreate(globalOwner.token, 'New Test Channel 3', true).channelId;

  //   requestSuccessfulChannelJoin(secondUser.token, secondChannelId);
  //   requestSuccessfulChannelJoin(secondUser.token, thirdChannelId);

  //   // globalOwner is the owner of 3 different channels.
  //   // secondUser is a member of all 3 channels.
  //   // Check whether the secondUser is made an owner to the correct (second) channel
  //   requestSuccessfulChannelAddOwner(globalOwner.token, secondChannelId, secondUser.authUserId);

  //   const firstChannelDetail = requestSuccessfulChannelDetails(globalOwner.token, firstChannelId);
  //   const secondChannelDetail = requestSuccessfulChannelDetails(globalOwner.token, secondChannelId);
  //   const thirdChannelDetail = requestSuccessfulChannelDetails(globalOwner.token, thirdChannelId);

  //   expect(firstChannelDetail.ownerMembers).not.toContainEqual(secondUserObj);
  //   expect(secondChannelDetail.ownerMembers).toContainEqual(secondUserObj);
  //   expect(thirdChannelDetail.ownerMembers).not.toContainEqual(secondUserObj);
  // });

  /*
  test('Global owner (as a channel member) can make another member a channel owner.', () => {
    const thirdUser = requestSuccessfulAuthRegister('thirduser@gmail.com', 'password', 'Third', 'User');
    const thirdUserObj = {
      uId: thirdUser.authUserId,
      email: 'thirduser@gmail.com',
      nameFirst: 'Third',
      nameLast: 'User',
      handleStr: 'thirduser',
      profileImgUrl: expect.any(String)
    };

    // The second user (secondUser) creates a channel, where the first and third
    // users are members of the channel.
    const secondChannelId = requestSuccessfulChannelsCreate(secondUser.token, 'Second Channel', true).channelId;
    requestSuccessfulChannelJoin(thirdUser.token, secondChannelId);
    requestSuccessfulChannelJoin(globalOwner.token, secondChannelId);

    // The first user (globalOwner) who is a global owner should be able to make
    // the third user (thirdUser) an owner of this channel.
    const addOwner = requestSuccessfulChannelAddOwner(globalOwner.token, secondChannelId, thirdUser.authUserId);
    expect(addOwner).toStrictEqual({});

    const secondChannelDetail = requestSuccessfulChannelDetails(globalOwner.token, secondChannelId);
    expect(secondChannelDetail.ownerMembers).toContainEqual(thirdUserObj);
    expect(secondChannelDetail.ownerMembers.length).toEqual(2);
  });
  */

  test('Global owner (as a channel member) can make themself a channel owner.', () => {
    // The second user creates a channel in which the global owner is a member.
    const secondChannelId = requestSuccessfulChannelsCreate(secondUser.token, 'Second Channel', true).channelId;
    requestSuccessfulChannelJoin(globalOwner.token, secondChannelId);
    const addOwner = requestSuccessfulChannelAddOwner(globalOwner.token, secondChannelId, globalOwner.authUserId);
    expect(addOwner).toStrictEqual({});

    const secondChannelDetail = requestSuccessfulChannelDetails(globalOwner.token, secondChannelId);
    expect(secondChannelDetail.ownerMembers).toContainEqual(globalOwnerObj);
    expect(secondChannelDetail.ownerMembers.length).toEqual(2);
  });
});

describe('Return error', () => {
  test('Token is invalid', () => {
    const addOwner = requestErrorChannelAddOwner(
      globalOwner.token + secondUser.token, // Ensures an invalid token.
      firstChannelId,
      secondUser.authUserId
    );
    expect(addOwner).toStrictEqual(TOKEN_ERROR);
  });

  test('channelId is invalid', () => {
    const addOwner = requestErrorChannelAddOwner(
      globalOwner.token,
      firstChannelId + 1,
      secondUser.authUserId
    );
    expect(addOwner).toStrictEqual(ERROR);
  });

  test('uId is invalid.', () => {
    const addOwner = requestErrorChannelAddOwner(
      globalOwner.token,
      firstChannelId,
      Math.abs(globalOwner.authUserId) + Math.abs(secondUser.authUserId)
    );
    expect(addOwner).toStrictEqual(ERROR);
  });

  test('uId refers to a user that is not a member of the channel.', () => {
    const thirdUser = requestSuccessfulAuthRegister('thirduser@gmail.com', 'password', 'Third', 'User');
    const addOwner = requestErrorChannelAddOwner(
      globalOwner.token,
      firstChannelId,
      thirdUser.authUserId
    );
    expect(addOwner).toStrictEqual(ERROR);
  });

  test('uId refers to a user that is already an owner of the channel.', () => {
    requestSuccessfulChannelAddOwner(globalOwner.token, firstChannelId, secondUser.authUserId);

    let addOwner = requestErrorChannelAddOwner(
      globalOwner.token,
      firstChannelId,
      secondUser.authUserId
    );
    expect(addOwner).toStrictEqual(ERROR);

    // Bonus test: channel owner tries to add themself as an owner.
    addOwner = requestErrorChannelAddOwner(
      globalOwner.token,
      firstChannelId,
      globalOwner.authUserId
    );
    expect(addOwner).toStrictEqual(ERROR);
  });

  test('User calling addOwnerV1 does not have owner permissions.', () => {
    const thirdUser = requestSuccessfulAuthRegister('thirduser@gmail.com', 'password', 'Third', 'User');
    requestSuccessfulChannelJoin(thirdUser.token, firstChannelId);

    const addOwner = requestErrorChannelAddOwner(
      secondUser.token,
      firstChannelId,
      thirdUser.authUserId
    );
    expect(addOwner).toStrictEqual(TOKEN_ERROR);
  });

  test('User calling addOwnerV1 is a global owner but is not in the channel.', () => {
    // Creates a channel where secondUser is a channel owner and thirdUser is a channel member.
    const secondChannelId = requestSuccessfulChannelsCreate(secondUser.token, 'New Test Channel 2', true).channelId;
    const thirdUser = requestSuccessfulAuthRegister('thirduser@gmail.com', 'password', 'Third', 'User');
    requestSuccessfulChannelJoin(thirdUser.token, secondChannelId);

    // Global Owner is not a channel member.
    const addOwner = requestErrorChannelAddOwner(globalOwner.token, secondChannelId, thirdUser.authUserId);
    expect(addOwner).toStrictEqual(TOKEN_ERROR);
  });
});
