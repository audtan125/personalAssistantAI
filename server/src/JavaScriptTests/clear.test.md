```javascript

import { clearV1 } from '../other.js';
import { authRegisterV1 } from '../auth.js';
import { channelsCreateV1 } from '../channels.js';
import { userProfileV1 } from '../users.js';

describe('clear on already empty data object', () => {
  test('Check that the return is correct', () => {
    expect(clearV1()).toStrictEqual({});
  });
});

describe('clear on non-empty data object', () => {
  test('clear after user has registered', () => {
    const userId = authRegisterV1('firstuser@gmail.com', '12345678', 'First', 'User').authUserId;
    const clearData = clearV1();

    expect(clearData).toEqual({});
    expect(userProfileV1(userId, userId)).toStrictEqual({ error: expect.any(String) });
  });

  test('clear after user has registered and channels have been created', () => {
    const userId = authRegisterV1('firstuser@gmail.com', '12345678', 'First', 'User').authUserId;

    channelsCreateV1(userId, 'Test Channel 1', true);
    channelsCreateV1(userId, 'Test Channel 2', true);
    channelsCreateV1(userId, 'Test Channel 3', false);
    channelsCreateV1(userId, 'Test Channel 4', false);
    channelsCreateV1(userId, 'Test Channel 5', true);

    clearV1();

    // If the data is cleared, then adding the previous user and channels should be valid.
    const user2 = authRegisterV1('seconduser@gmail.com', '12345678', 'Second', 'User');
    expect(user2).toStrictEqual({ authUserId: expect.any(Number) });
    expect(channelsCreateV1(userId, 'Test Channel 1', true)).toStrictEqual({ channelId: expect.any(Number) });
    expect(channelsCreateV1(userId, 'Test Channel 2', true)).toStrictEqual({ channelId: expect.any(Number) });
    expect(channelsCreateV1(userId, 'Test Channel 3', false)).toStrictEqual({ channelId: expect.any(Number) });
    expect(channelsCreateV1(userId, 'Test Channel 4', false)).toStrictEqual({ channelId: expect.any(Number) });
    expect(channelsCreateV1(userId, 'Test Channel 5', true)).toStrictEqual({ channelId: expect.any(Number) });
  });
});
