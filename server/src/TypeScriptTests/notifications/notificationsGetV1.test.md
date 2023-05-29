import { requestClear } from '../../Helpers/requests/requestOtherHelper';
import { requestSuccessfulAuthRegister } from '../../Helpers/requests/requestAuthHelper';
import { requestSuccessfulChannelsCreate } from '../../Helpers/requests/requestChannelsHelper';
import { requestSuccessfulChannelInvite, requestSuccessfulChannelLeave } from '../../Helpers/requests/requestChannelHelper';
import { requestSuccessfulDmCreate, requestSuccessfulDmLeave } from '../../Helpers/requests/requestDmHelper';
import { requestSuccessfulEditMessage, requestSuccessfulMessageReact, requestSuccessfulSendDm, requestSuccessfulSendMessage } from '../../Helpers/requests/requestMessageHelper';
import { requestSuccessfulNotificationsGet, requestErrorNotificationsGet } from '../../Helpers/requests/requestNotificationsHelper';
const AUTH_ERROR = 403;

// For every test, makes a dm and channel with first user and second user
let firstUser: {token: string, authUserId: number};
let secondUser: {token: string, authUserId: number};

let firstChannelId: number;
let firstChannelName: string;
let firstDmId: number;
let firstDmName: string;

beforeEach(() => {
  requestClear();
  firstUser = requestSuccessfulAuthRegister('emailer@gmail.com', 'password', 'First', 'User');
  secondUser = requestSuccessfulAuthRegister('seconduser@gmail.com', 'password', 'Second', 'User');

  // First user invites second user to channel
  firstChannelName = 'First Channel';
  firstChannelId = requestSuccessfulChannelsCreate(firstUser.token, firstChannelName, true).channelId;
  requestSuccessfulChannelInvite(firstUser.token, firstChannelId, secondUser.authUserId);

  firstDmId = requestSuccessfulDmCreate(firstUser.token, [secondUser.authUserId]).dmId;
  firstDmName = 'firstuser, seconduser';
});

afterAll(() => {
  requestClear();
});

describe('Successful notifications get', () => {
  test('User has 0 notifications', () => {
    const notifGet = requestSuccessfulNotificationsGet(firstUser.token);
    expect(notifGet).toStrictEqual({ notifications: [] });
  });

  describe('User has notification(s) from channel', () => {
    test('notification when user is tagged', () => {
      // First user gets tagged in a message sent by second user
      const notifGetBefore = requestSuccessfulNotificationsGet(firstUser.token);
      expect(notifGetBefore).toStrictEqual({ notifications: [] });

      // The end of the handle is signified by the end of the message, or a non-alphanumeric character.
      requestSuccessfulSendMessage(
        secondUser.token, firstChannelId, 'wanna touch grass w me today? @firstuser');

      const notifGetAfter = requestSuccessfulNotificationsGet(firstUser.token);
      expect(notifGetAfter).toStrictEqual(
        {
          notifications: [
            {
              channelId: firstChannelId,
              // dmId is the DM that the event happened in,
              // and is -1 if it is being sent to a channel
              // Refer to 6.1.4. Iteration 3+ Input/Output Types table
              dmId: -1,
              // Only the first 20 characters of the message is displayed
              notificationMessage:
              `seconduser tagged you in ${firstChannelName}: wanna touch grass w `
            }
          ]
        }
      );
    });

    test('notification when user\'s message is reacted to + remains when user leaves', () => {
      // Second user reacts to first user's message
      const msgId = requestSuccessfulSendMessage(
        firstUser.token, firstChannelId, 'Iteration 3 is very long').messageId;
      // Currently can only react with a reactId of 1
      requestSuccessfulMessageReact(secondUser.token, msgId, 1);
      const notifGetBeforeLeave = requestSuccessfulNotificationsGet(firstUser.token);
      const notifReact = {
        channelId: firstChannelId,
        dmId: -1,
        notificationMessage:
        `seconduser reacted to your message in ${firstChannelName}`
      };
      expect(notifGetBeforeLeave).toStrictEqual({ notifications: [notifReact] });

      // Assumed behaviour
      // firstuser leaves DM but notification remains
      requestSuccessfulChannelLeave(firstUser.token, firstChannelId);
      const notifGetAfter = requestSuccessfulNotificationsGet(firstUser.token);
      expect(notifGetAfter).toStrictEqual({ notifications: [notifReact] });
    });
  });

  describe('User has notification(s) from DM', () => {
    test('notification when user is tagged', () => {
      const notifGetBeforeTag = requestSuccessfulNotificationsGet(firstUser.token);
      expect(notifGetBeforeTag).toStrictEqual({ notifications: [] });
      requestSuccessfulSendDm(
        secondUser.token, firstChannelId, 'wanna touch grass w me today @firstuser?');
      const notifGetAfter = requestSuccessfulNotificationsGet(firstUser.token);
      expect(notifGetAfter).toStrictEqual(
        {
          notifications: [
            {
              channelId: -1,
              dmId: firstDmId,
              // Only the first 20 characters of the message is displayed
              notificationMessage:
              `seconduser tagged you in ${firstDmName}: wanna touch grass w `
            }
          ]
        }
      );
    });

    test('notification when user\'s message is reacted to + remains when user leaves', () => {
      // Second user reacts to first user's message
      const msgId = requestSuccessfulSendDm(
        firstUser.token, firstChannelId, 'Iteration 3 is very long').messageId;
      // Currently can only react with a reactId of 1
      requestSuccessfulMessageReact(secondUser.token, msgId, 1);
      const notifGetBefore = requestSuccessfulNotificationsGet(firstUser.token);
      const notifReact = {
        channelId: -1,
        dmId: firstDmId,
        notificationMessage:
        `seconduser reacted to your message in ${firstDmName}`
      };
      expect(notifGetBefore).toStrictEqual({ notifications: [notifReact] });

      // Assumed behaviour
      // firstuser leaves DM but notification remains
      requestSuccessfulDmLeave(firstUser.token, firstDmId);
      const notifGetAfter = requestSuccessfulNotificationsGet(firstUser.token);
      expect(notifGetAfter).toStrictEqual({ notifications: [notifReact] });
    });

    test('Dm created with 3 other people', () => {
      const thirdUser = requestSuccessfulAuthRegister(
        'thirduser@gmail.com', 'password', 'Third', 'User');
      const fourthUser = requestSuccessfulAuthRegister(
        'fourthUser@gmail.com', 'password', 'Fourth', 'User');
      // Create new DM
      const newDmId = requestSuccessfulDmCreate(firstUser.token,
        [secondUser.authUserId, thirdUser.authUserId, fourthUser.authUserId]).dmId;

      const newDmName = 'firstuser, fourthuser, seconduser, thirduser';
      // Check all 3 users are notified
      const addToDmNotif = {
        channelId: -1,
        dmId: newDmId,
        notificationMessage:
        `firstuser added you to ${newDmName}`
      };
      // Second user has 3 notifications total from all channel and DMs they were add to
      const secondUserNotifGet = requestSuccessfulNotificationsGet(secondUser.token);
      expect(secondUserNotifGet).toStrictEqual(
        {
          notifications: [
            addToDmNotif,
            {
              channelId: -1,
              dmId: firstDmId,
              notificationMessage:
              `firstuser added you to ${firstDmName}`
            },
            {
              channelId: firstChannelId,
              dmId: -1,
              notificationMessage:
              `firstuser added you to ${firstChannelName}`
            }
          ]
        }
      );
      const thirdUserNotifGet = requestSuccessfulNotificationsGet(thirdUser.token);
      expect(thirdUserNotifGet).toStrictEqual({ notifications: [addToDmNotif] });
      const fourthUserNotifGet = requestSuccessfulNotificationsGet(fourthUser.token);
      expect(fourthUserNotifGet).toStrictEqual({ notifications: [addToDmNotif] });
    });
  });

  test('User added to both channel and newly created DM', () => {
    // Second user gets notified when added to the channel
    const notifGet = requestSuccessfulNotificationsGet(secondUser.token);
    expect(notifGet).toStrictEqual(
      {
        // second user was added to channel first then DM
        // Notifications ordered from most recent to least recent
        notifications: [
          {
            channelId: -1,
            dmId: firstDmId,
            notificationMessage:
            `firstuser added you to ${firstDmName}`
          },
          {
            channelId: firstChannelId,
            dmId: -1,
            notificationMessage:
            `firstuser added you to ${firstChannelName}`
          }
        ]
      }
    );
  });

  describe('Successful notification due to tag behaviour edge cases', () => {
    test('Message edited to have tag', () => {
      // Refer to 6.10.2 Tagging:
      // Tagging should also occur when messages are edited to contain tags

      // Second user sends message then edits it to contain tag to first user
      const msgId = requestSuccessfulSendMessage(
        secondUser.token, firstChannelId, 'Iteration 3 is very long').messageId;
      requestSuccessfulEditMessage(secondUser.token, msgId, 'Iteration 3 is very long @firstuser');
      const tagNotif = {
        channelId: firstChannelId,
        dmId: -1,
        notificationMessage:
        `seconduser tagged you in ${firstChannelName}: Iteration 3 is very `
      };
      const notifGet = requestSuccessfulNotificationsGet(firstUser.token);
      expect(notifGet.notifications.length).toStrictEqual(1);
      expect(notifGet).toStrictEqual({ notifications: [tagNotif] });
    });

    // test('Optional message in message share contains tag', () => {
    //   // Refer to 6.10.2 Tagging
    //   // Tagging should also occur ... when the message/share optional message contains tags.
    // });

    // test('user is notified if they tag themselves in message', () => {
    //   // Refer to 6.10.1 Notifications
    //   requestSuccessfulSendMessage(
    //     secondUser.token, firstChannelId, '@firstuser too good');
    //   const notifGet = requestSuccessfulNotificationsGet(firstUser.token);
    //   expect(notifGet).toStrictEqual(
    //     {
    //       notifications: [
    //         {
    //           channelId: firstChannelId,
    //           dmId: -1,
    //           notificationMessage:
    //           `seconduser tagged you in ${firstChannelName}: @firstuser too good`
    //         }
    //       ]
    //     }
    //   );
    // });
  });
});

describe('http error', () => {
  test('Invalid token', () => {
    const notifGetAttempt = requestErrorNotificationsGet(firstUser.token + secondUser.token);
    expect(notifGetAttempt).toStrictEqual(AUTH_ERROR);
  });
});
