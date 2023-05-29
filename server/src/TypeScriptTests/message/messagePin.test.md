import {
  requestFirstUserAuthRegister,
  requestSecondUserAuthRegister,
  requestThirdUserAuthRegister,
} from '../../Helpers/requests/requestAuthHelper';
import { requestSuccessfulChannelsCreate } from '../../Helpers/requests/requestChannelsHelper';
import {
  requestSuccessfulSendMessage,
  requestSuccessfulMessagePin,
  requestErrorMessagePin,
} from '../../Helpers/requests/requestMessageHelper';
import { requestClear } from '../../Helpers/requests/requestOtherHelper';
import { requestSuccessfulChannelJoin } from '../../Helpers/requests/requestChannelHelper';
// import { requestSuccessfulChannelJoin, requestSuccessfulChannelMessages } from '../../Helpers/requests/requestChannelHelper';
import { requestSuccessfulDmCreate, requestSuccessfulDmMessages } from '../../Helpers/requests/requestDmHelper';
import { requestSuccessfulSendDm } from '../../Helpers/requests/requestMessageHelper';

const ERROR = 400;
const TOKEN_ERROR = 403;

let firstUser: { token: string; authUserId: number };
let secondUser: { token: string; authUserId: number };
let thirdUser: { token: string; authUserId: number };

let firstChannelId: number;
let secondChannelId: number;

let firstDmId: number;

let firstUserFirstChanMsg1: number;
// let firstUserFirstChanMsg2: number;

let firstUserFirstDmMsg1: number;
let firstUserFirstDmMsg2: number;

let secondUserFirstChanMsg1: number;
let secondUserSecondChanMsg1: number;

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

describe('messagePin successful', () => {
  describe('in channel', () => {
    // describe('pinning own message', () => {
    //   test('Pin 2 messages in 1 channel', () => {
    //     expect(
    //       requestSuccessfulMessagePin(firstUser.token, firstUserFirstChanMsg1)
    //     ).toStrictEqual({});

    //     let channelMessages = requestSuccessfulChannelMessages(firstUser.token, firstChannelId, 0);
    //     expect(channelMessages.messages[2].isPinned).toStrictEqual(true);
    //     expect(channelMessages.messages[1].isPinned).toStrictEqual(false);
    //     expect(channelMessages.messages[0].isPinned).toStrictEqual(false);

    //     expect(
    //       requestSuccessfulMessagePin(firstUser.token, firstUserFirstChanMsg2)
    //     ).toStrictEqual({});

    //     channelMessages = requestSuccessfulChannelMessages(firstUser.token, firstChannelId, 0);
    //     expect(channelMessages.messages[2].isPinned).toStrictEqual(true);
    //     expect(channelMessages.messages[1].isPinned).toStrictEqual(true);
    //     expect(channelMessages.messages[0].isPinned).toStrictEqual(false);
    //   });
    // });

    describe("pinning another user's message", () => {
      test('Global owner (as a channel member) pins a message in channel', () => {
        firstUser = requestFirstUserAuthRegister();
        thirdUser = requestThirdUserAuthRegister();
        const thirdChannelId = requestSuccessfulChannelsCreate(thirdUser.token, 'tc3', true).channelId;
        firstUserFirstChanMsg1 = requestSuccessfulSendMessage(
          thirdUser.token,
          thirdChannelId,
          'U1 message in first channel.'
        ).messageId;
        requestSuccessfulChannelJoin(firstUser.token, thirdChannelId);
        expect(
          requestSuccessfulMessagePin(firstUser.token, firstUserFirstChanMsg1)
        ).toStrictEqual({});
      });

      test('Pin 2 unique messages in 2 channels', () => {
        firstUser = requestFirstUserAuthRegister();
        secondUser = requestSecondUserAuthRegister();

        // create channels
        firstChannelId = requestSuccessfulChannelsCreate(
          firstUser.token,
          'Channel1',
          true
        ).channelId;
        secondChannelId = requestSuccessfulChannelsCreate(
          firstUser.token,
          'channel2',
          true
        ).channelId;
        requestSuccessfulChannelJoin(secondUser.token, firstChannelId);
        requestSuccessfulChannelJoin(secondUser.token, secondChannelId);

        // send messages to channel 1
        secondUserFirstChanMsg1 = requestSuccessfulSendMessage(
          secondUser.token,
          firstChannelId,
          'U1 message in first channel.'
        ).messageId;
        secondUserSecondChanMsg1 = requestSuccessfulSendMessage(
          secondUser.token,
          secondChannelId,
          'U2 message in first channel.'
        ).messageId;
        expect(
          requestSuccessfulMessagePin(firstUser.token, secondUserFirstChanMsg1)
        ).toStrictEqual({});
        expect(
          requestSuccessfulMessagePin(firstUser.token, secondUserSecondChanMsg1)
        ).toStrictEqual({});
      });
    });
  });

  describe('in DM', () => {
    describe('pinning own message', () => {
      test('Pin 2 messages in 1 DM', () => {
        firstUser = requestFirstUserAuthRegister();
        secondUser = requestSecondUserAuthRegister();

        // create dms
        firstDmId = requestSuccessfulDmCreate(firstUser.token, [
          secondUser.authUserId,
        ]).dmId;

        firstUserFirstDmMsg1 = requestSuccessfulSendDm(
          firstUser.token,
          firstDmId,
          'U1 Message in first dm.'
        ).messageId;
        firstUserFirstDmMsg2 = requestSuccessfulSendDm(
          firstUser.token,
          firstDmId,
          'U1 Message in first dm. x2'
        ).messageId;

        expect(
          requestSuccessfulMessagePin(firstUser.token, firstUserFirstDmMsg1)
        ).toStrictEqual({});

        let dmMessages = requestSuccessfulDmMessages(firstUser.token, firstDmId, 0);
        expect(dmMessages.messages[1].isPinned).toStrictEqual(true);
        expect(dmMessages.messages[0].isPinned).toStrictEqual(false);

        expect(
          requestSuccessfulMessagePin(firstUser.token, firstUserFirstDmMsg2)
        ).toStrictEqual({});

        dmMessages = requestSuccessfulDmMessages(firstUser.token, firstDmId, 0);
        expect(dmMessages.messages[1].isPinned).toStrictEqual(true);
        expect(dmMessages.messages[0].isPinned).toStrictEqual(true);
      });
    });
  });
});

describe('Exception encountered', () => {
  test('Invalid messageId', () => {
    firstUser = requestFirstUserAuthRegister();
    expect(
      requestErrorMessagePin(firstUser.token, -1)
    ).toStrictEqual(ERROR);
  });

  test('Invalid token', () => {
    firstUser = requestFirstUserAuthRegister();
    const thirdChannelId = requestSuccessfulChannelsCreate(firstUser.token, 'tc3', true).channelId;
    const firstUserThirdChanMsg = requestSuccessfulSendMessage(
      firstUser.token,
      thirdChannelId,
      'U1 message in first channel.'
    ).messageId;
    expect(
      requestErrorMessagePin(firstUser.token + 'a', firstUserThirdChanMsg)
    ).toStrictEqual(TOKEN_ERROR);
  });

  test('Message already pinned', () => {
    firstUser = requestFirstUserAuthRegister();
    const thirdChannelId = requestSuccessfulChannelsCreate(firstUser.token, 'tc3', true).channelId;
    const firstUserThirdChanMsg = requestSuccessfulSendMessage(
      firstUser.token,
      thirdChannelId,
      'U1 message in first channel.'
    ).messageId;
    requestSuccessfulMessagePin(firstUser.token, firstUserThirdChanMsg);
    expect(
      requestErrorMessagePin(firstUser.token, firstUserThirdChanMsg)
    ).toStrictEqual(ERROR);
  });

  test('User does not have owner permission in channel', () => {
    firstUser = requestFirstUserAuthRegister();
    firstChannelId = requestSuccessfulChannelsCreate(
      firstUser.token,
      'Channel1',
      true
    ).channelId;
    const firstUserFirstChanMsg = requestSuccessfulSendMessage(
      firstUser.token,
      firstChannelId,
      'U1 message in first channel.'
    ).messageId;

    thirdUser = requestThirdUserAuthRegister();
    requestSuccessfulChannelJoin(thirdUser.token, firstChannelId);
    expect(
      requestErrorMessagePin(thirdUser.token, firstUserFirstChanMsg)
    ).toStrictEqual(TOKEN_ERROR);
  });

  test('User does not have owner permission in dm', () => {
    firstUser = requestFirstUserAuthRegister();
    secondUser = requestSecondUserAuthRegister();

    // create dms
    firstDmId = requestSuccessfulDmCreate(firstUser.token, [
      secondUser.authUserId,
    ]).dmId;
    firstUserFirstDmMsg1 = requestSuccessfulSendDm(
      firstUser.token,
      firstDmId,
      'U1 Message in first dm.'
    ).messageId;
    expect(requestErrorMessagePin(secondUser.token, firstUserFirstDmMsg1)).toStrictEqual(
      TOKEN_ERROR
    );
  });

  test('messageId is valid but user is not part of the channel', () => {
    firstUser = requestFirstUserAuthRegister();
    firstChannelId = requestSuccessfulChannelsCreate(
      firstUser.token,
      'Channel1',
      true
    ).channelId;
    const firstUserFirstChanMsg = requestSuccessfulSendMessage(
      firstUser.token,
      firstChannelId,
      'U1 message in first channel.'
    ).messageId;

    thirdUser = requestThirdUserAuthRegister();
    expect(requestErrorMessagePin(thirdUser.token, firstUserFirstChanMsg)).toStrictEqual(
      ERROR
    );
  });

  test('messageId is valid but user is not part of the dm', () => {
    firstUser = requestFirstUserAuthRegister();
    // create dms
    firstDmId = requestSuccessfulDmCreate(firstUser.token, []).dmId;
    firstUserFirstDmMsg1 = requestSuccessfulSendDm(
      firstUser.token,
      firstDmId,
      'U1 Message in first dm.'
    ).messageId;

    thirdUser = requestThirdUserAuthRegister();
    expect(requestErrorMessagePin(thirdUser.token, firstUserFirstDmMsg1)).toStrictEqual(
      ERROR
    );
  });
});
