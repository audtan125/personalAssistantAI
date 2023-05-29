import { requestSuccessfulStandupActive, requestErrorStandupActive } from '../../Helpers/requests/requestStandupHelper';
import { requestSuccessfulAuthRegister } from '../../Helpers/requests/requestAuthHelper';
import { requestClear } from '../../Helpers/requests/requestOtherHelper';
import { requestSuccessfulChannelJoin } from '../../Helpers/requests/requestChannelHelper';
import { requestSuccessfulChannelsCreate } from '../../Helpers/requests/requestChannelsHelper';

// For every test, makes a channel with 2 members: the channel owner and a normal member
let globalOwner : {token: string, authUserId: number};
let firstChannelId : number;
let secondUser : {token: string, authUserId: number};
beforeEach(() => {
  requestClear();
  globalOwner = requestSuccessfulAuthRegister('emailer@gmail.com', 'password', 'First', 'User');
  firstChannelId = requestSuccessfulChannelsCreate(globalOwner.token, 'New Test Channel', true).channelId;

  secondUser = requestSuccessfulAuthRegister('seconduser@gmail.com', 'password', 'Second', 'User');
  requestSuccessfulChannelJoin(secondUser.token, firstChannelId);
});

afterAll(() => {
  requestClear();
});

describe('Successful standup active', () => {
  test('no standup running', () => {
    const standupActive = requestSuccessfulStandupActive(
      globalOwner.token, firstChannelId);
    expect(standupActive).toStrictEqual({ isActive: false, timeFinish: null });
  });
});

describe('Throw http exception', () => {
  test('Invalid token', () => {
    const standupActiveAttempt = requestErrorStandupActive(
      globalOwner.token + secondUser.token, firstChannelId);
    expect(standupActiveAttempt).toStrictEqual(403);
  });

  test('channelId does not refer to valid channel', () => {
    const standupActiveAttempt = requestErrorStandupActive(
      globalOwner.token, firstChannelId + 1);
    expect(standupActiveAttempt).toStrictEqual(400);
  });

  test('channelId is valid but user is not a member', () => {
    // create new third user
    const thirdUser = requestSuccessfulAuthRegister(
      'thirduser@gmail.com', 'password', 'Third', 'User');
    // user not part of first channel
    const standupActiveAttempt = requestErrorStandupActive(
      thirdUser.token, firstChannelId);
    expect(standupActiveAttempt).toStrictEqual(403);
  });
});
