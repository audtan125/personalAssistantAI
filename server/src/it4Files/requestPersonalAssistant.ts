import request from 'sync-request';
import { port, url } from '../config.json';
import { createPersonalAiReturn } from '../dataStore';
const SERVER_URL = `${url}:${port}`;

/**
 * Helper function that sends http request to /create/personal/assistant endpoint
 * Type-guarded to ensure output is successful return
 *
 * @param token - unique identifier for user session
 *
 * @returns {object} createPersonalAiReturn - in all cases
 */
export function requestSuccessfulCreatePersonalAi(token: string): createPersonalAiReturn {
  const res = request('POST', SERVER_URL + '/create/personal/assistant', {
    headers: {
      token: token,
    }
  });

  const jsonReturn = JSON.parse(res.getBody() as string);
  if (res.statusCode === 200) {
    return jsonReturn;
  } else {
    throw new Error(
      'Helper function requestSuccessfulCreatePersonalAi did not work'
    );
  }
}

/**
 * Helper function that sends http request to /create/personal/assistant endpoint
 * Type-guarded to ensure output is successful return
 *
 * @param token - unique identifier for user session
 *
 * @returns {number} - status code in all cases
 */
export function requestErrorCreatePersonalAi(token: string): number {
  const res = request('POST', SERVER_URL + '/create/personal/assistant', {
    headers: {
      token: token,
    }
  });

  if (res.statusCode !== 200) {
    return res.statusCode;
  } else {
    throw new Error(
      'Helper function requestErrorCreatePersonalAi did not work'
    );
  }
}
