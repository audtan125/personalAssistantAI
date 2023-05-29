import { getData, user, Data, setData } from './dataStore';
import { isTokenInvalid } from './Helpers/tokenHelper';
import { getUserId } from './Helpers/getUserId';
import validator from 'validator';
import HttpError from 'http-errors';
import request from 'sync-request';
import fs from 'fs';
import sharp from 'sharp';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

const ERROR = 400;
const TOKEN_ERROR = 403;

/**
 * For a valid user, returns information about their user ID, email, first name, last name, and handle.
 *
 * @param {string} token - unique identifier for user's session
 * @param {integer} uId - unique identifier for user
 *
 * @returns {object} {uId, email, nameFirst, nameLast, handleStr} - Parameters are valid and user exists.
 * Throw http error - in all the following cases:
 *      Invalid token
 *      Invalid uId
 */
export function userProfileV1(token: string, uId: number
): {user: user} {
  if (isTokenInvalid(token)) {
    throw HttpError(TOKEN_ERROR, 'Token is invalid');
  }

  const data: Data = getData();
  const findUserProfile = data.users.find(user => user.uId === uId);

  if (findUserProfile === undefined) {
    throw HttpError(ERROR, 'userId not found');
  }

  return { user: findUserProfile };
}

/**
 * Returns a list of all users and their associated details.
 *
 * @param {string} token - unique identifier for user's session
 *
 * @returns {object} {users} - when token is valid
 * Throw http error - in all the following cases:
 *      Invalid token
 */
export function usersAllV1(token: string): {users: user[]} {
  if (isTokenInvalid(token)) {
    throw HttpError(TOKEN_ERROR, 'Invalid Token');
  }

  const data: Data = getData();
  const usersToReturn = data.users.filter(user =>
    user.email !== undefined &&
    user.handleStr !== undefined
  );
  return { users: usersToReturn };
}

/**
 * Update the authorised user's first and last name
 *
 * @param {string} token - unique identifier for user's session
 * @param {string} nameFirst - new first name of user
 * @param {string} nameLast - new last name of user
 *
 * @returns {object} {} - on success
 * Throw http error - in all the following cases:
 *      Invalid token
 *      nameFirst or nameLast is not in between 1 and 50
 *      userId is not in users
 */
export function userSetNameV1(
  token: string,
  nameFirst: string,
  nameLast: string
): Record<string, never> {
  const data: Data = getData();
  if (isTokenInvalid(token)) {
    throw HttpError(TOKEN_ERROR, 'Invalid Token');
  }
  if (
    nameFirst.length < 1 ||
    nameFirst.length > 50 ||
    nameLast.length < 1 ||
    nameLast.length > 50
  ) {
    throw HttpError(ERROR, 'nameFirst or nameLast is not in between 1 and 50');
  }

  const finduId = getUserId(token);

  // data.users
  let findUser = data.users.find(user => user.uId === finduId);
  findUser.nameFirst = nameFirst;
  findUser.nameLast = nameLast;

  // data.globalOwners
  findUser = data.globalOwners.find(user => user.uId === finduId);
  if (findUser !== undefined) {
    findUser.nameFirst = nameFirst;
    findUser.nameLast = nameLast;
  }

  // data.dmDetails
  for (const dm of data.dmDetails) {
    findUser = dm.details.members.find(userObj => userObj.uId === finduId);
    if (findUser !== undefined) {
      findUser.nameFirst = nameFirst;
      findUser.nameLast = nameLast;
    }
  }

  // data.channelDetails
  for (const ch of data.channelDetails) {
    findUser = ch.details.ownerMembers.find(userObj => userObj.uId === finduId);
    if (findUser !== undefined) {
      findUser.nameFirst = nameFirst;
      findUser.nameLast = nameLast;
    }
    findUser = ch.details.allMembers.find(userObj => userObj.uId === finduId);
    if (findUser !== undefined) {
      findUser.nameFirst = nameFirst;
      findUser.nameLast = nameLast;
    }
  }

  setData(data);
  return {};
}

/**
 * Update the authorised user's email address
 *
 * @param {string} token - unique identifier for user's session
 * @param {string} email - new email of the user
 *
 * @returns {object} {} - on success
 * @returns {object} {error} - in all the following cases
 * Throw http error - in all the following cases:
 *      Invalid token
 *      email is not valid
 *      email is a duplicate
 *      userId is not in users
 */
export function userSetEmailV1(token: string, email: string
): Record<string, never> {
  if (!validator.isEmail(email)) throw HttpError(ERROR, 'email is not valid');

  if (isTokenInvalid(token)) throw HttpError(TOKEN_ERROR, 'Invalid Token');

  const data: Data = getData();

  const findUserEmailDuplicate = data.users.find(user => user.email === email);
  if (findUserEmailDuplicate !== undefined) throw HttpError(ERROR, 'email is a duplicate');

  const finduId = getUserId(token);

  // data.users
  let findUser = data.users.find(user => user.uId === finduId);
  findUser.email = email;

  // data.globalOwners
  findUser = data.globalOwners.find(user => user.uId === finduId);
  if (findUser !== undefined) {
    findUser.email = email;
  }

  // data.dmDetails
  for (const dm of data.dmDetails) {
    findUser = dm.details.members.find(userObj => userObj.uId === finduId);
    if (findUser !== undefined) {
      findUser.email = email;
    }
  }

  // data.channelDetails
  for (const ch of data.channelDetails) {
    findUser = ch.details.ownerMembers.find(userObj => userObj.uId === finduId);
    if (findUser !== undefined) {
      findUser.email = email;
    }
    findUser = ch.details.allMembers.find(userObj => userObj.uId === finduId);
    if (findUser !== undefined) {
      findUser.email = email;
    }
  }

  setData(data);
  return {};
}

/**
 * Update the authorised user's handle
 *
 * @param {string} token - unique identifier for user's session
 * @param {string} handleStr - new handle string of the user
 *
 * @returns {object} {} - on success
 * Throw http error - in all the following cases:
 *      handle string length is not appropriate
 *      handle string is not alphanumeric
 *      token is invalid
 *      handle string already exists in another user
 *      user token does not exist
 */
export function userSetHandleV1(token: string, handleStr: string
): Record<string, never> {
  const data = getData();
  if (handleStr.length < 3 || handleStr.length > 20) {
    throw HttpError(ERROR, 'handle string length is not appropriate');
  }

  if (!/^[A-Za-z0-9]+$/.test(handleStr)) {
    throw HttpError(ERROR, 'handle string is not alphanumeric');
  }

  if (isTokenInvalid(token)) {
    throw HttpError(TOKEN_ERROR, 'token is invalid');
  }

  const findUserHandleDuplicate = data.users.find(user => user.handleStr === handleStr);
  if (findUserHandleDuplicate !== undefined) {
    throw HttpError(ERROR, 'handle string already exists in another user');
  }

  const finduId = getUserId(token);

  // data.users
  let findUser = data.users.find(user => user.uId === finduId);
  findUser.handleStr = handleStr;

  // data.globalOwners
  findUser = data.globalOwners.find(user => user.uId === finduId);
  if (findUser !== undefined) {
    findUser.handleStr = handleStr;
  }

  // data.dmDetails
  for (const dm of data.dmDetails) {
    findUser = dm.details.members.find(userObj => userObj.uId === finduId);
    if (findUser !== undefined) {
      findUser.handleStr = handleStr;
    }
  }

  // data.channelDetails
  for (const ch of data.channelDetails) {
    findUser = ch.details.ownerMembers.find(userObj => userObj.uId === finduId);
    if (findUser !== undefined) {
      findUser.handleStr = handleStr;
    }
    findUser = ch.details.allMembers.find(userObj => userObj.uId === finduId);
    if (findUser !== undefined) {
      findUser.handleStr = handleStr;
    }
  }

  setData(data);
  return {};
}

/**
 * Update the authorised user's photo
 * NOTE: My own alteration for iteration 4: if xStart, yStart, xEnd and yEnd are all 0
 * It means do not crop the image
 *
 * @param {string} token - unique identifier for user's active session
 * @param {string} imgUrl - A http link which contains link to the image
 * @param {number} xStart - The starting pixel of the x coordinate
 * @param {number} yStart - The starting pixel of the y coordinate
 * @param {number} xEnd - The ending pixel of the x coordinate
 * @param {number} yEnd - The ending pixel of the y coordinate
 * @returns {object} {} - in all cases
 */

export function userProfileUploadPhotoV1(
  token: string, imgUrl: string, xStart: number, yStart: number,
  xEnd: number, yEnd: number
): Record<string, never> {
  if (isTokenInvalid(token)) {
    throw HttpError(TOKEN_ERROR, 'Token is invalid');
  }
  if (xStart > xEnd || yStart > yEnd || xStart < 0 || yStart < 0) {
    throw HttpError(ERROR, 'Invalid xStart and/or yStart');
  }

  // confirmed this behaviour on the forums
  // if (xStart === 0 && yStart === 0 && xEnd === 0 && yEnd === 0) {
  //   throw HttpError(ERROR, 'Image can not be 0 dimensions, invalid x and y coordinates');
  // }

  // Wrong file extension
  if (!(imgUrl.endsWith('.jpg') || imgUrl.endsWith('.jpeg'))) {
    // Apparently JPGs and JPEGs are the same file format.
    // Confirmed on forum don't need to cover .jpe .jif, .jfif, .jfi
    throw HttpError(ERROR, 'Image is not a JPG or JPEG');
  }

  const uId = getUserId(token);
  let localImgFilePath: string;
  if (!imgUrl.startsWith(SERVER_URL)) {
    localImgFilePath = createImageFile(uId, imgUrl, xStart, yStart, xEnd, yEnd);
    if (localImgFilePath === 'Invalid URL') {
      throw HttpError(ERROR, 'Invalid URL');
    }
    if (localImgFilePath === 'Invalid dimensions') {
      throw HttpError(ERROR, 'Invalid xEnd and/or yEnd');
    }
  } else {
    // Only write to file if we don't already have the file in our server
    // don't want to create deadlock error sending request to local host within a request
    localImgFilePath = 'public' + imgUrl.split(SERVER_URL)[1];
  }

  let croppedImgFilePath: string;
  if (xStart === 0 && yStart === 0 && xEnd === 0 && yEnd === 0) {
    // don't want to include '/public' in the url
    croppedImgFilePath = localImgFilePath.split('public').pop();
    console.log(croppedImgFilePath);
  } else {
    croppedImgFilePath = canCropImage(uId, localImgFilePath, xStart, yStart, xEnd, yEnd);
  }

  const data = getData();
  const userObj = data.users.find(userObj => userObj.uId === uId);

  // data.users
  userObj.profileImgUrl = SERVER_URL + croppedImgFilePath;

  // data.globalOwners
  let findUser = data.globalOwners.find(user => user.uId === uId);
  if (findUser !== undefined) {
    findUser.profileImgUrl = SERVER_URL + croppedImgFilePath;
  }

  // data.dmDetails
  for (const dm of data.dmDetails) {
    findUser = dm.details.members.find(userObj => userObj.uId === uId);
    if (findUser !== undefined) {
      findUser.profileImgUrl = SERVER_URL + croppedImgFilePath;
    }
  }

  // data.channelDetails
  for (const ch of data.channelDetails) {
    findUser = ch.details.ownerMembers.find(userObj => userObj.uId === uId);
    if (findUser !== undefined) {
      findUser.profileImgUrl = SERVER_URL + croppedImgFilePath;
    }
    findUser = ch.details.allMembers.find(userObj => userObj.uId === uId);
    if (findUser !== undefined) {
      findUser.profileImgUrl = SERVER_URL + croppedImgFilePath;
    }
  }
  setData(data);

  return {};
}

/**
 * Creates an image and stores the image in that particular file, then returns
 * the link to that image in the file stored
* @param {string} token - unique identifier for user's active session
 * @param {string} imgUrl - A http link which contains link to the image
 * @param {number} xStart - The starting pixel of the x coordinate
 * @param {number} yStart - The starting pixel of the y coordinate
 * @param {number} xEnd - The ending pixel of the x coordinate
 * @param {number} yEnd - The ending pixel of the y coordinate
 * @returns {string} -
 * true
 * - the link to the image created
 * false (one of the following)
 * - Invalid dimensions
 * - Invalid URL
 */

function createImageFile(uId: number, imgUrl: string, xStart: number, yStart: number,
  xEnd: number, yEnd: number): string {
  let res;
  try {
    res = request(
      'GET',
      imgUrl
    );
  } catch (error) {
    return 'Invalid URL';
  }

  if (res.statusCode === 200) {
    const body = res.getBody();

    // name the image files after the user's handle
    fs.writeFileSync(`public/profilePics/${uId}-original.jpg`, body, { flag: 'w' });

    const parser = require('exif-parser').create(body);
    const result = parser.parse();
    const imageSize = result.getImageSize();

    if (imageSize.width < (xEnd - xStart) || imageSize.height < (yEnd - yStart)) {
      return 'Invalid dimensions';
    }

    return `public/profilePics/${uId}-original.jpg`;
  } else {
    return 'Invalid URL';
  }
}

/**
 * Crops the particular image
 *
* @param {string} uId - unique identifier for user
 * @param {string} originalImgFilePath - The file path to the image stored on the server
 * @param {number} xStart - The starting pixel of the x coordinate
 * @param {number} yStart - The starting pixel of the y coordinate
 * @param {number} xEnd - The ending pixel of the x coordinate
 * @param {number} yEnd - The ending pixel of the y coordinate
 * @returns - void
 */

// Function inspired from https://morioh.com/p/4f3af02661df
function canCropImage(
  uId: number, originalImgFilePath: string, xStart: number, yStart: number, xEnd: number, yEnd: number
) {
  // Sharp doesn't allow the image file path to be the same as the cropped image file path
  // This is to ensure the output file path is never the same as the input
  let newImgFilePath = `public/profilePics/${uId}-cropped.jpg`;
  let i = 0;
  while (originalImgFilePath === newImgFilePath) {
    newImgFilePath = `public/profilePics/${uId}-${i}-cropped.jpg`;
    i++;
  }

  sharp(originalImgFilePath).extract(
    { left: xStart, top: yStart, width: xEnd - xStart, height: yEnd - yStart }
  ).toFile(newImgFilePath)
    .then(() => {
      // this below is not needed, just here for debugging purposes
      console.log('Image cropped and saved');
    })
    .catch((error: Error) => {
      console.error(`Error cropping image: ${error}`);
    });

  return `/profilePics/${uId}-cropped.jpg`;
}
