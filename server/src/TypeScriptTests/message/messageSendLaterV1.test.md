import { requestFirstUserAuthRegister, requestSecondUserAuthRegister } from '../../Helpers/requests/requestAuthHelper';
import { requestSuccessfulChannelsCreate } from '../../Helpers/requests/requestChannelsHelper';
import {
  requestSuccessfulSendMessageLater,
  requestErrorSendMessageLater
} from '../../Helpers/requests/requestMessageHelper';
import { requestClear } from '../../Helpers/requests/requestOtherHelper';
import { requestSuccessfulChannelMessages } from '../../Helpers/requests/requestChannelHelper';
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
let channelId : number;

beforeEach(() => {
  requestClear();
  globalUser = requestFirstUserAuthRegister();
  channelId = requestSuccessfulChannelsCreate(globalUser.token, 'New Test Channel', true).channelId;
});

afterAll(() => {
  requestClear();
});

describe('Successful message send later', () => {
  test('Correct message sent at correct time', () => {
    // Send message in 1 second
    const msgId = requestSuccessfulSendMessageLater(
      globalUser.token, channelId, 'message', (Date.now() / 1000) + 1
    ).messageId;

    let chMsgs = requestSuccessfulChannelMessages(globalUser.token, channelId, 0).messages;
    expect(chMsgs.length).toStrictEqual(0);

    sleep(1.5);

    // 1.5 seconds later, message should be sent.
    chMsgs = requestSuccessfulChannelMessages(globalUser.token, channelId, 0).messages;
    expect(chMsgs.length).toStrictEqual(1);
    expect(chMsgs).toContainEqual(
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
    expect(requestSuccessfulChannelMessages(globalUser.token, channelId, 0).messages.length).toStrictEqual(0);
    requestClear();
  });

  test('Invalid channelId', () => {
    expect(
      requestErrorSendMessageLater(
        globalUser.token, channelId + 1, 'message', (Date.now() / 1000)
      )
    ).toStrictEqual(MESSAGE_ERROR);
  });

  test('message is empty', () => {
    expect(
      requestErrorSendMessageLater(
        globalUser.token, channelId, '', (Date.now() / 1000)
      )
    ).toStrictEqual(MESSAGE_ERROR);
  });

  test('message is more than 1000 characters', () => {
    expect(
      requestErrorSendMessageLater(
        globalUser.token, channelId, string1000chars + 'A', (Date.now() / 1000)
      )
    ).toStrictEqual(MESSAGE_ERROR);
  });

  test('timeSent is in the past', () => {
    expect(
      requestErrorSendMessageLater(
        globalUser.token, channelId, 'message', (Date.now() / 1000) - 1
      )
    ).toStrictEqual(MESSAGE_ERROR);
  });

  test('User is not a member of specified channel', () => {
    const secondUser = requestSecondUserAuthRegister();
    expect(
      requestErrorSendMessageLater(
        secondUser.token, channelId, 'message', (Date.now() / 1000)
      )
    ).toStrictEqual(TOKEN_ERROR);
  });

  test('Invalid token', () => {
    expect(
      requestErrorSendMessageLater(
        globalUser.token + 'A', channelId, 'message', (Date.now() / 1000)
      )
    ).toStrictEqual(TOKEN_ERROR);
  });
});
