import { requestFirstUserAuthRegister, requestSecondUserAuthRegister } from '../../Helpers/requests/requestAuthHelper';
import { requestSuccessfulDmCreate, requestSuccessfulDmMessages, requestSuccessfulDmRemove } from '../../Helpers/requests/requestDmHelper';
import {
  requestSuccessfulSendDmMessageLater,
  requestErrorSendDmMessageLater,
  requestErrorMessageRemove
} from '../../Helpers/requests/requestMessageHelper';
import { requestClear } from '../../Helpers/requests/requestOtherHelper';
import { } from '../../Helpers/requests/requestDmHelper';
import { sleep } from '../../Helpers/sleep';
const string1000chars = `1111111111111111111111111111111111111111111111111111111
1111111111111111111111111111111111111111111111111111111111111111111111111111111
1111111111111111111111111111111111111111111111111111111111111111111111111111111
1111111111111111111111111111111111111111111111111111111111111111111111111111111
1111111111111111111111111111111111111111111111111111111111111111111111111111111
1111111111111111111111111111111111111111111111111111111111111111111111111111111
1111111111111111111111111111111111111111111111111111111111111111111111111111111
1111111111111111111111111111111111111111111111111111111111111111111111111111111
1111111111111111111111111111111111111111111111111111111111111111111111111111111
1111111111111111111111111111111111111111111111111111111111111111111111111111111
1111111111111111111111111111111111111111111111111111111111111111111111111111111
1111111111111111111111111111111111111111111111111111111111111111111111111111111
1111111111111111111111111111111111111111111111111111111111111111`;

const MESSAGE_ERROR = 400;
const TOKEN_ERROR = 403;

let globalUser : {token: string, authUserId: number};
let dmId : number;

beforeEach(() => {
  requestClear();
  globalUser = requestFirstUserAuthRegister();
  dmId = requestSuccessfulDmCreate(globalUser.token, []).dmId;
});

afterAll(() => {
  requestClear();
});

describe('Successful message send dm later', () => {
  // test('Check for valid timeSent value for message', () => {
  //   const startTime = Date.now() / 1000;

  //   // Send message in 1 second
  //   requestSuccessfulSendDmMessageLater(
  //     globalUser.token, dmId, 'message', startTime + 1
  //   );

  //   sleep(1.5);

  //   const dmMsgs = requestSuccessfulDmMessages(globalUser.token, dmId, 0).messages;
  //   expect(dmMsgs[0].timeSent).toBeGreaterThan(startTime);
  // });

  test('Message will not be sent if DM is removed before the message is scheduled to be sent.', () => {
    // Send message in 1 second
    const msgId = requestSuccessfulSendDmMessageLater(
      globalUser.token, dmId, 'message', (Date.now() / 1000) + 0.5
    ).messageId;

    // deletes dm
    requestSuccessfulDmRemove(globalUser.token, dmId);

    // Waits for send dm later to trigger
    sleep(1);

    // Checks whether the message can be removed. (It shouldn't be able to be removed)
    expect(requestErrorMessageRemove(globalUser.token, msgId)).toStrictEqual(MESSAGE_ERROR);
  });

  test('Correct message sent at correct time', () => {
    // Send message in 1 second
    const msgId = requestSuccessfulSendDmMessageLater(
      globalUser.token, dmId, 'message', (Date.now() / 1000) + 1
    ).messageId;

    let dmMsgs = requestSuccessfulDmMessages(globalUser.token, dmId, 0).messages;
    expect(dmMsgs.length).toStrictEqual(0);

    sleep(1.5);

    // 1.5 seconds later, message should be sent.
    dmMsgs = requestSuccessfulDmMessages(globalUser.token, dmId, 0).messages;
    expect(dmMsgs.length).toStrictEqual(1);
    expect(dmMsgs).toContainEqual(
      {
        messageId: msgId,
        uId: globalUser.authUserId,
        message: 'message',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false
      });
  });
});

describe('Error message send later', () => {
  afterEach(() => {
    // After each error test, check that the message is not added.
    sleep(0.5);
    expect(requestSuccessfulDmMessages(globalUser.token, dmId, 0).messages.length).toStrictEqual(0);
    requestClear();
  });

  test('Invalid dmId', () => {
    expect(
      requestErrorSendDmMessageLater(
        globalUser.token, dmId + 1, 'message', (Date.now() / 1000)
      )
    ).toStrictEqual(MESSAGE_ERROR);
  });

  test('message is empty', () => {
    expect(
      requestErrorSendDmMessageLater(
        globalUser.token, dmId, '', (Date.now() / 1000)
      )
    ).toStrictEqual(MESSAGE_ERROR);
  });

  test('message is more than 1000 characters', () => {
    expect(
      requestErrorSendDmMessageLater(
        globalUser.token, dmId, string1000chars + 'A', (Date.now() / 1000)
      )
    ).toStrictEqual(MESSAGE_ERROR);
  });

  test('timeSent is in the past', () => {
    expect(
      requestErrorSendDmMessageLater(
        globalUser.token, dmId, 'message', (Date.now() / 1000) - 1
      )
    ).toStrictEqual(MESSAGE_ERROR);
  });

  test('User is not a member of specified DM', () => {
    const secondUser = requestSecondUserAuthRegister();
    expect(
      requestErrorSendDmMessageLater(
        secondUser.token, dmId, 'message', (Date.now() / 1000)
      )
    ).toStrictEqual(TOKEN_ERROR);
  });

  test('Invalid token', () => {
    expect(
      requestErrorSendDmMessageLater(
        globalUser.token + 'A', dmId, 'message', (Date.now() / 1000)
      )
    ).toStrictEqual(TOKEN_ERROR);
  });
});
