import request from 'sync-request';
import { port, url } from '../../config.json';
const SERVER_URL = `${url}:${port}`;

/**
 * Sends POST http request to /standup/start/v1 endpoint
 * Typeguarded to ensure return is always successful
 *
 * @param {string} token - hashed string that identifies session
 * @param {number} channelId - unique identifier for channel
 * @param {number} length - number in seconds that standup will last for
 *
 * @returns {object} { timeFinish: number } - in all cases
 */
export function requestSuccessfulStandupStart(
  token: string,
  channelId: number,
  length: number
): {timeFinish: number} {
  const res = request('POST', SERVER_URL + '/standup/start/v1', {
    headers: {
      token: token,
    },
    json: {
      channelId: channelId,
      length: length
    },
  });

  const jsonReturn = JSON.parse(res.getBody() as string);

  if (res.statusCode === 200) {
    return jsonReturn;
  } else {
    throw new Error(
      'Helper function requestSuccessfulStandupStart did not work'
    );
  }
}

/**
 * Sends POST http request to /standup/start/v1 endpoint
 * Typeguarded to ensure return is always the status code
 *
 * @param {string} token - hashed string that identifies session
 * @param {number} channelId - unique identifier for channel
 * @param {number} length - number in seconds that standup will last for
 *
 * @returns {number} res.statusCode - in all cases
 */
export function requestErrorStandupStart(
  token: string,
  channelId: number,
  length: number
): number {
  const res = request('POST', SERVER_URL + '/standup/start/v1', {
    headers: {
      token: token,
    },
    json: {
      channelId: channelId,
      length: length
    },
  });

  if (res.statusCode !== 200) {
    return res.statusCode;
  } else {
    throw new Error(
      'Helper function requestErrorStandupStart did not work'
    );
  }
}

/**
 * Sends GET http request to /standup/active/v1 endpoint
 * Typeguarded to ensure return is always successful
 *
 * @param {string} token - unique identifier for user's session
 * @param {number} channelId - unique identifier for channel
 *
 * @returns {object} {isActive: boolean, timeFinish: number} - in all cases
 */
export function requestSuccessfulStandupActive(
  token: string,
  channelId: number
): {isActive: boolean, timeFinish: number} {
  const res = request('GET', SERVER_URL + '/standup/active/v1', {
    headers: {
      token: token
    },
    qs: {
      channelId: channelId
    },
  });

  const jsonReturn = JSON.parse(res.getBody() as string);

  if (res.statusCode === 200) {
    return jsonReturn;
  } else {
    throw new Error(
      'Helper function requestSuccessfulStandupActive did not work'
    );
  }
}

/**
 * Sends GET http request to /standup/active/v1 endpoint
 * Typeguarded to ensure return is always status code
 *
 * @param {string} token - unique identifier for user's session
 * @param {number} channelId - unique identifier for channel
 *
 * @returns {number} res.statusCode - in all cases
 */
export function requestErrorStandupActive(
  token: string,
  channelId: number
): number {
  const res = request('GET', SERVER_URL + '/standup/active/v1', {
    headers: {
      token: token
    },
    qs: {
      channelId: channelId
    },
  });

  if (res.statusCode !== 200) {
    return res.statusCode;
  } else {
    throw new Error(
      'Helper function requestErrorStandupActive did not work'
    );
  }
}

/**
 * Sends POST http request to /standup/send/v1 endpoint
 * Typeguarded to ensure return is always successful
 *
 * @param {string} token - unique identifier for session
 * @param {number} channelId - unqiue identifier for channel
 * @param {string} message - standup message being send
 *
 * @returns {object} {} - in all cases
 */
export function requestSuccessfulStandupSend(
  token: string,
  channelId: number,
  message: string
): Record<string, never> {
  const res = request('POST', SERVER_URL + '/standup/send/v1', {
    headers: {
      token: token
    },
    json: {
      channelId: channelId,
      message: message
    },
  });

  const jsonReturn = JSON.parse(res.getBody() as string);

  if (res.statusCode === 200) {
    return jsonReturn;
  } else {
    throw new Error(
      'Helper function requestSuccessfulStandupSend did not work'
    );
  }
}

/**
 * Sends POST http request to /standup/send/v1 endpoint
 * Typeguarded to ensure return is always status code
 *
 * @param {string} token - unique identifier for session
 * @param {number} channelId - unqiue identifier for channel
 * @param {string} message - standup message being send
 *
 * @returns {number} res.statusCode - in all cases
 */
export function requestErrorStandupSend(
  token: string,
  channelId: number,
  message: string
): number {
  const res = request('POST', SERVER_URL + '/standup/send/v1', {
    headers: {
      token: token
    },
    json: {
      channelId: channelId,
      message: message
    },
  });

  if (res.statusCode !== 200) {
    return res.statusCode;
  } else {
    throw new Error(
      'Helper function requestErrorStandupSend did not work'
    );
  }
}
