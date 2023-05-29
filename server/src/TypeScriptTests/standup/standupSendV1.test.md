import {
  requestSuccessfulStandupStart,
  requestSuccessfulStandupSend, requestErrorStandupSend
} from '../../Helpers/requests/requestStandupHelper';
import { requestSuccessfulAuthRegister } from '../../Helpers/requests/requestAuthHelper';
import { requestClear } from '../../Helpers/requests/requestOtherHelper';
import { requestSuccessfulChannelJoin } from '../../Helpers/requests/requestChannelHelper';
import { requestSuccessfulChannelsCreate } from '../../Helpers/requests/requestChannelsHelper';
import { message } from '../../dataStore';
import { requestSuccessfulChannelMessages } from '../../Helpers/requests/requestChannelHelper';
import { requestSuccessfulSendMessage } from '../../Helpers/requests/requestMessageHelper';
import { sleep } from '../../Helpers/sleep';

const aThousandCharacters = `abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuv
abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxy
abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxy
abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxy
abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxy
abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxy
abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxy
abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxy
abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxy
abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxy
abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxy
abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxy
abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxy
abcdefghijklmno`;

// For every test, makes a channel with 2 members: the channel owner and a normal member
let globalOwner : {token: string, authUserId: number};
let firstChannelId : number;
let secondUser : {token: string, authUserId: number};
beforeEach(() => {
  requestClear();
  globalOwner = requestSuccessfulAuthRegister('emailer@gmail.com', 'password', 'First', 'User');
  firstChannelId = requestSuccessfulChannelsCreate(globalOwner.token, 'New Test Channel', true).channelId;

  secondUser = requestSuccessfulAuthRegister('seconduser@gmail.com', 'password', 'Second', 'User');
  requestSuccessfulChannelJoin(secondUser.token, firstChannelId);
});

afterAll(() => {
  requestClear();
});

describe('Successful standup send', () => {
  test('standups have correct return type', () => {
    // 1 second stand up
    requestSuccessfulStandupStart(globalOwner.token, firstChannelId, 1);
    // 1/2 a second into the stand up
    sleep(0.5);
    const standupSend1 = requestSuccessfulStandupSend(
      secondUser.token, firstChannelId, 'Coded for 12 hours straight');
    expect(standupSend1).toStrictEqual({});
    const standupSend2 = requestSuccessfulStandupSend(
      globalOwner.token, firstChannelId, 'Hopped on a 8 hour coding meeting');
    expect(standupSend2).toStrictEqual({});

    // make sure test finishes standup before calling clear - 1.5 seconds after standup called
    sleep(1);
  });

  // test('Same person sends 2 standups', () => {
  //   requestSuccessfulStandupStart(globalOwner.token, firstChannelId, 0.5);

  //   const msgsBeforeStandupFinished: message[] = requestSuccessfulChannelMessages(
  //     globalOwner.token, firstChannelId, 0).messages;

  //   requestSuccessfulStandupSend(globalOwner.token, firstChannelId, 'Touched grass today');
  //   requestSuccessfulStandupSend(globalOwner.token, firstChannelId, 'My code passed');

  //   // 1 second after standup finished
  //   sleep(1.5);
  //   const msgsAfterStandupFinished: message[] = requestSuccessfulChannelMessages(
  //     globalOwner.token, firstChannelId, 0).messages;

  //   expect(msgsBeforeStandupFinished).toStrictEqual([]);
  //   expect(msgsAfterStandupFinished).toStrictEqual(
  //     [
  //       {
  //         messageId: msgsAfterStandupFinished[0].messageId,
  //         uId: globalOwner.authUserId,
  //         message: 'firstuser: Touched grass today\nfirstuser: My code passed',
  //         timeSent: expect.any(Number),
  //         reacts: [],
  //         isPinned: false
  //       },
  //     ]
  //   );
  // });

  describe('standup starts after normal messages have been sent in the channel', () => {
    let firstMsgId: number;
    let secondMsgId: number;
    let firstMessageObject: message;
    let secondMessageObject: message;
    beforeEach(() => {
      firstMsgId = requestSuccessfulSendMessage(
        globalOwner.token, firstChannelId, 'Standup will be happening soon').messageId;
      secondMsgId = requestSuccessfulSendMessage(
        secondUser.token, firstChannelId, 'Oke boss').messageId;

      firstMessageObject = {
        messageId: firstMsgId,
        uId: globalOwner.authUserId,
        message: 'Standup will be happening soon',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false
      };
      secondMessageObject = {
        messageId: secondMsgId,
        uId: secondUser.authUserId,
        message: 'Oke boss',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false
      };

      // stand up started by first user that will last 500 milliseconds
      requestSuccessfulStandupStart(
        globalOwner.token, firstChannelId, 0.5);

      // before each test wait 1 millisecond after standup has started
      sleep(0.001);
    });

    test('no messages sent during stand up', () => {
      // wait until standup is over by 1 millisecond
      // ie 501 milliseconds have passed in total now
      sleep(0.5);

      // no stand ups sent so no standup summary message
      const msgs: message[] = requestSuccessfulChannelMessages(
        globalOwner.token, firstChannelId, 0).messages;
      expect(msgs).toStrictEqual(
        [
          secondMessageObject,
          firstMessageObject
        ]
      );
    });

    // test('2 standups sent by two diff users', () => {
    //   requestSuccessfulStandupSend(globalOwner.token, firstChannelId, 'Touched grass today');
    //   requestSuccessfulStandupSend(secondUser.token, firstChannelId, 'Did not touch grass');
    //   // 1 millisecond after stand up is finished check the messages in channel
    //   sleep(0.5);
    //   const msgs: message[] = requestSuccessfulChannelMessages(
    //     globalOwner.token, firstChannelId, 0).messages;

    //   expect(msgs).toStrictEqual(
    //     [
    //       {
    //         // the standup summary will be the most recent message
    //         // sent into the channel ie index 0
    //         messageId: msgs[0].messageId,
    //         uId: globalOwner.authUserId,
    //         message: 'firstuser: Touched grass today\nseconduser: Did not touch grass',
    //         timeSent: expect.any(Number),
    //         reacts: [],
    //         isPinned: false
    //       },
    //       secondMessageObject,
    //       firstMessageObject
    //     ]
    //   );
    // });

    // test('message is 0 characters/empty', () => {
    //   const standupSend = requestSuccessfulStandupSend(
    //     globalOwner.token, firstChannelId, '');
    //   requestSuccessfulStandupSend(secondUser.token, firstChannelId, 'Did not touch grass');

    //   sleep(0.5);
    //   const msgs: message[] = requestSuccessfulChannelMessages(
    //     globalOwner.token, firstChannelId, 0).messages;

    //   expect(msgs).toStrictEqual(
    //     [
    //       {
    //         // the standup summary will be the most recent message
    //         // sent into the channel ie index 0
    //         messageId: msgs[0].messageId,
    //         uId: globalOwner.authUserId,
    //         message: 'firstuser: \nseconduser: Did not touch grass',
    //         timeSent: expect.any(Number),
    //         reacts: [],
    //         isPinned: false
    //       },
    //       secondMessageObject,
    //       firstMessageObject
    //     ]
    //   );

    //   // make sure test finishes standup before calling clear
    //   sleep(0.5);
    //   expect(standupSend).toStrictEqual({});
    // });
  });

  // test('message is 1000 characters', () => {
  //   requestSuccessfulStandupStart(globalOwner.token, firstChannelId, 0.5);

  //   sleep(0.1);
  //   const standupSend = requestErrorStandupSend(
  //     globalOwner.token, firstChannelId + 1, aThousandCharacters);

  //   expect(standupSend).toStrictEqual(400);

  //   // make sure test finishes standup before calling clear
  //   sleep(0.5);
  // });
});

describe('Throw http exceptions', () => {
  test('Can not send a standup when standup is 0 seconds', () => {
    requestSuccessfulStandupStart(globalOwner.token, firstChannelId, 0.5);
    const standupSend = requestErrorStandupSend(
      globalOwner.token + secondUser.token, firstChannelId, 'Standup message');
    expect(standupSend).toStrictEqual(403);
    sleep(0.5);
  });

  test('Can not send a standup when standup is 0 seconds', () => {
    requestSuccessfulStandupStart(globalOwner.token, firstChannelId, 0);
    const standupSend = requestErrorStandupSend(
      globalOwner.token, firstChannelId + 1, 'Standup message');
    expect(standupSend).toStrictEqual(400);
  });

  test('channelId is invalid', () => {
    requestSuccessfulStandupStart(globalOwner.token, firstChannelId, 0.7);

    // currently only one channel exists
    sleep(0.4);
    const standupSendAttempt = requestErrorStandupSend(
      globalOwner.token, firstChannelId + 1, 'Error standup');
    expect(standupSendAttempt).toStrictEqual(400);
    // make sure test finishes standup before calling clear
    sleep(0.5);
  });

  test('message is 1001 characters', () => {
    requestSuccessfulStandupStart(globalOwner.token, firstChannelId, 1);

    sleep(0.501);
    const standupSendAttempt = requestErrorStandupSend(
      globalOwner.token, firstChannelId, aThousandCharacters + '1');

    expect(standupSendAttempt).toStrictEqual(400);

    // make sure test finishes standup before calling clear
    sleep(0.5);
  });

  describe('active standup not currently running', () => {
    test('no standup called', () => {
      const standupSendAttempt = requestErrorStandupSend(
        globalOwner.token, firstChannelId, 'Error standup');

      expect(standupSendAttempt).toStrictEqual(400);
    });

    test('standup already finished', () => {
      requestSuccessfulStandupStart(
        globalOwner.token, firstChannelId, 1);

      // standup lasts 1 second and we are testing at 1001 milliseconds
      sleep(1.001);
      const standupSendAttempt = requestErrorStandupSend(
        globalOwner.token, firstChannelId, 'Error standup');

      expect(standupSendAttempt).toStrictEqual(400);
    });
  });

  test('channelId valid but user is not a member', () => {
    // Created a third user that is not part of any channels atm
    const thirdUser = requestSuccessfulAuthRegister(
      'thirduser@gmail.com', 'password', 'Third', 'User');

    // standup in first channel started
    requestSuccessfulStandupStart(globalOwner.token, firstChannelId, 1);

    // Third user attempt to start a stand up in first channel
    sleep(0.501);
    const standupSendAttempt = requestErrorStandupSend(
      thirdUser.token, firstChannelId, 'Error standup');

    expect(standupSendAttempt).toStrictEqual(403);

    // make sure test finishes standup before calling clear
    sleep(0.5);
  });
});
