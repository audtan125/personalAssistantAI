import { workspaceStats } from '../dataStore';
import { requestSuccessfulAdminUserRemove } from '../Helpers/requests/requestAdminHelper';
import { requestSuccessfulAuthRegister } from '../Helpers/requests/requestAuthHelper';
import { requestSuccessfulChannelInvite, requestSuccessfulChannelJoin, requestSuccessfulChannelLeave } from '../Helpers/requests/requestChannelHelper';
import { requestSuccessfulChannelsCreate } from '../Helpers/requests/requestChannelsHelper';
import { requestSuccessfulDmCreate, requestSuccessfulDmLeave, requestSuccessfulDmRemove } from '../Helpers/requests/requestDmHelper';
import { requestSuccessfulSendMessageLater, requestSuccessfulSendDm, requestSuccessfulSendMessage, requestSuccessfulSendDmMessageLater, requestSuccessfulMessageRemove, requestSuccessfulMessageShare } from '../Helpers/requests/requestMessageHelper';
import { requestClear } from '../Helpers/requests/requestOtherHelper';
import { requestSuccessfulStandupSend, requestSuccessfulStandupStart } from '../Helpers/requests/requestStandupHelper';
import { sleep } from '../Helpers/sleep';
import { requestErrorUsersStats, requestSuccessfulUsersStats } from './requestStatsHelper';
const TOKEN_ERROR = 403;

let firstUser: {token: string, authUserId: number};
let usersStatsReturn: {workspaceStats: workspaceStats};
beforeEach(() => {
  // Added sleep to avoid request clear too early before tests with async functions
  // eg Potentially clears after channel is created
  sleep(0.5);
  requestClear();
});

afterAll(() => {
  sleep(1.5);
  requestClear();
});

test('first user that registers has 0 for all metrics', () => {
  const beforeRegister = Date.now() / 1000;
  firstUser = requestSuccessfulAuthRegister(
    'emailer@gmail.com', 'password', 'First', 'User');
  const afterRegister = Date.now() / 1000;

  usersStatsReturn = requestSuccessfulUsersStats(firstUser.token);
  expect(usersStatsReturn).toStrictEqual(
    {
      workspaceStats: {
        channelsExist: [{ numChannelsExist: 0, timeStamp: expect.any(Number) }],
        dmsExist: [{ numDmsExist: 0, timeStamp: expect.any(Number) }],
        messagesExist: [{ numMessagesExist: 0, timeStamp: expect.any(Number) }],
        utilizationRate: 0
      }
    }
  );

  // test timestamps are all correct
  expect(
    usersStatsReturn.workspaceStats.channelsExist[0].timeStamp
  ).toBeGreaterThanOrEqual(beforeRegister);
  expect(
    usersStatsReturn.workspaceStats.channelsExist[0].timeStamp
  ).toBeLessThanOrEqual(afterRegister);

  expect(
    usersStatsReturn.workspaceStats.dmsExist[0].timeStamp
  ).toBeGreaterThanOrEqual(beforeRegister);
  expect(
    usersStatsReturn.workspaceStats.dmsExist[0].timeStamp
  ).toBeLessThanOrEqual(afterRegister);

  expect(
    usersStatsReturn.workspaceStats.messagesExist[0].timeStamp
  ).toBeGreaterThanOrEqual(beforeRegister);
  expect(
    usersStatsReturn.workspaceStats.messagesExist[0].timeStamp
  ).toBeLessThanOrEqual(afterRegister);
});

describe('Successful return', () => {
  beforeEach(() => {
    firstUser = requestSuccessfulAuthRegister(
      'emailer@gmail.com', 'password', 'First', 'User');
  });

  test('User creates a channel and a dm then sends a message in each', () => {
    // Channel is created
    const beforeCreateChannel = Date.now() / 1000;
    const firstChannelId = requestSuccessfulChannelsCreate(
      firstUser.token, 'First Channel', true).channelId;
    const AfterCreateChannel = Date.now() / 1000;
    // check users stats
    usersStatsReturn = requestSuccessfulUsersStats(firstUser.token);
    expect(usersStatsReturn).toStrictEqual(
      {
        workspaceStats: {
          channelsExist: [
            { numChannelsExist: 0, timeStamp: expect.any(Number) },
            { numChannelsExist: 1, timeStamp: expect.any(Number) }
          ],
          dmsExist: [
            { numDmsExist: 0, timeStamp: expect.any(Number) }
          ],
          messagesExist: [
            { numMessagesExist: 0, timeStamp: expect.any(Number) }
          ],
          // utilization rate is 1 as there is only 1 user, and that user is part of a channel or dm
          utilizationRate: 1
        }
      }
    );
    // check timestamps are in correct range
    const channelExistTimeStamp: number = usersStatsReturn.workspaceStats.channelsExist[1].timeStamp;
    expect(channelExistTimeStamp).toBeGreaterThanOrEqual(beforeCreateChannel);
    expect(channelExistTimeStamp).toBeLessThanOrEqual(AfterCreateChannel);

    // DM is created
    const beforeCreateDm = Date.now() / 1000;
    const firstDmId = requestSuccessfulDmCreate(firstUser.token, []).dmId;
    const AfterCreateDm = Date.now() / 1000;
    // check users stats
    usersStatsReturn = requestSuccessfulUsersStats(firstUser.token);
    expect(usersStatsReturn).toStrictEqual(
      {
        workspaceStats: {
          channelsExist: [
            { numChannelsExist: 0, timeStamp: expect.any(Number) },
            { numChannelsExist: 1, timeStamp: expect.any(Number) }
          ],
          dmsExist: [
            { numDmsExist: 0, timeStamp: expect.any(Number) },
            { numDmsExist: 1, timeStamp: expect.any(Number) }
          ],
          messagesExist: [
            { numMessagesExist: 0, timeStamp: expect.any(Number) }
          ],
          utilizationRate: 1
        }
      }
    );
    // check timestamps are in correct range
    const dmExistTimeStamp: number = usersStatsReturn.workspaceStats.dmsExist[1].timeStamp;
    expect(dmExistTimeStamp).toBeGreaterThanOrEqual(beforeCreateDm);
    expect(dmExistTimeStamp).toBeLessThanOrEqual(AfterCreateDm);

    // Send a message into the channel
    const beforeSendChannelMsg = Date.now() / 1000;
    requestSuccessfulSendMessage(firstUser.token, firstChannelId, 'First message');
    const afterSendChannelMsg = Date.now() / 1000;
    // check users stats
    usersStatsReturn = requestSuccessfulUsersStats(firstUser.token);
    expect(usersStatsReturn).toStrictEqual(
      {
        workspaceStats: {
          channelsExist: [
            { numChannelsExist: 0, timeStamp: expect.any(Number) },
            { numChannelsExist: 1, timeStamp: expect.any(Number) }
          ],
          dmsExist: [
            { numDmsExist: 0, timeStamp: expect.any(Number) },
            { numDmsExist: 1, timeStamp: expect.any(Number) }
          ],
          messagesExist: [
            { numMessagesExist: 0, timeStamp: expect.any(Number) },
            { numMessagesExist: 1, timeStamp: expect.any(Number) }
          ],
          utilizationRate: 1
        }
      }
    );
    // check timestamps are in correct range
    const channelMsgExistTimeStamp: number = usersStatsReturn.workspaceStats.messagesExist[1].timeStamp;
    expect(channelMsgExistTimeStamp).toBeGreaterThanOrEqual(beforeSendChannelMsg);
    expect(channelMsgExistTimeStamp).toBeLessThanOrEqual(afterSendChannelMsg);

    // Send a message into the dm
    const beforeSendDmMsg = Date.now() / 1000;
    requestSuccessfulSendDm(firstUser.token, firstDmId, 'Second message to exist');
    const afterSendDmMsg = Date.now() / 1000;
    // check users stats
    usersStatsReturn = requestSuccessfulUsersStats(firstUser.token);
    expect(usersStatsReturn).toStrictEqual(
      {
        workspaceStats: {
          channelsExist: [
            { numChannelsExist: 0, timeStamp: expect.any(Number) },
            { numChannelsExist: 1, timeStamp: expect.any(Number) }
          ],
          dmsExist: [
            { numDmsExist: 0, timeStamp: expect.any(Number) },
            { numDmsExist: 1, timeStamp: expect.any(Number) }
          ],
          messagesExist: [
            { numMessagesExist: 0, timeStamp: expect.any(Number) },
            { numMessagesExist: 1, timeStamp: expect.any(Number) },
            { numMessagesExist: 2, timeStamp: expect.any(Number) }
          ],
          utilizationRate: 1
        }
      }
    );
    // check timestamps are in correct range
    const dmMsgExistTimeStamp: number = usersStatsReturn.workspaceStats.messagesExist[2].timeStamp;
    expect(dmMsgExistTimeStamp).toBeGreaterThanOrEqual(beforeSendDmMsg);
    expect(dmMsgExistTimeStamp).toBeLessThanOrEqual(afterSendDmMsg);
  });

  test('Cases whe utilization rate is not 0 or 1', () => {
    // Create second user
    const secondUser = requestSuccessfulAuthRegister(
      'seconduser@gmail.com', 'password', 'Second', 'User'
    );
    // First user creates channel
    const firstChannelId = requestSuccessfulChannelsCreate(
      firstUser.token, 'First Channel', true).channelId;
    usersStatsReturn = requestSuccessfulUsersStats(firstUser.token);
    // Since there is 1 user that is not part of any channels or dms
    expect(usersStatsReturn.workspaceStats.utilizationRate).toStrictEqual(0.5);

    // Create third user
    const thirdUser = requestSuccessfulAuthRegister(
      'thirduser@gmail.com', 'password', 'Third', 'User'
    );
    // Since there are now 3 users and only 1 that is part of channel or dm
    usersStatsReturn = requestSuccessfulUsersStats(firstUser.token);
    expect(usersStatsReturn.workspaceStats.utilizationRate).toStrictEqual(1 / 3);

    // channel invite and join affects utilization rate
    requestSuccessfulChannelInvite(firstUser.token, firstChannelId, secondUser.authUserId);
    usersStatsReturn = requestSuccessfulUsersStats(firstUser.token);
    expect(usersStatsReturn.workspaceStats.utilizationRate).toStrictEqual(2 / 3);

    requestSuccessfulChannelJoin(thirdUser.token, firstChannelId);
    usersStatsReturn = requestSuccessfulUsersStats(firstUser.token);
    expect(usersStatsReturn.workspaceStats.utilizationRate).toStrictEqual(1);

    // channel leave affects utilization rate
    requestSuccessfulChannelLeave(thirdUser.token, firstChannelId);
    usersStatsReturn = requestSuccessfulUsersStats(firstUser.token);
    expect(usersStatsReturn.workspaceStats.utilizationRate).toStrictEqual(2 / 3);

    // dm create affects utilization rate
    const firstDmId = requestSuccessfulDmCreate(firstUser.token, [thirdUser.authUserId]).dmId;
    usersStatsReturn = requestSuccessfulUsersStats(firstUser.token);
    expect(usersStatsReturn.workspaceStats.utilizationRate).toStrictEqual(1);

    // dm leave affects utilization rate
    requestSuccessfulDmLeave(thirdUser.token, firstDmId);
    usersStatsReturn = requestSuccessfulUsersStats(firstUser.token);
    expect(usersStatsReturn.workspaceStats.utilizationRate).toStrictEqual(2 / 3);

    // already account for dm remove affect util rate in diff test

    // user remove affects utilization rate
    requestSuccessfulAdminUserRemove(firstUser.token, secondUser.authUserId);
    usersStatsReturn = requestSuccessfulUsersStats(firstUser.token);
    expect(usersStatsReturn.workspaceStats.utilizationRate).toStrictEqual(1 / 3);
  });

  test('Message in channel sent with sendlater only increases messages exist after sent', () => {
    const firstChannelId = requestSuccessfulChannelsCreate(
      firstUser.token, 'First Channel', true).channelId;
    // Send this message in 1 second
    requestSuccessfulSendMessageLater(firstUser.token, firstChannelId, 'First message send later', (Date.now() / 1000) + 1);
    // Message has not been sent yet
    sleep(0.5);
    usersStatsReturn = requestSuccessfulUsersStats(firstUser.token);
    expect(usersStatsReturn.workspaceStats.messagesExist).toStrictEqual(
      [{ numMessagesExist: 0, timeStamp: expect.any(Number) }]
    );
    sleep(1.5);
    // Message has been sent now
    usersStatsReturn = requestSuccessfulUsersStats(firstUser.token);
    expect(usersStatsReturn.workspaceStats.messagesExist).toContainEqual(
      { numMessagesExist: 1, timeStamp: expect.any(Number) }
    );
  });

  test('Message in dm not sent yet with sendlaterdm is not included in num msgs', () => {
    const firstDmId = requestSuccessfulDmCreate(firstUser.token, []).dmId;
    // Send this message in 1 second
    requestSuccessfulSendDmMessageLater(
      firstUser.token, firstDmId, 'First message send later', (Date.now() / 1000) + 1);
    // Message has not been sent yet
    sleep(0.5);
    usersStatsReturn = requestSuccessfulUsersStats(firstUser.token);
    expect(usersStatsReturn.workspaceStats.messagesExist).toStrictEqual(
      [{ numMessagesExist: 0, timeStamp: expect.any(Number) }]
    );
    sleep(1.5);
    // Message has been sent now
    usersStatsReturn = requestSuccessfulUsersStats(firstUser.token);
    expect(usersStatsReturn.workspaceStats.messagesExist).toContainEqual(
      { numMessagesExist: 1, timeStamp: expect.any(Number) }
    );
  });

  test('standup message is not included in num msgs before standup finished', () => {
    const firstChannelId = requestSuccessfulChannelsCreate(
      firstUser.token, 'First Channel', true).channelId;
    // Standup summary sent in 1 second
    requestSuccessfulStandupStart(firstUser.token, firstChannelId, 1);
    requestSuccessfulStandupSend(firstUser.token, firstChannelId, 'Standup sent');
    // Standup summary message has not been sent yet
    sleep(0.1);
    usersStatsReturn = requestSuccessfulUsersStats(firstUser.token);
    expect(usersStatsReturn.workspaceStats.messagesExist).toStrictEqual(
      [{ numMessagesExist: 0, timeStamp: expect.any(Number) }]
    );
    sleep(1.5);
    // Standup summary message has been sent now
    usersStatsReturn = requestSuccessfulUsersStats(firstUser.token);

    expect(usersStatsReturn.workspaceStats.messagesExist).toStrictEqual(
      [
        { numMessagesExist: 0, timeStamp: expect.any(Number) },
        { numMessagesExist: 1, timeStamp: expect.any(Number) }
      ]
    );
  });

  test('num channels does not decrease when every person has left the channel', () => {
    const firstChannelId = requestSuccessfulChannelsCreate(
      firstUser.token, 'First Channel', true).channelId;
    requestSuccessfulChannelLeave(firstUser.token, firstChannelId);
    expect(usersStatsReturn.workspaceStats.channelsExist).toContainEqual(
      { numChannelsExist: 1, timeStamp: expect.any(Number) }
    );
    expect(usersStatsReturn.workspaceStats.utilizationRate).toStrictEqual(1);
  });

  test('Decreases num messages when a message is removed', () => {
    // Send message into dm
    const firstDmId = requestSuccessfulDmCreate(firstUser.token, []).dmId;
    const dmMsgId = requestSuccessfulSendDm(
      firstUser.token, firstDmId, 'First message to exist').messageId;
    usersStatsReturn = requestSuccessfulUsersStats(firstUser.token);
    expect(usersStatsReturn.workspaceStats.messagesExist).toContainEqual(
      { numMessagesExist: 1, timeStamp: expect.any(Number) }
    );
    // Remove message from dm
    const beforeDmMsgRemove = Date.now() / 1000;
    requestSuccessfulMessageRemove(firstUser.token, dmMsgId);
    const afterDmMsgRemove = Date.now() / 1000;

    usersStatsReturn = requestSuccessfulUsersStats(firstUser.token);
    expect(usersStatsReturn.workspaceStats.messagesExist).toStrictEqual(
      [
        { numMessagesExist: 0, timeStamp: expect.any(Number) },
        { numMessagesExist: 1, timeStamp: expect.any(Number) },
        { numMessagesExist: 0, timeStamp: expect.any(Number) }
      ]
    );
    const msgRemoveTimestamp = usersStatsReturn.workspaceStats.messagesExist[2].timeStamp;
    expect(msgRemoveTimestamp).toBeGreaterThanOrEqual(beforeDmMsgRemove);
    expect(msgRemoveTimestamp).toBeLessThanOrEqual(afterDmMsgRemove);

    // Send message into channel
    const firstChannelId = requestSuccessfulChannelsCreate(
      firstUser.token, 'First Channel', true).channelId;
    const channelMsgId = requestSuccessfulSendMessage(firstUser.token, firstChannelId,
      'Second message but first message has been removed').messageId;
    usersStatsReturn = requestSuccessfulUsersStats(firstUser.token);
    expect(usersStatsReturn.workspaceStats.messagesExist).toStrictEqual(
      [
        { numMessagesExist: 0, timeStamp: expect.any(Number) },
        { numMessagesExist: 1, timeStamp: expect.any(Number) },
        { numMessagesExist: 0, timeStamp: expect.any(Number) },
        { numMessagesExist: 1, timeStamp: expect.any(Number) }
      ]
    );
    // Remove message from channel
    const beforeChMsgRemove = Date.now() / 1000;
    requestSuccessfulMessageRemove(firstUser.token, channelMsgId);
    const afterChMsgRemove = Date.now() / 1000;
    usersStatsReturn = requestSuccessfulUsersStats(firstUser.token);
    expect(usersStatsReturn.workspaceStats.messagesExist).toStrictEqual(
      [
        { numMessagesExist: 0, timeStamp: expect.any(Number) },
        { numMessagesExist: 1, timeStamp: expect.any(Number) },
        { numMessagesExist: 0, timeStamp: expect.any(Number) },
        { numMessagesExist: 1, timeStamp: expect.any(Number) },
        { numMessagesExist: 0, timeStamp: expect.any(Number) }
      ]
    );
    const chMsgRemoveTimestamp = usersStatsReturn.workspaceStats.messagesExist[4].timeStamp;
    expect(chMsgRemoveTimestamp).toBeGreaterThanOrEqual(beforeChMsgRemove);
    expect(chMsgRemoveTimestamp).toBeLessThanOrEqual(afterChMsgRemove);

    // This all should not affect the utilization rate
    expect(usersStatsReturn.workspaceStats.utilizationRate).toStrictEqual(1);
  });

  test('2 dms are created and dm remove is called on the first dm', () => {
    // Create 2 dms
    const firstDmId = requestSuccessfulDmCreate(firstUser.token, []).dmId;
    requestSuccessfulDmCreate(firstUser.token, []);

    usersStatsReturn = requestSuccessfulUsersStats(firstUser.token);
    expect(usersStatsReturn.workspaceStats.dmsExist).toStrictEqual(
      [
        { numDmsExist: 0, timeStamp: expect.any(Number) },
        { numDmsExist: 1, timeStamp: expect.any(Number) },
        { numDmsExist: 2, timeStamp: expect.any(Number) }
      ]
    );
    expect(usersStatsReturn.workspaceStats.utilizationRate).toStrictEqual(1);

    const beforeDmRemove = Date.now() / 1000;
    requestSuccessfulDmRemove(firstUser.token, firstDmId);
    const afterDmRemove = Date.now() / 1000;

    // dm has been removed so num should go down
    usersStatsReturn = requestSuccessfulUsersStats(firstUser.token);
    expect(usersStatsReturn.workspaceStats.dmsExist).toStrictEqual(
      [
        { numDmsExist: 0, timeStamp: expect.any(Number) },
        { numDmsExist: 1, timeStamp: expect.any(Number) },
        { numDmsExist: 2, timeStamp: expect.any(Number) },
        { numDmsExist: 1, timeStamp: expect.any(Number) }
      ]
    );
    // Utilization should still be 1
    expect(usersStatsReturn.workspaceStats.utilizationRate).toStrictEqual(1);
    const dmRemoveTimeStamp = usersStatsReturn.workspaceStats.dmsExist[3].timeStamp;
    expect(dmRemoveTimeStamp).toBeGreaterThanOrEqual(beforeDmRemove);
    expect(dmRemoveTimeStamp).toBeLessThanOrEqual(afterDmRemove);
  });

  test('removing dm removes messages', () => {
    const firstDmId = requestSuccessfulDmCreate(firstUser.token, []).dmId;

    // send two dm messages
    requestSuccessfulSendDm(firstUser.token, firstDmId, 'Hi');
    requestSuccessfulSendDm(firstUser.token, firstDmId, 'Message 2');

    const beforeDmRemove = Date.now() / 1000;
    requestSuccessfulDmRemove(firstUser.token, firstDmId);
    const afterDmRemove = Date.now() / 1000;

    // dm has been removed so num mesages should go down
    usersStatsReturn = requestSuccessfulUsersStats(firstUser.token);
    expect(usersStatsReturn.workspaceStats.messagesExist).toStrictEqual(
      [
        { numMessagesExist: 0, timeStamp: expect.any(Number) },
        { numMessagesExist: 1, timeStamp: expect.any(Number) },
        { numMessagesExist: 2, timeStamp: expect.any(Number) },
        { numMessagesExist: 0, timeStamp: expect.any(Number) }
      ]
    );
    // Utilization should decrease down to 0
    expect(usersStatsReturn.workspaceStats.utilizationRate).toStrictEqual(0);
    const dmRemoveTimeStamp = usersStatsReturn.workspaceStats.messagesExist[3].timeStamp;
    expect(dmRemoveTimeStamp).toBeGreaterThanOrEqual(beforeDmRemove);
    expect(dmRemoveTimeStamp).toBeLessThanOrEqual(afterDmRemove);
  });

  test('Sharing a message counts as a message sent', () => {
    // Share a dm message
    const firstDmId = requestSuccessfulDmCreate(firstUser.token, []).dmId;
    const dmMsgId = requestSuccessfulSendDm(firstUser.token, firstDmId, 'Hi').messageId;
    requestSuccessfulMessageShare(firstUser.token, dmMsgId, 'Hi!', -1, firstDmId);
    usersStatsReturn = requestSuccessfulUsersStats(firstUser.token);
    expect(usersStatsReturn.workspaceStats.messagesExist).toStrictEqual(
      [
        { numMessagesExist: 0, timeStamp: expect.any(Number) },
        { numMessagesExist: 1, timeStamp: expect.any(Number) },
        { numMessagesExist: 2, timeStamp: expect.any(Number) }
      ]
    );

    // Share a channel message
    const firstChannelId = requestSuccessfulChannelsCreate(
      firstUser.token, 'First Channel', true).channelId;
    const channelMsgId = requestSuccessfulSendMessage(firstUser.token, firstChannelId,
      'Channel message').messageId;
    requestSuccessfulMessageShare(firstUser.token, channelMsgId, 'Hi!', firstChannelId, -1);
    usersStatsReturn = requestSuccessfulUsersStats(firstUser.token);
    expect(usersStatsReturn.workspaceStats.messagesExist).toStrictEqual(
      [
        { numMessagesExist: 0, timeStamp: expect.any(Number) },
        { numMessagesExist: 1, timeStamp: expect.any(Number) },
        { numMessagesExist: 2, timeStamp: expect.any(Number) },
        { numMessagesExist: 3, timeStamp: expect.any(Number) },
        { numMessagesExist: 4, timeStamp: expect.any(Number) }
      ]
    );
  });

  // message is edited to empty so is removed affect num messages
});

describe('Throws http exception', () => {
  test('Token is invalid', () => {
    firstUser = requestSuccessfulAuthRegister(
      'emailer@gmail.com', 'password', 'First', 'User');
    expect(requestErrorUsersStats(firstUser.token + 'A')).toStrictEqual(TOKEN_ERROR);
  });
});
