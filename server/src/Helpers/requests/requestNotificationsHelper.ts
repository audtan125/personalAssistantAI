import request from 'sync-request';
import { port, url } from '../../config.json';
const SERVER_URL = `${url}:${port}`;
import { notification } from '../../dataStore';

/**
 * Helper function that sends http request to /notifications/get/v1 endpoint
 * Type-guarded to ensure output is successful return
 *
 * @param token - unique identifier for user session
 *
 * @returns {object} {notifications} - in all cases
 */
export function requestSuccessfulNotificationsGet(token: string): {notifications: notification[]} {
  const res = request('GET', SERVER_URL + '/notifications/get/v1', {
    headers: {
      token: token,
    }
  });

  const jsonReturn = JSON.parse(res.getBody() as string);
  if (res.statusCode === 200) {
    return jsonReturn;
  } else {
    throw new Error(
      'Helper function requestSuccessfulNotificationsGet did not work'
    );
  }
}

/**
 * Helper function that sends http request to /notifications/get/v1 endpoint
 * Type-guarded to ensure output is error return
 *
 * @param token - unique identifier for user session
 *
 * @returns {number} response status code - in all cases
 */
export function requestErrorNotificationsGet(token: string): number {
  const res = request('GET', SERVER_URL + '/notifications/get/v1', {
    headers: {
      token: token,
    }
  });

  if (res.statusCode !== 200) {
    return res.statusCode;
  } else {
    throw new Error(
      'Helper function requestErrorNotificationsGet did not work'
    );
  }
}
