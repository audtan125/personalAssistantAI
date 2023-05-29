import {
  requestSuccessfulChannelMessages, requestErrorChannelMessages
} from '../../Helpers/requests/requestChannelHelper';
import { requestSuccessfulAuthRegister } from '../../Helpers/requests/requestAuthHelper';
import { requestSuccessfulChannelsCreate } from '../../Helpers/requests/requestChannelsHelper';
import { requestClear } from '../../Helpers/requests/requestOtherHelper';
import { requestSuccessfulSendMessage } from '../../Helpers/requests/requestMessageHelper';
import { messageReturn } from '../../dataStore';

const ERROR = 400;
const TOKEN_ERROR = 403;

let firstUser : {token: string, authUserId: number};
let firstChannelId : number;
beforeEach(() => {
  requestClear();
  firstUser = requestSuccessfulAuthRegister('testeremail@gmail.com', '123456', 'first', 'last');
  firstChannelId = requestSuccessfulChannelsCreate(firstUser.token, 'New Test Channel', true).channelId;
});

afterAll(() => {
  requestClear();
});

describe('Success return messages object', () => {
  test('Channel with no messages', () => {
    const channelMessage = requestSuccessfulChannelMessages(firstUser.token, firstChannelId, 0);
    expect(channelMessage).toStrictEqual({
      messages: [],
      start: 0,
      end: -1
    });
  });

  test('Channel with 1 message', () => {
    const msgId = requestSuccessfulSendMessage(firstUser.token, firstChannelId, 'LONELY MESSAGE').messageId;
    const channelMessage = requestSuccessfulChannelMessages(firstUser.token, firstChannelId, 0);

    expect(channelMessage).toStrictEqual({
      messages: [
        {
          messageId: msgId,
          uId: firstUser.authUserId,
          message: 'LONELY MESSAGE',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false
        }
      ],
      start: 0,
      end: -1
    });
  });

  // test('Channel with exactly 50 messages should return all messages', () => {
  //   const msgObjList : messageReturn[] = [];

  //   for (let i = 0; i < 50; i++) {
  //     const msgId : number = requestSuccessfulSendMessage(firstUser.token, firstChannelId,
  //       'NOT SO LONELY MESSAGE' + i.toString()).messageId;

  //     const currentMsgObj: messageReturn = {
  //       messageId: msgId,
  //       uId: firstUser.authUserId,
  //       message: 'NOT SO LONELY MESSAGE' + i.toString(),
  //       timeSent: expect.any(Number),
  //       reacts: [],
  //       isPinned: false
  //     };

  //     // Inserts the most recent message at the start of the array.
  //     // Specification: "Message with index 0 is the most recent message in the channel"
  //     msgObjList.splice(0, 0, currentMsgObj);
  //   }

  //   const channelMessages = requestSuccessfulChannelMessages(firstUser.token, firstChannelId, 0);
  //   expect(channelMessages).toStrictEqual({
  //     messages: msgObjList,
  //     start: 0,
  //     end: -1
  //   });
  //   expect(channelMessages.messages.length).toStrictEqual(50);

  //   // TimeSent must be in decreasing order (most recent message first).
  //   let previousTime = Date.now();
  //   for (const msg of channelMessages.messages) {
  //     expect(msg.timeSent).toBeLessThanOrEqual(previousTime);
  //     previousTime = msg.timeSent;
  //   }
  // });

  test('Channel with exactly 51 messages should only return 50', () => {
    const msgObjList : messageReturn[] = [];

    requestSuccessfulSendMessage(firstUser.token, firstChannelId,
      'NOT SO LONELY MESSAGE0');
    for (let i = 1; i < 51; i++) {
      const msgId : number = requestSuccessfulSendMessage(firstUser.token, firstChannelId,
        'NOT SO LONELY MESSAGE' + i.toString()).messageId;

      const currentMsgObj: messageReturn = {
        messageId: msgId,
        uId: firstUser.authUserId,
        message: 'NOT SO LONELY MESSAGE' + i.toString(),
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false
      };

      msgObjList.splice(0, 0, currentMsgObj);
    }

    const channelMessages = requestSuccessfulChannelMessages(firstUser.token, firstChannelId, 0);
    expect(channelMessages).toStrictEqual({
      messages: msgObjList,
      start: 0,
      end: 50
    });
    expect(channelMessages.messages.length).toStrictEqual(50);
  });

  /*
  test('start is equal to the index of the last (oldest) message in the channel.', () => {
    const lastMessage = requestSuccessfulSendMessage(firstUser.token, firstChannelId, 'finale');
    for (let i = 1; i < 5; i++) {
      requestSuccessfulSendMessage(firstUser.token, firstChannelId, 'blah');
    }

    const correctMessagesList: messageReturn[] = [
      {
        messageId: lastMessage.messageId,
        uId: firstUser.authUserId,
        message: 'finale',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false
      }
    ];

    const correctChannelMessages = {
      messages: correctMessagesList,
      start: 4,
      end: -1
    };

    const channelMessage = requestSuccessfulChannelMessages(firstUser.token, firstChannelId, 4);
    expect(channelMessage).toStrictEqual(correctChannelMessages);
  });
  */

  test('start is equal to the number of messages in the channel.', () => {
    for (let i = 0; i < 5; i++) {
      requestSuccessfulSendMessage(firstUser.token, firstChannelId, 'blah');
    }

    const correctMessagesList : messageReturn[] = [];

    const correctChannelMessages = {
      messages: correctMessagesList,
      start: 5,
      end: -1
    };

    const channelMessage = requestSuccessfulChannelMessages(firstUser.token, firstChannelId, 5);
    expect(channelMessage).toStrictEqual(correctChannelMessages);
  });

  // test('Only returns the messages from the requested channel.', () => {
  //   const secondChannelId = requestSuccessfulChannelsCreate(firstUser.token, 'New Test Channel 2', true).channelId;
  //   const thirdChannelId = requestSuccessfulChannelsCreate(firstUser.token, 'New Test Channel 3', true).channelId;

  //   const thirdChannelMsgObjList : messageReturn[] = [];
  //   for (let i = 0; i < 5; i++) {
  //     requestSuccessfulSendMessage(firstUser.token, firstChannelId, 'blah');
  //     requestSuccessfulSendMessage(firstUser.token, secondChannelId, 'blah');

  //     // Stores messages from the third channel in order.
  //     const msgId = requestSuccessfulSendMessage(firstUser.token, thirdChannelId, 'blah').messageId;
  //     thirdChannelMsgObjList.splice(0, 0,
  //       {
  //         messageId: msgId,
  //         uId: firstUser.authUserId,
  //         message: 'blah',
  //         timeSent: expect.any(Number),
  //         reacts: [],
  //         isPinned: false
  //       }
  //     );
  //   }

  //   const correctChannelMessages = {
  //     messages: thirdChannelMsgObjList,
  //     start: 0,
  //     end: -1
  //   };

  //   const channelMessage = requestSuccessfulChannelMessages(firstUser.token, thirdChannelId, 0);
  //   expect(channelMessage).toStrictEqual(correctChannelMessages);

  //   // TimeSent must be in decreasing order (most recent message first).
  //   let previousTime = Date.now();
  //   for (const msg of channelMessage.messages) {
  //     expect(msg.timeSent).toBeLessThanOrEqual(previousTime);
  //     previousTime = msg.timeSent;
  //   }
  // });
});

describe('Error return', () => {
  test('Invalid token', () => {
    const channelMessage = requestErrorChannelMessages(firstUser.token + 'random', firstChannelId, 0);
    expect(channelMessage).toStrictEqual(TOKEN_ERROR);
  });

  test('Invalid channelId', () => {
    const channelMessage = requestErrorChannelMessages(firstUser.token, firstChannelId + 1, 0);
    expect(channelMessage).toStrictEqual(ERROR);
  });

  test('Token refers to a user who is not a member of the channel', () => {
    const secondUser = requestSuccessfulAuthRegister('seconduser@gmail.com', '123456', 'second', 'user');
    const channelMessage = requestErrorChannelMessages(secondUser.token, firstChannelId, 0);
    expect(channelMessage).toStrictEqual(TOKEN_ERROR);
  });

  test('Start is greater than the total number of messages in channel', () => {
    for (let i = 0; i < 3; i++) {
      requestSuccessfulSendMessage(firstUser.token, firstChannelId, 'blah');
    }

    const channelMessage = requestErrorChannelMessages(firstUser.token, firstChannelId, 4);
    expect(channelMessage).toStrictEqual(ERROR);
  });

  test('ASSUMPTION: start is negative', () => {
    for (let i = 0; i < 2; i++) {
      requestSuccessfulSendMessage(firstUser.token, firstChannelId, 'blah');
    }

    const channelMessage = requestErrorChannelMessages(firstUser.token, firstChannelId, -1);
    expect(channelMessage).toStrictEqual(ERROR);
  });
});
