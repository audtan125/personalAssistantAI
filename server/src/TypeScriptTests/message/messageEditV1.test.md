import { requestSuccessfulAuthRegister } from '../../Helpers/requests/requestAuthHelper';
import { requestSuccessfulChannelsCreate } from '../../Helpers/requests/requestChannelsHelper';
import { requestClear } from '../../Helpers/requests/requestOtherHelper';
import { requestSuccessfulChannelJoin, requestSuccessfulChannelMessages } from '../../Helpers/requests/requestChannelHelper';
import {
  requestSuccessfulEditMessage,
  requestErrorEditMessage,
  requestSuccessfulSendMessage,
  requestSuccessfulSendDm,
} from '../../Helpers/requests/requestMessageHelper';
import { requestSuccessfulDmCreate, requestSuccessfulDmMessages } from '../../Helpers/requests/requestDmHelper';
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

// For every test, makes a channel with 2 members: the channel owner and a normal member
// And have a first message from that normal member
let globalOwner: { token: string; authUserId: number };
let channelId: number;
let secondUser: { token: string; authUserId: number };
let messageId: number;

beforeEach(() => {
  requestClear();
  globalOwner = requestSuccessfulAuthRegister(
    'emailer@gmail.com',
    'password',
    'Test',
    'User'
  );
  secondUser = requestSuccessfulAuthRegister(
    'seconduser@gmail.com',
    'password',
    'Second',
    'User'
  );

  channelId = requestSuccessfulChannelsCreate(
    globalOwner.token,
    'New Test Channel',
    true
  ).channelId;

  requestSuccessfulChannelJoin(secondUser.token, channelId);

  messageId = requestSuccessfulSendMessage(
    secondUser.token,
    channelId,
    'First message'
  ).messageId;
});

afterAll(() => {
  requestClear();
});

describe('Succesfully edit message', () => {
  test('user edits own message', () => {
    const editedMessage = requestSuccessfulEditMessage(
      globalOwner.token,
      messageId,
      'edited'
    );
    const messages = requestSuccessfulChannelMessages(globalOwner.token, channelId, 0).messages;

    expect(editedMessage).toStrictEqual({});
    expect(messages).toContainEqual(
      {
        messageId: messageId,
        uId: secondUser.authUserId,
        message: 'edited',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false
      }
    );
  });
  // test('Message is 0 characters long', () => {
  //   const editedMessage = requestSuccessfulEditMessage(
  //     globalOwner.token,
  //     messageId,
  //     ''
  //   );
  //   const messages = requestSuccessfulChannelMessages(globalOwner.token, channelId, 0).messages;

  //   expect(editedMessage).toStrictEqual({});
  //   expect(messages).not.toContainEqual(
  //     {
  //       messageId: messageId,
  //       uId: globalOwner.authUserId,
  //       message: '',
  //       timeSent: expect.any(Number),
  //       reacts: [],
  //       isPinned: false
  //     }
  //   );
  // });

  // test('Message is 1000 characters long', () => {
  //   const editedMessage = requestSuccessfulEditMessage(
  //     globalOwner.token,
  //     messageId,
  //     string1000chars
  //   );
  //   const messages = requestSuccessfulChannelMessages(globalOwner.token, channelId, 0);
  //   expect(editedMessage).toStrictEqual({});
  //   expect(messages.messages).toContainEqual(
  //     {
  //       messageId: messageId,
  //       uId: secondUser.authUserId,
  //       message: string1000chars,
  //       timeSent: expect.any(Number),
  //       reacts: [],
  //       isPinned: false
  //     }
  //   );
  // });

  test('user edits dm message', () => {
    const dmId = requestSuccessfulDmCreate(globalOwner.token, []).dmId;
    const msgId = requestSuccessfulSendDm(globalOwner.token, dmId, 'test coverage').messageId;
    const editedMessage = requestSuccessfulEditMessage(
      globalOwner.token,
      msgId,
      'edited'
    );
    const messages = requestSuccessfulDmMessages(globalOwner.token, dmId, 0).messages;

    expect(editedMessage).toStrictEqual({});
    expect(messages).toContainEqual(
      {
        messageId: msgId,
        uId: globalOwner.authUserId,
        message: 'edited',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false
      }
    );
  });

  test("user edits channel and dm message to empty '' (deletes message)", () => {
    const dmId = requestSuccessfulDmCreate(globalOwner.token, []).dmId;
    const msgId = requestSuccessfulSendDm(globalOwner.token, dmId, 'test coverage').messageId;
    const editedMessage = requestSuccessfulEditMessage(
      globalOwner.token,
      msgId,
      ''
    );
    const messages = requestSuccessfulDmMessages(globalOwner.token, dmId, 0).messages;

    expect(editedMessage).toStrictEqual({});
    expect(messages).not.toContainEqual(
      {
        messageId: msgId,
        uId: globalOwner.authUserId,
        message: '',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false
      }
    );

    requestSuccessfulEditMessage(
      globalOwner.token,
      messageId,
      ''
    );
    const messages2 = requestSuccessfulChannelMessages(globalOwner.token, channelId, 0).messages;

    expect(messages2).toStrictEqual([]);
  });

  // test('Edit standup summary', () => {
  //   requestSuccessfulStandupStart(globalOwner.token, channelId, 0.5);
  //   requestSuccessfulStandupSend(globalOwner.token, channelId, 'Touched grass today');
  //   requestSuccessfulStandupSend(secondUser.token, channelId, 'My code passed');

  //   // 1 second after standup finished
  //   sleep(1.5);

  //   let messages = requestSuccessfulChannelMessages(globalOwner.token, channelId, 0).messages;
  //   const standupId = messages.find(message => message.message === 'testuser: Touched grass today\nseconduser: My code passed').messageId;

  //   requestSuccessfulEditMessage(globalOwner.token, standupId, 'EDITED');

  //   messages = requestSuccessfulChannelMessages(
  //     globalOwner.token, channelId, 0
  //   ).messages;

  //   expect(messages).toContainEqual(
  //     {
  //       messageId: standupId,
  //       uId: globalOwner.authUserId,
  //       message: 'EDITED',
  //       timeSent: expect.any(Number),
  //       reacts: [],
  //       isPinned: false
  //     }
  //   );
  // });
  /*
  test('Edit standup summary to 0 characters (delete)', () => {
    requestSuccessfulStandupStart(globalOwner.token, channelId, 0.5);

    requestSuccessfulStandupSend(globalOwner.token, channelId, 'Touched grass today');
    requestSuccessfulStandupSend(secondUser.token, channelId, 'My code passed');

    // 1 second after standup finished
    sleep(1.5);
    let messages = requestSuccessfulChannelMessages(globalOwner.token, channelId, 0).messages;
    const standupId = messages.find(message => message.message === 'testuser: Touched grass today\nseconduser: My code passed').messageId;
    requestSuccessfulEditMessage(globalOwner.token, standupId, '');
    messages = requestSuccessfulChannelMessages(
      globalOwner.token, channelId, 0
    ).messages;

    expect(messages.length).toStrictEqual(1);
    expect(messages).toContainEqual(
      {
        messageId: expect.any(Number),
        uId: secondUser.authUserId,
        message: 'First message',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false
      }
    );
  });
  */
});

describe('Error return', () => {
  test('Invalid token', () => {
    const editedMessage = requestErrorEditMessage(
      globalOwner.token + secondUser.token,
      messageId,
      'Edited Message'
    );

    expect(editedMessage).toStrictEqual(TOKEN_ERROR);
  });

  test('invalid channelId', () => {
    const editedMessage = requestErrorEditMessage(
      globalOwner.token,
      channelId + 1,
      'Edited Message'
    );

    expect(editedMessage).toStrictEqual(MESSAGE_ERROR);
  });

  test('message is 1001 characters long', () => {
    const editedMessage = requestErrorEditMessage(
      globalOwner.token,
      messageId,
      string1000chars + 'a'
    );

    expect(editedMessage).toStrictEqual(MESSAGE_ERROR);
  });

  test('user is not a member of the channel', () => {
    const thirdUser = requestSuccessfulAuthRegister(
      'thirduser@gmail.com',
      'password',
      'Third',
      'User'
    );
    const editedMessage = requestErrorEditMessage(
      thirdUser.token,
      messageId,
      'Edited Message'
    );
    expect(editedMessage).toStrictEqual(MESSAGE_ERROR);
  });

  test('user tries editing the message of another user', () => {
    const thirdUser = requestSuccessfulAuthRegister(
      'thirduser@gmail.com',
      'password',
      'Third',
      'User'
    );
    requestSuccessfulChannelJoin(thirdUser.token, channelId);
    const thirdUserMessageId = requestSuccessfulSendMessage(
      thirdUser.token,
      channelId,
      'Third user message'
    ).messageId;

    const editedMessage = requestErrorEditMessage(
      secondUser.token,
      thirdUserMessageId,
      'Edited Message'
    );

    expect(editedMessage).toStrictEqual(TOKEN_ERROR);
  });

  test('user tries editing non existent message', () => {
    const editedMessage = requestErrorEditMessage(
      secondUser.token,
      messageId + 1,
      'Edited Message'
    );

    expect(editedMessage).toStrictEqual(MESSAGE_ERROR);
  });

  test('User is not authorised to edit message in dm', () => {
    const dmId = requestSuccessfulDmCreate(globalOwner.token, [secondUser.authUserId]).dmId;
    const msgId = requestSuccessfulSendDm(globalOwner.token, dmId, 'test coverage').messageId;

    const editedMessage = requestErrorEditMessage(
      secondUser.token,
      msgId,
      'Edited Message'
    );

    expect(editedMessage).toStrictEqual(TOKEN_ERROR);
  });
});
