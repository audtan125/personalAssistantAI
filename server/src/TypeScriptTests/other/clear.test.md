import { requestClear } from '../../Helpers/requests/requestOtherHelper';

import { requestSuccessfulAuthRegister } from '../../Helpers/requests/requestAuthHelper';
import {
  requestSuccessfulChannelsCreate, requestSuccessfulChannelsListAll
} from '../../Helpers/requests/requestChannelsHelper';
import { requestSuccessfulUserAll } from '../../Helpers/requests/requestUserHelper';

afterAll(() => {
  requestClear();
});

describe('Check return is correct', () => {
  test('clear before any data has been added', () => {
    const clearReturn = requestClear();
    expect(clearReturn).toStrictEqual({});
  });
  test('clear after user has been registered', () => {
    requestSuccessfulAuthRegister('firstuser@gmail.com', '123456', 'First', 'User');
    const clearReturn = requestClear();
    expect(clearReturn).toStrictEqual({});
  });
});

test('Check information is fully deleted from the data object', () => {
  let firstUser = requestSuccessfulAuthRegister('firstuser@gmail.com', '123456', 'First', 'User');
  let secondUser = requestSuccessfulAuthRegister('seconduser@gmail.com', 'password', 'Second', 'User');
  let thirdUser = requestSuccessfulAuthRegister('thirduser@gmail.com', 'password', 'Third', 'User');

  requestSuccessfulChannelsCreate(firstUser.token, 'Test Channel 1', true);
  requestSuccessfulChannelsCreate(secondUser.token, 'Test Channel 2', true);
  requestSuccessfulChannelsCreate(thirdUser.token, 'Test Channel 3', false);

  const clearReturn = requestClear();
  expect(clearReturn).toStrictEqual({});

  // Repeating the above processes should not return error.
  firstUser = requestSuccessfulAuthRegister('firstuser@gmail.com', '123456', 'First', 'User');

  const userList = requestSuccessfulUserAll(firstUser.token).users;
  expect(userList.length).toBe(1);

  secondUser = requestSuccessfulAuthRegister('seconduser@gmail.com', 'password', 'Second', 'User');
  thirdUser = requestSuccessfulAuthRegister('thirduser@gmail.com', 'password', 'Third', 'User');

  expect(firstUser).not.toStrictEqual({ error: expect.any(String) });
  expect(secondUser).not.toStrictEqual({ error: expect.any(String) });
  expect(thirdUser).not.toStrictEqual({ error: expect.any(String) });

  // There should not be any channels.
  const channelList = requestSuccessfulChannelsListAll(firstUser.token);
  expect(channelList.channels.length).toBe(0);
});
