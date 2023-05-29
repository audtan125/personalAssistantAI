import { requestClear } from '../../Helpers/requests/requestOtherHelper';
import { requestSuccessfulAuthRegister } from '../../Helpers/requests/requestAuthHelper';
import { requestSuccessfulChannelsCreate } from '../../Helpers/requests/requestChannelsHelper';
import { requestSuccessfulChannelJoin, requestSuccessfulChannelMessages } from '../../Helpers/requests/requestChannelHelper';
import {
  requestSuccessfulStandupActive, requestSuccessfulStandupSend, requestSuccessfulStandupStart, requestErrorStandupStart
} from '../../Helpers/requests/requestStandupHelper';
import { message } from '../../dataStore';
import { sleep } from '../../Helpers/sleep';

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

describe('Successful standup start', () => {
  describe('length is', () => {
    test('2 seconds', () => {
      const standupStart = requestSuccessfulStandupStart(
        globalOwner.token, firstChannelId, 2);

      // testing stand up is active after 1 millisecond has passed
      sleep(0.001);
      let firstChannelActive = requestSuccessfulStandupActive(
        globalOwner.token, firstChannelId);
      expect(firstChannelActive).toStrictEqual(
        { isActive: true, timeFinish: standupStart.timeFinish }
      );

      // 1 millisecond after stand up should be finished,
      // stand up should not be active anymore
      sleep(2);
      firstChannelActive = requestSuccessfulStandupActive(
        globalOwner.token, firstChannelId);
      expect(firstChannelActive).toStrictEqual(
        { isActive: false, timeFinish: null }
      );

      // expect the return type structure to be correct
      expect(standupStart).toStrictEqual({ timeFinish: expect.any(Number) });
      // and for timeFinish to be >= 0
      expect(standupStart.timeFinish).toBeGreaterThanOrEqual(0);
    });
  });

  test('0 seconds', () => {
    // Time in seconds
    const timeBeforeStandupStart = Math.floor(Date.now() / 1000);
    const standupStart = requestSuccessfulStandupStart(
      globalOwner.token, firstChannelId, 0);
    expect(standupStart).toStrictEqual({ timeFinish: expect.any(Number) });
    const timeAfterStandupStart = Math.floor(Date.now() / 1000);

    // expect channel to not be active because stand up lasted 0 seconds
    const firstChannelActive = requestSuccessfulStandupActive(
      globalOwner.token, firstChannelId);
    expect(firstChannelActive).toStrictEqual(
      { isActive: false, timeFinish: null }
    );

    // timeFinish should be the same time as when the function was called
    expect(standupStart.timeFinish).toBeGreaterThanOrEqual(timeBeforeStandupStart);
    expect(standupStart.timeFinish).toBeLessThanOrEqual(timeAfterStandupStart);
  });

  // test('standup in second channel does not start standup in first channel', () => {
  //   const secondChannelId = requestSuccessfulChannelsCreate(
  //     globalOwner.token, 'New Test Channel', true).channelId;

  //   const standupStart = requestSuccessfulStandupStart(
  //     globalOwner.token, secondChannelId, 0.5);

  //   // after 1ms
  //   sleep(0.001);

  //   expect(standupStart).toStrictEqual({ timeFinish: expect.any(Number) });
  //   expect(standupStart.timeFinish).toBeGreaterThanOrEqual(0);

  //   // second channel standup is active
  //   const secondChannelActive = requestSuccessfulStandupActive(
  //     globalOwner.token, secondChannelId);
  //   expect(secondChannelActive).toStrictEqual(
  //     { isActive: true, timeFinish: standupStart.timeFinish }
  //   );
  //   // first channel is not active
  //   const firstChannelActive = requestSuccessfulStandupActive(
  //     globalOwner.token, firstChannelId);
  //   expect(firstChannelActive).toStrictEqual(
  //     { isActive: false, timeFinish: null }
  //   );

  //   // sleep so that standup is finished before we clear datastore
  //   sleep(0.5);
  // });

  describe('standup summary message sent at the right time', () => {
    let standupStart: { timeFinish: number };
    beforeEach(() => {
      // first user starts a stand up that lasts 5 seconds before each test
      standupStart = requestSuccessfulStandupStart(
        globalOwner.token, firstChannelId, 0.5);
      // wait 1 millisecond after standup started
      sleep(0.001);
      expect(standupStart).toStrictEqual({ timeFinish: expect.any(Number) });
      expect(standupStart.timeFinish).toBeGreaterThanOrEqual(0);
    });

    test('No packaged message as no standups were sent in during standup time', () => {
      // 1 millisecond after the stand up has finished, check the messages in the channel
      sleep(0.5);
      const msgs: message[] = requestSuccessfulChannelMessages(
        globalOwner.token, firstChannelId, 0).messages;
      // messages are an empty array as no messages have been sent yet
      expect(msgs).toStrictEqual([]);
    });

    test('Packaged message of one standup', () => {
      const msgsBeforeStandupFinished: message[] = requestSuccessfulChannelMessages(
        globalOwner.token, firstChannelId, 0).messages;
      // second user sends in their standup
      requestSuccessfulStandupSend(secondUser.token, firstChannelId, 'Touched grass today');
      // Standup finished
      sleep(0.5);
      const msgsAfterStandupFinished: message[] = requestSuccessfulChannelMessages(
        globalOwner.token, firstChannelId, 0).messages;

      expect(msgsBeforeStandupFinished).toStrictEqual([]);
      expect(msgsAfterStandupFinished).toStrictEqual(
        [
          {
            // the standup summary will be the most recent message
            // sent into the channel ie index 0
            messageId: msgsAfterStandupFinished[0].messageId,
            // the first user started the standup so the summary
            // message is sent by their id
            uId: globalOwner.authUserId,
            message: 'seconduser: Touched grass today',
            timeSent: expect.any(Number),
            reacts: [],
            isPinned: false
          },
        ]
      );

      // // 50 millisecond range on either side (range of 500ms is allowed)
      // // for the standup summary message timeStamp
      // const rangeSeconds = 0.05;
      // expect(msgsAfterStandupFinished[0].timeSent).toBeGreaterThanOrEqual(
      //   Math.floor(standupStart.timeFinish) - rangeSeconds);
      // expect(msgsAfterStandupFinished[0].timeSent).toBeLessThanOrEqual(
      //   Math.floor(standupStart.timeFinish) + rangeSeconds);
    });
  });

  // test('Standup still active in the last 10 milliseconds of length', () => {
  //   const standupStart = requestSuccessfulStandupStart(
  //     secondUser.token, firstChannelId, 0.5);
  //   sleep(0.4);
  //   const standupActive = requestSuccessfulStandupActive(
  //     globalOwner.token, firstChannelId);
  //   expect(standupActive).toStrictEqual(
  //     { isActive: true, timeFinish: standupStart.timeFinish }
  //   );
  // });

  // test('two different channels can have standups at the same time', () => {
  //   // Create second channel
  //   const secondChannelId = requestSuccessfulChannelsCreate(
  //     globalOwner.token, 'New Test Channel', true).channelId;

  //   // start standups in both channels
  //   const standupStart1 = requestSuccessfulStandupStart(
  //     globalOwner.token, firstChannelId, 0.5);
  //   const standupStart2 = requestSuccessfulStandupStart(
  //     globalOwner.token, secondChannelId, 0.5);

  //   // after 1ms
  //   sleep(0.001);

  //   expect(standupStart1).toStrictEqual({ timeFinish: expect.any(Number) });
  //   expect(standupStart2).toStrictEqual({ timeFinish: expect.any(Number) });
  //   expect(standupStart1.timeFinish).toBeGreaterThanOrEqual(0);
  //   expect(standupStart2.timeFinish).toBeGreaterThanOrEqual(0);

  //   // both channels have active standups
  //   const firstChannelActive = requestSuccessfulStandupActive(
  //     globalOwner.token, firstChannelId);
  //   expect(firstChannelActive).toStrictEqual(
  //     { isActive: true, timeFinish: standupStart1.timeFinish }
  //   );
  //   const secondChannelActive = requestSuccessfulStandupActive(
  //     globalOwner.token, secondChannelId);
  //   expect(secondChannelActive).toStrictEqual(
  //     { isActive: true, timeFinish: standupStart2.timeFinish }
  //   );

  //   // sleep so that standup is finished before we clear datastore
  //   sleep(0.5);
  // });

  // test('normal user starts the stand up', () => {
  //   const standupStart = requestSuccessfulStandupStart(
  //     secondUser.token, firstChannelId, 0.5);
  //   // wait 1 millisecond after standup is meant to finish in order to check
  //   // the return
  //   sleep(0.501);
  //   expect(standupStart).toStrictEqual({ timeFinish: expect.any(Number) });
  //   expect(standupStart.timeFinish).toBeGreaterThanOrEqual(0);
  // });
});

describe('Throws http exception', () => {
  test('invalid token', () => {
    const standupStartAttempt = requestErrorStandupStart(
      globalOwner.token + secondUser.token, firstChannelId, 0.5);
    sleep(0.501);
    expect(standupStartAttempt).toStrictEqual(403);
  });

  test('channelId valid but user is not a member', () => {
    // Created a third user that is not part of any channels atm
    const thirdUser = requestSuccessfulAuthRegister(
      'thirduser@gmail.com', 'password', 'Third', 'User');
    // Third user attempt to start a stand up in first channel
    const standupStartAttempt = requestErrorStandupStart(
      thirdUser.token, firstChannelId, 0.5);
    sleep(0.501);
    expect(standupStartAttempt).toStrictEqual(403);
  });

  test('channelId is invalid', () => {
    // currently only one channel exists
    const standupStartAttempt = requestErrorStandupStart(
      globalOwner.token, firstChannelId + 1, 0.5);
    sleep(0.501);
    expect(standupStartAttempt).toStrictEqual(400);
  });

  test('length is invalid', () => {
    // length can not be a negative integer
    const standupStartAttempt = requestErrorStandupStart(
      globalOwner.token, firstChannelId, -1);
    sleep(0.501);
    expect(standupStartAttempt).toStrictEqual(400);
  });

  test('active standup already running in channel', () => {
    // Active standup
    requestSuccessfulStandupStart(
      globalOwner.token, firstChannelId, 0.5);
    // attempt to start standup again
    const standupStartAttempt = requestErrorStandupStart(
      globalOwner.token, firstChannelId, 0.5);
    sleep(0.501);
    expect(standupStartAttempt).toStrictEqual(400);
  });
});
