import {
  requestSuccessfulChannelsCreate,
  requestSuccessfulChannelsListAll,
  requestErrorChannelsListAll,
} from '../../Helpers/requests/requestChannelsHelper';
import { requestSuccessfulAuthRegister } from '../../Helpers/requests/requestAuthHelper';
import { requestClear } from '../../Helpers/requests/requestOtherHelper';

const TOKEN_ERROR = 403;

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

describe('Cases where channesListAll returns successfully', () => {
  /*
  test('return object is correct', () => {
    const token = requestSuccessfulAuthRegister(
      'newUser@gmail.com',
      '123456',
      'new',
      'user'
    ).token;
    const channelId1 = requestSuccessfulChannelsCreate(
      token,
      'Channel1',
      true
    ).channelId;
    const channelId2 = requestSuccessfulChannelsCreate(
      token,
      'Channel2',
      true
    ).channelId;
    const channelsList = requestSuccessfulChannelsListAll(token);

    expect(channelsList).toStrictEqual({
      channels: [
        {
          channelId: channelId1,
          name: 'Channel1',
        },
        {
          channelId: channelId2,
          name: 'Channel2',
        },
      ],
    });
  });
  */

  test('Test for no channels', () => {
    const token = requestSuccessfulAuthRegister(
      'newUser@gmail.com',
      '123456',
      'new',
      'user'
    ).token;

    expect(requestSuccessfulChannelsListAll(token)).toStrictEqual({
      channels: [],
    });
  });

  test('channels have a mixture of public and private status', () => {
    const token = requestSuccessfulAuthRegister(
      'newUser@gmail.com',
      '123456',
      'new',
      'user'
    ).token;
    const channelId1 = requestSuccessfulChannelsCreate(
      token,
      'Channel1',
      false
    ).channelId;
    const channelId2 = requestSuccessfulChannelsCreate(
      token,
      'Channel2',
      true
    ).channelId;
    const channelId3 = requestSuccessfulChannelsCreate(
      token,
      'Channel3',
      false
    ).channelId;
    const channelId4 = requestSuccessfulChannelsCreate(
      token,
      'Channel4',
      true
    ).channelId;

    const chId = [channelId1, channelId2, channelId3, channelId4];
    const chName = ['Channel1', 'Channel2', 'Channel3', 'Channel4'];
    const channelList = requestSuccessfulChannelsListAll(token).channels;

    // For each index 0 to 4, check if allChannelList contains corresponding channel id and channel name.
    for (const ch in chId) {
      expect(channelList).toContainEqual({
        channelId: chId[ch],
        name: chName[ch],
      });
    }
  });
  test('Test for users that are not global owners', () => {
    // we assume that any user can call channelsListAll not just global owners
    // First user automatically added to globalOwners
    const token1 = requestSuccessfulAuthRegister(
      'FirstUser@gmail.com',
      '123456',
      'First',
      'user'
    ).token;
    const token2 = requestSuccessfulAuthRegister(
      'SecondUser@gmail.com',
      '123456',
      'Second',
      'User'
    ).token;
    const channelId1 = requestSuccessfulChannelsCreate(
      token1,
      'Channel1',
      false
    ).channelId;

    // will list all channels normally
    expect(requestSuccessfulChannelsListAll(token2)).toStrictEqual({
      channels: [
        {
          channelId: channelId1,
          name: 'Channel1',
        },
      ],
    });
  });
});

describe('Cases where channelsListAll returns error', () => {
  /*
  test('Test if token is null', () => {
    const token1 = requestSuccessfulAuthRegister(
      'FirstUser@gmail.com',
      '123456',
      'First',
      'user'
    ).token;
    const token2 = requestSuccessfulAuthRegister(
      'SecondUser@gmail.com',
      '123456',
      'Second',
      'User'
    ).token;
    requestSuccessfulChannelsCreate(token1, 'Channel1', false);
    requestSuccessfulChannelsCreate(token1, 'Channel2', true);
    const invalidToken: string = null;

    expect(requestErrorChannelsListAll(invalidToken)).toStrictEqual(TOKEN_ERROR);
  });
  */

  test('Test if token is invalid string', () => {
    const token1 = requestSuccessfulAuthRegister(
      'FirstUser@gmail.com',
      '123456',
      'First',
      'user'
    ).token;
    const token2 = requestSuccessfulAuthRegister(
      'SecondUser@gmail.com',
      '123456',
      'Second',
      'User'
    ).token;
    requestSuccessfulChannelsCreate(token1, 'Channel1', false);
    requestSuccessfulChannelsCreate(token1, 'Channel2', true);
    // Since only two users exist, combining their tokens is invalid
    expect(requestErrorChannelsListAll(token1 + token2)).toStrictEqual(
      TOKEN_ERROR
    );
  });
});
