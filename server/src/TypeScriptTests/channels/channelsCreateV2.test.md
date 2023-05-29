import {
  requestSuccessfulChannelsCreate,
  requestErrorChannelsCreate,
} from '../../Helpers/requests/requestChannelsHelper';
import { requestSuccessfulAuthRegister, requestFirstUserAuthRegister } from '../../Helpers/requests/requestAuthHelper';
import { requestClear } from '../../Helpers/requests/requestOtherHelper';
import { requestSuccessfulUserProfile } from '../../Helpers/requests/requestUserHelper';
import { requestSuccessfulChannelDetails } from '../../Helpers/requests/requestChannelHelper';

const ERROR = 400;
const TOKEN_ERROR = 403;

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

describe('Cases where channels were created successfully', () => {
  /*
  test('returns an integer value', () => {
    const token = requestFirstUserAuthRegister().token;
    const newChannel = requestSuccessfulChannelsCreate(
      token,
      'Kang Seulgi',
      true
    );

    expect(newChannel).toStrictEqual({ channelId: expect.any(Number) });
  });
  */

  test('channels have unique channelIds', () => {
    const token = requestFirstUserAuthRegister().token;
    const channelId1 = requestSuccessfulChannelsCreate(
      token,
      'Giorno Giovanna',
      true
    ).channelId;
    const channelId2 = requestSuccessfulChannelsCreate(
      token,
      'Bunnings Snag',
      true
    ).channelId;

    expect(channelId1).not.toEqual(channelId2);
  });

  /*
  test('channel is private', () => {
    const token = requestSuccessfulAuthRegister('newUser@gmail.com', '123456', 'new', 'user').token;
    const channelId = requestSuccessfulChannelsCreate(
      token,
      'Burger King foot',
      false
    ).channelId;
    const channelDetail = requestSuccessfulChannelDetails(token, channelId);

    expect(channelDetail.isPublic).toEqual(false);
  });
  */

  test('function has correct return object structure', () => {
    const token = requestFirstUserAuthRegister().token;
    const returnObject = requestSuccessfulChannelsCreate(
      token,
      'Kang Seulgi',
      true
    );

    expect(returnObject).toStrictEqual({
      channelId: returnObject.channelId,
    });
  });

  test('Adds user who created channel to ownerMembers', () => {
    const newUser = requestSuccessfulAuthRegister('newUser@gmail.com', '123456', 'new', 'user');
    const channelId = requestSuccessfulChannelsCreate(
      newUser.token,
      'Tesco Chicken',
      true
    ).channelId;

    const user = requestSuccessfulUserProfile(newUser.token, newUser.authUserId).user;
    const ownerMembersArray = requestSuccessfulChannelDetails(
      newUser.token,
      channelId
    ).ownerMembers;

    expect(ownerMembersArray).toStrictEqual([user]);
  });
});

describe('Cases where channels were not created successfully', () => {
  test('token is invalid', () => {
    const token = '';
    const channel = requestErrorChannelsCreate(
      token,
      'Joe Biden',
      false
    );

    expect(channel).toStrictEqual(TOKEN_ERROR);
  });

  test('channel name is less than 1 character', () => {
    const token = requestSuccessfulAuthRegister(
      'newUser@gmail.com',
      '123456',
      'new',
      'user'
    ).token;
    const newChannel = requestErrorChannelsCreate(token, '', true);

    expect(newChannel).toStrictEqual(ERROR);
  });

  test('name is more than 20 character', () => {
    const token = requestFirstUserAuthRegister().token;
    const newChannel = requestErrorChannelsCreate(
      token,
      'SenbonzakuraKageyoshi',
      true
    );

    expect(newChannel).toStrictEqual(ERROR);
  });

  /*
  test('creating a channel without an existing token', () => {
    // token of '1' is invalid because no users have been created
    const channelId = requestErrorChannelsCreate(
      '1',
      'I AM IN THE',
      true
    );

    expect(channelId).toStrictEqual(TOKEN_ERROR);
  });
  */

  test('invalid token passed when user exists', () => {
    const newUserToken = requestFirstUserAuthRegister().token;
    const channelId = requestErrorChannelsCreate(
      newUserToken + 'extra',
      'Hop on Amongus',
      true
    );

    expect(channelId).toStrictEqual(TOKEN_ERROR);
  });
});
