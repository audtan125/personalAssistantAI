import validator from 'validator';
import { getData, setData, tokenObject, user } from './dataStore';
import { v4 as uuidv4 } from 'uuid';
import HttpError from 'http-errors';
import crypto from 'crypto';
import { saveToFile } from './save';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

/**
 * Registers a user
 *
 * @param {string} email - A string which identifies the user.
 * @param {string} password - A string which is used to identify and
 *                            authenticate for the user's account.
 * @param {string} nameFirst - The first name of the user.
 * @param {string} nameLast - The last name of the user.
 *
 * @returns {object} {authUserId} - if registration details are valid
 * Throw http error - in all the following cases:
 *      email entered is not a valid email (more in section 4.3)
 *      email address is already being used by another user
 *      length of password is less than 6 characters
 *      length of nameFirst is not between 1 and 50 characters inclusive
 *      length of nameLast is not between 1 and 50 characters inclusive
 */
export function authRegisterV1(
  email: string, password: string, nameFirst: string, nameLast: string
): {authUserId: number, token: string} {
  if (
    IsRegistrationValid(email, password, nameFirst, nameLast) === false
  ) {
    throw HttpError(400, 'email password or name entered is invalid');
  }

  const data = getData();
  const handleString = generateHandleString(nameFirst, nameLast);

  const newUser: user = {
    // This user Id will be modified later in the function.
    uId: -1,
    email: email,
    nameFirst: nameFirst,
    nameLast: nameLast,
    handleStr: handleString,
    profileImgUrl: `${SERVER_URL}/default-profilePic.jpg`
  };

  // If the user being created is a personal AI
  if (email === 'personalassistant@gmail.com') {
    newUser.profileImgUrl = `${SERVER_URL}/personalAssistant-profilePic.jpg`;
  }

  const timeNow = Date.now() / 1000;

  // if this is the first user, then the user is automatically
  // made a global owner.
  if (data.users.length === 0) {
    newUser.uId = 1;
    data.globalOwners.push(newUser);

    // This is the first user so all the metrics will be equal to 0
    data.workspaceStats = {
      channelsExist: [{ numChannelsExist: 0, timeStamp: timeNow }],
      dmsExist: [{ numDmsExist: 0, timeStamp: timeNow }],
      messagesExist: [{ numMessagesExist: 0, timeStamp: timeNow }],
      usersWhoHaveJoinedAChannelOrDm: []
    };
    setData(data);
  } else {
    newUser.handleStr = updateHandleStringIfDuplicate(newUser.handleStr);
    if (isEmailTaken(email)) {
      throw HttpError(400, 'this email is already in use');
    }

    // the new user Id is just the last added user's Id + 1
    newUser.uId = data.users.length + 1;
  }
  data.users.push(newUser);

  // Create their userStats object in the dataStore
  data.userStats.push({
    uId: newUser.uId,
    numChannelsJoined: 0,
    channelsJoinedStats: [{ numChannelsJoined: 0, timeStamp: timeNow }],
    numDmsJoined: 0,
    dmsJoinedStats: [{ numDmsJoined: 0, timeStamp: timeNow }],
    numMessagesSent: 0,
    messagesSentStats: [{ numMessagesSent: 0, timeStamp: timeNow }],
  });

  setData(data);
  storePassword(newUser.uId, password);
  const token = generateToken(newUser.uId);
  saveToFile();
  return { authUserId: newUser.uId, token: token };
}

/**
 * Logs in a user if the email and password is correct
 *
 * @param {string} email - A string that identifies a user using their email
 * @param {string} password - A string that is used to authenticate logins to a user's account
 *
 * @returns {object} {authUserId, token} - if log in is valid
 * Throws http error
 *        if email entered does not belong to a user
 *        if password is not correct
 */
export function authLoginV1(email: string, password: string):
{authUserId: number, token: string} {
  if (!isLoginDetailsValid(email, password)) {
    throw HttpError(400, 'log in details invalid');
  }

  const useruId = findEmailRegistered(email);
  if (useruId === -1) throw HttpError(400, 'user is not a member');

  const token = generateToken(useruId);

  if (isPasswordRegistered(password, useruId)) {
    return { authUserId: useruId, token: token };
  } else {
    throw HttpError(400, 'incorrect password typed in');
  }
}

/**
 * Given an active token, invalidates the token to log the user out.
 *
 * @param {string} token - A string used to validate an instance of login or
 *                         registration.
 *
 * @returns {object} {} - Token exists.
 * Throws http error if token does not exist.
 */
export function authLogoutV1(token: string): Record<string, never> {
  const data = getData();
  const index = data.tokens.findIndex(tokenObj => tokenObj.token === token);

  // Token not found
  if (index === -1) {
    throw HttpError(403, 'token is not valid');
  }

  data.tokens.splice(index, 1);
  setData(data);
  return {};
}

/**
 * Given an email address, if the email address belongs to a registered user, sends them
 * an email containing a secret password reset code.
 *
 * @param {string} email - A string which identifies the user.
 *
 * @returns {object} {} - in all cases.
 */
export function authPasswordResetRequestV1(email: string): Record<string, never> {
  if (isEmailTaken(email)) {
    const resetCode = uuidv4();
    sendResetCodeToEmail(resetCode, email);

    const data = getData();
    // Retrieves a uId that corresponds to the email parameter.
    const userId = data.users.find(userObj => userObj.email === email).uId;
    data.resetCodes.push(
      {
        uId: userId,
        resetCode: resetCode
      }
    );
    setData(data);

    // Logs out the user from all sessions.
    const userTokenObjArray: tokenObject[] = data.tokens.filter(tokenObj => tokenObj.uId === userId);
    for (const tokenObj of userTokenObjArray) {
      authLogoutV1(tokenObj.token);
    }

    saveToFile();
  }

  return {};
}

/**
 * Given a valid resetCode and newPassword, sets the resetCode user's new password
 * to newPassword. Invalidates the resetCode.
 *
 * @param {string} resetCode - A string used to verify the user.
 * @param {string} newPassword - A string representing the new password.
 *
 * @returns {object} {} - if successful.
 * Throw http error - in all the following cases:
 *      resetCode is invalid
 *      newPassword is less than 6 characters long
 */
export function authPasswordResetResetV1(resetCode: string, newPassword: string
): Record<string, never> {
  const data = getData();
  const resetPasswordObjIndex = data.resetCodes.findIndex(
    resetPasswordObj => resetPasswordObj.resetCode === resetCode
  );

  if (newPassword.length < 6) {
    throw HttpError(400, 'newPassword is less than 6 characters long');
  }

  if (resetPasswordObjIndex === -1) {
    throw HttpError(400, 'resetCode is invalid');
  }

  // Sets the new password.
  const userId = data.resetCodes[resetPasswordObjIndex].uId;
  const passwordObj = data.passwords.find(passwordObj => passwordObj.uId === userId);
  passwordObj.password = getHashOf(newPassword);

  // Invalidates the reset code.
  data.resetCodes.splice(resetPasswordObjIndex, 1);

  setData(data);

  return {};
}

// ~~~~~~~~~~~~~~~~~~~~~~~~ HELPER FUNCTIONS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

/**
 * Sends the given resetCode in an email to the given email parameter.
 *
 * @param {string} resetCode - A string which can be used to reset the password of the user
 * with the given email.
 * @param {string} email - A string which identifies the user.
 *
 */
function sendResetCodeToEmail(resetCode: string, email: string) {
  // Setup for sending emails (Code adapted from https://www.w3schools.com/nodejs/nodejs_email.asp/)
  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'boostf15b@gmail.com',
      pass: 'loairqqvgorndawv'
    }
  });

  const mailInfo = {
    from: 'boostf15b@gmail.com',
    to: email,
    subject: 'UNSW Memes Password Reset',
    text: resetCode
  };
  transporter.sendMail(mailInfo);
}

/**
 * Checks if the log in email and password is valid
 *
 * @param {string} email - A string which identifies the user.
 * @param {string} password - A string which is used to identify and
 *                            authenticate for the user's account.
 * @returns {boolean} true - if all arguments passed in are valid
 * @returns {boolean} false - if arguments are invalid
 */
function isLoginDetailsValid(email: string, password: string): boolean {
  const data = getData();
  if (
    validator.isEmail(email) === false ||
    password.length < 6 ||
    data.users.length === 0
  ) return false;
  return true;
}

/**
 * Generates a new token for the user's session and stores it
 *
 * @returns {string} tokenString - in all cases
 */
function generateToken(uId: number): string {
  const data = getData();
  // generates a version 4 uuid which is unique
  // don't have to check for duplicates as the number of UUIDs generated
  // to have at least 1 collision is 2.71 quintillion
  const tokenString = uuidv4();
  const hashedToken = getHashOf(tokenString);

  // we store the token hashed
  data.tokens.push({ uId: uId, token: hashedToken });
  // we send the user/client side the unhashed token
  return tokenString;
}

/**
 * Hashes a string (token or password)
 *
 * @param {string} string - the token or password to be hashed
 *
 * @returns {string} - the hashed string
 */
export function getHashOf(string: string): string {
  const SECRET = 'Boost15';
  // hashes the token - this is now a mathematically irreversible string
  return crypto.createHash('sha256').update(string + SECRET).digest('hex');
}

/**
 * Finds the email the user is logging in with and returns user Id
 *
 * @param {string} email - A string which identifies the user.
 * @returns {number} user.uid - if all arguments passed in are valid
 * @returns {number} -1 - if arguments are invalid
 */
function findEmailRegistered(email: string): number {
  const data = getData();
  const userObj = data.users.find(user => user.email === email);

  if (userObj !== undefined) {
    return userObj.uId;
  }

  return -1;
}

/**
 * Checks if the password is correct
 *
 * @param {string} password - A string which is used to identify and
 *                            authenticate for the user's account.
 * @param {integer} useruId - An integer which indentifies the user.
 *
 * @returns {boolean} true - if all arguments passed in are valid
 * @returns {boolean} false - if arguments are invalid
 */
function isPasswordRegistered(password: string, useruId: number): boolean {
  const data = getData();
  const userObj = data.passwords.find(user => user.uId === useruId);

  if (userObj === undefined || userObj.password !== getHashOf(password)) {
    return false;
  }

  return true;
}

/**
 * Checks if registration details entered by user is valid
 *
 * Assumes that names can only have letters and the symbol '-'
 * @param {string} email - A string which identifies the user.
 * @param {string} password - A string which is used to identify and
 *                            authenticate for the user's account.
 * @param {string} nameFirst - The first name of the user.
 * @param {string} nameLast - The last name of the user.
 *
 * @returns {boolean} true - if all arguments passed in are valid
 * @returns {boolean} false - if arguments are invalid
 */
function IsRegistrationValid(
  email: string, password: string, nameFirst: string, nameLast: string
): boolean {
  // check that nameFirst, nameLast and password are valid lengths
  if (
    nameFirst.length < 1 ||
    nameFirst.length > 50 ||
    nameLast.length < 1 ||
    nameLast.length > 50 ||
    password.length < 6
  ) {
    return false;
  }
  if (validator.isEmail(email) !== true) {
    return false;
  }

  return true;
}

/**
 * Updates the data object in dataStore with the new password for a new user
 *
 * @param {integer} newUserId - the newly generated Id for the user being registered
 * @param {string} password - the password the user entered when registrating
 *
 * @returns void
 */
function storePassword(newUserId: number, password: string) {
  const data = getData();
  // store hashed password
  const hashedPassword = getHashOf(password);
  data.passwords.push(
    {
      uId: newUserId,
      password: hashedPassword,
    }
  );
  setData(data);
}

/**
 * Appends the handleString with the smallest number (starting from 0)
 * if this handle is already taken by another user, so
 * that this new handle is unique.
 *
 * @param {string} handleString - the handle string being made for the new user
 * @param {string} duplicateString - handle string that matches
 *                 the new user's handle string with the greatest appended
 *                 integer
 *
 * @returns {string} handleString - the new handle string with the appended
 *                   integer
 */
function appendNextIntegerToHandleString(
  handleString: string, duplicateString: string
): string {
  const appendedNumber = duplicateString.charAt(
    duplicateString.length - 1
  );
  // increment the number by one
  const newAppendedNumber = parseInt(appendedNumber) + 1;
  handleString = handleString + newAppendedNumber;
  return handleString;
}

/**
 * Appends the handlestring with the smallest number (starting from 0)
 * that forms a new handle that isn't already taken
 * (only used if handleString is a duplicate)
 *
 * @param {string} handleString - a concatenation of the new user's lowercase
 *                                first name and last name
 *
 * @returns {string} handleString - if it is a duplicate, then the updated
 *                   handleString is returned, else the same handleString that
 *                          was passed in is returned
 */
function updateHandleStringIfDuplicate(handleString: string): string {
  const data = getData();
  let duplicateWGreatestInteger = 'no duplicates';

  for (const user of data.users) {
    // For each existing user
    if (handleString === user.handleStr) {
      duplicateWGreatestInteger = user.handleStr;
    } else if (
      /\d/.test(user.handleStr) === true
    ) {
      // If the last character in the handlestring has a number then:
      // check if the the new user's handle string matches the existing user's
      // handle string excluding the appended number in the last position
      // If no numbers check if handlestring matches exactly
      if (handleString === user.handleStr.substring(0, user.handleStr.length - 1)) {
        duplicateWGreatestInteger = user.handleStr;
      }
    }
  }
  if (handleString === duplicateWGreatestInteger) {
    handleString = handleString + '0';
  } else if (/\d/.test(duplicateWGreatestInteger.slice(-1)) === true) {
    // If the last digit of the duplicate handlestring is a number
    handleString =
    appendNextIntegerToHandleString(handleString, duplicateWGreatestInteger);
  }

  return handleString;
}

/**
 * Checks if the email the new user enters for registration already
 * belongs to an existing user
 *
 * @param {string} email - A string which indentifies the user.
 *
 * @returns {boolean} true - if email is already used
 * @returns {boolean} false - if email does not belong to current user
 */
function isEmailTaken(email: string): boolean {
  const data = getData();
  const emailIndex = data.users.findIndex(user => user.email === email);

  if (emailIndex !== -1) {
    return true;
  }

  return false;
}

/**
 * Generates a concatenation of the user's lowercase first name and last
 * name that is cut off at 20 characters
 *
 * @param {string} nameFirst - The first name of the user.
 * @param {string} nameLast - The last name of the user.
 *
 * @returns {string} handleString - the newly generated handle string
 */
function generateHandleString(nameFirst: string, nameLast: string): string {
  let handleString = nameFirst + nameLast;

  // Removes spaces from string.
  handleString = handleString.replace(/\s+/g, '');

  // Removes any non letter characters
  handleString = handleString.replace(/[^a-zA-Z0-9]/g, '');

  if (handleString.length > 20) {
    handleString = handleString.substring(0, 20);
  }

  handleString = handleString.toLowerCase();
  return handleString;
}
