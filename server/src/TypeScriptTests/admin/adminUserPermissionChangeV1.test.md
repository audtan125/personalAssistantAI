
import { requestSuccessfulAdminUserPermissionChange, requestErrorAdminUserPermissionChange } from '../../Helpers/requests/requestAdminHelper';
import { requestSuccessfulAuthRegister } from '../../Helpers/requests/requestAuthHelper';
import { requestClear } from '../../Helpers/requests/requestOtherHelper';
import { requestSuccessfulChannelJoin, requestSuccessfulChannelDetails, requestErrorChannelJoin } from '../../Helpers/requests/requestChannelHelper';
import { requestSuccessfulChannelsCreate } from '../../Helpers/requests/requestChannelsHelper';
import { user } from '../../dataStore';
const ERROR = 400;
const TOKEN_ERROR = 403;

let globalOwner: {token: string, authUserId: number};
let userRegister2: {token: string, authUserId: number};

beforeEach(() => {
  requestClear();
  globalOwner = requestSuccessfulAuthRegister(
    'testeremail@gmail.com', '123456', 'test', 'email'
  );
  userRegister2 = requestSuccessfulAuthRegister(
    'testeremail2@gmail.com', '123456', 'first', 'user'
  );
});

afterAll(() => {
  requestClear();
});

describe('Successful test cases', () => {
  test('a global owner setting a member user to a global owner', () => {
    requestSuccessfulAdminUserPermissionChange(globalOwner.token, userRegister2.authUserId, 1);
    // should return error the second time you called on that user because they were already a global user
    const errorReturn = requestErrorAdminUserPermissionChange(globalOwner.token, userRegister2.authUserId, 1);
    expect(errorReturn).toStrictEqual(ERROR);

    const userRegister3 = requestSuccessfulAuthRegister(
      'testeremail3@gmail.com', '123456', 'second', 'user'
    );
    const channelId = requestSuccessfulChannelsCreate(userRegister3.token, 'New Test Channel', false).channelId;
    const userProfile: user = {
      uId: userRegister3.authUserId,
      email: 'testeremail3@gmail.com',
      nameFirst: 'second',
      nameLast: 'user',
      handleStr: 'seconduser',
      profileImgUrl: expect.any(String)
    };
    const channelJoin = requestSuccessfulChannelJoin(userRegister2.token, channelId);
    const channelDetails = requestSuccessfulChannelDetails(userRegister2.token, channelId);
    // should be able to join a private channel
    expect(channelJoin).toStrictEqual({});
    expect(channelDetails.allMembers).toContainEqual(userProfile);
  });

  test('a global owner setting another global owner to a member user', () => {
    requestSuccessfulAdminUserPermissionChange(globalOwner.token, userRegister2.authUserId, 1);
    requestSuccessfulAdminUserPermissionChange(userRegister2.token, globalOwner.authUserId, 2);
    const errorReturn = requestErrorAdminUserPermissionChange(globalOwner.token, userRegister2.authUserId, 2);
    expect(errorReturn).toStrictEqual(TOKEN_ERROR);

    const userRegister3 = requestSuccessfulAuthRegister(
      'testeremail3@gmail.com', '123456', 'second', 'user'
    );
    const channelId = requestSuccessfulChannelsCreate(userRegister3.token, 'New Test Channel', false).channelId;

    const channelJoin = requestErrorChannelJoin(globalOwner.token, channelId);
    expect(channelJoin).toStrictEqual(TOKEN_ERROR);
  });
});

describe('Error test cases', () => {
  test('Invalid token', () => {
    const errorReturn = requestErrorAdminUserPermissionChange(
      globalOwner.token + userRegister2.token, userRegister2.authUserId, 1
    );

    expect(errorReturn).toStrictEqual(TOKEN_ERROR);
  });

  test('A user member trying to change a global owner to a user member', () => {
    const errorReturn = requestErrorAdminUserPermissionChange(userRegister2.token, globalOwner.authUserId, 2);
    expect(errorReturn).toStrictEqual(TOKEN_ERROR);
  });

  test('A user member trying to change a user member to a global owner', () => {
    const userRegister3 = requestSuccessfulAuthRegister(
      'testeremail3@gmail.com', '123456', 'second', 'user'
    );

    const errorReturn = requestErrorAdminUserPermissionChange(userRegister2.token, userRegister3.authUserId, 1);
    expect(errorReturn).toStrictEqual(TOKEN_ERROR);
  });

  test('uId does not refer to a valid user', () => {
    const errorReturn = requestErrorAdminUserPermissionChange(globalOwner.token, userRegister2.authUserId + globalOwner.authUserId, 1);
    expect(errorReturn).toStrictEqual(ERROR);
  });

  test('The only globalOwner trying to demote itself to a user member', () => {
    const errorReturn = requestErrorAdminUserPermissionChange(globalOwner.token, globalOwner.authUserId, 2);
    expect(errorReturn).toStrictEqual(ERROR);
  });

  test('permissionId is invalid', () => {
    const errorReturn = requestErrorAdminUserPermissionChange(globalOwner.token, userRegister2.authUserId, 100);
    expect(errorReturn).toStrictEqual(ERROR);
  });
  /*
  test('globalOwner attempts to promote a globalOwner', () => {
    requestSuccessfulAdminUserPermissionChange(globalOwner.token, userRegister2.authUserId, 1);
    const errorReturn = requestErrorAdminUserPermissionChange(globalOwner.token, userRegister2.authUserId, 1);
    expect(errorReturn).toStrictEqual(ERROR);
  });

  test('globalOwner attempts to demote a member', () => {
    const errorReturn = requestErrorAdminUserPermissionChange(globalOwner.token, userRegister2.authUserId, 2);
    expect(errorReturn).toStrictEqual(ERROR);
  });
  */
});
