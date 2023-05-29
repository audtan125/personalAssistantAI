import { channel } from '../../dataStore';
import { requestFirstUserAuthRegister } from './requestAuthHelper';

import request from 'sync-request';
import { port, url } from '../../config.json';
const SERVER_URL = `${url}:${port}`;

/**
 ** Helper function that sends a http request to
 * the /channels/create/v3 endpoint
 * Type guarded to ensure successful return
 *
 * @param {string} token - A string used to validate an instance of login or
 *                         registration.
 * @param {string} name - String that identifies the name of a channel
 * @param {boolean} isPublic - The public or private status of a channel
 *
 * @returns {channeId: number} - in all cases
 */
export function requestSuccessfulChannelsCreate(
  token: string,
  name: string,
  isPublic: boolean
): { channelId: number } {
  const res = request('POST', SERVER_URL + '/channels/create/v3', {
    headers: { token: token },
    json: {
      name: name,
      isPublic: isPublic,
    },
  });

  const jsonReturn = JSON.parse(res.getBody() as string);

  if (res.statusCode === 200) {
    return jsonReturn;
  } else {
    throw new Error(
      'Helper function requestSuccessfulChannelsCreate did not work'
    );
  }
}

/**
 ** Helper function that sends a http request to
 * the /channels/create/v3 endpoint
 * Type guarded to ensure error return
 *
 * @param {string} token - A string used to validate an instance of login or
 *                         registration.
 * @param {string} name - String that identifies the name of a channel
 * @param {boolean} isPublic - The public or private status of a channel
 *
 * @returns {number} http status code - in all cases
 */
export function requestErrorChannelsCreate(
  token: string,
  name: string,
  isPublic: boolean
): number {
  const res = request('POST', SERVER_URL + '/channels/create/v3', {
    headers: { token: token },
    json: {
      name: name,
      isPublic: isPublic,
    },
  });

  if (res.statusCode !== 200) {
    return res.statusCode;
  } else {
    throw new Error('Helper function requestErrorChannelsCreate did not work');
  }
}

/**
 ** Helper function that sends a http request to
 * the /channels/listall/v3 endpoint
 * Type guarded to ensure successful return
 *
 * @param {string} token - A string used to validate an instance of login or
 *                         registration.
 *
 * @returns {object} {channels} - in all cases
 */
export function requestSuccessfulChannelsListAll(token: string): {
  channels: Array<channel>;
} {
  const res = request('GET', SERVER_URL + '/channels/listall/v3', {
    headers: { token: token },
  });
  const jsonReturn = JSON.parse(res.getBody() as string);
  if (res.statusCode === 200) {
    return jsonReturn;
  } else {
    throw new Error(
      'Helper function requestSuccessfulChannelsListAll did not work'
    );
  }
}

/**
 ** Helper function that sends a http request to
 * the /channels/listall/v3 endpoint
 * Type guarded to ensure error return
 *
 * @param {string} token - A string used to validate an instance of login or
 *                         registration.
 *
 * @returns {number} http status code - in all cases
 */
export function requestErrorChannelsListAll(token: string): number {
  const res = request('GET', SERVER_URL + '/channels/listall/v3', {
    headers: { token: token },
  });

  if (res.statusCode !== 200) {
    return res.statusCode;
  } else {
    throw new Error('Helper function requestErrorChannelsListAll did not work');
  }
}

/**
 * Helper that creates a user and then creates a new channel with
 * the token generated for that user. The newly created channel is
 * PUBLIC and has the name Channel1
 *
 * @returns {channelId: number}
 */
export function requestPublicChannelCreate(): { channelId: number } {
  const token = requestFirstUserAuthRegister().token;
  return requestSuccessfulChannelsCreate(token, 'Channel1', true);
}

/**
 * Helper that creates a user and then creates a new channel with
 * the token generated for that user. The newly created channel is
 * PRIVATE and has the name Channel1
 *
 * @returns {channelId: number}
 */
export function requestPrivateChannelCreate(): { channelId: number } {
  const token = requestFirstUserAuthRegister().token;
  return requestSuccessfulChannelsCreate(token, 'Channel1', false);
}

/**
 ** Helper function that sends a http request to
 * the /channels/list/v3 endpoint
 * Type guarded to ensure successful return
 *
 * @param {string} token - A string used to validate an instance of login or
 *                         registration.
 *
 * @returns {object} {channels} - in all cases
 */
export function requestSuccessfulChannelsList(token: string): {
  channels: Array<channel>;
} {
  const res = request('GET', SERVER_URL + '/channels/list/v3', {
    headers: { token: token },
  });
  const jsonReturn = JSON.parse(res.getBody() as string);

  if (res.statusCode === 200) {
    return jsonReturn;
  } else {
    throw new Error(
      'Helper function requestSuccessfulChannelsList did not work'
    );
  }
}

/**
 ** Helper function that sends a http request to
 * the /channels/list/v3 endpoint
 * Type guarded to ensure error return
 *
 * @param {string} token - A string used to validate an instance of login or
 *                         registration.
 *
 * @returns {number} http status code - in all cases
 */
export function requestErrorChannelsList(token: string): number {
  const res = request('GET', SERVER_URL + '/channels/list/v3', {
    headers: { token: token },
  });

  if (res.statusCode !== 200) {
    return res.statusCode;
  } else {
    throw new Error(
      'Helper function requestUnsuccessfulChannelsList did not work'
    );
  }
}
