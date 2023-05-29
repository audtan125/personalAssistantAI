import { requestFirstUserAuthRegister, requestSecondUserAuthRegister, requestSuccessfulAuthRegister, requestThirdUserAuthRegister } from '../../Helpers/requests/requestAuthHelper';
import { requestSuccessfulChannelsCreate } from '../../Helpers/requests/requestChannelsHelper';
import { requestSuccessfulDmCreate, requestSuccessfulDmLeave, requestSuccessfulDmMessages } from '../../Helpers/requests/requestDmHelper';
import {
  requestSuccessfulSendMessage,
  requestSuccessfulMessageRemove,
  requestErrorMessageRemove,
  requestSuccessfulSendDm,
} from '../../Helpers/requests/requestMessageHelper';
import { requestClear } from '../../Helpers/requests/requestOtherHelper';
import { requestSuccessfulChannelJoin, requestSuccessfulChannelLeave, requestSuccessfulChannelMessages } from '../../Helpers/requests/requestChannelHelper';
import { messageReturn } from '../../dataStore';

const MESSAGE_ERROR = 400;
const TOKEN_ERROR = 403;
let globalOwner : {token: string, authUserId: number};
let member : {token: string, authUserId: number};
let globalToken : string;
let memberToken : string;
let globalMessageId : number;
let memberMessageId : number;
let globalId : number;
let memberId : number;
let globalMessage : messageReturn;
let memberMessage : messageReturn;

beforeEach(() => {
  requestClear();
  // Global owner, not channel/DM owner
  globalOwner = requestFirstUserAuthRegister();
  globalToken = globalOwner.token;
  globalId = globalOwner.authUserId;

  // Not global owner, not channel/DM owner
  member = requestThirdUserAuthRegister();
  memberToken = member.token;
  memberId = member.authUserId;
});

afterAll(() => {
  requestClear();
});

describe('Test for channels', () => {
  let channelOwner : {token: string, authUserId: number};
  let ownerToken : string;
  let channelId : number;
  let ownerMessageId : number;
  let ownerMessage : messageReturn;

  beforeEach(() => {
    channelOwner = requestSecondUserAuthRegister();
    ownerToken = channelOwner.token;
    const ownerId = channelOwner.authUserId;

    channelId = requestSuccessfulChannelsCreate(ownerToken, 'testCh', true).channelId;
    requestSuccessfulChannelJoin(globalToken, channelId);
    requestSuccessfulChannelJoin(memberToken, channelId);

    globalMessageId = requestSuccessfulSendMessage(
      globalToken,
      channelId,
      "I'm red da ba dee"
    ).messageId;

    memberMessageId = requestSuccessfulSendMessage(
      memberToken,
      channelId,
      "I'm green da ba dee"
    ).messageId;

    ownerMessageId = requestSuccessfulSendMessage(
      ownerToken,
      channelId,
      "I'm blue da ba dee"
    ).messageId;

    globalMessage = {
      message: "I'm red da ba dee",
      messageId: globalMessageId,
      timeSent: expect.any(Number),
      uId: globalId,
      reacts: [],
      isPinned: false
    };
    memberMessage = {
      message: "I'm green da ba dee",
      messageId: memberMessageId,
      timeSent: expect.any(Number),
      uId: memberId,
      reacts: [],
      isPinned: false
    };
    ownerMessage = {
      message: "I'm blue da ba dee",
      messageId: ownerMessageId,
      timeSent: expect.any(Number),
      uId: ownerId,
      reacts: [],
      isPinned: false
    };
  });

  describe('Successfully remove message', () => {
    test('Global owner', () => {
      requestSuccessfulMessageRemove(globalToken, ownerMessageId);

      const channelMessages = requestSuccessfulChannelMessages(globalToken, channelId, 0).messages;
      expect(channelMessages.length).toStrictEqual(2);
      expect(channelMessages).toContainEqual(globalMessage);
      expect(channelMessages).toContainEqual(memberMessage);
    });

    // test('Channel owner', () => {
    //   requestSuccessfulMessageRemove(ownerToken, globalMessageId);
    //   let channelMessages = requestSuccessfulChannelMessages(ownerToken, channelId, 0).messages;
    //   expect(channelMessages.length).toStrictEqual(2);
    //   expect(channelMessages).toContainEqual(ownerMessage);
    //   expect(channelMessages).toContainEqual(memberMessage);

    //   requestSuccessfulMessageRemove(ownerToken, ownerMessageId);
    //   channelMessages = requestSuccessfulChannelMessages(ownerToken, channelId, 0).messages;
    //   expect(channelMessages.length).toStrictEqual(1);
    //   expect(channelMessages).toContainEqual(memberMessage);

    //   requestSuccessfulMessageRemove(ownerToken, memberMessageId);
    //   channelMessages = requestSuccessfulChannelMessages(ownerToken, channelId, 0).messages;
    //   expect(channelMessages.length).toStrictEqual(0);
    // });

    test('Member', () => {
      requestSuccessfulMessageRemove(memberToken, memberMessageId);
      const channelMessages = requestSuccessfulChannelMessages(memberToken, channelId, 0).messages;
      expect(channelMessages.length).toStrictEqual(2);
      expect(channelMessages).toContainEqual(ownerMessage);
      expect(channelMessages).toContainEqual(globalMessage);
    });

    /*
    test('Remove standup summary', () => {
      requestSuccessfulStandupStart(globalToken, channelId, 0.5);
      requestSuccessfulStandupSend(globalToken, channelId, 'Touched grass today');
      requestSuccessfulStandupSend(ownerToken, channelId, 'My code passed');

      // 1 second after standup finished
      sleep(1.5);

      let messages = requestSuccessfulChannelMessages(globalOwner.token, channelId, 0).messages;
      const standupId = messages.find(message => message.message === 'firstuser: Touched grass today\nseconduser: My code passed').messageId;

      requestSuccessfulMessageRemove(globalOwner.token, standupId);

      messages = requestSuccessfulChannelMessages(
        globalToken, channelId, 0
      ).messages;

      expect(messages.length).toStrictEqual(3);
      expect(messages).not.toContainEqual(
        {
          messageId: standupId,
          uId: globalId,
          message: expect.any(String),
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false
        }
      );
    });
    */
  });

  describe('Error remove message', () => {
    test('Global owner is not in channel', () => {
      requestSuccessfulChannelLeave(globalToken, channelId);
      expect(requestErrorMessageRemove(globalToken, memberMessageId)).toStrictEqual(MESSAGE_ERROR);
    });

    test('User is no longer a member', () => {
      requestSuccessfulChannelLeave(memberToken, channelId);
      expect(requestErrorMessageRemove(memberToken, memberMessageId)).toStrictEqual(MESSAGE_ERROR);
    });

    test('User is a member but is not the message sender and does not have owner permissions.', () => {
      const thirduser = requestSuccessfulAuthRegister('fourthuser@gmail.com', '123456', 'test', 'coverage');
      requestSuccessfulChannelJoin(thirduser.token, channelId);
      expect(requestErrorMessageRemove(thirduser.token, memberMessageId)).toStrictEqual(TOKEN_ERROR);
    });

    test('Invalid message ID', () => {
      const invalidId = Math.abs(globalMessageId) + Math.abs(ownerMessageId) + Math.abs(memberMessageId);
      expect(requestErrorMessageRemove(ownerToken, invalidId)).toStrictEqual(MESSAGE_ERROR);
    });

    test('Invalid token', () => {
      const invalidToken = globalToken + ownerToken + memberToken;
      expect(requestErrorMessageRemove(invalidToken, memberMessageId)).toStrictEqual(TOKEN_ERROR);
    });
  });
});

describe('Test for DMs', () => {
  let dmCreator : {token: string, authUserId: number};
  let dmId : number;
  let creatorToken : string;
  let creatorMessageId : number;
  let globalId : number;
  let memberId : number;
  let creatorId : number;
  let creatorMessage : {message: string, messageId: number, timeSent: number, uId: number, reacts: [],
    isPinned: false};

  beforeEach(() => {
    dmCreator = requestSecondUserAuthRegister();
    creatorToken = dmCreator.token;
    creatorId = dmCreator.authUserId;

    globalId = globalOwner.authUserId;
    memberId = member.authUserId;
    dmId = requestSuccessfulDmCreate(creatorToken, [globalId, memberId]).dmId;

    globalMessageId = requestSuccessfulSendDm(
      globalToken,
      dmId,
      "I'm red da ba dee"
    ).messageId;

    memberMessageId = requestSuccessfulSendDm(
      memberToken,
      dmId,
      "I'm green da ba dee"
    ).messageId;

    creatorMessageId = requestSuccessfulSendDm(
      creatorToken,
      dmId,
      "I'm blue da ba dee"
    ).messageId;

    globalMessage = {
      message: "I'm red da ba dee",
      messageId: globalMessageId,
      timeSent: expect.any(Number),
      uId: globalId,
      reacts: [],
      isPinned: false
    };
    memberMessage = {
      message: "I'm green da ba dee",
      messageId: memberMessageId,
      timeSent: expect.any(Number),
      uId: memberId,
      reacts: [],
      isPinned: false
    };
    creatorMessage = {
      message: "I'm blue da ba dee",
      messageId: creatorMessageId,
      timeSent: expect.any(Number),
      uId: creatorId,
      reacts: [],
      isPinned: false
    };
  });

  describe('Successfully remove message', () => {
    test('Global owner', () => {
      requestSuccessfulMessageRemove(globalToken, globalMessageId);
      const dmMessages = requestSuccessfulDmMessages(globalToken, dmId, 0).messages;
      expect(dmMessages.length).toStrictEqual(2);
      expect(dmMessages).toContainEqual(creatorMessage);
      expect(dmMessages).toContainEqual(memberMessage);
    });

    // test('DM Creator', () => {
    //   requestSuccessfulMessageRemove(creatorToken, globalMessageId);
    //   let dmMessages = requestSuccessfulDmMessages(creatorToken, dmId, 0).messages;
    //   expect(dmMessages.length).toStrictEqual(2);
    //   expect(dmMessages).toContainEqual(creatorMessage);
    //   expect(dmMessages).toContainEqual(memberMessage);

    //   requestSuccessfulMessageRemove(creatorToken, creatorMessageId);
    //   dmMessages = requestSuccessfulDmMessages(creatorToken, dmId, 0).messages;
    //   expect(dmMessages.length).toStrictEqual(1);
    //   expect(dmMessages).toContainEqual(memberMessage);

    //   requestSuccessfulMessageRemove(creatorToken, memberMessageId);
    //   dmMessages = requestSuccessfulDmMessages(creatorToken, dmId, 0).messages;
    //   expect(dmMessages.length).toStrictEqual(0);
    // });

    test('Message sender', () => {
      requestSuccessfulMessageRemove(memberToken, memberMessageId);
      const dmMessages = requestSuccessfulDmMessages(memberToken, dmId, 0).messages;
      expect(dmMessages.length).toStrictEqual(2);
      expect(dmMessages).toContainEqual(creatorMessage);
      expect(dmMessages).toContainEqual(globalMessage);
    });
  });

  describe('Error remove message', () => {
    test('Global owner is not allowed to remove other users messages', () => {
      expect(requestErrorMessageRemove(globalToken, creatorMessageId)).toStrictEqual(TOKEN_ERROR);
      expect(requestErrorMessageRemove(globalToken, memberMessageId)).toStrictEqual(TOKEN_ERROR);
    });

    test('User is no longer a member', () => {
      requestSuccessfulDmLeave(memberToken, dmId);
      expect(requestErrorMessageRemove(memberToken, memberMessageId)).toStrictEqual(MESSAGE_ERROR);
    });

    test('Invalid message ID', () => {
      const invalidId = Math.abs(globalMessageId) + Math.abs(creatorMessageId) + Math.abs(memberMessageId);
      expect(requestErrorMessageRemove(creatorToken, invalidId)).toStrictEqual(MESSAGE_ERROR);
    });

    test('Invalid token', () => {
      let invalidToken = 'Invalid';
      while (invalidToken === globalToken ||
             invalidToken === creatorToken ||
             invalidToken === memberToken
      ) {
        invalidToken += 'Invalid';
      }

      expect(requestErrorMessageRemove(invalidToken, globalMessageId)).toStrictEqual(TOKEN_ERROR);
      expect(requestErrorMessageRemove(invalidToken, creatorMessageId)).toStrictEqual(TOKEN_ERROR);
      expect(requestErrorMessageRemove(invalidToken, memberMessageId)).toStrictEqual(TOKEN_ERROR);
    });
  });
});
