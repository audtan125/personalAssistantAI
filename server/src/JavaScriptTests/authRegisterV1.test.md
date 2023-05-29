```javascript

import { authRegisterV1 } from '../auth.js';
import { userProfileV1 } from '../users.js';

import { clearV1 } from '../other.js';

beforeEach(() => {
  clearV1();
});

test('Test first user registered has the correct details', () => {
  // stores the value stored in the field 'authUserId'
  // INSIDE the return object
  // firstuser@gmail.com is a valid email according to: https://email-checker.net/validate
  const authReturn = authRegisterV1(
    'firstuser@gmail.com',
    '123456789',
    'First',
    'User'
  );
  const authUserId = authReturn.authUserId;
  expect(authReturn).toStrictEqual({ authUserId: expect.any(Number) });
  // need to access the nested user object within the outer return object
  const user = userProfileV1(authUserId, authUserId).user;
  expect(user).toStrictEqual({
    uId: authUserId,
    email: 'firstuser@gmail.com',
    nameFirst: 'First',
    nameLast: 'User',
    handleStr: 'firstuser',
  });
});

test('Test second user registered has the correct details', () => {
  authRegisterV1('firstuser@gmail.com', '123456789', 'First', 'User');
  // firstuser@gmail.com is a valid email according to: https://email-checker.net/validate
  const authReturn = authRegisterV1(
    'seconduser@gmail.com',
    '123456789',
    'Second',
    'User'
  );
  const authUserId = authReturn.authUserId;
  expect(authReturn).toStrictEqual({ authUserId: expect.any(Number) });
  const user = userProfileV1(authUserId, authUserId).user;
  expect(user).toStrictEqual({
    uId: authUserId,
    email: 'seconduser@gmail.com',
    nameFirst: 'Second',
    nameLast: 'User',
    handleStr: 'seconduser',
  });
});

test("Test that the second registered user's Id is not a duplicate", () => {
  const firstUserId = authRegisterV1(
    'firstuser@gmail.com',
    '123456789',
    'First',
    'User'
  ).authUserId;
  const secondUserId = authRegisterV1(
    'seconduser@gmail.com',
    '123456789',
    'Second',
    'User'
  ).authUserId;
  expect(secondUserId).not.toBe(firstUserId);
});

test('Test that we can register a large number of users', () => {
  // refer to the names array at the bottom of the file
  for (const name of names) {
    const authUserId = authRegisterV1(
      name + '@gmail.com',
      '123456789',
      name,
      name
    ).authUserId;
    expect(Number.isInteger(authUserId)).toBe(true);
    const user = userProfileV1(authUserId, authUserId).user;
    expect(user.nameFirst).toBe(name);
    expect(user.nameLast).toBe(name);
    expect(user.email).toBe(name + '@gmail.com');
  }
});

test('Test first user registered has a valid email', () => {
  // entered an invalid email as an argument so should
  // store an error
  const errorObject = authRegisterV1(
    'randomname@toot',
    '123456789',
    'Random',
    'Name'
  );
  expect(errorObject).toStrictEqual({ error: expect.any(String) });
});

test('Test email address is already being used by another user', () => {
  const authReturn = authRegisterV1(
    'firstuser@gmail.com',
    '123456789',
    'First',
    'User'
  );

  // should return an error as the email is already being used
  const errorObject = authRegisterV1(
    'firstuser@gmail.com',
    '123456789',
    'Second',
    'User'
  );
  expect(authReturn).toStrictEqual({ authUserId: expect.any(Number) });
  expect(errorObject).toStrictEqual({ error: expect.any(String) });
});

describe('Password-related', () => {
  test('Tests when first user registered has an empty password', () => {
    // passwords need to be over 6 characters long
    const errorObject = authRegisterV1(
      'firstuser@gmail.com',
      '',
      'First',
      'User'
    );
    expect(errorObject).toStrictEqual({ error: expect.any(String) });
  });

  test('Tests if password is too short by 1 character', () => {
    // passwords need to be at least 6 characters long
    const errorObject = authRegisterV1(
      'firstuser@gmail.com',
      'abcde',
      'first',
      'user'
    );
    expect(errorObject).toStrictEqual({ error: expect.any(String) });
  });

  test('Tests if password is the minimum valid size', () => {
    // passwords need to be at least 6 characters long
    const authUserId = authRegisterV1(
      'firstuser@gmail.com',
      'abcdef',
      'first',
      'user'
    );
    expect(authUserId).toStrictEqual({ authUserId: expect.any(Number) });
  });
});

test('Tests if first user registered has a first name that is too short', () => {
  // first names need to be between 1 and 50 characters long inclusive
  const errorObject = authRegisterV1(
    'firstuser@gmail.com',
    '123456789',
    '',
    'User'
  );
  expect(errorObject).toStrictEqual({ error: expect.any(String) });
});

test('Tests if the first user has a first name that is too long', () => {
  // first names need to be between 1 and 50 characters long inclusive
  const errorObject = authRegisterV1(
    // this is 51 characters long
    'firstuser@gmail.com',
    '123456789',
    'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxy',
    'User'
  );
  expect(errorObject).toStrictEqual({ error: expect.any(String) });
});

test('Tests if the first user has first name that is max length', () => {
  // first name is 50 characters long
  const errorObject = authRegisterV1(
    'firstuser@gmail.com',
    '123456789',
    'aVeryLongNameBlahBlahBlahaVeryLongNameBlahBlahBlah',
    'LastName'
  );
  expect(errorObject).toStrictEqual({ authUserId: expect.any(Number) });
});

test('Tests if the first user has last name that is max length', () => {
  // first name is 50 characters long
  const errorObject = authRegisterV1(
    'firstuser@gmail.com',
    '123456789',
    'first',
    'aVeryLongNameBlahBlahBlahaVeryLongNameBlahBlahBlah'
  );
  expect(errorObject).toStrictEqual({ authUserId: expect.any(Number) });
});

test('Tests if last name has a space in it', () => {
  // first name is 50 characters long
  const errorObject = authRegisterV1(
    'firstuser@gmail.com',
    '123456789',
    'Vincent',
    'Van Gough'
  );
  expect(errorObject).toStrictEqual({ authUserId: expect.any(Number) });
});

test('Tests if first name has a space in it', () => {
  // first name is 50 characters long
  const errorObject = authRegisterV1(
    'firstuser@gmail.com',
    '123456789',
    'Anne Marie',
    'Van'
  );
  expect(errorObject).toStrictEqual({ authUserId: expect.any(Number) });
});

test('Tests if the first user has a last name that is too short', () => {
  // last names need to be between 1 and 50 characters long inclusive
  const errorObject = authRegisterV1(
    'firstuser@gmail.com',
    '123456789',
    'first',
    ''
  );
  expect(errorObject).toStrictEqual({ error: expect.any(String) });
});

test('Tests if the first user has a last name that is too long', () => {
  // last names need to be between 1 and 50 characters long inclusive
  const errorObject = authRegisterV1(
    'firstuser@gmail.com',
    '123456789',
    'first',
    'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijk'
  );
  expect(errorObject).toStrictEqual({ error: expect.any(String) });
});

test('Tests if the the handle string appends 1 when it is a duplicate', () => {
  const firstUserId = authRegisterV1(
    'firstuser@gmail.com',
    '123456789',
    'Same',
    'Name'
  ).authUserId;
  const secondUserId = authRegisterV1(
    'seconduser@gmail.com',
    '123456789',
    'Same',
    'Name'
  ).authUserId;
  const thirdUserId = authRegisterV1(
    'thirduser@gmail.com',
    '123456789',
    'Same',
    'Name'
  ).authUserId;
  const firstUser = userProfileV1(firstUserId, firstUserId).user;
  const secondUser = userProfileV1(secondUserId, secondUserId).user;
  const thirdUser = userProfileV1(thirdUserId, thirdUserId).user;
  expect(firstUser.handleStr).toBe('samename');
  expect(secondUser.handleStr).toBe('samename0');
  expect(thirdUser.handleStr).toBe('samename1');
});

test('Tests if the the handle string appends 1 when it is a duplicate (with 20 character limit)', () => {
  const firstUserId = authRegisterV1(
    'firstuser@gmail.com',
    '123456789',
    'SameSameSa',
    'NameNameNa'
  ).authUserId;
  const secondUserId = authRegisterV1(
    'seconduser@gmail.com',
    '123456789',
    'SameSameSa',
    'NameNameNa'
  ).authUserId;
  const thirdUserId = authRegisterV1(
    'thirduser@gmail.com',
    '123456789',
    'SameSameSa',
    'NameNameNa'
  ).authUserId;
  const firstUser = userProfileV1(firstUserId, firstUserId).user;
  const secondUser = userProfileV1(secondUserId, secondUserId).user;
  const thirdUser = userProfileV1(thirdUserId, thirdUserId).user;
  expect(firstUser.handleStr).toBe('samesamesanamenamena');
  expect(secondUser.handleStr).toBe('samesamesanamenamena0');
  expect(thirdUser.handleStr).toBe('samesamesanamenamena1');
});

test('Tests if the handle string will cut off at 20 characters correctly', () => {
  const firstUserId = authRegisterV1(
    'firstuser@gmail.com',
    '123456789',
    'ASuperReallyLongName',
    'ThisShouldAllBeCutOff'
  ).authUserId;
  const user = userProfileV1(firstUserId, firstUserId).user;
  expect(user.handleStr).toBe('asuperreallylongname');
});

describe('Test for names containing special characters', () => {
  beforeEach(() => {
    clearV1();
  });

  test('Test for first name with special characters', () => {
    const firstUserId = authRegisterV1(
      'firstuser@gmail.com',
      '123456789',
      '读写汉字学中文',
      'lastname'
    ).authUserId;
    const user = userProfileV1(firstUserId, firstUserId).user;
    expect(user.handleStr).toBe('unrecognisedname');
  });

  test('Test for last name with special characters', () => {
    const firstUserId = authRegisterV1(
      'firstuser@gmail.com',
      '123456789',
      'firstname',
      '读写汉字学中文'
    ).authUserId;
    const user = userProfileV1(firstUserId, firstUserId).user;
    expect(user.handleStr).toBe('unrecognisedname');
  });

  test('Test for non alphanumeric characters after 20 characters.', () => {
    const firstUserId = authRegisterV1(
      'firstuser@gmail.com',
      '123456789',
      'firstfirstfirst',
      'first读写汉字学中文'
    ).authUserId;
    const user = userProfileV1(firstUserId, firstUserId).user;
    expect(user.handleStr).toBe('firstfirstfirstfirst');
  });

  test('Test for non alphanumeric characters after 19 characters.', () => {
    const firstUserId = authRegisterV1(
      'firstuser@gmail.com',
      '123456789',
      'firstfirstfirst',
      'firs读写汉字学中文'
    ).authUserId;
    const user = userProfileV1(firstUserId, firstUserId).user;
    expect(user.handleStr).toBe('unrecognisedname');
  });

  test('Test for multiple non alphanumeric names.', () => {
    const firstUserId = authRegisterV1(
      'firstuser@gmail.com',
      '123456789',
      'firstfirstfirst',
      'firs读写汉字学中文'
    ).authUserId;
    const secondUserId = authRegisterV1(
      'seconduser@gmail.com',
      '123456789',
      'firstfirstfirst',
      'firs!写汉字学中文'
    ).authUserId;

    const user = userProfileV1(firstUserId, firstUserId).user;
    const user0 = userProfileV1(secondUserId, secondUserId).user;
    expect(user.handleStr).toBe('unrecognisedname');
    expect(user0.handleStr).toBe('unrecognisedname0');
  });

  test('Test for first name containing a space.', () => {
    const firstUserId = authRegisterV1(
      'firstuser@gmail.com',
      '123456789',
      'first first',
      'firstfirst!'
    ).authUserId;

    const user = userProfileV1(firstUserId, firstUserId).user;
    expect(user.handleStr).toBe('firstfirstfirstfirst');
  });

  test('Test for first name consisting only of spaces.', () => {
    const firstUserId = authRegisterV1(
      'firstuser@gmail.com',
      '123456789',
      '          ',
      '          '
    ).authUserId;

    const user = userProfileV1(firstUserId, firstUserId).user;
    expect(user.handleStr).toBe('unrecognisedname');
  });
});

// The following code was a partial snippet of the code in:
// https://gist.github.com/ruanbekker/a1506f06aa1df06c5a9501cb393626ea
// It is an array of names
const names = [
  'Aaran',
  'Aaren',
  'Aarez',
  'Aarman',
  'Aaron',
  'Aaron-James',
  'Aarron',
  'Aaryan',
  'Aaryn',
  'Aayan',
  'Aazaan',
  'Abaan',
  'Abbas',
  'Abdallah',
  'Abdalroof',
  'Abdihakim',
  'Abdirahman',
  'Abdisalam',
  'Abdul',
  'Abdul-Aziz',
  'Abdulbasir',
  'Abdulkadir',
  'Abdulkarem',
  'Abdulkhader',
  'Abdullah',
  'Abdul-Majeed',
  'Abdulmalik',
  'Abdul-Rehman',
  'Abdur',
  'Abdurraheem',
  'Abdur-Rahman',
  'Abdur-Rehmaan',
  'Abel',
  'Abhinav',
  'Abhisumant',
  'Abid',
  'Abir',
  'Abraham',
  'Abu',
  'Abubakar',
  'Ace',
  'Adain',
  'Adam',
  'Adam-James',
  'Addison',
  'Addisson',
  'Adegbola',
  'Adegbolahan',
  'Aden',
  'Adenn',
  'Adie',
  'Adil',
  'Aditya',
  'Adnan',
  'Adrian',
  'Adrien',
  'Aedan',
  'Aedin',
  'Aedyn',
  'Aeron',
  'Afonso',
  'Ahmad',
  'Ahmed',
  'Ahmed-Aziz',
  'Ahoua',
  'Ahtasham',
  'Aiadan',
  'Aidan',
  'Aiden',
  'Aiden-Jack',
  'Aiden-Vee',
  'Aidian',
  'Aidy',
  'Ailin',
  'Aiman',
  'Ainsley',
  'Ainslie',
  'Airen',
  'Airidas',
  'Airlie',
  'AJ',
  'Ajay',
  'A-Jay',
  'Ajayraj',
  'Akan',
  'Akram',
  'Al',
  'Ala',
  'Alan',
  'Alanas',
  'Alasdair',
  'Alastair',
  'Alber',
  'Albert',
  'Albie',
  'Aldred',
  'Alec',
  'Aled',
  'Aleem',
  'Aleksandar',
  'Aleksander',
  'Aleksandr',
  'Aleksandrs',
];
