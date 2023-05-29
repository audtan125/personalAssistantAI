import request from 'sync-request';
import { port, url } from '../../config.json';
const SERVER_URL = `${url}:${port}`;

/**
 * Helper function that sends a http request to
 * the admin/user/remove/v1 endpoint
 * Type guarded to ensure successful admin user remove return
 *
 * @param {string} token - unique identifier for an active session.
 * @param {number} uId - unique identifier for a user.
 *
 * @returns {} - in all cases
 */
export function requestSuccessfulAdminUserRemove(token: string, uId: number):
Record<string, never> {
  const res = request('DELETE', SERVER_URL + '/admin/user/remove/v1',
    {
      headers: {
        token: token
      },
      qs: {
        uId: uId
      }
    }
  );
  const jsonReturn = JSON.parse(res.getBody() as string);
  if (res.statusCode === 200) {
    return jsonReturn;
  } else {
    throw new Error(
      'Helper function requestSuccessfulAdminUserRemove did not work'
    );
  }
}

/**
 * Helper function that sends a http request to
 * the admin/user/remove/v1 endpoint
 * Type guarded to ensure successful admin user remove return
 *
 * @param {string} token - unique identifier for an active session.
 * @param {number} uId - unique identifier for a user.
 *
 * @returns {number} http status code - in all cases
 */
export function requestErrorAdminUserRemove(token: string, uId: number): number {
  const res = request('DELETE', SERVER_URL + '/admin/user/remove/v1',
    {
      headers: {
        token: token
      },
      qs: {
        uId: uId
      }
    }
  );
  if (res.statusCode !== 200) {
    return res.statusCode;
  } else {
    throw new Error(
      'Helper function requestErrorAdminUserRemove did not work'
    );
  }
}

/**
 * Helper function that sends a http request to
 * the admin/userpermission/change/v1 endpoint
 * Type guarded to ensure successful admin userpermission return
 * @param {string} token - unique identifier for an authorized user
 * @param {number} uId - unique identifier for a user.
 * @param {number} permissionId - a unique identifier to determine which permission level to change
 * @returns {} - in all cases
 */
export function requestSuccessfulAdminUserPermissionChange(token: string, uId: number, permissionId: number):
Record<string, never> {
  const res = request('POST', SERVER_URL + '/admin/userpermission/change/v1',
    {
      headers: {
        token: token
      },
      json: {
        uId: uId,
        permissionId: permissionId
      },
    });
  const jsonReturn = JSON.parse(res.getBody() as string);
  if (res.statusCode === 200) {
    return jsonReturn;
  } else {
    throw new Error(
      'Helper function requestSuccessfulAdminUserPermissionChange did not work'
    );
  }
}

/**
 * Helper function that sends a http request to
 * the admin/userpermission/change/v1 endpoint
 * Type guarded to ensure error admin userpermission return
 * @param {string} token - unique identifier for an authorized user
 * @param {number} uId - unique identifier for a user.
 * @param {number} permissionId - a unique identifier to determine which permission level to change
 * @returns {number} http status code - in all cases
 */
export function requestErrorAdminUserPermissionChange(token: string, uId: number, permissionId: number):
number {
  const res = request('POST', SERVER_URL + '/admin/userpermission/change/v1',
    {
      headers: {
        token: token
      },
      json: {
        uId: uId,
        permissionId: permissionId,
      }
    });
  if (res.statusCode !== 200) {
    return res.statusCode;
  } else {
    throw new Error(
      'Helper function requestErrorAdminUserPermissionChange did not work'
    );
  }
}
