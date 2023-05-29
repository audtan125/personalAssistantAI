import {
  requestSuccessfulAuthRegister,
} from '../../Helpers/requests/requestAuthHelper';
import { requestSuccessfulChannelsCreate } from '../../Helpers/requests/requestChannelsHelper';
import { requestSuccessfulDmCreate, requestSuccessfulDmMessages } from '../../Helpers/requests/requestDmHelper';
import {
  requestErrorMessageShare, requestSuccessfulMessageShare, requestSuccessfulSendDm, requestSuccessfulSendMessage,
} from '../../Helpers/requests/requestMessageHelper';
import {
  requestSuccessfulChannelMessages,
} from '../../Helpers/requests/requestChannelHelper';
// import {
//   requestSuccessfulChannelJoin, requestSuccessfulChannelMessages,
// } from '../../Helpers/requests/requestChannelHelper';
import { requestClear } from '../../Helpers/requests/requestOtherHelper';

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

const ERROR = 400;
const TOKEN_ERROR = 403;

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

describe('Successful return', () => {
  test('Correct message is shared to the correct channel', () => {
    const globalOwner = requestSuccessfulAuthRegister('emailer@gmail.com', 'password', 'Test', 'User');
    const channelIdList = [];
    for (let i = 0; i < 3; i++) {
      channelIdList.push(
        requestSuccessfulChannelsCreate(globalOwner.token, 'ch' + (i + 1).toString(), true).channelId
      );
    }

    // Sends multiple messages to the third channel.
    const msgIdList = [];
    for (let i = 0; i < 3; i++) {
      msgIdList.push(
        requestSuccessfulSendMessage(globalOwner.token, channelIdList[2], 'test' + i.toString()).messageId
      );
    }

    // Shares a message to the first two channels.
    const msgShare1 = requestSuccessfulMessageShare(
      globalOwner.token, msgIdList[0], 'something', channelIdList[0], -1
    );
    const msgShare2 = requestSuccessfulMessageShare(
      globalOwner.token, msgIdList[1], '', channelIdList[1], -1
    );
    expect(msgShare1).toStrictEqual({ sharedMessageId: expect.any(Number) });
    expect(msgShare2).toStrictEqual({ sharedMessageId: expect.any(Number) });

    const channelMessage0 = requestSuccessfulChannelMessages(globalOwner.token, channelIdList[0], 0);
    expect(channelMessage0.messages[0].uId).toStrictEqual(globalOwner.authUserId);
    expect(channelMessage0.messages[0].messageId).not.toStrictEqual(msgIdList[0]);
    expect(channelMessage0.messages[0].message).toStrictEqual('test0something');
    expect(channelMessage0.messages.length).toStrictEqual(1);

    const channelMessage1 = requestSuccessfulChannelMessages(globalOwner.token, channelIdList[1], 0);
    expect(channelMessage1.messages[0].uId).toStrictEqual(globalOwner.authUserId);
    expect(channelMessage1.messages[0].messageId).not.toStrictEqual(msgIdList[1]);
    expect(channelMessage1.messages[0].message).toStrictEqual('test1');
    expect(channelMessage1.messages.length).toStrictEqual(1);
  });

  test('Correct message is shared to the correct dm', () => {
    const globalOwner = requestSuccessfulAuthRegister('emailer@gmail.com', 'password', 'Test', 'User');
    const dmIdList = [];
    for (let i = 0; i < 3; i++) {
      dmIdList.push(
        requestSuccessfulDmCreate(globalOwner.token, []).dmId
      );
    }

    // Sends multiple messages to the third channel.
    const msgIdList = [];
    for (let i = 0; i < 3; i++) {
      msgIdList.push(requestSuccessfulSendDm(globalOwner.token, dmIdList[2], 'test' + i.toString()).messageId);
    }

    // Shares a message to the first two channels.
    const msgShare1 = requestSuccessfulMessageShare(
      globalOwner.token, msgIdList[0], 'something', -1, dmIdList[0]
    );
    const msgShare2 = requestSuccessfulMessageShare(
      globalOwner.token, msgIdList[1], '', -1, dmIdList[1]
    );
    expect(msgShare1).toStrictEqual({ sharedMessageId: expect.any(Number) });
    expect(msgShare2).toStrictEqual({ sharedMessageId: expect.any(Number) });

    const dmMessage0 = requestSuccessfulDmMessages(globalOwner.token, dmIdList[0], 0);
    expect(dmMessage0.messages[0].uId).toStrictEqual(globalOwner.authUserId);
    expect(dmMessage0.messages[0].messageId).not.toStrictEqual(msgIdList[0]);
    expect(dmMessage0.messages[0].message).toStrictEqual('test0something');
    expect(dmMessage0.messages.length).toStrictEqual(1);

    const dmMessage1 = requestSuccessfulDmMessages(globalOwner.token, dmIdList[1], 0);
    expect(dmMessage1.messages[0].uId).toStrictEqual(globalOwner.authUserId);
    expect(dmMessage1.messages[0].messageId).not.toStrictEqual(msgIdList[1]);
    expect(dmMessage1.messages[0].message).toStrictEqual('test1');
    expect(dmMessage1.messages.length).toStrictEqual(1);
  });

  // test('Optional message is 1000 characters long', () => {
  //   const globalOwner = requestSuccessfulAuthRegister('emailer@gmail.com', 'password', 'Test', 'User');
  //   const firstChannelId = requestSuccessfulChannelsCreate(globalOwner.token, 'ch1', true).channelId;
  //   const msgId = requestSuccessfulSendMessage(globalOwner.token, firstChannelId, string1000chars).messageId;

  //   const secondChannelId = requestSuccessfulChannelsCreate(globalOwner.token, 'ch2', true).channelId;
  //   requestSuccessfulMessageShare(globalOwner.token, msgId, string1000chars, secondChannelId, -1);

  //   const channelMessage = requestSuccessfulChannelMessages(globalOwner.token, secondChannelId, 0);
  //   expect(channelMessage.messages[0].messageId).not.toStrictEqual(msgId);
  //   expect(channelMessage.messages[0].message).toStrictEqual(string1000chars + string1000chars);
  // });

  // test('Channel member shares the message sent by another member', () => {
  //   const globalOwner = requestSuccessfulAuthRegister('emailer@gmail.com', 'password', 'Test', 'User');
  //   const firstChannelId = requestSuccessfulChannelsCreate(globalOwner.token, 'ch1', true).channelId;
  //   const msgId = requestSuccessfulSendMessage(globalOwner.token, firstChannelId, 'another').messageId;

  //   // Second user joins the channel and shares the channel owner's message.
  //   const secondUser = requestSuccessfulAuthRegister('seconduser@gmail.com', 'abcidgaf', 'second', 'user');
  //   const secondChannelId = requestSuccessfulChannelsCreate(secondUser.token, 'ch2', true).channelId;
  //   requestSuccessfulChannelJoin(secondUser.token, firstChannelId);
  //   requestSuccessfulMessageShare(secondUser.token, msgId, 'something', secondChannelId, -1);

  //   const channelMessage = requestSuccessfulChannelMessages(secondUser.token, secondChannelId, 0);
  //   expect(channelMessage.messages[0].messageId).not.toStrictEqual(msgId);
  //   expect(channelMessage.messages[0].message).toStrictEqual('anothersomething');
  // });

  // test('Message is shared to the same channel as it is currently in.', () => {
  //   const globalOwner = requestSuccessfulAuthRegister('emailer@gmail.com', 'password', 'Test', 'User');
  //   const firstChannelId = requestSuccessfulChannelsCreate(globalOwner.token, 'ch1', true).channelId;
  //   const msgId = requestSuccessfulSendMessage(globalOwner.token, firstChannelId, 'another').messageId;

  //   requestSuccessfulMessageShare(globalOwner.token, msgId, 'something', firstChannelId, -1);

  //   const channelMessage = requestSuccessfulChannelMessages(globalOwner.token, firstChannelId, 0);
  //   expect(channelMessage.messages[0].messageId).not.toStrictEqual(msgId);
  //   expect(channelMessage.messages[0].message).toStrictEqual('anothersomething');
  //   expect(channelMessage.messages[1].messageId).toStrictEqual(msgId);
  // });
});

describe('Error return', () => {
  test('Invalid token', () => {
    const globalOwner = requestSuccessfulAuthRegister('emailer@gmail.com', 'password', 'Test', 'User');
    const firstChannelId = requestSuccessfulChannelsCreate(globalOwner.token, 'ch1', true).channelId;
    const msgId = requestSuccessfulSendMessage(globalOwner.token, firstChannelId, 'another').messageId;

    const msgShare = requestErrorMessageShare(globalOwner.token + 'A', msgId, 'add', firstChannelId, -1);
    expect(msgShare).toStrictEqual(TOKEN_ERROR);
  });

  describe('Both channelId and dmId are invalid (or -1)', () => {
    test.each([
      { chId: 'Invalid', dmId: -1 },
      { chId: -1, dmId: 'Invalid' },
      { chId: -1, dmId: -1 },
      { chId: 1, dmId: 1 }
    ])("channelId='$chId', dmId='$dmId", ({ chId, dmId }) => {
      const globalOwner = requestSuccessfulAuthRegister('emailer@gmail.com', 'password', 'Test', 'User');
      let msgShare;
      if (chId === 'Invalid') {
        const firstChannelId = requestSuccessfulChannelsCreate(globalOwner.token, 'ch1', true).channelId;
        const msgId = requestSuccessfulSendMessage(globalOwner.token, firstChannelId, 'another').messageId;
        msgShare = requestErrorMessageShare(globalOwner.token, msgId, 'test', firstChannelId + 1, -1);
      } else if (dmId === 'Invalid') {
        const firstDmId = requestSuccessfulDmCreate(globalOwner.token, []).dmId;
        const msgId = requestSuccessfulSendDm(globalOwner.token, firstDmId, 'another').messageId;
        msgShare = requestErrorMessageShare(globalOwner.token, msgId, 'test', -1, firstDmId + 1);
      } else {
        msgShare = requestErrorMessageShare(globalOwner.token, 1, 'test', -1, -1);
      }
      expect(msgShare).toStrictEqual(ERROR);
    });
  });

  test('optional message is 1001 characters long', () => {
    const globalOwner = requestSuccessfulAuthRegister('emailer@gmail.com', 'password', 'Test', 'User');
    const firstChannelId = requestSuccessfulChannelsCreate(globalOwner.token, 'ch1', true).channelId;
    const msgId = requestSuccessfulSendMessage(globalOwner.token, firstChannelId, 'another').messageId;

    const msgShare = requestErrorMessageShare(
      globalOwner.token, msgId, string1000chars + '1', firstChannelId, -1
    );
    expect(msgShare).toStrictEqual(ERROR);
  });

  test('User is not part of the channel that contains ogMessageId', () => {
    const globalOwner = requestSuccessfulAuthRegister('emailer@gmail.com', 'password', 'Test', 'User');
    const firstChannelId = requestSuccessfulChannelsCreate(globalOwner.token, 'ch1', true).channelId;
    const msgId = requestSuccessfulSendMessage(globalOwner.token, firstChannelId, 'another').messageId;

    const secondUser = requestSuccessfulAuthRegister('seconduser@gmail.com', 'abcidgaf', 'second', 'user');
    const msgShare = requestErrorMessageShare(secondUser.token, msgId, 'add', firstChannelId, -1);
    expect(msgShare).toStrictEqual(ERROR);
  });

  test('User is not part of the dm that contains ogMessageId', () => {
    const globalOwner = requestSuccessfulAuthRegister('emailer@gmail.com', 'password', 'Test', 'User');
    const firstDmId = requestSuccessfulDmCreate(globalOwner.token, []).dmId;
    const msgId = requestSuccessfulSendDm(globalOwner.token, firstDmId, 'another').messageId;

    const secondUser = requestSuccessfulAuthRegister('seconduser@gmail.com', 'abcidgaf', 'second', 'user');
    const msgShare = requestErrorMessageShare(secondUser.token, msgId, 'add', -1, firstDmId);
    expect(msgShare).toStrictEqual(ERROR);
  });

  test('User is not part of the channel they are sharing the message to.', () => {
    const globalOwner = requestSuccessfulAuthRegister('emailer@gmail.com', 'password', 'Test', 'User');
    const firstChannelId = requestSuccessfulChannelsCreate(globalOwner.token, 'ch1', true).channelId;
    const msgId = requestSuccessfulSendMessage(globalOwner.token, firstChannelId, 'another').messageId;

    const secondUser = requestSuccessfulAuthRegister('seconduser@gmail.com', 'abcidgaf', 'second', 'user');
    const secondChannelId = requestSuccessfulChannelsCreate(secondUser.token, 'ch2', true).channelId;

    const msgShare = requestErrorMessageShare(globalOwner.token, msgId, 'add', secondChannelId, -1);
    expect(msgShare).toStrictEqual(TOKEN_ERROR);
  });

  test('User is not part of the dm they are sharing the message to.', () => {
    const globalOwner = requestSuccessfulAuthRegister('emailer@gmail.com', 'password', 'Test', 'User');
    const firstDmId = requestSuccessfulDmCreate(globalOwner.token, []).dmId;
    const msgId = requestSuccessfulSendDm(globalOwner.token, firstDmId, 'another').messageId;

    const secondUser = requestSuccessfulAuthRegister('seconduser@gmail.com', 'abcidgaf', 'second', 'user');
    const secondDmId = requestSuccessfulDmCreate(secondUser.token, []).dmId;

    const msgShare = requestErrorMessageShare(globalOwner.token, msgId, 'add', -1, secondDmId);
    expect(msgShare).toStrictEqual(TOKEN_ERROR);
  });

  test('channelId and dmId are both valid (which is invalid).', () => {
    const globalOwner = requestSuccessfulAuthRegister('emailer@gmail.com', 'password', 'Test', 'User');
    const dmId = requestSuccessfulDmCreate(globalOwner.token, []).dmId;
    const channelId = requestSuccessfulChannelsCreate(globalOwner.token, 'test coverage', true).channelId;
    const msgId = requestSuccessfulSendMessage(globalOwner.token, channelId, ':(').messageId;
    expect(
      requestErrorMessageShare(globalOwner.token, msgId, 'help me', channelId, dmId)
    ).toStrictEqual(ERROR);
  });
});
