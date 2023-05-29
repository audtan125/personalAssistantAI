import { requestClear } from '../../Helpers/requests/requestOtherHelper';
import {
  requestFirstUserAuthRegister, requestSecondUserAuthRegister
} from '../../Helpers/requests/requestAuthHelper';
import {
  requestErrorDmMessages,
  requestSuccessfulDmCreate, requestSuccessfulDmMessages
} from '../../Helpers/requests/requestDmHelper';
import {
  requestSuccessfulSendDm
} from '../../Helpers/requests/requestMessageHelper';
const ERROR = 400;
const AUTH_ERROR = 403;

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

describe('Successfully display messages', () => {
  // test('Display no messages successfully', () => {
  //   const token: string = requestFirstUserAuthRegister().token;
  //   const dmId: number = requestSuccessfulDmCreate(token, []).dmId;
  //   const dmMessagesReturn = requestSuccessfulDmMessages(token, dmId, 0);
  //   expect(dmMessagesReturn).toStrictEqual(
  //     {
  //       messages: [],
  //       start: 0,
  //       end: -1,
  //     }
  //   );
  // });

  test('Display 50 duplicate messages, with 1 message left', () => {
    const firstUser = requestFirstUserAuthRegister();
    const dmId: number = requestSuccessfulDmCreate(firstUser.token, []).dmId;
    const msgIdArray: number[] = [];
    // Create 51 messages
    for (let i = 0; i <= 50; i++) {
      msgIdArray[i] = requestSuccessfulSendDm(
        firstUser.token, dmId, 'Team Boost is Top').messageId;
    }
    const dmMessagesReturn = requestSuccessfulDmMessages(
      firstUser.token, dmId, 0);
    expect(dmMessagesReturn.start).toStrictEqual(0);
    // check it returns end = 50 as there is still 1 more message to load
    expect(dmMessagesReturn.end).toStrictEqual(50);
    // Expect each msgId from msgIdArray stored in index 1 to 50 inclusive
    // to be included in the return array
    // (excluding index 0 which is the least recently created)
    for (let j = 1; j <= 50; j++) {
      expect(dmMessagesReturn.messages).toContainEqual(
        {
          messageId: msgIdArray[j],
          uId: firstUser.authUserId,
          message: 'Team Boost is Top',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false
        }
      );
    }
    // Expect exactly 50 messages are returned
    expect(dmMessagesReturn.messages.length).toBe(50);
  });

  // test('Test order of returned messages is from most recent to least', () => {
  //   const firstUser: {token: string, authUserId: number
  //     } = requestFirstUserAuthRegister();
  //   const dmId: number = requestSuccessfulDmCreate(firstUser.token, []).dmId;

  //   const msgId1: number = requestSuccessfulSendDm(
  //     firstUser.token, dmId, 'Team Boost is Top').messageId;

  //   const msgId2: number = requestSuccessfulSendDm(
  //     firstUser.token, dmId, 'Team Boost is Top').messageId;

  //   const msgId3: number = requestSuccessfulSendDm(
  //     firstUser.token, dmId, 'Team Boost is Top').messageId;

  //   const dmMessages = requestSuccessfulDmMessages(firstUser.token, dmId, 0);
  //   expect(dmMessages).toStrictEqual(
  //     {
  //       messages: expect.any(Array),
  //       start: 0,
  //       end: -1,
  //     }
  //   );
  //   // the most recent message should be at index 0, according to spec
  //   expect(dmMessages.messages[0]).toStrictEqual(
  //     {
  //       messageId: msgId3,
  //       uId: firstUser.authUserId,
  //       message: 'Team Boost is Top',
  //       timeSent: expect.any(Number),
  //       reacts: [],
  //       isPinned: false
  //     }
  //   );
  //   expect(dmMessages.messages[1]).toStrictEqual(
  //     {
  //       messageId: msgId2,
  //       uId: firstUser.authUserId,
  //       message: 'Team Boost is Top',
  //       timeSent: expect.any(Number),
  //       reacts: [],
  //       isPinned: false
  //     }
  //   );
  //   expect(dmMessages.messages[2]).toStrictEqual(
  //     {
  //       messageId: msgId1,
  //       uId: firstUser.authUserId,
  //       message: 'Team Boost is Top',
  //       timeSent: expect.any(Number),
  //       reacts: [],
  //       isPinned: false
  //     }
  //   );
  //   // Expect the more recent message to be sent at a later time
  //   expect(dmMessages.messages[0].timeSent).toBeGreaterThanOrEqual(
  //     dmMessages.messages[1].timeSent
  //   );
  //   expect(dmMessages.messages[1].timeSent).toBeGreaterThanOrEqual(
  //     dmMessages.messages[2].timeSent
  //   );
  // });

  describe('Start is non zero', () => {
    test('number of messages left is less than 50', () => {
      const firstUser = requestFirstUserAuthRegister();
      const dmId: number = requestSuccessfulDmCreate(firstUser.token, []).dmId;
      const msgIdArray: number[] = [];
      // Create 10 messages
      for (let i = 0; i <= 9; i++) {
        // push in the message Ids so that the 0th index is the most recently
        // created Id
        msgIdArray.unshift(requestSuccessfulSendDm(
          firstUser.token, dmId, 'Team Boost is Top').messageId);
      }
      // Start is 3
      const dmMessages = requestSuccessfulDmMessages(firstUser.token, dmId, 3);
      expect(dmMessages).toStrictEqual(
        {
          messages: expect.any(Array),
          start: 3,
          end: -1,
        }
      );
      // Indices for the messages created are
      // 0 1 2 3 4 5 6 7 8 9
      // The message ids stored at each index is (most recent first)
      // 9 8 7 6 5 4 3 2 1 0
      // The indices for the messages returned are
      //       6 5 4 3 2 1 0
      // Where the 3rd index is now the 0th index
      expect(dmMessages.messages.length).toBe(7);
      expect(dmMessages.messages[0]).toStrictEqual(
        {
          // Since start was 3
          // The message Id should be the 3rd index of msgIdArray
          messageId: msgIdArray[3],
          uId: firstUser.authUserId,
          message: 'Team Boost is Top',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false
        }
      );
    });

    // test('start is 50 and number of messages left is 50', () => {
    //   const firstUser = requestFirstUserAuthRegister();
    //   const dmId: number = requestSuccessfulDmCreate(firstUser.token, []).dmId;
    //   const msgIdArray: number[] = [];
    //   // Create 100 messages
    //   for (let i = 0; i <= 99; i++) {
    //     msgIdArray[i] = requestSuccessfulSendDm(
    //       firstUser.token, dmId, 'Team Boost is Top').messageId;
    //   }
    //   const dmMessages = requestSuccessfulDmMessages(firstUser.token, dmId, 50);
    //   // Since the most recent message has already been displayed
    //   // end should be -1
    //   expect(dmMessages).toStrictEqual(
    //     {
    //       messages: expect.any(Array),
    //       start: 50,
    //       end: -1,
    //     }
    //   );
    //   // from index 50 to 99, there are 50 messages in total
    //   expect(dmMessages.messages.length).toBe(50);
    // });
    test('start is equal to the number of messages', () => {
      const firstUser = requestFirstUserAuthRegister();
      const dmId: number = requestSuccessfulDmCreate(firstUser.token, []).dmId;
      // Create 10 messages
      for (let i = 0; i <= 9; i++) {
        requestSuccessfulSendDm(firstUser.token, dmId, 'Team Boost is Top');
      }
      // start is index 10, which is invalid as the last index is 9
      const dmMessages = requestSuccessfulDmMessages(firstUser.token, dmId, 10);
      expect(dmMessages).toStrictEqual(
        {
          messages: [],
          start: 10,
          end: -1,
        }
      );
    });
  });
});

describe('Returns error', () => {
  describe('Start is larger than number of messages', () => {
    /*
    test('Start is 1 but no messages created yet', () => {
      const token: string = requestFirstUserAuthRegister().token;
      const dmId: number = requestSuccessfulDmCreate(token, []).dmId;
      // Start is 1
      const dmMessagesReturn = requestErrorDmMessages(token, dmId, 1);
      expect(dmMessagesReturn).toStrictEqual(ERROR);
    });
    */
    test('Start is 2 and 1 message created', () => {
      const token: string = requestFirstUserAuthRegister().token;
      const dmId: number = requestSuccessfulDmCreate(token, []).dmId;
      requestSuccessfulSendDm(token, dmId, 'Team Boost is Top');
      // Start is 2
      const dmMessagesReturn = requestErrorDmMessages(token, dmId, 2);
      expect(dmMessagesReturn).toStrictEqual(ERROR);
    });
  });

  test('Start is negative', () => {
    const token: string = requestFirstUserAuthRegister().token;
    const dmId: number = requestSuccessfulDmCreate(token, []).dmId;
    requestSuccessfulSendDm(token, dmId, 'Team Boost is Top');
    // Start is -1
    const dmMessagesReturn = requestErrorDmMessages(token, dmId, -1);
    expect(dmMessagesReturn).toStrictEqual(ERROR);
  });

  describe('dmId is not valid', () => {
    test('1 dm created yet', () => {
      const firstUser = requestFirstUserAuthRegister();
      const dmId: number = requestSuccessfulDmCreate(firstUser.token, []).dmId;
      // Since only 1 dm has been created dmId + 1 is invalid
      const dmMessagesReturn = requestErrorDmMessages(firstUser.token, dmId + 1, 0);
      expect(dmMessagesReturn).toStrictEqual(ERROR);
    });
  });

  test('dmId is valid but user is not a member', () => {
    const firstUser = requestFirstUserAuthRegister();
    const secondUser = requestSecondUserAuthRegister();
    // Dm is created with only the first user
    const dmId: number = requestSuccessfulDmCreate(firstUser.token, []).dmId;
    // First user sends message
    requestSuccessfulSendDm(firstUser.token, dmId, 'Team Boost is Top');
    // Second user calls dm messages
    const dmMessagesReturn = requestErrorDmMessages(secondUser.token, dmId, 0);
    expect(dmMessagesReturn).toStrictEqual(AUTH_ERROR);
  });

  describe('token is invalid', () => {
    test('1 user has been created', () => {
      const token: string = requestFirstUserAuthRegister().token;
      const dmId: number = requestSuccessfulDmCreate(token, []).dmId;
      // No messages created but would return an empty array if token was valid
      // Since only 1 user has been created, token + 'a' is invalid
      const dmMessagesReturn = requestErrorDmMessages(token + 'a', dmId, 0);
      expect(dmMessagesReturn).toStrictEqual(AUTH_ERROR);
    });
  });
});
