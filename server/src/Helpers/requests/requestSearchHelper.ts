import request from 'sync-request';
import { port, url } from '../../config.json';
import { message } from '../../dataStore';
const SERVER_URL = `${url}:${port}`;

/**
 * Helper function that sends a http request to
 * the /search/v1 endpoint
 * Type guarded to ensure successful search return
 *
 * @param {string} token - unique identifier for an active session.
 * @param {string} queryStr - string used to search for matching messages.
 *
 * @returns {messages: message[]} - in all cases
 */
export function requestSuccessfulSearch(token: string, queryStr: string): {messages: message[]} {
  const res = request('GET', SERVER_URL + '/search/v1',
    {
      headers: {
        token: token
      },
      qs: {
        queryStr: queryStr
      }
    }
  );
  const jsonReturn = JSON.parse(res.getBody() as string);

  if (res.statusCode === 200) {
    return jsonReturn;
  } else {
    throw new Error(
      'Helper function requestSuccessfulSearch did not work'
    );
  }
}

/**
 * Helper function that sends a http request to
 * the /search/v1 endpoint
 * Type guarded to ensure error search return
 *
 * @param {string} token - unique identifier for an active session.
 * @param {string} queryStr - string used to search for matching messages.
 *
 * @returns {number} error status code - in all cases
 */
export function requestErrorSearch(token: string, queryStr: string): number {
  const res = request('GET', SERVER_URL + '/search/v1',
    {
      headers: {
        token: token
      },
      qs: {
        queryStr: queryStr
      }
    }
  );

  if (res.statusCode !== 200) {
    return res.statusCode;
  } else {
    throw new Error(
      'Helper function requestErrorSearch did not work'
    );
  }
}
