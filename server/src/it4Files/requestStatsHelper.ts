import request from 'sync-request';
import { port, url } from '../config.json';
const SERVER_URL = `${url}:${port}`;
import { userStatsReturn, workspaceStats } from '../dataStore';

/**
 * Helper function that sends http request to /user/stats/v1 endpoint
 * Type-guarded to ensure output is successful return
 *
 * @param token - unique identifier for user session
 *
 * @returns {object} userStatsReturn - in all cases
 */
export function requestSuccessfulUserStats(token: string): { userStats: userStatsReturn } {
  const res = request('GET', SERVER_URL + '/user/stats/v1', {
    headers: {
      token: token,
    }
  });

  const jsonReturn = JSON.parse(res.getBody() as string);
  if (res.statusCode === 200) {
    return jsonReturn;
  } else {
    throw new Error(
      'Helper function requestSuccessfulUserStats did not work'
    );
  }
}

/**
 * Helper function that sends http request to /user/stats/v1 endpoint
 * Type-guarded to ensure return is status code
 *
 * @param token - unique identifier for user session
 *
 * @returns {number} response status code - in all cases
 */
export function requestErrorUserStats(token: string): number {
  const res = request('GET', SERVER_URL + '/user/stats/v1', {
    headers: {
      token: token,
    }
  });

  if (res.statusCode !== 200) {
    return res.statusCode;
  } else {
    throw new Error(
      'Helper function requestErrorUserStats did not work'
    );
  }
}

/**
 * Helper function that sends http request to /users/stats/v1 endpoint
 * Type-guarded to ensure output is successful return
 *
 * @param token - unique identifier for user session
 *
 * @returns {object} userStatsReturn - in all cases
 */
export function requestSuccessfulUsersStats(token: string): { workspaceStats: workspaceStats } {
  const res = request('GET', SERVER_URL + '/users/stats/v1', {
    headers: {
      token: token,
    }
  });

  const jsonReturn = JSON.parse(res.getBody() as string);
  if (res.statusCode === 200) {
    return jsonReturn;
  } else {
    throw new Error(
      'Helper function requestSuccessfulUsersStats did not work'
    );
  }
}

/**
 * Helper function that sends http request to /users/stats/v1 endpoint
 * Type-guarded to ensure return is status code
 *
 * @param token - unique identifier for user session
 *
 * @returns {number} response status code - in all cases
 */
export function requestErrorUsersStats(token: string): number {
  const res = request('GET', SERVER_URL + '/users/stats/v1', {
    headers: {
      token: token,
    }
  });

  if (res.statusCode !== 200) {
    return res.statusCode;
  } else {
    throw new Error(
      'Helper function requestErrorUsersStats did not work'
    );
  }
}
