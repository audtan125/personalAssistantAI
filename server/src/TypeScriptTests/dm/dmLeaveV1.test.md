import {
  requestFirstUserAuthRegister, requestSecondUserAuthRegister
} from '../../Helpers/requests/requestAuthHelper';
import {
  requestSuccessfulDmCreate, requestSuccessfulDmDetails, requestSuccessfulDmLeave, requestErrorDmLeave
} from '../../Helpers/requests/requestDmHelper';
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

describe('Successful DM leave', () => {
  test('DM member leaves DM', () => {
    const user1 = requestFirstUserAuthRegister();
    const user2 = requestSecondUserAuthRegister();
    const uId1 = user1.authUserId;
    const uId2 = user2.authUserId;
    const token1 = user1.token;
    const token2 = user2.token;

    const dmId = requestSuccessfulDmCreate(token1, [uId2]).dmId;

    expect(requestSuccessfulDmLeave(token2, dmId)).toStrictEqual({});

    const details = requestSuccessfulDmDetails(token1, dmId);
    const userProfile1 = requestSuccessfulUserProfile(token1, uId1).user;
    const userProfile2 = requestSuccessfulUserProfile(token2, uId2).user;

    expect(details.members).toContainEqual(userProfile1);
    expect(details.members).not.toContainEqual(userProfile2);
    expect(details.members.length).toStrictEqual(1);
  });

  test('DM owner leaves DM', () => {
    const user1 = requestFirstUserAuthRegister();
    const user2 = requestSecondUserAuthRegister();
    const uId1 = user1.authUserId;
    const uId2 = user2.authUserId;
    const token1 = user1.token;
    const token2 = user2.token;

    const dmId = requestSuccessfulDmCreate(token1, [uId2]).dmId;

    expect(requestSuccessfulDmLeave(token1, dmId)).toStrictEqual({});

    const details = requestSuccessfulDmDetails(token2, dmId);
    const userProfile1 = requestSuccessfulUserProfile(token1, uId1).user;
    const userProfile2 = requestSuccessfulUserProfile(token2, uId2).user;

    expect(details.members).toContainEqual(userProfile2);
    expect(details.members).not.toContainEqual(userProfile1);
    expect(details.members.length).toStrictEqual(1);
  });

  // test('All users leave DM', () => {
  //   const user1 = requestFirstUserAuthRegister();
  //   const user2 = requestSecondUserAuthRegister();
  //   const uId2 = user2.authUserId;
  //   const token1 = user1.token;
  //   const token2 = user2.token;

  //   const dmId = requestSuccessfulDmCreate(token1, [uId2]).dmId;

  //   expect(requestSuccessfulDmLeave(token1, dmId)).toStrictEqual({});
  //   expect(requestSuccessfulDmLeave(token2, dmId)).toStrictEqual({});

  //   // DM should no longer exist
  //   expect(requestErrorDmDetails(token1, dmId)).toStrictEqual(DMID_ERROR);
  // });
});

describe('Error return', () => {
  test('dmId does not refer to a valid DM', () => {
    const token = requestFirstUserAuthRegister().token;
    const dmId = requestSuccessfulDmCreate(token, []).dmId;
    expect(requestErrorDmLeave(token, dmId + 1)).toStrictEqual(DMID_ERROR);
    expect(requestErrorDmLeave(token, dmId - 1)).toStrictEqual(DMID_ERROR);
  });
  test('dmId is valid and the user is not a member of the DM', () => {
    const token1 = requestFirstUserAuthRegister().token;
    const token2 = requestSecondUserAuthRegister().token;
    const dmId = requestSuccessfulDmCreate(token1, []).dmId;
    expect(requestErrorDmLeave(token2, dmId)).toStrictEqual(TOKEN_ERROR);
  });
  test('token is invalid', () => {
    const token = requestFirstUserAuthRegister().token;
    const invalidToken1 = 'A' + token;
    const invalidToken2 = token + 'A';
    const dmId = requestSuccessfulDmCreate(token, []).dmId;
    expect(requestErrorDmLeave(invalidToken1, dmId)).toStrictEqual(TOKEN_ERROR);
    expect(requestErrorDmLeave(invalidToken2, dmId)).toStrictEqual(TOKEN_ERROR);
  });
});
