import { requestFirstUserAuthRegister, requestSecondUserAuthRegister } from '../../Helpers/requests/requestAuthHelper';
import { requestSuccessfulDmCreate, requestSuccessfulDmList, requestSuccessfulDmRemove, requestErrorDmRemove, requestSuccessfulDmLeave, requestErrorDmMessages } from '../../Helpers/requests/requestDmHelper';
import { requestErrorEditMessage, requestSuccessfulSendDm } from '../../Helpers/requests/requestMessageHelper';
import { requestClear } from '../../Helpers/requests/requestOtherHelper';
const ERROR = 400;
const AUTH_ERROR = 403;

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

describe('Successful dm remove', () => {
  test('For DM1 containing user1 and DM2 containing user1 and user2, remove DM1', () => {
    const token1 = requestFirstUserAuthRegister().token;
    const user2 = requestSecondUserAuthRegister();
    const uId2 = user2.authUserId;
    const token2 = user2.token;

    const dmId1 = requestSuccessfulDmCreate(token1, []).dmId;
    const dmId2 = requestSuccessfulDmCreate(token1, [uId2]).dmId;

    expect(requestSuccessfulDmRemove(token1, dmId1)).toStrictEqual({});

    const dmList1 = requestSuccessfulDmList(token1).dms;
    expect(dmList1.length).toStrictEqual(1);
    expect(dmList1[0].dmId).toStrictEqual(dmId2);

    const dmList2 = requestSuccessfulDmList(token2).dms;
    expect(dmList2.length).toStrictEqual(1);
    expect(dmList2[0].dmId).toStrictEqual(dmId2);

    // dmId1 should be invalid
    expect(requestErrorDmMessages(token1, dmId1, 0)).toStrictEqual(ERROR);
  });

  // test('For DM1 containing user1 and DM2 containing user1 and user2, remove DM2', () => {
  //   const token1 = requestFirstUserAuthRegister().token;
  //   const user2 = requestSecondUserAuthRegister();
  //   const uId2 = user2.authUserId;
  //   const token2 = user2.token;

  //   const dmId1 = requestSuccessfulDmCreate(token1, []).dmId;
  //   const dmId2 = requestSuccessfulDmCreate(token1, [uId2]).dmId;

  //   expect(requestSuccessfulDmRemove(token1, dmId2)).toStrictEqual({});

  //   const dmList1 = requestSuccessfulDmList(token1).dms;
  //   expect(dmList1.length).toStrictEqual(1);
  //   expect(dmList1[0].dmId).toStrictEqual(dmId1);

  //   const dmList2 = requestSuccessfulDmList(token2).dms;

  //   // user2 is no longer a part of any DM.
  //   expect(dmList2.length).toStrictEqual(0);

  //   // dmId2 should be invalid
  //   expect(requestErrorDmMessages(token1, dmId2, 0)).toStrictEqual(ERROR);
  // });

  test('Messages from dm are removed after dm is removed.', () => {
    const token1 = requestFirstUserAuthRegister().token;
    const dmId1 = requestSuccessfulDmCreate(token1, []).dmId;
    const msgId = requestSuccessfulSendDm(token1, dmId1, 'test coverage').messageId;

    requestSuccessfulDmRemove(token1, dmId1);
    expect(requestErrorEditMessage(token1, msgId, 'hello')).toStrictEqual(ERROR);
  });
});

describe('Return error', () => {
  test('DM ID does not refer to a valid DM', () => {
    const token = requestFirstUserAuthRegister().token;
    const dmId = requestSuccessfulDmCreate(token, []).dmId;
    expect(requestErrorDmRemove(token, dmId + 1)).toStrictEqual(ERROR);
  });

  test('User of token is not the creator of specified DM', () => {
    const token1 = requestFirstUserAuthRegister().token;
    const user2 = requestSecondUserAuthRegister();
    const token2 = user2.token;
    const uId2 = user2.authUserId;
    const dmId = requestSuccessfulDmCreate(token1, [uId2]).dmId;
    expect(requestErrorDmRemove(token2, dmId)).toStrictEqual(AUTH_ERROR);
  });

  test('dmId is valid and the authorised user is no longer in the DM', () => {
    const token1 = requestFirstUserAuthRegister().token;
    const user2 = requestSecondUserAuthRegister();
    const uId2 = user2.authUserId;
    const dmId = requestSuccessfulDmCreate(token1, [uId2]).dmId;
    requestSuccessfulDmLeave(token1, dmId);
    expect(requestErrorDmRemove(token1, dmId)).toStrictEqual(AUTH_ERROR);
  });

  test('Token does not exist', () => {
    const token = requestFirstUserAuthRegister().token;
    const dmId = requestSuccessfulDmCreate(token, []).dmId;
    expect(requestErrorDmRemove(token + 'A', dmId)).toStrictEqual(AUTH_ERROR);
  });
});
