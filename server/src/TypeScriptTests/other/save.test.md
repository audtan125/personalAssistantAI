import fs from 'fs';
import { requestSuccessfulAuthRegister } from '../../Helpers/requests/requestAuthHelper';
import { saveToFile } from '../../save';
import { requestClear } from '../../Helpers/requests/requestOtherHelper';
import { getHashOf } from '../../auth';

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

test('Test the return type of the save function is correct', () => {
  expect(saveToFile()).toStrictEqual({});
});

// -------------------------- WHITEBOX TEST -----------------------------------

test('successful save of a user in dataFile', () => {
  // authRegisterReturn should automatically call the saveToFile function
  const authRegisterReturn = requestSuccessfulAuthRegister(
    'firstuser@gmail.com', '123456', 'First', 'User'
  );
  const fileData = JSON.parse(
    String(fs.readFileSync('src/dataFile.json', { flag: 'r' }))
  );

  if ('authUserId' in authRegisterReturn) {
    const authUserId = authRegisterReturn.authUserId;

    expect(fileData.users).toContainEqual(
      {
        uId: authUserId,
        email: 'firstuser@gmail.com',
        nameFirst: 'First',
        nameLast: 'User',
        handleStr: 'firstuser',
        profileImgUrl: expect.any(String)
      }
    );

    expect(fileData.globalOwners).toContainEqual(
      {
        uId: authUserId,
        email: 'firstuser@gmail.com',
        nameFirst: 'First',
        nameLast: 'User',
        handleStr: 'firstuser',
        profileImgUrl: expect.any(String)
      }
    );

    expect(fileData.passwords).toContainEqual(
      {
        uId: authUserId,
        password: getHashOf('123456')
      }
    );
  } else {
    throw new Error('AuthRegister did not work');
  }
});
