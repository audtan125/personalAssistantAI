import { userStatsReturn } from '../dataStore';
import { requestSuccessfulAuthRegister } from '../Helpers/requests/requestAuthHelper';
import { requestSuccessfulChannelInvite, requestSuccessfulChannelJoin, requestSuccessfulChannelLeave } from '../Helpers/requests/requestChannelHelper';
import { requestSuccessfulChannelsCreate } from '../Helpers/requests/requestChannelsHelper';
import { requestSuccessfulDmCreate, requestSuccessfulDmLeave, requestSuccessfulDmRemove } from '../Helpers/requests/requestDmHelper';
import { requestSuccessfulMessageRemove, requestSuccessfulSendDm, requestSuccessfulSendDmMessageLater, requestSuccessfulSendMessage, requestSuccessfulSendMessageLater } from '../Helpers/requests/requestMessageHelper';
import { requestClear } from '../Helpers/requests/requestOtherHelper';
import { requestSuccessfulStandupSend, requestSuccessfulStandupStart } from '../Helpers/requests/requestStandupHelper';
import { sleep } from '../Helpers/sleep';
import { requestErrorUserStats, requestSuccessfulUserStats } from './requestStatsHelper';
const TOKEN_ERROR = 403;

let firstUser: {token: string, authUserId: number};
let userStats: {userStats: userStatsReturn};
beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

test('User has no stats', () => {
  const beforeRegister = Date.now() / 1000;
  firstUser = requestSuccessfulAuthRegister(
    'emailer@gmail.com', 'password', 'First', 'User');
  const afterRegister = Date.now() / 1000;

  userStats = requestSuccessfulUserStats(firstUser.token);
  expect(userStats).toStrictEqual(
    // 7.10. Analytics
    // For users, the first data point should be 0 for all metrics at the time that their account was created
    {
      userStats: {
        channelsJoined: [{ numChannelsJoined: 0, timeStamp: expect.any(Number) }],
        dmsJoined: [{ numDmsJoined: 0, timeStamp: expect.any(Number) }],
        messagesSent: [{ numMessagesSent: 0, timeStamp: expect.any(Number) }],
        involvementRate: 0
      }
    }
  );

  // test timestamps are all correct
  expect(
    userStats.userStats.channelsJoined[0].timeStamp
  ).toBeGreaterThanOrEqual(beforeRegister);
  expect(
    userStats.userStats.channelsJoined[0].timeStamp
  ).toBeLessThanOrEqual(afterRegister);

  expect(
    userStats.userStats.dmsJoined[0].timeStamp
  ).toBeGreaterThanOrEqual(beforeRegister);
  expect(
    userStats.userStats.dmsJoined[0].timeStamp
  ).toBeLessThanOrEqual(afterRegister);

  expect(
    userStats.userStats.messagesSent[0].timeStamp
  ).toBeGreaterThanOrEqual(beforeRegister);
  expect(
    userStats.userStats.messagesSent[0].timeStamp
  ).toBeLessThanOrEqual(afterRegister);
});

describe('Successful return', () => {
  beforeEach(() => {
    firstUser = requestSuccessfulAuthRegister(
      'emailer@gmail.com', 'password', 'First', 'User');
  });

  test('User creates a channel and a dm and sends a message to each', () => {
    // Create channel
    const beforeCreateChannel = Date.now() / 1000;
    const firstChannelId = requestSuccessfulChannelsCreate(
      firstUser.token, 'First Channel', true).channelId;
    const AfterCreateChannel = Date.now() / 1000;
    // Check user stats
    userStats = requestSuccessfulUserStats(firstUser.token);
    expect(userStats).toStrictEqual(
      {
        userStats: {
          channelsJoined: [
            { numChannelsJoined: 0, timeStamp: expect.any(Number) },
            { numChannelsJoined: 1, timeStamp: expect.any(Number) }
          ],
          dmsJoined: [{ numDmsJoined: 0, timeStamp: expect.any(Number) }],
          messagesSent: [{ numMessagesSent: 0, timeStamp: expect.any(Number) }],
          involvementRate: 1
        }
      }
    );
    // Check time stamp
    const channelCreateTimeStamps = userStats.userStats.channelsJoined[1].timeStamp;
    expect(channelCreateTimeStamps).toBeGreaterThanOrEqual(beforeCreateChannel);
    expect(channelCreateTimeStamps).toBeLessThanOrEqual(AfterCreateChannel);

    // Create dm
    const beforeCreateDm = Date.now() / 1000;
    const firstDmId = requestSuccessfulDmCreate(
      firstUser.token, []).dmId;
    const AfterCreateDm = Date.now() / 1000;
    // Check user stats
    userStats = requestSuccessfulUserStats(firstUser.token);
    expect(userStats).toStrictEqual(
      {
        userStats: {
          channelsJoined: [
            { numChannelsJoined: 0, timeStamp: expect.any(Number) },
            { numChannelsJoined: 1, timeStamp: expect.any(Number) }
          ],
          dmsJoined: [
            { numDmsJoined: 0, timeStamp: expect.any(Number) },
            { numDmsJoined: 1, timeStamp: expect.any(Number) }
          ],
          messagesSent: [{ numMessagesSent: 0, timeStamp: expect.any(Number) }],
          involvementRate: 1
        }
      }
    );
    // Check time stamp
    const dmCreateTimeStamp = userStats.userStats.dmsJoined[1].timeStamp;
    expect(dmCreateTimeStamp).toBeGreaterThanOrEqual(beforeCreateDm);
    expect(dmCreateTimeStamp).toBeLessThanOrEqual(AfterCreateDm);

    // Send message into dm
    const beforeSendDm = Date.now() / 1000;
    requestSuccessfulSendDm(firstUser.token, firstDmId, 'First message sent');
    const AfterSendDm = Date.now() / 1000;
    // Check user stats
    userStats = requestSuccessfulUserStats(firstUser.token);
    expect(userStats).toStrictEqual(
      {
        userStats: {
          channelsJoined: [
            { numChannelsJoined: 0, timeStamp: expect.any(Number) },
            { numChannelsJoined: 1, timeStamp: expect.any(Number) }
          ],
          dmsJoined: [
            { numDmsJoined: 0, timeStamp: expect.any(Number) },
            { numDmsJoined: 1, timeStamp: expect.any(Number) }
          ],
          messagesSent: [
            { numMessagesSent: 0, timeStamp: expect.any(Number) },
            { numMessagesSent: 1, timeStamp: expect.any(Number) }
          ],
          involvementRate: 1
        }
      }
    );
    // Check time stamp
    const SendDmTimeStamp = userStats.userStats.messagesSent[1].timeStamp;
    expect(SendDmTimeStamp).toBeGreaterThanOrEqual(beforeSendDm);
    expect(SendDmTimeStamp).toBeLessThanOrEqual(AfterSendDm);

    // Send message into channel
    const beforeSendChannelMsg = Date.now() / 1000;
    requestSuccessfulSendMessage(firstUser.token, firstChannelId, 'Second message to exist');
    const afterSendChannelMsg = Date.now() / 1000;
    // Check user stats
    userStats = requestSuccessfulUserStats(firstUser.token);
    expect(userStats).toStrictEqual(
      {
        userStats: {
          channelsJoined: [
            { numChannelsJoined: 0, timeStamp: expect.any(Number) },
            { numChannelsJoined: 1, timeStamp: expect.any(Number) }
          ],
          dmsJoined: [
            { numDmsJoined: 0, timeStamp: expect.any(Number) },
            { numDmsJoined: 1, timeStamp: expect.any(Number) }
          ],
          messagesSent: [
            { numMessagesSent: 0, timeStamp: expect.any(Number) },
            { numMessagesSent: 1, timeStamp: expect.any(Number) },
            { numMessagesSent: 2, timeStamp: expect.any(Number) }
          ],
          involvementRate: 1
        }
      }
    );
    // Check time stamp
    const SendChannelMsgTimeStamp = userStats.userStats.messagesSent[2].timeStamp;
    expect(SendChannelMsgTimeStamp).toBeGreaterThanOrEqual(beforeSendChannelMsg);
    expect(SendChannelMsgTimeStamp).toBeLessThanOrEqual(afterSendChannelMsg);
  });

  test(`First user creates a channel and second user joins then 
  sends messages to it (test involvement rate is correct)`, () => {
    // Create second user who joins channel
    const secondUser = requestSuccessfulAuthRegister(
      'seconduser@gmail.com', 'password', 'Second', 'User'
    );
    const firstChannelId = requestSuccessfulChannelsCreate(
      firstUser.token, 'First Channel', true).channelId;

    // Check the involvement rate for second user BEFORE
    // they join the channel
    userStats = requestSuccessfulUserStats(secondUser.token);
    expect(userStats.userStats.involvementRate).toStrictEqual(0);

    // Second user joins the first channel
    const beforeChannelJoin = Date.now() / 1000;
    requestSuccessfulChannelJoin(secondUser.token, firstChannelId);
    const afterChannelJoin = Date.now() / 1000;
    // Check the user stats for first user after this join
    userStats = requestSuccessfulUserStats(firstUser.token);
    expect(userStats.userStats.channelsJoined).toContainEqual(
      { numChannelsJoined: 1, timeStamp: expect.any(Number) }
    );
    expect(userStats.userStats.involvementRate).toStrictEqual(1);
    // Check the user stats for second user after this join
    userStats = requestSuccessfulUserStats(secondUser.token);
    expect(userStats.userStats.channelsJoined).toContainEqual(
      { numChannelsJoined: 1, timeStamp: expect.any(Number) }
    );
    expect(userStats.userStats.involvementRate).toStrictEqual(1);
    // Check time stamp for this join
    const channelJoinTimeStamp = userStats.userStats.channelsJoined[1].timeStamp;
    expect(channelJoinTimeStamp).toBeGreaterThanOrEqual(beforeChannelJoin);
    expect(channelJoinTimeStamp).toBeLessThanOrEqual(afterChannelJoin);

    // Second user sends message to channel
    requestSuccessfulSendMessage(secondUser.token, firstChannelId, 'First message');
    // Check the involvement rate for first user
    userStats = requestSuccessfulUserStats(firstUser.token);
    expect(userStats.userStats.involvementRate).toStrictEqual(0.5);
    // Check the involvement rate for second user
    userStats = requestSuccessfulUserStats(secondUser.token);
    expect(userStats.userStats.involvementRate).toStrictEqual(1);

    // Second user sends another message to channel
    requestSuccessfulSendMessage(secondUser.token, firstChannelId, 'Second message');
    // Check the involvement rate for first user
    userStats = requestSuccessfulUserStats(firstUser.token);
    expect(userStats.userStats.involvementRate).toStrictEqual(1 / 3);
    expect(userStats.userStats.messagesSent).not.toContainEqual(
      { numMessagesSent: 1, timeStamp: expect.any(Number) }
    );
    // Check the involvement rate for second user
    userStats = requestSuccessfulUserStats(secondUser.token);
    expect(userStats.userStats.involvementRate).toStrictEqual(1);
    expect(userStats.userStats.messagesSent).toContainEqual(
      { numMessagesSent: 1, timeStamp: expect.any(Number) }
    );
  });

  test('First user creates a dm and second user sends messages to it (test involvement rate is correct)', () => {
    const secondUser = requestSuccessfulAuthRegister(
      'seconduser@gmail.com', 'password', 'Second', 'User'
    );
    const beforeDmCreate = Date.now() / 1000;
    const firstDmId = requestSuccessfulDmCreate(
      firstUser.token, [secondUser.authUserId]).dmId;
    const afterDmCreate = Date.now() / 1000;

    // Check the user stats for second user after dm created
    userStats = requestSuccessfulUserStats(secondUser.token);
    expect(userStats.userStats.dmsJoined).toContainEqual(
      { numDmsJoined: 1, timeStamp: expect.any(Number) }
    );
    expect(userStats.userStats.involvementRate).toStrictEqual(1);
    // Check time stamp for this join
    const dmCreateTimeStamp = userStats.userStats.dmsJoined[1].timeStamp;
    expect(dmCreateTimeStamp).toBeGreaterThanOrEqual(beforeDmCreate);
    expect(dmCreateTimeStamp).toBeLessThanOrEqual(afterDmCreate);

    // Second user sends message to dm
    requestSuccessfulSendDm(secondUser.token, firstDmId, 'First message');
    // Check the involvement rate for first user
    userStats = requestSuccessfulUserStats(firstUser.token);
    expect(userStats.userStats.involvementRate).toStrictEqual(0.5);
    // Check the involvement rate for second user
    userStats = requestSuccessfulUserStats(secondUser.token);
    expect(userStats.userStats.involvementRate).toStrictEqual(1);

    // Second user sends another message to dm
    requestSuccessfulSendDm(secondUser.token, firstDmId, 'Second message');
    // Check the involvement rate for first user
    userStats = requestSuccessfulUserStats(firstUser.token);
    expect(userStats.userStats.involvementRate).toStrictEqual(1 / 3);
    expect(userStats.userStats.messagesSent).not.toContainEqual(
      { numMessagesSent: 1, timeStamp: expect.any(Number) }
    );
    // Check the involvement rate for second user
    userStats = requestSuccessfulUserStats(secondUser.token);
    expect(userStats.userStats.messagesSent).toContainEqual(
      { numMessagesSent: 1, timeStamp: expect.any(Number) }
    );
    expect(userStats.userStats.involvementRate).toStrictEqual(1);
  });

  test('Inviting second user into channel', () => {
    // Create second user who joins channel
    const secondUser = requestSuccessfulAuthRegister(
      'seconduser@gmail.com', 'password', 'Second', 'User'
    );
    const firstChannelId = requestSuccessfulChannelsCreate(
      firstUser.token, 'First Channel', true).channelId;

    // Check the user stats for second user BEFORE
    // they join the channel
    userStats = requestSuccessfulUserStats(secondUser.token);
    expect(userStats.userStats.channelsJoined).not.toContainEqual(
      { numChannelsJoined: 1, timeStamp: expect.any(Number) }
    );
    expect(userStats.userStats.involvementRate).toStrictEqual(0);

    // First user invites second user into channel
    const beforeChannelInvite = Date.now() / 1000;
    requestSuccessfulChannelInvite(firstUser.token, firstChannelId, secondUser.authUserId);
    const afterChannelInvite = Date.now() / 1000;

    // Check the user stats for second user after this join
    userStats = requestSuccessfulUserStats(secondUser.token);
    expect(userStats.userStats.channelsJoined).toContainEqual(
      { numChannelsJoined: 1, timeStamp: expect.any(Number) }
    );
    expect(userStats.userStats.involvementRate).toStrictEqual(1);
    // Check time stamp for this join
    const channelInviteTimeStamp = userStats.userStats.channelsJoined[1].timeStamp;
    expect(channelInviteTimeStamp).toBeGreaterThanOrEqual(beforeChannelInvite);
    expect(channelInviteTimeStamp).toBeLessThanOrEqual(afterChannelInvite);
  });

  test('Removal of messages does not decrease num messages stat', () => {
    const firstChannelId = requestSuccessfulChannelsCreate(
      firstUser.token, 'First Channel', true).channelId;
    const firstMsgId = requestSuccessfulSendMessage(
      firstUser.token, firstChannelId, 'First message').messageId;

    userStats = requestSuccessfulUserStats(firstUser.token);
    expect(userStats.userStats.messagesSent).toContainEqual(
      { numMessagesSent: 1, timeStamp: expect.any(Number) }
    );
    expect(userStats.userStats.messagesSent.length).toStrictEqual(2);
    expect(userStats.userStats.involvementRate).toStrictEqual(1);
    // Remove message
    requestSuccessfulMessageRemove(firstUser.token, firstMsgId);
    // Expect involvement rate to still be 1 and message to still show up in stats

    userStats = requestSuccessfulUserStats(firstUser.token);
    expect(userStats.userStats.messagesSent).toContainEqual(
      { numMessagesSent: 1, timeStamp: expect.any(Number) }
    );
    expect(userStats.userStats.messagesSent.length).toStrictEqual(2);
    expect(userStats.userStats.involvementRate).toStrictEqual(1);
  });

  test('Leaving channel decreases involvement rate', () => {
    const firstChannelId = requestSuccessfulChannelsCreate(
      firstUser.token, 'First Channel', true).channelId;

    // Check user stats before leave channel
    userStats = requestSuccessfulUserStats(firstUser.token);
    expect(userStats.userStats.channelsJoined).toStrictEqual(
      [
        { numChannelsJoined: 0, timeStamp: expect.any(Number) },
        { numChannelsJoined: 1, timeStamp: expect.any(Number) }
      ]
    );
    expect(userStats.userStats.involvementRate).toStrictEqual(1);

    // Leaves channel
    requestSuccessfulChannelLeave(firstUser.token, firstChannelId);

    // Check user stats after leave channel
    userStats = requestSuccessfulUserStats(firstUser.token);
    expect(userStats.userStats.channelsJoined).toStrictEqual(
      [
        { numChannelsJoined: 0, timeStamp: expect.any(Number) },
        { numChannelsJoined: 1, timeStamp: expect.any(Number) },
        { numChannelsJoined: 0, timeStamp: expect.any(Number) }
      ]
    );
    expect(userStats.userStats.involvementRate).toStrictEqual(0);
  });

  test('Leaving dm decreases involvement rate', () => {
    const firstDmId = requestSuccessfulDmCreate(
      firstUser.token, []).dmId;
    // Check user stats before leave dm
    userStats = requestSuccessfulUserStats(firstUser.token);
    expect(userStats.userStats.dmsJoined).toStrictEqual(
      [
        { numDmsJoined: 0, timeStamp: expect.any(Number) },
        { numDmsJoined: 1, timeStamp: expect.any(Number) }
      ]
    );
    expect(userStats.userStats.involvementRate).toStrictEqual(1);

    // Leave dm
    requestSuccessfulDmLeave(firstUser.token, firstDmId);

    // Check user stats after leave dm
    userStats = requestSuccessfulUserStats(firstUser.token);
    expect(userStats.userStats.dmsJoined).toStrictEqual(
      [
        { numDmsJoined: 0, timeStamp: expect.any(Number) },
        { numDmsJoined: 1, timeStamp: expect.any(Number) },
        { numDmsJoined: 0, timeStamp: expect.any(Number) }
      ]
    );
    expect(userStats.userStats.involvementRate).toStrictEqual(0);
  });

  test('dm remove decreases involvement rate', () => {
    const secondUser = requestSuccessfulAuthRegister(
      'seconduser@gmail.com', 'password', 'Second', 'User'
    );
    const firstDmId = requestSuccessfulDmCreate(
      firstUser.token, [secondUser.authUserId]).dmId;

    // second user sends message into dm
    requestSuccessfulSendDm(
      secondUser.token, firstDmId,
      'My num messages sent will not decrease when dm gets removed!');

    // Check user stats before leave dm
    let firstUserStats = requestSuccessfulUserStats(firstUser.token);
    expect(firstUserStats.userStats.dmsJoined).toContainEqual(
      { numDmsJoined: 1, timeStamp: expect.any(Number) }
    );
    expect(firstUserStats.userStats.involvementRate).toStrictEqual(0.5);

    let secondUserStats = requestSuccessfulUserStats(secondUser.token);
    expect(secondUserStats.userStats.dmsJoined).toContainEqual(
      { numDmsJoined: 1, timeStamp: expect.any(Number) }
    );
    expect(secondUserStats.userStats.involvementRate).toStrictEqual(1);

    // remove dm
    requestSuccessfulDmRemove(firstUser.token, firstDmId);

    // Check user stats after leave dm
    firstUserStats = requestSuccessfulUserStats(firstUser.token);
    expect(firstUserStats.userStats.dmsJoined).toStrictEqual(
      [
        { numDmsJoined: 0, timeStamp: expect.any(Number) },
        { numDmsJoined: 1, timeStamp: expect.any(Number) },
        { numDmsJoined: 0, timeStamp: expect.any(Number) }
      ]
    );
    expect(firstUserStats.userStats.involvementRate).toStrictEqual(0);

    secondUserStats = requestSuccessfulUserStats(secondUser.token);
    expect(secondUserStats.userStats.dmsJoined).toStrictEqual(
      [
        { numDmsJoined: 0, timeStamp: expect.any(Number) },
        { numDmsJoined: 1, timeStamp: expect.any(Number) },
        { numDmsJoined: 0, timeStamp: expect.any(Number) }
      ]
    );
    expect(secondUserStats.userStats.messagesSent).toStrictEqual(
      [
        { numMessagesSent: 0, timeStamp: expect.any(Number) },
        { numMessagesSent: 1, timeStamp: expect.any(Number) }
      ]
    );
    // Involvement rate will be 1 / 0 so involvement rate should be 0
    expect(secondUserStats.userStats.involvementRate).toStrictEqual(0);
  });

  test('Involvement rate is capped at 1', () => {
    // Send two messages into channel, remove both messages
    const firstChannelId = requestSuccessfulChannelsCreate(
      firstUser.token, 'First Channel', true).channelId;
    const firstMsgId = requestSuccessfulSendMessage(
      firstUser.token, firstChannelId, 'First message').messageId;
    const secondMsgId = requestSuccessfulSendMessage(
      firstUser.token, firstChannelId, 'Second message').messageId;
    requestSuccessfulMessageRemove(firstUser.token, firstMsgId);
    requestSuccessfulMessageRemove(firstUser.token, secondMsgId);

    // Involvment rate is greater than 1:
    // sum(numChannelsJoined, numDmsJoined, numMsgsSent)/sum(numChannels, numDms, numMsgs)
    // = (1 + 0 + 2) / (1 + 0 + 0) = 3
    userStats = requestSuccessfulUserStats(firstUser.token);
    expect(userStats.userStats.involvementRate).toStrictEqual(1);
  });

  test('message send later, send later dm and standup increases num msgs send', () => {
    const firstChannelId = requestSuccessfulChannelsCreate(
      firstUser.token, 'First Channel', true).channelId;
    const firstDmId = requestSuccessfulDmCreate(
      firstUser.token, []).dmId;

    requestSuccessfulSendMessageLater(
      firstUser.token, firstChannelId, 'send later in channel',
      (Date.now() / 1000) + 1
    );

    requestSuccessfulSendDmMessageLater(
      firstUser.token, firstDmId, 'send later in dm',
      (Date.now() / 1000) + 1
    );

    // After 1.5 seconds both messages are sent
    sleep(1.5);
    let firstUserStats = requestSuccessfulUserStats(firstUser.token);
    expect(firstUserStats.userStats.messagesSent).toStrictEqual(
      [
        { numMessagesSent: 0, timeStamp: expect.any(Number) },
        { numMessagesSent: 1, timeStamp: expect.any(Number) },
        { numMessagesSent: 2, timeStamp: expect.any(Number) }
      ]
    );

    // Second user joins channel and sends a standup
    const secondUser = requestSuccessfulAuthRegister(
      'seconduser@gmail.com', 'password', 'Second', 'User'
    );
    requestSuccessfulChannelJoin(secondUser.token, firstChannelId);

    // Start standup for 2 seconds
    requestSuccessfulStandupStart(firstUser.token, firstChannelId, 2);
    sleep(0.5);
    requestSuccessfulStandupSend(secondUser.token, firstChannelId, 'Standup msg');

    // standup is over
    // First user has sent standup summary message
    sleep(2);
    firstUserStats = requestSuccessfulUserStats(firstUser.token);
    expect(firstUserStats.userStats.messagesSent).toStrictEqual(
      [
        { numMessagesSent: 0, timeStamp: expect.any(Number) },
        { numMessagesSent: 1, timeStamp: expect.any(Number) },
        { numMessagesSent: 2, timeStamp: expect.any(Number) },
        { numMessagesSent: 3, timeStamp: expect.any(Number) }
      ]
    );

    // second user's standup send does not increase num msgs sent
    const secondUserStats = requestSuccessfulUserStats(secondUser.token);
    expect(secondUserStats.userStats.messagesSent).toStrictEqual(
      [{ numMessagesSent: 0, timeStamp: expect.any(Number) }]
    );
  });
});

describe('Throw http exception', () => {
  test('Token is invalid', () => {
    firstUser = requestSuccessfulAuthRegister(
      'emailer@gmail.com', 'password', 'First', 'User');
    expect(requestErrorUserStats(firstUser.token + 'A')).toStrictEqual(TOKEN_ERROR);
  });
});
