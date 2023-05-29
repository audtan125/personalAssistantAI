import {
  requestSuccessfulChannelsCreate,
} from '../../Helpers/requests/requestChannelsHelper';
import { requestSuccessfulAuthRegister } from '../../Helpers/requests/requestAuthHelper';
import { requestSuccessfulChannelDetails, requestErrorChannelDetails } from '../../Helpers/requests/requestChannelHelper';
import { requestClear } from '../../Helpers/requests/requestOtherHelper';
import { user } from '../../dataStore';

const ERROR = 400;
const TOKEN_ERROR = 403;

let firstUser : {token: string, authUserId: number};
let firstUserObj : user;
beforeEach(() => {
  requestClear();
  firstUser = requestSuccessfulAuthRegister('emailer@gmail.com', 'password', 'Test', 'User');
  firstUserObj = {
    uId: firstUser.authUserId,
    email: 'emailer@gmail.com',
    nameFirst: 'Test',
    nameLast: 'User',
    handleStr: 'testuser',
    profileImgUrl: expect.any(String)
  };
});

afterAll(() => {
  requestClear();
});

describe('Success Return Details', () => {
  /*
  test('Details of the newly created public channel match expected data.', () => {
    const channelId = requestSuccessfulChannelsCreate(firstUser.token, 'New Test Channel', true).channelId;

    // Checks if the channel details contain the variables
    // { name, isPublic, ownerMembers, allMembers }
    // and if the values are an exact match.
    const channelDetails = requestSuccessfulChannelDetails(firstUser.token, channelId);
    expect(channelDetails).toStrictEqual({
      name: 'New Test Channel',
      isPublic: true,
      ownerMembers: [firstUserObj],
      allMembers: [firstUserObj],
    });
  });
  */

  test('Details of the newly created private channel match expected data.', () => {
    const channelId = requestSuccessfulChannelsCreate(firstUser.token, 'New Test Channel', false).channelId;

    // Checks if the channel details contain the variables
    // { name, isPublic, ownerMembers, allMembers }
    // and if the values are an exact match.
    const channelDetails = requestSuccessfulChannelDetails(firstUser.token, channelId);
    expect(channelDetails).toStrictEqual({
      name: 'New Test Channel',
      isPublic: false,
      ownerMembers: [firstUserObj],
      allMembers: [firstUserObj],
    });
  });

  test('Details of the third created channel match expected data requested by the second user.', () => {
    const secondUser = requestSuccessfulAuthRegister('seconduser@gmail.com', 'password', 'Testing', 'User');
    requestSuccessfulAuthRegister('thirduser@gmail.com', 'password', 'third', 'user');

    requestSuccessfulChannelsCreate(secondUser.token, 'Old Test Channel', true);
    requestSuccessfulChannelsCreate(secondUser.token, 'Test Channel', true);
    const channelId = requestSuccessfulChannelsCreate(secondUser.token, 'New Test Channel', true).channelId;

    // Checks if the channel details contain the variables
    // { name, isPublic, ownerMembers, allMembers }
    // and if the values are an exact match.
    const channelDetails = requestSuccessfulChannelDetails(secondUser.token, channelId);
    expect(channelDetails).toEqual({
      name: 'New Test Channel',
      isPublic: true,
      ownerMembers: [{
        uId: secondUser.authUserId,
        email: 'seconduser@gmail.com',
        nameFirst: 'Testing',
        nameLast: 'User',
        handleStr: 'testinguser',
        profileImgUrl: expect.any(String)
      }],
      allMembers: [{
        uId: secondUser.authUserId,
        email: 'seconduser@gmail.com',
        nameFirst: 'Testing',
        nameLast: 'User',
        handleStr: 'testinguser',
        profileImgUrl: expect.any(String)
      }],
    });
  });
});

describe('Details return error', () => {
  test('Invalid token.', () => {
    const channelId = requestSuccessfulChannelsCreate(firstUser.token, 'New Test Channel', true).channelId;

    // Checks if the channel details contain a valid error
    // return value when given an invalid token, firstUser.token + 'RANDOM'.
    const channelDetails = requestErrorChannelDetails(firstUser.token + 'RANDOM', channelId);
    expect(channelDetails).toStrictEqual(TOKEN_ERROR);
  });

  test('Invalid channel ID.', () => {
    const newChannelId = requestSuccessfulChannelsCreate(firstUser.token, 'New Test Channel', true).channelId;

    // Checks if the channel details contain a valid error
    // return value when given a non-existent channel id, newChannelId + 1.
    const channelDetails = requestErrorChannelDetails(firstUser.token, newChannelId + 1);
    expect(channelDetails).toStrictEqual(ERROR);
  });

  test('The user is not a member of the requested channel.', () => {
    const secondUser = requestSuccessfulAuthRegister('sadman@gmail.com', 'password123', 'Lonely', 'Man');

    const channelId = requestSuccessfulChannelsCreate(firstUser.token, 'New Test Channel', true).channelId;

    const channelDetails = requestErrorChannelDetails(secondUser.token, channelId);
    expect(channelDetails).toStrictEqual(TOKEN_ERROR);
  });
});
