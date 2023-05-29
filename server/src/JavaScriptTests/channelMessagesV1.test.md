```javascript

import { channelsCreateV1 } from '../channels.js';
import { authRegisterV1 } from '../auth.js';
import { clearV1 } from '../other.js';
import { channelMessagesV1 } from '../channel.js';

describe('channelMessagesV1 Tests', () => {
  beforeEach(() => {
    clearV1();
  });

  test('Test for valid inputs', () => {
    const registerId = authRegisterV1('testeremail@gmail.com', '123456', 'first', 'last').authUserId;
    const channelId = channelsCreateV1(registerId, 'test channel', true).channelId;
    const channelMessage = channelMessagesV1(registerId, channelId, 0);
    expect(channelMessage).toStrictEqual({
      messages: channelMessage.messages,
      start: channelMessage.start,
      end: channelMessage.end
    });
  });

  test('Test for inputting the wrong type', () => {
    const registerId = authRegisterV1('testeremail@gmail.com', '123456', 'first', 'last').authUserId;
    expect(channelMessagesV1(registerId, 'one', 'lets go')).toStrictEqual({ error: expect.any(String) });
  });

  test('Test for user enterting a invalid user uId', () => {
    const registerId = authRegisterV1('testeremail@gmail.com', '123456', 'first', 'last');
    const channelId = channelsCreateV1(registerId, 'test channel', true).channelId;
    const start = 0;
    const channelMessage = channelsCreateV1(2100, channelId, start);
    expect(channelMessage).toStrictEqual({ error: expect.any(String) });
  });

  test('Test for user entering a invalid channelId', () => {
    const registerId = authRegisterV1('testeremail@gmail.com', '123456', 'first', 'last');
    const channelId = channelsCreateV1(registerId, 'test channel', true).channelId;
    const start = 0;
    const channelMessage = channelsCreateV1(registerId, channelId + 1, start);
    expect(channelMessage).toStrictEqual({ error: expect.any(String) });
  });

  test('test for channelMessages being called whilst no channel have been created', () => {
    const registerId = authRegisterV1('testeremail@gmail.com', '123456', 'first', 'last').authUserId;
    expect(channelMessagesV1(registerId, 1, 0)).toStrictEqual({ error: expect.any(String) });
  });

  test('for case where they are not any messages in the channel', () => {
    const registerId = authRegisterV1('testeremail@gmail.com', '123456', 'first', 'last').authUserId;
    const channelId = channelsCreateV1(registerId, 'test channel', true).channelId;
    const start = 0;
    expect(channelMessagesV1(registerId, channelId, start)).toStrictEqual({
      messages: [],
      start: start,
      end: -1
    });
  });

  test('for invalid case where start is a negative number (-1)', () => {
    const registerId = authRegisterV1('testeremail@gmail.com', '123456', 'first', 'last').authUserId;
    const channelId = channelsCreateV1(registerId, 'test channel', true).channelId;
    const start = -1;
    expect(channelMessagesV1(registerId, channelId, start)).toStrictEqual({ error: expect.any(String) });
  });
});
