import { requestFirstUserAuthRegister, requestSecondUserAuthRegister } from '../../Helpers/requests/requestAuthHelper';
import { requestSuccessfulChannelsCreate } from '../../Helpers/requests/requestChannelsHelper';
import { requestSuccessfulDmCreate } from '../../Helpers/requests/requestDmHelper';
import { requestSuccessfulChannelJoin, requestSuccessfulChannelLeave, requestSuccessfulChannelMessages } from '../../Helpers/requests/requestChannelHelper';
import { requestSuccessfulSendMessage, requestSuccessfulSendDm, requestSuccessfulMessageReact, requestSuccessfulMessageUnreact, requestErrorMessageUnreact } from '../../Helpers/requests/requestMessageHelper';
import { requestSuccessfulDmMessages, requestSuccessfulDmLeave } from '../../Helpers/requests/requestDmHelper';
import { requestClear } from '../../Helpers/requests/requestOtherHelper';

const REACT_ERROR = 400;
const TOKEN_ERROR = 403;

let user1 : {token: string, authUserId: number};
let user2 : {token: string, authUserId: number};

let chId : number;
let chMsgId1 : number;
let chMsgId2 : number;

let dmId : number;
let dmMsgId1 : number;

// The only reaction that the frontend currently has.
const reactId = 1;

beforeEach(() => {
  requestClear();
  user1 = requestFirstUserAuthRegister();
  user2 = requestSecondUserAuthRegister();
});

afterAll(() => {
  requestClear();
});

describe('Successful message unreact', () => {
  describe('Channels', () => {
    beforeEach(() => {
      chId = requestSuccessfulChannelsCreate(user1.token, 'channel1', true).channelId;
      requestSuccessfulChannelJoin(user2.token, chId);
      chMsgId1 = requestSuccessfulSendMessage(user1.token, chId, 'First channel message').messageId;
      chMsgId2 = requestSuccessfulSendMessage(user1.token, chId, 'Second channel message').messageId;
    });

    test('Two users react to both messages and unreact to both messages', () => {
      requestSuccessfulMessageReact(user1.token, chMsgId1, reactId);
      requestSuccessfulMessageReact(user2.token, chMsgId1, reactId);
      requestSuccessfulMessageReact(user1.token, chMsgId2, reactId);
      requestSuccessfulMessageReact(user2.token, chMsgId2, reactId);

      // User 1 unreacts to message 1
      requestSuccessfulMessageUnreact(user1.token, chMsgId1, reactId);

      // User 2 still has a reaction to this message
      const msg1 = requestSuccessfulChannelMessages(user1.token, chId, 0).messages[1];
      const msgReacts1 = msg1.reacts;
      expect(msgReacts1.length).toStrictEqual(1);
      expect(msgReacts1[0]).toStrictEqual({ reactId: reactId, uIds: [user2.authUserId], isThisUserReacted: false });

      // Check that unreact does not affect other message,
      // both users should still have a reaction to this message.
      const msg2 = requestSuccessfulChannelMessages(user1.token, chId, 0).messages[0];
      const msgReacts2 = msg2.reacts;
      expect(msgReacts2.length).toStrictEqual(1);
      expect(msgReacts2[0]).toStrictEqual({ reactId: reactId, uIds: [user1.authUserId, user2.authUserId], isThisUserReacted: true });
    });
  });

  describe('DMs', () => {
    beforeEach(() => {
      dmId = requestSuccessfulDmCreate(user1.token, [user2.authUserId]).dmId;
      dmMsgId1 = requestSuccessfulSendDm(user1.token, dmId, 'First dm message').messageId;
    });

    test('Two users react and one unreacts to message with reaction of reactID', () => {
      requestSuccessfulMessageReact(user1.token, dmMsgId1, reactId);
      requestSuccessfulMessageReact(user2.token, dmMsgId1, reactId);

      requestSuccessfulMessageUnreact(user1.token, dmMsgId1, reactId);

      const msgReacts1 = requestSuccessfulDmMessages(user1.token, dmId, 0).messages[0].reacts;
      expect(msgReacts1.length).toStrictEqual(1);
      expect(msgReacts1[0]).toStrictEqual({ reactId: reactId, uIds: [user2.authUserId], isThisUserReacted: false });

      const msgReacts2 = requestSuccessfulDmMessages(user2.token, dmId, 0).messages[0].reacts;
      expect(msgReacts2.length).toStrictEqual(1);
      expect(msgReacts2[0]).toStrictEqual({ reactId: reactId, uIds: [user2.authUserId], isThisUserReacted: true });
    });
  });
});

describe('Error message unreact', () => {
  describe('Channels', () => {
    beforeEach(() => {
      chId = requestSuccessfulChannelsCreate(user1.token, 'channel1', true).channelId;
      requestSuccessfulChannelJoin(user2.token, chId);
      chMsgId1 = requestSuccessfulSendMessage(user1.token, chId, 'First channel message').messageId;
      chMsgId2 = requestSuccessfulSendMessage(user1.token, chId, 'Second channel message').messageId;
    });

    test('Message not in any channel or DM the authorised user is in', () => {
      requestSuccessfulMessageReact(user2.token, chMsgId1, reactId);
      requestSuccessfulChannelLeave(user2.token, chId);
      expect(requestErrorMessageUnreact(user2.token, chMsgId1, reactId)).toStrictEqual(REACT_ERROR);
    });

    test('ReactId is not a valid react ID', () => {
      requestSuccessfulMessageReact(user1.token, chMsgId1, reactId);
      expect(requestErrorMessageUnreact(user1.token, chMsgId1, reactId + 1)).toStrictEqual(REACT_ERROR);
    });

    test('Message does not contain a react with ID reactId from the authorised user', () => {
      requestSuccessfulMessageReact(user1.token, chMsgId1, reactId);
      expect(requestErrorMessageUnreact(user2.token, chMsgId1, reactId)).toStrictEqual(REACT_ERROR);
    });

    /*
    test('Invalid token', () => {
      requestSuccessfulMessageReact(user1.token, chMsgId1, reactId);
      requestSuccessfulMessageReact(user2.token, chMsgId1, reactId);

      const tokens = [user1.token, user2.token];

      let invalidToken = 'Invalid';
      while (tokens.includes(invalidToken)) {
        invalidToken += 'Invalid';
      }

      expect(requestErrorMessageUnreact(invalidToken, chMsgId1, reactId)).toStrictEqual(TOKEN_ERROR);
    });
    */
  });

  describe('DMs', () => {
    beforeEach(() => {
      dmId = requestSuccessfulDmCreate(user1.token, [user2.authUserId]).dmId;
      dmMsgId1 = requestSuccessfulSendDm(user1.token, dmId, 'First dm message').messageId;
    });

    test('Message not in any channel or DM the authorised user is in', () => {
      requestSuccessfulMessageReact(user2.token, dmMsgId1, reactId);
      requestSuccessfulDmLeave(user2.token, dmId);
      expect(requestErrorMessageUnreact(user2.token, dmMsgId1, reactId)).toStrictEqual(REACT_ERROR);
    });

    test('ReactId is not a valid react ID', () => {
      requestSuccessfulMessageReact(user1.token, dmMsgId1, reactId);
      expect(requestErrorMessageUnreact(user1.token, dmMsgId1, reactId + 1)).toStrictEqual(REACT_ERROR);
      expect(requestErrorMessageUnreact(user1.token, dmMsgId1, reactId - 1)).toStrictEqual(REACT_ERROR);
    });

    test('Message does not contain a react with ID reactId from the authorised user', () => {
      requestSuccessfulMessageReact(user1.token, dmMsgId1, reactId);
      expect(requestErrorMessageUnreact(user2.token, dmMsgId1, reactId)).toStrictEqual(REACT_ERROR);

      requestSuccessfulMessageUnreact(user1.token, dmMsgId1, reactId);
      expect(requestErrorMessageUnreact(user1.token, dmMsgId1, reactId)).toStrictEqual(REACT_ERROR);
    });

    test('Invalid token', () => {
      expect(requestErrorMessageUnreact(user1.token + user2.token, dmMsgId1, reactId)).toStrictEqual(TOKEN_ERROR);
    });
  });
});
