import { requestFirstUserAuthRegister, requestSecondUserAuthRegister, requestThirdUserAuthRegister } from '../../Helpers/requests/requestAuthHelper';
import { requestSuccessfulChannelsCreate } from '../../Helpers/requests/requestChannelsHelper';
import { requestSuccessfulDmCreate } from '../../Helpers/requests/requestDmHelper';
import { requestSuccessfulChannelJoin, requestSuccessfulChannelMessages } from '../../Helpers/requests/requestChannelHelper';
import { requestSuccessfulSendMessage, requestSuccessfulSendDm, requestSuccessfulMessageReact, requestErrorMessageReact } from '../../Helpers/requests/requestMessageHelper';
import { requestSuccessfulDmMessages } from '../../Helpers/requests/requestDmHelper';
import { requestClear } from '../../Helpers/requests/requestOtherHelper';

const REACT_ERROR = 400;
const TOKEN_ERROR = 403;

let user1 : {token: string, authUserId: number};
let user2 : {token: string, authUserId: number};

let chId : number;
let chMsgId1 : number;

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

describe('Successful message react', () => {
  describe('Channels', () => {
    beforeEach(() => {
      chId = requestSuccessfulChannelsCreate(user1.token, 'channel1', true).channelId;
      requestSuccessfulChannelJoin(user2.token, chId);
      chMsgId1 = requestSuccessfulSendMessage(user1.token, chId, 'First channel message').messageId;
    });

    test('Two users react to message with reaction of reactID', () => {
      requestSuccessfulMessageReact(user1.token, chMsgId1, reactId);
      let msgReacts = requestSuccessfulChannelMessages(user1.token, chId, 0).messages[0].reacts;
      expect(msgReacts.length).toStrictEqual(1);
      expect(msgReacts[0]).toStrictEqual({ reactId: reactId, uIds: [user1.authUserId], isThisUserReacted: true });

      requestSuccessfulMessageReact(user2.token, chMsgId1, reactId);
      msgReacts = requestSuccessfulChannelMessages(user1.token, chId, 0).messages[0].reacts;
      expect(msgReacts.length).toStrictEqual(1);
      expect(msgReacts[0]).toStrictEqual({ reactId: reactId, uIds: [user1.authUserId, user2.authUserId], isThisUserReacted: true });
    });
  });

  describe('DMs', () => {
    beforeEach(() => {
      dmId = requestSuccessfulDmCreate(user1.token, [user2.authUserId]).dmId;
      dmMsgId1 = requestSuccessfulSendDm(user1.token, dmId, 'First dm message').messageId;
    });

    test('Two users react to message with reaction of reactID', () => {
      requestSuccessfulMessageReact(user1.token, dmMsgId1, reactId);
      let msgReacts = requestSuccessfulDmMessages(user1.token, dmId, 0).messages[0].reacts;
      expect(msgReacts.length).toStrictEqual(1);
      expect(msgReacts[0]).toStrictEqual({ reactId: reactId, uIds: [user1.authUserId], isThisUserReacted: true });

      requestSuccessfulMessageReact(user2.token, dmMsgId1, reactId);
      msgReacts = requestSuccessfulDmMessages(user1.token, dmId, 0).messages[0].reacts;
      expect(msgReacts.length).toStrictEqual(1);
      expect(msgReacts[0]).toStrictEqual({ reactId: reactId, uIds: [user1.authUserId, user2.authUserId], isThisUserReacted: true });
    });
  });
});

describe('Error message react', () => {
  describe('Channels', () => {
    beforeEach(() => {
      chId = requestSuccessfulChannelsCreate(user1.token, 'channel1', true).channelId;
      requestSuccessfulChannelJoin(user2.token, chId);
      chMsgId1 = requestSuccessfulSendMessage(user1.token, chId, 'First channel message').messageId;
    });

    test('message not in any channel or DM the authorised user is in', () => {
      const user3 = requestThirdUserAuthRegister();
      expect(requestErrorMessageReact(user3.token, chMsgId1, reactId)).toStrictEqual(REACT_ERROR);
    });

    test('reactId is not a valid react ID', () => {
      expect(requestErrorMessageReact(user1.token, chMsgId1, reactId - 1)).toStrictEqual(REACT_ERROR);
    });

    test('Message already contains a react with ID reactId from the authorised user', () => {
      requestSuccessfulMessageReact(user1.token, chMsgId1, reactId);
      expect(requestErrorMessageReact(user1.token, chMsgId1, reactId)).toStrictEqual(REACT_ERROR);
    });

    test('Invalid token', () => {
      const tokens = [user1.token, user2.token];

      let invalidToken = 'Invalid';
      while (tokens.includes(invalidToken)) {
        invalidToken += 'Invalid';
      }

      expect(requestErrorMessageReact(invalidToken, chMsgId1, reactId)).toStrictEqual(TOKEN_ERROR);
    });
  });

  describe('DMs', () => {
    beforeEach(() => {
      dmId = requestSuccessfulDmCreate(user1.token, [user2.authUserId]).dmId;
      dmMsgId1 = requestSuccessfulSendDm(user1.token, dmId, 'First dm message').messageId;
    });

    test('message not in any channel or DM the authorised user is in', () => {
      const user3 = requestThirdUserAuthRegister();
      expect(requestErrorMessageReact(user3.token, dmMsgId1, reactId)).toStrictEqual(REACT_ERROR);
    });

    test('reactId is not a valid react ID', () => {
      expect(requestErrorMessageReact(user1.token, dmMsgId1, reactId + 1)).toStrictEqual(REACT_ERROR);
    });

    test('Message already contains a react with ID reactId from the authorised user', () => {
      requestSuccessfulMessageReact(user1.token, dmMsgId1, reactId);
      expect(requestErrorMessageReact(user1.token, dmMsgId1, reactId)).toStrictEqual(REACT_ERROR);
    });

    test('Invalid token', () => {
      expect(requestErrorMessageReact(user1.token + user2.token, dmMsgId1, reactId)).toStrictEqual(TOKEN_ERROR);
    });
  });
});
