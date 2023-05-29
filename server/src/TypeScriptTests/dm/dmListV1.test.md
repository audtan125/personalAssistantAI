import { requestFirstUserAuthRegister, requestSecondUserAuthRegister } from '../../Helpers/requests/requestAuthHelper';
import { requestSuccessfulDmCreate, requestSuccessfulDmDetails, requestSuccessfulDmList, requestErrorDmList } from '../../Helpers/requests/requestDmHelper';
import { requestClear } from '../../Helpers/requests/requestOtherHelper';
const ERROR = 403;

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

describe('Successful dm list', () => {
  /*
  test('User is a part of all DMs', () => {
    const user1 = requestFirstUserAuthRegister();
    const user2 = requestSecondUserAuthRegister();
    const uId1 = user1.authUserId;
    const token1 = user1.token;
    const token2 = user2.token;

    const dmId1 = requestSuccessfulDmCreate(token1, []).dmId;
    const dmId2 = requestSuccessfulDmCreate(token2, [uId1]).dmId;
    const dmName1 = requestSuccessfulDmDetails(token1, dmId1).name;
    const dmName2 = requestSuccessfulDmDetails(token2, dmId2).name;

    const dmList = requestSuccessfulDmList(token1).dms;
    expect(dmList).toContainEqual({ dmId: dmId1, name: dmName1 });
    expect(dmList).toContainEqual({ dmId: dmId2, name: dmName2 });
    expect(dmList.length).toStrictEqual(2);
  });
  */

  test('User is part of some of the DMs', () => {
    const user1 = requestFirstUserAuthRegister();
    const user2 = requestSecondUserAuthRegister();
    const uId1 = user1.authUserId;
    const token1 = user1.token;
    const token2 = user2.token;

    const dmId1 = requestSuccessfulDmCreate(token1, []).dmId;
    const dmId2 = requestSuccessfulDmCreate(token2, [uId1]).dmId;
    const dmId3 = requestSuccessfulDmCreate(token2, []).dmId;

    const dmName1 = requestSuccessfulDmDetails(token1, dmId1).name;
    const dmName2 = requestSuccessfulDmDetails(token2, dmId2).name;
    const dmName3 = requestSuccessfulDmDetails(token2, dmId3).name;

    const dmList = requestSuccessfulDmList(token1).dms;
    expect(dmList).toContainEqual({ dmId: dmId1, name: dmName1 });
    expect(dmList).toContainEqual({ dmId: dmId2, name: dmName2 });
    expect(dmList.length).toStrictEqual(2);
    expect(dmList).not.toContainEqual({ dmId: dmId3, name: dmName3 });
  });

  test('User of current token is not a member of any DM', () => {
    const token1 = requestFirstUserAuthRegister().token;
    const token2 = requestSecondUserAuthRegister().token;

    requestSuccessfulDmCreate(token2, []);
    requestSuccessfulDmCreate(token2, []);

    const dmList = requestSuccessfulDmList(token1).dms;
    expect(dmList).toStrictEqual([]);
  });

  /*
  test('There are no DMs', () => {
    const token1 = requestFirstUserAuthRegister().token;
    const dmList = requestSuccessfulDmList(token1).dms;
    expect(dmList).toStrictEqual([]);
  });
  */
});

describe('Return error', () => {
  test('Token does not exist', () => {
    const token1 = requestFirstUserAuthRegister().token;
    expect(requestErrorDmList(token1 + 'A')).toStrictEqual(ERROR);
  });
});
