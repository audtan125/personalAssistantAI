import {
  requestSuccessfulChannelsCreate,
  requestSuccessfulChannelsList,
  requestErrorChannelsList,
  requestPublicChannelCreate,
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

describe('Cases where channels were listed successfully', () => {
  /*
  test('check that the object returned is an array', () => {
    const token = requestSuccessfulAuthRegister(
      'real@gmail.com',
      '123456',
      'first',
      'last'
    ).token;
    requestSuccessfulChannelsCreate(token, 'Bruh', true);
    const joinedChannels = requestSuccessfulChannelsList(token);

    expect(Array.isArray(joinedChannels.channels)).toEqual(true);
  });
  */

  test('user exists but is not part of any channels', () => {
    const token = requestSuccessfulAuthRegister(
      'real@gmail.com',
      '123456',
      'first',
      'last'
    ).token;
    // The function call below creates a unique token separate from the one above
    requestPublicChannelCreate();
    const joinedChannels = requestSuccessfulChannelsList(token);

    expect(joinedChannels).toStrictEqual({ channels: [] });
  });

  /*
  test('returned object is exactly what is expected', () => {
    const token = requestSuccessfulAuthRegister(
      'real@gmail.com',
      '123456',
      'first',
      'last'
    ).token;
    const newChannel = requestSuccessfulChannelsCreate(
      token,
      'Kang Seulgi',
      true
    );
    const joinedChannels = requestSuccessfulChannelsList(token);

    expect(joinedChannels).toStrictEqual({
      channels: [{ channelId: newChannel.channelId, name: 'Kang Seulgi' }],
    });
  });
  */

  test('only lists channels user is part of when other channels exist', () => {
    const tokenFirst = requestSuccessfulAuthRegister(
      'real@gmail.com',
      '123456',
      'first',
      'last'
    ).token;
    const newChannel = requestSuccessfulChannelsCreate(
      tokenFirst,
      'Channel1',
      true
    );
    const newChannel2 = requestSuccessfulChannelsCreate(
      tokenFirst,
      'Channel2',
      false
    );
    requestPublicChannelCreate();
    const joinedChannels = requestSuccessfulChannelsList(tokenFirst);

    expect(joinedChannels.channels).toContainEqual(
      { channelId: newChannel.channelId, name: 'Channel1' }
    );
    expect(joinedChannels.channels).toContainEqual(
      { channelId: newChannel2.channelId, name: 'Channel2' }
    );
  });

  /*
  test('channel returned when channel is private and user is part of it', () => {
    const token = requestSuccessfulAuthRegister(
      'real@gmail.com',
      '123456',
      'first',
      'last'
    ).token;
    const newChannel = requestSuccessfulChannelsCreate(
      token,
      'Channel1',
      false
    );
    const joinedChannels = requestSuccessfulChannelsList(token);

    expect(joinedChannels).toStrictEqual({
      channels: [{ channelId: newChannel.channelId, name: 'Channel1' }],
    });
  });
  */
  /*
  test('multiple channels returned when user is part of more than one channel', () => {
    const token = requestSuccessfulAuthRegister(
      'real@gmail.com',
      '123456',
      'first',
      'last'
    ).token;
    const newChannel1 = requestSuccessfulChannelsCreate(
      token,
      'Channel1',
      true
    );
    const newChannel2 = requestSuccessfulChannelsCreate(
      token,
      'Channel2',
      true
    );
    const joinedChannels = requestSuccessfulChannelsList(token);

    expect(joinedChannels).toStrictEqual({
      channels: [
        { channelId: newChannel1.channelId, name: 'Channel1' },
        { channelId: newChannel2.channelId, name: 'Channel2' },
      ],
    });
  });
  */
});

describe('Case where channels were not listed successfully', () => {
  test('invalid token', () => {
    let token = requestSuccessfulAuthRegister(
      'real@gmail.com',
      '123456',
      'first',
      'last'
    ).token;
    // this token will no longer be valid because it is different
    // from the only token that exists
    token += 'extra';
    const joinedChannels = requestErrorChannelsList(token);

    expect(joinedChannels).toEqual(TOKEN_ERROR);
  });
});
