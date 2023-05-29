import {
  requestSuccessfulAuthRegister, requestFirstUserAuthRegister,
  requestSecondUserAuthRegister
} from '../../Helpers/requests/requestAuthHelper';
import {
  requestSuccessfulSendDm, requestErrorSendDm
} from '../../Helpers/requests/requestMessageHelper';
import {
  requestSuccessfulDmCreate
} from '../../Helpers/requests/requestDmHelper';
import { requestClear } from '../../Helpers/requests/requestOtherHelper';
const aThousandCharacters = `abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuv
abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxy
abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxy
abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxy
abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxy
abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxy
abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxy
abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxy
abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxy
abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxy
abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxy
abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxy
abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxy
abcdefghijklmno`;

const ERROR = 400;
const AUTH_ERROR = 403;

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

describe('Successful dm message sent', () => {
  test('Check two messages sent do not have the same id', () => {
    const token: string = requestFirstUserAuthRegister().token;
    const dmId: number = requestSuccessfulDmCreate(token, []).dmId;
    const sendDmReturn = requestSuccessfulSendDm(token, dmId, 'Team Boost is Top');
    const sendDmReturn2 = requestSuccessfulSendDm(token, dmId, 'pls give us good marks Archit');
    expect(sendDmReturn).toStrictEqual({ messageId: expect.any(Number) });
    expect(sendDmReturn2).toStrictEqual({ messageId: expect.any(Number) });
    expect(sendDmReturn2.messageId).not.toBe(sendDmReturn.messageId);
  });

  describe('Message length', () => {
    test('is the minimum valid length', () => {
      const token: string = requestFirstUserAuthRegister().token;
      const dmId: number = requestSuccessfulDmCreate(token, []).dmId;
      const sendDmReturn = requestSuccessfulSendDm(token, dmId, 'T');
      expect(sendDmReturn).toStrictEqual({ messageId: expect.any(Number) });
    });

    test('is the maximum possible length', () => {
      const token: string = requestFirstUserAuthRegister().token;
      const dmId: number = requestSuccessfulDmCreate(token, []).dmId;
      const sendDmReturn = requestSuccessfulSendDm(token, dmId, aThousandCharacters);
      expect(sendDmReturn).toStrictEqual({ messageId: expect.any(Number) });
    });
  });
});

describe('Return error', () => {
  describe('dmId does not refer to a valid dm', () => {
    /*
    test('valid token but no dms have been created yet', () => {
      const token: string = requestFirstUserAuthRegister().token;
      // 1 is an invalid dmId because no dms have been created yet
      const sendDmReturn = requestErrorSendDm(token, 1, 'Team Boost is Top');
      expect(sendDmReturn).toStrictEqual(ERROR);
    });
    */
    test('one dm has already been created', () => {
      const token: string = requestFirstUserAuthRegister().token;
      const dmId: number = requestSuccessfulDmCreate(token, []).dmId;
      // dmId + 1 is an invalid dmId because only one dm has been created so far
      const sendDmReturn = requestErrorSendDm(token, dmId + 1, 'Team Boost is Top');
      expect(sendDmReturn).toStrictEqual(ERROR);
    });
  });

  describe('length of message is invalid', () => {
    test('too short', () => {
      const token: string = requestFirstUserAuthRegister().token;
      const dmId: number = requestSuccessfulDmCreate(token, []).dmId;
      // message needs to be at least 1 character
      const sendDmReturn = requestErrorSendDm(token, dmId, '');
      expect(sendDmReturn).toStrictEqual(ERROR);
    });

    test('too long', () => {
      const token: string = requestFirstUserAuthRegister().token;
      const dmId: number = requestSuccessfulDmCreate(token, []).dmId;
      // message needs to be less than or equal to 1001 characters
      const sendDmReturn = requestErrorSendDm(token, dmId, aThousandCharacters + 'a');
      expect(sendDmReturn).toStrictEqual(ERROR);
    });
  });

  describe('valid dmId but user is not a member of the dm', () => {
    test('two users are a member, third is not', () => {
      const token: string = requestFirstUserAuthRegister().token;
      // Second user's userId
      const uId2: number = requestSecondUserAuthRegister().authUserId;
      // First and Second user is a member of the dm
      const dmId: number = requestSuccessfulDmCreate(token, [uId2]).dmId;
      // Third user's token
      const authRegisterReturn3 = requestSuccessfulAuthRegister(
        'thirduser@gmail.com', '123456', 'Third', 'User'
      );
      let token3;
      if ('token' in authRegisterReturn3) {
        token3 = authRegisterReturn3.token;
      }
      // third user sends a message into the dm
      const sendDmReturn = requestErrorSendDm(token3, dmId, 'Team Boost is Top');
      expect(sendDmReturn).toStrictEqual(AUTH_ERROR);
    });
  });

  describe('token is invalid', () => {
    test('user and dm have been created', () => {
      const token: string = requestFirstUserAuthRegister().token;
      const dmId: number = requestSuccessfulDmCreate(token, []).dmId;
      // dmId is valid but token is invalid
      const sendDmReturn = requestErrorSendDm(token + 'a', dmId, 'Team Boost is Top');
      expect(sendDmReturn).toStrictEqual(AUTH_ERROR);
    });
  });
});
