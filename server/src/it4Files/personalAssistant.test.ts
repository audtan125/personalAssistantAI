import { requestSuccessfulAuthRegister } from '../Helpers/requests/requestAuthHelper';
import { requestSuccessfulDmList } from '../Helpers/requests/requestDmHelper';
import { requestSuccessfulSendDm } from '../Helpers/requests/requestMessageHelper';
import { requestClear } from '../Helpers/requests/requestOtherHelper';
import { requestSuccessfulUserProfile } from '../Helpers/requests/requestUserHelper';
import { port, url } from '../config.json';
import { requestSuccessfulCreatePersonalAi } from './requestPersonalAssistant';
const SERVER_URL = `${url}:${port}`;

let firstUser: {token: string, authUserId: number};
beforeEach(() => {
  requestClear();
  firstUser = requestSuccessfulAuthRegister(
    'firstuser@gmail.com', 'password', 'First', 'User');
});

afterAll(() => {
  requestClear();
});

test('Test personal assistant is created', () => {
  const personalAi = requestSuccessfulCreatePersonalAi(firstUser.token);

  const personalAIProfile = requestSuccessfulUserProfile(firstUser.token, personalAi.personalAiId);
  expect(personalAIProfile).toStrictEqual(
    {
      user: {
        uId: personalAi.personalAiId,
        email: 'personalassistant@gmail.com',
        nameFirst: 'Personal',
        nameLast: 'Assistant',
        handleStr: 'personalassistant',
        profileImgUrl: `${SERVER_URL}/personalAssistant-profilePic.jpg`
      }
    }
  );
});

test('Test personal assistant dm exists', () => {
  const personalAi = requestSuccessfulCreatePersonalAi(firstUser.token);
  const userDmsArray = requestSuccessfulDmList(firstUser.token).dms;
  expect(userDmsArray).toStrictEqual(
    [
      {
        dmId: personalAi.personalAiDmId,
        name: 'firstuser, personalassistant',
      }
    ]
  );
});

test('Test user can send message into personal assistant channel', () => {
  const personalAiReturn = requestSuccessfulCreatePersonalAi(firstUser.token);
  requestSuccessfulSendDm(firstUser.token, personalAiReturn.personalAiDmId, 'Hi ai');
});
