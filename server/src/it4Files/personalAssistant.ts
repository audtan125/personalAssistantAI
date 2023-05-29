import { authRegisterV1, getHashOf } from '../auth';
import { channelsCreateV1 } from '../channels';
import HttpError from 'http-errors';
import validator from 'validator';
import { createPersonalAiReturn, getData, setData } from '../dataStore';
import { isTokenInvalid } from '../Helpers/tokenHelper';
import { channelInviteV1 } from '../channel';
import { getUserId } from '../Helpers/getUserId';
import { addMessageToAllMessages, generateMessageId } from '../Helpers/messagesHelper';
import { updateUserStatsIncreaseMsgsSent, updateWorkspaceStatsMessagesExists } from './statsHelper';
import { userProfileUploadPhotoV1, userSetEmailV1, userSetHandleV1, userSetNameV1 } from '../users';
import { saveToFile } from '../save';
import { dmCreateV1 } from '../dm';

/**
 * Creates a dm with the personal assistant bot
 *
 * @param token - unique identifier for session
 * @returns {object} createPersonalAiReturn - when successful
 * Throws http error when:
 * Token is invalid
 */
export function createPersonalAi(token: string): createPersonalAiReturn {
  if (isTokenInvalid(token)) {
    throw HttpError(403, 'Invalid Token');
  }
  const data = getData();

  // If personal assistant user has already been created, skip registering
  const personalAiUserObj = data.users.find(userObj => userObj.email === 'personalassistant@gmail.com');
  let personalAi;
  let hashedPersonalAiToken;
  let personalAiId: number;
  if (personalAiUserObj === undefined) {
    personalAi = authRegisterV1(
      'personalassistant@gmail.com', 'adminPassword', 'Personal', 'Assistant');
    hashedPersonalAiToken = getHashOf(personalAi.token);
    personalAiId = personalAi.authUserId;
  } else {
    // find personal ai's token
    personalAiId = personalAiUserObj.uId;
    const tokenObj = data.tokens.find(tokenObj => tokenObj.uId === personalAiId);
    hashedPersonalAiToken = tokenObj.token;
  }

  const userUId = getUserId(token);
  const personalAiDmId = dmCreateV1(hashedPersonalAiToken, [userUId]).dmId;

  // Save data about personal ai state in data store for persistence
  data.personalAiDmsState.push(
    {
      dmId: personalAiDmId,
      uId: personalAiId,
      token: hashedPersonalAiToken,
    }
  );

  personalAiSendResponse(
    personalAiDmId,
    'Hi there, I am your very own personal assistant! What can I do for you today?\n\nTo see a list of things I can do please type \'?\''
  );

  return {
    // Returning something triggers the react front end state to refresh
    // It also helps with black box testing
    personalAiToken: hashedPersonalAiToken,
    personalAiId: personalAiId,
    personalAiDmId: personalAiDmId
  };
}

/**
 * Takes in message and checks if it has multiple requests or a single request
 * If there are multiple, they will be separated by a comma
 *
 * @param userToken - token of the user who is interacting with personal assistant
 * @param dmId - unique identifier for the dm with the personal assistant
 * @param message - message from the user containing the request they would like
 */
export function personalAiListenRequest(
  userToken: string, dmId: number, message: string
) {
  // Make requests case insensitive
  const messageLowercase = message.toLowerCase();

  // Message contains multiple requests
  if (messageLowercase.includes(',')) {
    // split message into its separate requests
    const requests = messageLowercase.split(',');
    // Need to keep a copy of the array with the original capital cases
    const newValues = message.split(',');

    for (const i in requests) {
      identifyWhichRequest(userToken, dmId, requests[i], newValues[i]);
    }
  } else {
    identifyWhichRequest(userToken, dmId, messageLowercase, message);
  }
}

/**
 * Determines what the user would like to do based on if the message contains
 * specific substrings
 *
 * @param userToken - unique identifier for the user's session
 * @param dmId - unique identifier for the dm with the personal assistant
 * @param request - the message the user has sent in all lowercase
 * @param newValue - the new name/handle/email with original cases
 *
 */
function identifyWhichRequest(
  userToken: string, dmId: number, request: string, newValue: string
) {
  if (request.includes('set')) {
    processSetUserDetailsRequest(
      userToken, dmId, request, newValue);
  } else if (request.includes('create')) {
    if (request.includes('channel')) {
      if (!request.includes('"')) {
        personalAiSendResponse(dmId,
          'Don\'t forget to specify a channel name!');
      }
      const channelName = newValue.split('"')[1];
      let isPublic: boolean;
      if (request.includes('private') && request.includes('public')) {
        personalAiSendResponse(dmId,
          'Cmon now, a channel can\'t be both private and public! Try again and choose one');
        return;
      } else if (request.includes('public')) {
        isPublic = true;
      } else if (request.includes('private')) {
        isPublic = false;
      } else {
        personalAiSendResponse(dmId,
          'Don\'t forget to specify whether the channel will be public or private, try again!');
        return;
      }
      const createdChannelId = channelsCreateV1(userToken, channelName, isPublic).channelId;

      if (request.includes('email')) {
        addUserEmailsToChannel(userToken, dmId, request, createdChannelId, channelName);
      }
    }
  } else if (request.includes('?')) {
    personalAiSendResponse(dmId,
      `As your personal assistant I can make things easier for you!

    To update your details use the key word 'set' and specify what you'd like to change. 
    Examples of what I can update for you:
    - handle
    - name
    - profile picture
    To tell me what you'd like to change it to using the key word 'to' right before your new handle/name/url
      For example:
        set profile pic to https://www.dreamworks.com/storage/movies/shrek/gallery/shrek-gallery-1.jpg

    To create a channel use the key word 'create', specify public or private,
    and write the channel name in double quotes
      For example:
        Create public channel "My channel!"

    You can also quickly add a list of users by their email by using the key word 'email'
    Write each email on a separate line, and I'll automatically invite them into the channel
      For example:
        Please create a channel named "COMP1531" with the emails:
        audrey@gmail.com
        archit@gmail.com
        miguel@gmail.com
        aPersonalAssistantIsTheBestBonusFeature@gmail.com
      
    Finally, if you'd like to do multiple things in one go, just separate each request with a comma!
      For example: 
        set handle to IAmSoGoodAtCoding, create private channel "The best coders"`);
  } else {
    personalAiSendResponse(dmId,
      'Hmmm I\'m not quite sure what you wanted me to do, type ? for a quick guide!');
  }
}

/**
 * Invites every user with the corresponding email into the channel
 * that the personal assistant has created
 *
 * @param userToken - unique identifier for the user's session
 * @param dmId - unique identifier for the dm with the personal assistant
 * @param request - the message the user has sent in all lowercase
 * @param createdChannelId - the channel Id that the personal assistant has created
 * @param channelName - the channel name, used in the personal assistant's response
 */
function addUserEmailsToChannel(
  userToken: string, dmId: number, request: string, createdChannelId: number, channelName: string
) {
  // For each email, add the user's uId to uIdArray
  // Check they are the same (case insensitive)
  const emailsArray = request.split('\n');
  // The first line will be the request, not an email
  emailsArray.splice(0, 1);
  const uIdArray = [];
  let userCouldNotBeAdded = false;
  for (const email of emailsArray) {
    const data = getData();
    const userObj = data.users.find(userObj => userObj.email.toLowerCase() === email);
    if (userObj === undefined) {
      personalAiSendResponse(dmId,
        `I couldn't find user with email ${email}`);
      userCouldNotBeAdded = true;
      continue;
    }
    uIdArray.push(userObj.uId);
  }

  // For each uId, invite them to channel
  for (const uIdToInvite of uIdArray) {
    channelInviteV1(userToken, createdChannelId, uIdToInvite);
  }
  if (userCouldNotBeAdded) {
    personalAiSendResponse(dmId,
      `But I have added everyone else into the channel '${channelName}'!`);
  } else {
    personalAiSendResponse(dmId,
      `I have created the channel '${channelName}' and added everyone in the list!`);
  }
}

/**
 * If the message contains the key word 'set', finds which user detail
 * the user want to update and calls that function
 *
 * @param userToken - unique identifier for the user's session
 * @param dmId - unique identifier for the dm with the personal assistant
 * @param request - the message the user has sent in all lowercase
 * @param newValue - the new name/handle/email with original cases
 */
function processSetUserDetailsRequest(
  userToken: string, dmId: number, request: string, newValue: string
) {
  if (checkIfMissingNewValue(dmId, request) === true) {
    return;
  }
  if (request.includes('handle')) {
    processSetUserHandleRequest(userToken, dmId, request, newValue);
  } else if (request.includes('name')) {
    processSetUserNameRequest(userToken, dmId, request, newValue);
  } else if (request.includes('email')) {
    processSetUserEmailRequest(userToken, dmId, request, newValue);
  } else if (request.includes('pic')) {
    const newImgUrl = newValue.split('to').pop().trim();
    // All 0 coordinates will signal to not crop the image
    userProfileUploadPhotoV1(userToken, newImgUrl, 0, 0, 0, 0);
  }
}

/**
 * Updates user handle
 *
 * @param userToken - unique identifier for the user's session
 * @param dmId - unique identifier for the dm with the personal assistant
 * @param request - the message the user has sent in all lowercase
 * @param newValue - the new name/handle/email with original cases
 */
function processSetUserHandleRequest(
  userToken: string, dmId: number, request: string, newValue: string
) {
  const data = getData();
  let newHandle = newValue.split('to').pop().trim();
  if (newHandle.includes(' ')) {
    newHandle = newHandle.split(' ')[0].trim();
  }

  if (newHandle.length < 3 || newHandle.length > 20) {
    personalAiSendResponse(dmId,
      'Careful there handles need to be between 3 and 20 characters, please try a different handle!');
    return;
  }

  if (!/^[A-Za-z0-9]+$/.test(newHandle)) {
    personalAiSendResponse(dmId,
      'Careful there handles can only contain numbers and letters, please try a different handle!');
    return;
  }

  const findUserHandleDuplicate = data.users.find(user => user.handleStr === newHandle);
  if (findUserHandleDuplicate !== undefined) {
    personalAiSendResponse(dmId,
      'Hmm it seems that another user got to that handle first, please try a different handle!');
    return;
  }

  userSetHandleV1(userToken, newHandle);
  personalAiSendResponse(dmId,
    `Nice, your handle is now '${newHandle}'`);
}

/**
 * Updates user's name
 *
 * @param userToken - unique identifier for the user's session
 * @param dmId - unique identifier for the dm with the personal assistant
 * @param request - the message the user has sent in all lowercase
 * @param newValue - the new name/handle/email with original cases
 */
function processSetUserNameRequest(
  userToken: string, dmId: number, request: string, newValue: string
) {
  const newName = newValue.split('to').pop().trim();
  const nameArray = newName.split(' ');
  const newFirstName = nameArray[0];
  const newLastName = nameArray[1];

  if (
    newFirstName.length < 1 ||
    newFirstName.length > 50 ||
    newLastName.length < 1 ||
    newLastName.length > 50
  ) {
    personalAiSendResponse(dmId,
      'Careful there first and last names need to be between 1 and 50 characters, please try a different name!');
  } else {
    userSetNameV1(userToken, newFirstName, newLastName);
    personalAiSendResponse(dmId,
      `Okay! Your name is now '${newName}'`);
  }
}

/**
 * Updates user's email
 *
 * @param userToken - unique identifier for the user's session
 * @param dmId - unique identifier for the dm with the personal assistant
 * @param request - the message the user has sent in all lowercase
 * @param newValue - the new name/handle/email with original cases
 */
function processSetUserEmailRequest(
  userToken: string, dmId: number, request: string, newValue: string
) {
  const data = getData();
  const newEmail = newValue.split('to').pop().trim();

  if (!validator.isEmail(newEmail)) {
    personalAiSendResponse(dmId,
      `Hey it seems that '${newEmail}' is an invalid email, please try a different one!`);
    return;
  }

  const findUserEmailDuplicate = data.users.find(user => user.email === newEmail);
  if (findUserEmailDuplicate !== undefined) {
    personalAiSendResponse(dmId,
      `Hey it seems that '${newEmail}' is already in use, please try a different one!`);
    return;
  }

  userSetEmailV1(userToken, newEmail);
  personalAiSendResponse(dmId,
    `Hooray! Your handle is now '${newEmail}'`);
}

/**
 * Checks if the user forgets to specify what they would like their new handle/email/name
 * to be
 *
 * @param dmId - unique identifier for the dm with the personal assistant
 * @param request - the message the user has sent in all lowercase
 */
function checkIfMissingNewValue(dmId: number, request: string): boolean {
  let missingValue: string;
  if (request.includes('handle')) {
    missingValue = 'handle';
  } else if (request.includes('name')) {
    missingValue = 'name';
  } else if (request.includes('email')) {
    missingValue = 'email';
  }
  if (request.includes('to') === false) {
    if (request.includes('pic')) {
      personalAiSendResponse(dmId,
        'Don\'t forget to let me know which image url you\'d like your new profile picture to be!');
      return true;
    }
    personalAiSendResponse(dmId,
      `Don't forget to let me know what you'd like your new ${missingValue} to be!`);
    return true;
  }
  return false;
}

/**
 * Sends a response message into the dm by the personal assistant
 *
 * @param dmId - unique identifier for the dm with the personal assistant
 * @param responseMsg - the message that the personal assistant wants to send
 */
function personalAiSendResponse(dmId: number, responseMsg: string) {
  const data = getData();
  const state = data.personalAiDmsState.find(
    dmObj => dmObj.dmId === dmId);
  const messageId: number = generateMessageId();
  addMessageToAllMessages(messageId, state.uId, responseMsg);

  const dmMessagesObj = data.dmMessages.find(
    (dmMessagesObj) => dmMessagesObj.dmId === state.dmId
  );

  dmMessagesObj.allMessageIds.unshift(
    messageId
  );
  setData(data);
  saveToFile();

  updateWorkspaceStatsMessagesExists();
  updateUserStatsIncreaseMsgsSent(state.uId);
}
