import {
  requestSuccessfulChannelDetails,
  requestSuccessfulChannelJoin, requestSuccessfulChannelLeave,
  requestErrorChannelLeave
} from '../../Helpers/requests/requestChannelHelper';
import { requestSuccessfulAuthRegister } from '../../Helpers/requests/requestAuthHelper';
import { requestSuccessfulChannelsCreate } from '../../Helpers/requests/requestChannelsHelper';
import { requestClear } from '../../Helpers/requests/requestOtherHelper';
import { sleep } from '../../Helpers/sleep';
import { user } from '../../dataStore';
import { requestSuccessfulStandupStart } from '../../Helpers/requests/requestStandupHelper';

const ERROR = 400;
const TOKEN_ERROR = 403;

// For every test, makes a channel with 2 members: the channel owner and a normal member
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
});

afterAll(() => {
  requestClear();
});

describe('Success Leave Channel', () => {
  /*
  test('The return data must be empty.', () => {
    const channelLeave = requestSuccessfulChannelLeave(secondUser.token, firstChannelId);
    expect(channelLeave).toStrictEqual({});
  });
  */

  // test('The correct user is (only) removed from the correct channel', () => {
  //   const secondChannelId = requestSuccessfulChannelsCreate(globalOwner.token, 'ch2', true).channelId;
  //   const thirdChannelId = requestSuccessfulChannelsCreate(globalOwner.token, 'ch3', true).channelId;
  //   const fourthChannelId = requestSuccessfulChannelsCreate(globalOwner.token, 'ch4', true).channelId;

  //   requestSuccessfulChannelJoin(secondUser.token, secondChannelId);
  //   requestSuccessfulChannelJoin(secondUser.token, thirdChannelId);
  //   requestSuccessfulChannelJoin(secondUser.token, fourthChannelId);

  //   // Populates all 4 channels with multiple random users.
  //   const validEmails = ['thirduser@gmail.com', 'fourthuser@gmail.com', 'fifthuser@gmail.com'];
  //   for (let i = 0; i < 3; i++) {
  //     const userToken = requestSuccessfulAuthRegister(validEmails[i], 'password', 'Test', 'User').token;
  //     requestSuccessfulChannelJoin(userToken, firstChannelId);
  //     requestSuccessfulChannelJoin(userToken, secondChannelId);
  //     requestSuccessfulChannelJoin(userToken, thirdChannelId);
  //     requestSuccessfulChannelJoin(userToken, fourthChannelId);
  //   }

  //   requestSuccessfulChannelLeave(secondUser.token, thirdChannelId);

  //   // Check contents of ownerMembers and allMembers for all channels created
  //   const channels = [firstChannelId, secondChannelId, thirdChannelId, fourthChannelId];
  //   for (const ch of channels) {
  //     const chDetails = requestSuccessfulChannelDetails(globalOwner.token, ch);

  //     if (ch === thirdChannelId) {
  //       expect(chDetails.allMembers).not.toContainEqual(secondUserObj);
  //       expect(chDetails.allMembers.length).toStrictEqual(4);
  //     } else {
  //       // Unspecified channels
  //       expect(chDetails.allMembers).toContainEqual(secondUserObj);
  //       expect(chDetails.allMembers.length).toStrictEqual(5);
  //     }
  //   }
  // });

  test('Channel owners are also removed from the ownerMembers array.', () => {
    expect(requestSuccessfulChannelLeave(globalOwner.token, firstChannelId)).toStrictEqual({});

    const channelDetail = requestSuccessfulChannelDetails(secondUser.token, firstChannelId);

    expect(channelDetail.ownerMembers).not.toContainEqual(globalOwnerObj);
    expect(channelDetail.ownerMembers).not.toContainEqual(secondUserObj);
    expect(channelDetail.ownerMembers.length).toStrictEqual(0);

    expect(channelDetail.allMembers).not.toContainEqual(globalOwnerObj);
    expect(channelDetail.allMembers).toContainEqual(secondUserObj);
    expect(channelDetail.allMembers.length).toStrictEqual(1);
  });

  // test('Channel with no members is not erased.', () => {
  //   requestSuccessfulChannelLeave(globalOwner.token, firstChannelId);
  //   requestSuccessfulChannelLeave(secondUser.token, firstChannelId);

  //   requestSuccessfulChannelJoin(secondUser.token, firstChannelId);

  //   const channelDetail = requestSuccessfulChannelDetails(secondUser.token, firstChannelId);

  //   expect(channelDetail.ownerMembers.length).toStrictEqual(0);
  //   expect(channelDetail.allMembers.length).toStrictEqual(1);
  //   expect(channelDetail.allMembers).toContainEqual(secondUserObj);
  // });
  /*
  test('The only channel owner is able to leave the channel, but rejoins as only a member.', () => {
    const secondChannelId = requestSuccessfulChannelsCreate(secondUser.token, 'ch2', true).channelId;

    requestSuccessfulChannelLeave(secondUser.token, secondChannelId);

    requestSuccessfulChannelJoin(secondUser.token, secondChannelId);

    const channelDetail = requestSuccessfulChannelDetails(secondUser.token, secondChannelId);

    // Despite previously being a channel owner, the user that rejoins the channel is now only a member.
    expect(channelDetail.ownerMembers.length).toStrictEqual(0);
    expect(channelDetail.allMembers.length).toStrictEqual(1);
    expect(channelDetail.allMembers).toContainEqual(secondUserObj);
  });

  test('User is the starter of an active standup in another channel.', () => {
    // Starting a standup in the second channel should not prevent
    // globalOwner from leaving the first channel.
    const secondChannelId = requestSuccessfulChannelsCreate(globalOwner.token, 'ch2', true).channelId;
    // 1 second standup
    requestSuccessfulStandupStart(globalOwner.token, secondChannelId, 1);

    const channelLeave = requestSuccessfulChannelLeave(globalOwner.token, firstChannelId);
    expect(channelLeave).toStrictEqual({});

    // Allots time for the standup to terminate.
    sleep(1.5);
  });
  */
});

describe('Error return', () => {
  test('Invalid token.', () => {
    const channelLeave = requestErrorChannelLeave(globalOwner.token + secondUser.token, firstChannelId);
    expect(channelLeave).toStrictEqual(TOKEN_ERROR);
  });

  test('Invalid channel ID.', () => {
    const channelLeave = requestErrorChannelLeave(globalOwner.token, firstChannelId + 1);
    expect(channelLeave).toStrictEqual(ERROR);
  });

  test('User is the starter of an active standup in the channel.', () => {
    // 1 second standup
    requestSuccessfulStandupStart(globalOwner.token, firstChannelId, 1);
    const channelLeave = requestErrorChannelLeave(globalOwner.token, firstChannelId);
    expect(channelLeave).toStrictEqual(ERROR);

    // Allots time for the standup to terminate
    sleep(1.5);
  });

  test('Token refers to a user that is not a member of the channel.', () => {
    const thirdUser = requestSuccessfulAuthRegister('thirduser@gmail.com', 'password', 'Third', 'User');
    const channelLeave = requestErrorChannelLeave(thirdUser.token, firstChannelId);
    expect(channelLeave).toStrictEqual(TOKEN_ERROR);
  });

  /*
  test('Channel member tries to leave the channel twice.', () => {
    requestSuccessfulChannelLeave(secondUser.token, firstChannelId);
    const channelLeave = requestErrorChannelLeave(secondUser.token, firstChannelId);
    expect(channelLeave).toStrictEqual(TOKEN_ERROR);
  });
  */
});
