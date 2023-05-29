import { requestSuccessfulAuthRegister } from '../../Helpers/requests/requestAuthHelper';
import { requestSuccessfulChannelsCreate } from '../../Helpers/requests/requestChannelsHelper';
import {
  requestSuccessfulSendMessage,
  requestErrorSendMessage,
} from '../../Helpers/requests/requestMessageHelper';
import { requestClear } from '../../Helpers/requests/requestOtherHelper';

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

const ERROR = 400;
const TOKEN_ERROR = 403;

// For every test, makes a channel with 2 members: the channel owner and a normal member
let globalOwner : {token: string, authUserId: number};
let firstChannelId : number;
beforeAll(() => {
  requestClear();
  globalOwner = requestSuccessfulAuthRegister('emailer@gmail.com', 'password', 'Test', 'User');
  firstChannelId = requestSuccessfulChannelsCreate(globalOwner.token, 'New Test Channel', true).channelId;
});

afterAll(() => {
  requestClear();
});

describe('Successfully sent message', () => {
  test('Correct messageId return object', () => {
    const sendMessage = requestSuccessfulSendMessage(globalOwner.token, firstChannelId, 'Valid message');
    expect(sendMessage).toStrictEqual({ messageId: expect.any(Number) });
  });
});

describe('Error return', () => {
  test('Invalid token', () => {
    const channelMessage = requestErrorSendMessage(globalOwner.token + 'a', firstChannelId, 'valid message');
    expect(channelMessage).toStrictEqual(TOKEN_ERROR);
  });

  test('Invalid channelId', () => {
    const channelMessage = requestErrorSendMessage(globalOwner.token, firstChannelId + 1, 'valid message');
    expect(channelMessage).toStrictEqual(ERROR);
  });

  test('Message is too long', () => {
    const channelMessage = requestErrorSendMessage(globalOwner.token, firstChannelId, string1000chars + 'abacefeaffea');
    expect(channelMessage).toStrictEqual(ERROR);
  });

  test('Message is 0 characters long', () => {
    const channelMessage = requestErrorSendMessage(globalOwner.token, firstChannelId, '');
    expect(channelMessage).toStrictEqual(ERROR);
  });

  test('Message is 1001 characters long', () => {
    const channelMessage = requestErrorSendMessage(globalOwner.token, firstChannelId, string1000chars + 'a');
    expect(channelMessage).toStrictEqual(ERROR);
  });

  test('User is not a member of the channel.', () => {
    const thirdUser = requestSuccessfulAuthRegister('thirduser@gmail.com', 'password', 'Third', 'User');
    const channelMessage = requestErrorSendMessage(thirdUser.token, firstChannelId, 'valid message');
    expect(channelMessage).toStrictEqual(TOKEN_ERROR);
  });
});
