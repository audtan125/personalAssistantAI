import { requestSuccessfulAuthRegister } from '../../Helpers/requests/requestAuthHelper';
import { requestSuccessfulSendDm, requestSuccessfulSendMessage } from '../../Helpers/requests/requestMessageHelper';
import { requestSuccessfulChannelsCreate } from '../../Helpers/requests/requestChannelsHelper';
import { requestSuccessfulDmCreate } from '../../Helpers/requests/requestDmHelper';
import { requestClear } from '../../Helpers/requests/requestOtherHelper';
import {
  requestSuccessfulSearch, requestErrorSearch
} from '../../Helpers/requests/requestSearchHelper';
import { requestSuccessfulChannelJoin } from '../../Helpers/requests/requestChannelHelper';
import { message } from '../../dataStore';

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

const ERROR = 400;
const TOKEN_ERROR = 403;

// Creates two users. The secondUser is in a channel with a few messages.
let globalOwner : {token: string, authUserId: number};
let secondUser : {token: string, authUserId: number};
let firstChannelId: number;
beforeEach(() => {
  requestClear();
  globalOwner = requestSuccessfulAuthRegister('emailer@gmail.com', 'password', 'Test', 'User');
  secondUser = requestSuccessfulAuthRegister('seconduser@gmail.com', 'password', 'Second', 'User');
  firstChannelId = requestSuccessfulChannelsCreate(
    secondUser.token, 'Test Channel', true
  ).channelId;
});

afterAll(() => {
  requestClear();
});

describe('Success messages returned', () => {
  const msgObjList: message[] = [];
  beforeEach(() => {
    // Adds a few messages to the channel.
    msgObjList.push(
      {
        messageId: requestSuccessfulSendMessage(
          secondUser.token, firstChannelId, 'hello1somethinghellohello'
        ).messageId,
        uId: secondUser.authUserId,
        message: 'hello1somethinghellohello',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false
      }
    );
    msgObjList.push(
      {
        messageId: requestSuccessfulSendMessage(
          secondUser.token, firstChannelId, 'abcjgjrgjoebmrbsomethin'
        ).messageId,
        uId: secondUser.authUserId,
        message: 'abcjgjrgjoebmrbsomethin',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false
      }
    );
    msgObjList.push(
      {
        messageId: requestSuccessfulSendMessage(
          secondUser.token, firstChannelId, 'some HELPthing'
        ).messageId,
        uId: secondUser.authUserId,
        message: 'some HELPthing',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false
      }
    );
    msgObjList.push(
      {
        messageId: requestSuccessfulSendMessage(
          secondUser.token, firstChannelId, 'anothersomethin123$'
        ).messageId,
        uId: secondUser.authUserId,
        message: 'anothersomethin123$',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false
      }
    );
    msgObjList.push(
      {
        messageId: requestSuccessfulSendMessage(
          secondUser.token, firstChannelId, aThousandCharacters
        ).messageId,
        uId: secondUser.authUserId,
        message: aThousandCharacters,
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false
      }
    );
  });

  test('User is not part of any channel or dm', () => {
    const searchResult = requestSuccessfulSearch(globalOwner.token, 'something');
    expect(searchResult).toStrictEqual({ messages: [] });
  });

  test('queryStr is 1000 characters long', () => {
    requestSuccessfulChannelJoin(globalOwner.token, firstChannelId);
    const searchResult = requestSuccessfulSearch(globalOwner.token, aThousandCharacters);
    expect(searchResult.messages).toStrictEqual([msgObjList[4]]);
  });

  // test('over 50 messages returned from a channel and a dm', () => {
  //   const ch = requestSuccessfulChannelsCreate(globalOwner.token, 'new test', true).channelId;
  //   const dm = requestSuccessfulDmCreate(globalOwner.token, []).dmId;
  //   for (let i = 0; i < 26; i++) {
  //     requestSuccessfulSendMessage(globalOwner.token, ch, ' ');
  //     requestSuccessfulSendDm(globalOwner.token, dm, ' ');
  //   }

  //   const searchResult = requestSuccessfulSearch(globalOwner.token, ' ');
  //   expect(searchResult.messages.length).toStrictEqual(52);
  // });

  // test('returns matching messages only', () => {
  //   requestSuccessfulChannelJoin(globalOwner.token, firstChannelId);

  //   let searchResult = requestSuccessfulSearch(globalOwner.token, 'something');
  //   expect(searchResult.messages).toStrictEqual([msgObjList[0]]);

  //   searchResult = requestSuccessfulSearch(globalOwner.token, 'SOMETHIN');
  //   expect(searchResult.messages.length).toStrictEqual(3);
  //   expect(searchResult.messages).toContainEqual(msgObjList[0]);
  //   expect(searchResult.messages).toContainEqual(msgObjList[1]);
  //   expect(searchResult.messages).toContainEqual(msgObjList[3]);

  //   searchResult = requestSuccessfulSearch(globalOwner.token, '1');
  //   expect(searchResult.messages.length).toStrictEqual(2);
  //   expect(searchResult.messages).toContainEqual(msgObjList[0]);
  //   expect(searchResult.messages).toContainEqual(msgObjList[3]);

  //   searchResult = requestSuccessfulSearch(globalOwner.token, 'some ');
  //   expect(searchResult.messages).toStrictEqual([msgObjList[2]]);

  //   searchResult = requestSuccessfulSearch(globalOwner.token, 'random');
  //   expect(searchResult).toStrictEqual({ messages: [] });
  // });

  test('matching messages only returned from the dms and channels that the user is in', () => {
    const dmIdList = [];
    const channelIdList = [];
    dmIdList.push(requestSuccessfulDmCreate(globalOwner.token, []).dmId);
    dmIdList.push(requestSuccessfulDmCreate(globalOwner.token, [secondUser.authUserId]).dmId);
    dmIdList.push(requestSuccessfulDmCreate(secondUser.token, []).dmId);
    channelIdList.push(
      requestSuccessfulChannelsCreate(globalOwner.token, 'new test', true).channelId
    );

    // Stores the messages that the global owner should be able to query.
    const globalOwnerMsgObjList: message[] = [];
    globalOwnerMsgObjList.push(
      {
        messageId: requestSuccessfulSendDm(
          globalOwner.token, dmIdList[0], aThousandCharacters
        ).messageId,
        uId: globalOwner.authUserId,
        message: aThousandCharacters,
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false
      }
    );
    globalOwnerMsgObjList.push(
      {
        messageId: requestSuccessfulSendDm(globalOwner.token, dmIdList[1], '1').messageId,
        uId: globalOwner.authUserId,
        message: '1',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false
      }
    );
    globalOwnerMsgObjList.push(
      {
        messageId: requestSuccessfulSendMessage(
          globalOwner.token, dmIdList[1], 'abc'
        ).messageId,
        uId: globalOwner.authUserId,
        message: 'abc',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false
      }
    );

    let searchResult = requestSuccessfulSearch(globalOwner.token, 'some');
    expect(searchResult).toStrictEqual({ messages: [] });

    requestSuccessfulChannelJoin(globalOwner.token, firstChannelId);
    searchResult = requestSuccessfulSearch(globalOwner.token, 'some');
    expect(searchResult.messages.length).toStrictEqual(4);
  });
});

describe('Error return', () => {
  test('Invalid token', () => {
    const searchResult = requestErrorSearch(globalOwner.token + secondUser.token + 'A', 'some');
    expect(searchResult).toStrictEqual(TOKEN_ERROR);
  });

  test('queryStr is 1001 characters long', () => {
    const searchResult = requestErrorSearch(globalOwner.token, 'A' + aThousandCharacters);
    expect(searchResult).toStrictEqual(ERROR);
  });

  test('queryStr is empty', () => {
    const searchResult = requestErrorSearch(globalOwner.token, '');
    expect(searchResult).toStrictEqual(ERROR);
  });
});
