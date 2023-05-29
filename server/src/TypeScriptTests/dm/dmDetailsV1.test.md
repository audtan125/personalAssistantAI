import { requestSuccessfulAuthRegister } from '../../Helpers/requests/requestAuthHelper';
import { requestSuccessfulDmCreate, requestSuccessfulDmDetails, requestErrorDmDetails } from '../../Helpers/requests/requestDmHelper';
import { requestSuccessfulUserProfile } from '../../Helpers/requests/requestUserHelper';
import { requestClear } from '../../Helpers/requests/requestOtherHelper';
const DMID_ERROR = 400;
const TOKEN_ERROR = 403;

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

describe('Successful DM details', () => {
  test('only one user', () => {
    const user = requestSuccessfulAuthRegister(
      'firstuser@gmail.com', '123456', 'First', 'User'
    );
    const uId = user.authUserId;
    const token = user.token;

    const dmId = requestSuccessfulDmCreate(token, []).dmId;
    const details = requestSuccessfulDmDetails(token, dmId);
    const userProfile = requestSuccessfulUserProfile(token, uId).user;
    expect(details).toStrictEqual({ name: 'firstuser', members: [userProfile] });
  });

  test('Multiple users', () => {
    const user1 = requestSuccessfulAuthRegister(
      'firstuser@gmail.com', '123456', 'First', 'User'
    );
    const user2 = requestSuccessfulAuthRegister(
      'seconduser@gmail.com', '123456', 'Second', 'User'
    );
    const user3 = requestSuccessfulAuthRegister(
      'thirduser@gmail.com', '123456', 'Third', 'User'
    );
    const uId1 = user1.authUserId;
    const uId2 = user2.authUserId;
    const uId3 = user3.authUserId;
    const token1 = user1.token;
    const token2 = user2.token;
    const token3 = user3.token;

    const dmId = requestSuccessfulDmCreate(token1, [uId2, uId3]).dmId;
    const details = requestSuccessfulDmDetails(token1, dmId);

    const dmName = 'firstuser, seconduser, thirduser';
    const profile1 = requestSuccessfulUserProfile(token1, uId1).user;
    const profile2 = requestSuccessfulUserProfile(token2, uId2).user;
    const profile3 = requestSuccessfulUserProfile(token3, uId3).user;

    expect(details.name).toStrictEqual(dmName);
    expect(details.members).toContainEqual(profile1);
    expect(details.members).toContainEqual(profile2);
    expect(details.members).toContainEqual(profile3);
  });
});

describe('Error return', () => {
  test('DM ID does not exist', () => {
    const token = requestSuccessfulAuthRegister(
      'firstuser@gmail.com', '123456', 'First', 'User'
    ).token;

    const dmId = requestSuccessfulDmCreate(token, []).dmId;
    expect(requestErrorDmDetails(token, dmId + 1)).toStrictEqual(DMID_ERROR);
  });

  test('Valid DM ID but user of token is not a member of the DM', () => {
    const token0 = requestSuccessfulAuthRegister(
      'zerouser@gmail.com', '123456', 'zero', 'User'
    ).token;
    const token1 = requestSuccessfulAuthRegister(
      'firstuser@gmail.com', '123456', 'First', 'User'
    ).token;

    const dmId = requestSuccessfulDmCreate(token1, []).dmId;
    expect(requestErrorDmDetails(token0, dmId)).toStrictEqual(TOKEN_ERROR);
  });

  test('Invalid token', () => {
    const token = requestSuccessfulAuthRegister(
      'firstuser@gmail.com', '123456', 'First', 'User'
    ).token;
    const dmId = requestSuccessfulDmCreate(token, []).dmId;
    expect(requestErrorDmDetails('A' + token, dmId)).toStrictEqual(TOKEN_ERROR);
  });
});
