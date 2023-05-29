import {
  requestFirstUserAuthRegister,
  requestSecondUserAuthRegister,
  requestThirdUserAuthRegister,
} from '../../Helpers/requests/requestAuthHelper';
import { requestSuccessfulChannelsCreate } from '../../Helpers/requests/requestChannelsHelper';
import {
  requestSuccessfulSendMessage,
  requestSuccessfulMessagePin,
  requestSuccessfulMessageUnpin,
  requestErrorMessageUnpin,
} from '../../Helpers/requests/requestMessageHelper';
import { requestClear } from '../../Helpers/requests/requestOtherHelper';
import { requestSuccessfulChannelJoin } from '../../Helpers/requests/requestChannelHelper';
import { requestSuccessfulDmCreate } from '../../Helpers/requests/requestDmHelper';
// import { requestSuccessfulChannelJoin, requestSuccessfulChannelMessages } from '../../Helpers/requests/requestChannelHelper';
// import { requestSuccessfulDmCreate, requestSuccessfulDmMessages } from '../../Helpers/requests/requestDmHelper';
import { requestSuccessfulSendDm } from '../../Helpers/requests/requestMessageHelper';

const ERROR = 400;
const TOKEN_ERROR = 403;

let firstUser: { token: string; authUserId: number };
let secondUser: { token: string; authUserId: number };
let thirdUser: { token: string; authUserId: number };

let firstDmId: number;
let secondDmId: number;

let firstUserFirstChanMsg1: number;
let firstUserFirstDmMsg1: number;

let secondUserFirstDmMsg1: number;
let thirdUserFirstDmMsg1: number;

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

describe('messageUnpin successful', () => {
  describe('in channel', () => {
    // describe('unpinning own message', () => {
    //   test('unpin 2 messages in 1 channel', () => {
    //     // All messages in channel pinned.
    //     requestSuccessfulMessagePin(firstUser.token, firstUserFirstChanMsg1);
    //     requestSuccessfulMessagePin(firstUser.token, firstUserFirstChanMsg2);
    //     requestSuccessfulMessagePin(firstUser.token, secondUserFirstChanMsg1);
    //     requestSuccessfulMessagePin(firstUser.token, secondUserFirstChanMsg2);

    //     expect(
    //       requestSuccessfulMessageUnpin(firstUser.token, firstUserFirstChanMsg1)
    //     ).toStrictEqual({});

    //     let channelMessages = requestSuccessfulChannelMessages(firstUser.token, firstChannelId, 0);
    //     expect(channelMessages.messages[3].isPinned).toStrictEqual(false);
    //     expect(channelMessages.messages[2].isPinned).toStrictEqual(true);
    //     expect(channelMessages.messages[1].isPinned).toStrictEqual(true);
    //     expect(channelMessages.messages[0].isPinned).toStrictEqual(true);

    //     expect(
    //       requestSuccessfulMessageUnpin(firstUser.token, firstUserFirstChanMsg2)
    //     ).toStrictEqual({});

    //     channelMessages = requestSuccessfulChannelMessages(firstUser.token, firstChannelId, 0);
    //     expect(channelMessages.messages[3].isPinned).toStrictEqual(false);
    //     expect(channelMessages.messages[2].isPinned).toStrictEqual(false);
    //     expect(channelMessages.messages[1].isPinned).toStrictEqual(true);
    //     expect(channelMessages.messages[0].isPinned).toStrictEqual(true);
    //   });
    // });

    describe("unpinning another user's message", () => {
      test('Global owner (as a channel member) unpins a message in channel', () => {
        firstUser = requestFirstUserAuthRegister();
        thirdUser = requestThirdUserAuthRegister();
        const firstChannelId = requestSuccessfulChannelsCreate(thirdUser.token, 'tc3', true).channelId;
        firstUserFirstChanMsg1 = requestSuccessfulSendMessage(
          thirdUser.token,
          firstChannelId,
          'U1 message in first channel.'
        ).messageId;
        requestSuccessfulChannelJoin(firstUser.token, firstChannelId);
        requestSuccessfulMessagePin(firstUser.token, firstUserFirstChanMsg1);
        expect(
          requestSuccessfulMessageUnpin(firstUser.token, firstUserFirstChanMsg1)
        ).toStrictEqual({});
      });

      // test('unpin 2 unique messages in 2 channels', () => {
      //   requestSuccessfulMessagePin(firstUser.token, secondUserFirstChanMsg1);
      //   requestSuccessfulMessagePin(firstUser.token, secondUserSecondChanMsg1);
      //   expect(
      //     requestSuccessfulMessageUnpin(
      //       firstUser.token,
      //       secondUserFirstChanMsg1
      //     )
      //   ).toStrictEqual({});
      //   expect(
      //     requestSuccessfulMessageUnpin(
      //       firstUser.token,
      //       secondUserSecondChanMsg1
      //     )
      //   ).toStrictEqual({});
      // });
    });
  });

  describe('in DM', () => {
    // describe('pinning own message', () => {
    //   test('unpin 2 messages in 1 DM', () => {
    //     firstUserFirstDmMsg1 = requestSuccessfulSendDm(
    //       firstUser.token,
    //       firstDmId,
    //       'U1 Message in first dm.'
    //     ).messageId;
    //     firstUserFirstDmMsg2 = requestSuccessfulSendDm(
    //       firstUser.token,
    //       firstDmId,
    //       'U1 Message in first dm. x2'
    //     ).messageId;
    //     requestSuccessfulMessagePin(firstUser.token, firstUserFirstDmMsg1);
    //     requestSuccessfulMessagePin(firstUser.token, firstUserFirstDmMsg2);
    //     expect(
    //       requestSuccessfulMessageUnpin(firstUser.token, firstUserFirstDmMsg1)
    //     ).toStrictEqual({});

    //     let dmMessages = requestSuccessfulDmMessages(firstUser.token, firstDmId, 0);
    //     expect(dmMessages.messages[1].isPinned).toStrictEqual(false);
    //     expect(dmMessages.messages[0].isPinned).toStrictEqual(true);

    //     expect(
    //       requestSuccessfulMessageUnpin(firstUser.token, firstUserFirstDmMsg2)
    //     ).toStrictEqual({});

    //     dmMessages = requestSuccessfulDmMessages(firstUser.token, firstDmId, 0);
    //     expect(dmMessages.messages[1].isPinned).toStrictEqual(false);
    //     expect(dmMessages.messages[0].isPinned).toStrictEqual(false);
    //   });

    //   test('unpin 2 unique messages in 2 DMs', () => {
    //     firstUserFirstDmMsg1 = requestSuccessfulSendDm(
    //       firstUser.token,
    //       firstDmId,
    //       'U1 Message in first dm. x2'
    //     ).messageId;
    //     thirdUser = requestThirdUserAuthRegister();
    //     secondDmId = requestSuccessfulDmCreate(firstUser.token, [
    //       thirdUser.authUserId,
    //     ]).dmId;
    //     firstUserSecondDmMsg1 = requestSuccessfulSendDm(
    //       firstUser.token,
    //       secondDmId,
    //       'U1 Message in second dm.'
    //     ).messageId;
    //     requestSuccessfulMessagePin(firstUser.token, firstUserFirstDmMsg1);
    //     requestSuccessfulMessagePin(firstUser.token, firstUserSecondDmMsg1);
    //     expect(
    //       requestSuccessfulMessageUnpin(firstUser.token, firstUserFirstDmMsg1)
    //     ).toStrictEqual({});
    //     expect(
    //       requestSuccessfulMessageUnpin(firstUser.token, firstUserSecondDmMsg1)
    //     ).toStrictEqual({});
    //   });
    // });

    describe("unpinning another user's message", () => {
      test('unpin 2 unique messages in 2 DMs', () => {
        firstUser = requestFirstUserAuthRegister();
        secondUser = requestSecondUserAuthRegister();
        thirdUser = requestThirdUserAuthRegister();
        firstDmId = requestSuccessfulDmCreate(firstUser.token, [
          secondUser.authUserId,
        ]).dmId;
        secondDmId = requestSuccessfulDmCreate(firstUser.token, [
          thirdUser.authUserId,
        ]).dmId;
        secondUserFirstDmMsg1 = requestSuccessfulSendDm(
          secondUser.token,
          firstDmId,
          'U2 Message in first dm.'
        ).messageId;
        thirdUserFirstDmMsg1 = requestSuccessfulSendDm(
          thirdUser.token,
          secondDmId,
          'U3 Message in first dm.'
        ).messageId;
        requestSuccessfulMessagePin(firstUser.token, secondUserFirstDmMsg1);
        requestSuccessfulMessagePin(firstUser.token, thirdUserFirstDmMsg1);
        expect(
          requestSuccessfulMessageUnpin(firstUser.token, secondUserFirstDmMsg1)
        ).toStrictEqual({});
        expect(
          requestSuccessfulMessageUnpin(firstUser.token, thirdUserFirstDmMsg1)
        ).toStrictEqual({});
      });
    });
  });
});

describe('Exception encountered', () => {
  test('Invalid messageId', () => {
    firstUser = requestFirstUserAuthRegister();
    const firstChannelId = requestSuccessfulChannelsCreate(firstUser.token, 'tc3', true).channelId;
    const firstUserThirdChanMsg = requestSuccessfulSendMessage(
      firstUser.token,
      firstChannelId,
      'U1 message in first channel.'
    ).messageId;
    requestSuccessfulMessagePin(firstUser.token, firstUserThirdChanMsg);
    expect(
      requestErrorMessageUnpin(firstUser.token, firstUserThirdChanMsg + 1)
    ).toStrictEqual(ERROR);
  });

  test('Invalid token', () => {
    expect(
      requestErrorMessageUnpin('A', firstUserFirstChanMsg1)
    ).toStrictEqual(TOKEN_ERROR);
  });

  test('Message already unpinned', () => {
    firstUser = requestFirstUserAuthRegister();
    const firstChannelId = requestSuccessfulChannelsCreate(firstUser.token, 'tc3', true).channelId;
    const firstUserThirdChanMsg = requestSuccessfulSendMessage(
      firstUser.token,
      firstChannelId,
      'U1 message in first channel.'
    ).messageId;
    requestSuccessfulMessagePin(firstUser.token, firstUserThirdChanMsg);
    requestSuccessfulMessageUnpin(firstUser.token, firstUserThirdChanMsg);
    expect(
      requestErrorMessageUnpin(firstUser.token, firstUserThirdChanMsg)
    ).toStrictEqual(ERROR);
  });

  test('Auth user exists but is not part of channel', () => {
    firstUser = requestFirstUserAuthRegister();
    secondUser = requestSecondUserAuthRegister();
    const firstChannelId = requestSuccessfulChannelsCreate(firstUser.token, 'tc3', true).channelId;
    const firstUserThirdChanMsg = requestSuccessfulSendMessage(
      firstUser.token,
      firstChannelId,
      'U1 message in first channel.'
    ).messageId;
    requestSuccessfulMessagePin(firstUser.token, firstUserThirdChanMsg);
    expect(
      requestErrorMessageUnpin(secondUser.token, firstUserThirdChanMsg)
    ).toStrictEqual(ERROR);
  });

  test('User does not have owner permission in channel', () => {
    firstUser = requestFirstUserAuthRegister();
    const firstChannelId = requestSuccessfulChannelsCreate(firstUser.token, 'tc3', true).channelId;
    const firstUserThirdChanMsg = requestSuccessfulSendMessage(
      firstUser.token,
      firstChannelId,
      'U1 message in first channel.'
    ).messageId;
    requestSuccessfulMessagePin(firstUser.token, firstUserThirdChanMsg);
    thirdUser = requestThirdUserAuthRegister();
    requestSuccessfulChannelJoin(thirdUser.token, firstChannelId);
    expect(
      requestErrorMessageUnpin(thirdUser.token, firstUserThirdChanMsg)
    ).toStrictEqual(TOKEN_ERROR);
  });

  test('User does not have owner permission in dm', () => {
    firstUser = requestFirstUserAuthRegister();
    secondUser = requestSecondUserAuthRegister();
    firstDmId = requestSuccessfulDmCreate(firstUser.token, [secondUser.authUserId]).dmId;
    secondUserFirstDmMsg1 = requestSuccessfulSendDm(
      secondUser.token,
      firstDmId,
      'U1 Message in first dm.'
    ).messageId;
    requestSuccessfulMessagePin(firstUser.token, secondUserFirstDmMsg1);
    expect(requestErrorMessageUnpin(secondUser.token, secondUserFirstDmMsg1)).toStrictEqual(
      TOKEN_ERROR
    );
  });

  test('User is not in dm', () => {
    firstUser = requestFirstUserAuthRegister();
    secondUser = requestSecondUserAuthRegister();
    firstDmId = requestSuccessfulDmCreate(firstUser.token, []).dmId;

    firstUserFirstDmMsg1 = requestSuccessfulSendDm(
      firstUser.token,
      firstDmId,
      'U1 Message in first dm.'
    ).messageId;
    requestSuccessfulMessagePin(firstUser.token, firstUserFirstDmMsg1);
    expect(
      requestErrorMessageUnpin(secondUser.token, firstUserFirstDmMsg1)
    ).toStrictEqual(ERROR);
  });
});
