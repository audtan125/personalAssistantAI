import request from 'sync-request';
import { port, url } from '../../config.json';
import { user } from '../../dataStore';
const SERVER_URL = `${url}:${port}`;

/**
 * Helper function that sends a http request to
 * the /user/profile/v3 endpoint
 * Type guarded to ensure successful return
 *
 * @param {string} token - unique identifier for session
 * @param {number} uId - unqiue identifier for user
 *
 * @returns {object} {user} - in all cases
 */
export function requestSuccessfulUserProfile(token: string, uId: number
): {user: user} {
  const res = request('GET', SERVER_URL + '/user/profile/v3', {
    headers: {
      token: token,
    },
    qs: {
      uId: uId
    },
  });
  const jsonReturn = JSON.parse(res.getBody() as string);
  if (res.statusCode === 200) { return jsonReturn; } else {
    throw new Error(
      'Helper function requestSuccessfulUserProfile did not work'
    );
  }
}

/**
 * Helper function that sends a http request to
 * the /user/profile/v3 endpoint
 * Type guarded to ensure return of status code
 *
 * @param {string} token - unique identifier for session
 * @param {number} uId - unqiue identifier for user
 *
 * @returns {number} res.statuscode - in all cases
 */
export function requestErrorUserProfile(token: string, uId: number
): number {
  const res = request('GET', SERVER_URL + '/user/profile/v3', {
    headers: {
      token: token,
    },
    qs: {
      uId: uId
    },
  });
  if (res.statusCode !== 200) { return res.statusCode; } else {
    throw new Error(
      'Helper function requestErrorUserProfile did not work'
    );
  }
}

/**
 * Helper function that sends a http request to
 * the /users/all/v2 endpoint
 * Type guarded to ensure successful return
 *
 * @param {string} token - unique identifier for session
 *
 * @returns {object} {users} - in all cases
 */
export function requestSuccessfulUserAll(token: string
): {users: user[]} {
  const res = request('GET', SERVER_URL + '/users/all/v2', {
    headers: {
      token: token,
    },
  });
  const jsonReturn = JSON.parse(res.getBody() as string);
  if (res.statusCode === 200) { return jsonReturn; } else {
    throw new Error(
      'Helper function requestSuccessfulUserAll did not work'
    );
  }
}

/**
 * Helper function that sends a http request to
 * the /users/all/v2 endpoint
 * Type guarded to ensure error return
 *
 * @param {string} token - unique identifier for session
 *
 * @returns {number} error status code - in all cases
 */
export function requestErrorUserAll(token: string
): number {
  const res = request('GET', SERVER_URL + '/users/all/v2', {
    headers: {
      token: token,
    },
  });
  if (res.statusCode !== 200) { return res.statusCode; } else {
    throw new Error(
      'Helper function requestErrorUserAll did not work'
    );
  }
}

/**
 * Helper function that sends a http request to
 * the /user/profile/setname/v2 endpoint
 * Type guarded to ensure successful return
 *
 * @param {string} token - unique identifier for session
 * @param {string} nameFirst - first name user is changing to
 * @param {string} nameLast - last name user is changing to
 *
 * @returns {object} {} - in all cases
 */
export function requestSuccessfulUserSetName(
  token: string,
  nameFirst: string,
  nameLast: string
): Record<string, never> {
  const res = request('PUT', SERVER_URL + '/user/profile/setname/v2', {
    headers: {
      token: token,
    },
    json: {
      nameFirst: nameFirst,
      nameLast: nameLast
    },
  });
  const jsonReturn = JSON.parse(res.getBody() as string);
  if (res.statusCode === 200) {
    return jsonReturn;
  } else {
    throw new Error(
      'Helper function requestSuccessfulUserSetName did not work'
    );
  }
}

/**
 * Helper function that sends a http request to
 * the /user/profile/setname/v2 endpoint
 * Type guarded to ensure error return
 *
 * @param {string} token - unique identifier for session
 * @param {string} nameFirst - first name user is changing to
 * @param {string} nameLast - last name user is changing to
 *
 * @returns {number} error status code - in all cases
 */
export function requestErrorUserSetName(
  token: string,
  nameFirst: string,
  nameLast: string
): number {
  const res = request('PUT', SERVER_URL + '/user/profile/setname/v2', {
    headers: {
      token: token,
    },
    json: {
      nameFirst: nameFirst,
      nameLast: nameLast
    },
  });
  if (res.statusCode !== 200) { return res.statusCode; } else {
    throw new Error(
      'Helper function requestErrorUserSetName did not work'
    );
  }
}

/**
 * Helper function that sends a http request to
 * the /user/profile/setemail/v2 endpoint
 * Type guarded to ensure successful return
 *
 * @param {string} token - unique identifier for session
 * @param {string} email - email user is changing to
 *
 * @returns {object} {} - in all cases
 */
export function requestSuccessfulUserSetEmail(
  token: string,
  email: string
): Record<string, never> {
  const res = request('PUT', SERVER_URL + '/user/profile/setemail/v2', {
    headers: {
      token: token
    },
    json: {
      email: email
    }
  });
  const jsonReturn = JSON.parse(res.getBody() as string);
  if (res.statusCode === 200) {
    return jsonReturn;
  } else {
    throw new Error(
      'Helper function requestSuccessfulUserSetEmail did not work'
    );
  }
}

/**
 * Helper function that sends a http request to
 * the /user/profile/setemail/v2 endpoint
 * Type guarded to ensure error return
 *
 * @param {string} token - unique identifier for session
 * @param {string} email - email user is changing to
 *
 * @returns {number} error status code - in all cases
 */
export function requestErrorUserSetEmail(
  token: string,
  email: string
): number {
  const res = request('PUT', SERVER_URL + '/user/profile/setemail/v2', {
    headers: {
      token: token
    },
    json: {
      email: email
    },
  });
  if (res.statusCode !== 200) {
    return res.statusCode;
  } else {
    throw new Error(
      'Helper function requestErrorUserSetEmail did not work'
    );
  }
}

/**
 * Helper function that sends a http request to
 * the /user/profile/sethandle/v2 endpoint
 * Type guarded to ensure successful return
 *
 * @param {string} token - unique identifier for session
 * @param {string} handleStr - handle user is changing to
 *
 * @returns {object} {} - in all cases
 */
export function requestSuccessfulUserSetHandle(
  token: string,
  handleStr: string
): Record<string, never> {
  const res = request('PUT', SERVER_URL + '/user/profile/sethandle/v2', {
    headers: {
      token: token
    },
    json: {
      handleStr: handleStr
    },
  });
  const jsonReturn = JSON.parse(res.getBody() as string);
  if (res.statusCode === 200) {
    return jsonReturn;
  } else {
    throw new Error(
      'Helper function requestSuccessfulUserSetHandle did not work'
    );
  }
}

/**
 * Helper function that sends a http request to
 * the /user/profile/sethandle/v2 endpoint
 * Type guarded to ensure error return
 *
 * @param {string} token - unique identifier for session
 * @param {string} handleStr - handle user is changing to
 *
 * @returns {number} error status code - in all cases
 */
export function requestErrorUserSetHandle(
  token: string,
  handleStr: string
): number {
  const res = request('PUT', SERVER_URL + '/user/profile/sethandle/v2', {
    headers: {
      token: token
    },
    json: {
      handleStr: handleStr
    },
  });
  if (res.statusCode !== 200) {
    return res.statusCode;
  } else {
    throw new Error(
      'Helper function requestErrorUserSetHandle did not work'
    );
  }
}

/**
 * Helper function that sends a http request to
 * the /user/profile/uploadphoto/v1 endpoint
 * Type guarded to ensure successful return
 * @param {string} token - unique identifier for user's active session
 * @param {string} imgUrl - A http link which contains link to the image
 * @param {number} xStart - The starting pixel of the x coordinate
 * @param {number} yStart - The starting pixel of the y coordinate
 * @param {number} xEnd - The ending pixel of the x coordinate
 * @param {number} yEnd - The ending pixel of the y coordinate
 * @returns {object} {} - in all cases
 */

export function requestSuccessfulUserProfileUploadPhoto(
  token: string, imgUrl: string, xStart: number, yStart: number, xEnd: number, yEnd: number
): Record<never, string> {
  const res = request('POST', SERVER_URL + '/user/profile/uploadphoto/v1', {
    headers: {
      token: token
    },
    json: {
      imgUrl: imgUrl,
      xStart: xStart,
      yStart: yStart,
      xEnd: xEnd,
      yEnd: yEnd
    },
  });
  const jsonReturn = JSON.parse(res.getBody() as string);
  if (res.statusCode === 200) {
    return jsonReturn;
  } else {
    throw new Error(
      'Helper function requestSuccessfulUserProfileUploadPhoto did not work'
    );
  }
}

/**
 * Helper function that sends a http request to
 * the /user/profile/uploadphoto/v1 endpoint
 * Type guarded to ensure error return
 * @param {string} token - unique identifier for user's active session
 * @param {string} imgUrl - A http link which contains link to the image
 * @param {number} xStart - The starting pixel of the x coordinate
 * @param {number} yStart - The starting pixel of the y coordinate
 * @param {number} xEnd - The ending pixel of the x coordinate
 * @param {number} yEnd - The ending pixel of the y coordinate
 * @returns {number} error status code - in all cases
 */

export function requestErrorUserProfileUploadPhoto(
  token: string, imgUrl: string, xStart: number, yStart: number, xEnd: number, yEnd: number
): number {
  const res = request('POST', SERVER_URL + '/user/profile/uploadphoto/v1', {
    headers: {
      token: token
    },
    json: {
      imgUrl: imgUrl,
      xStart: xStart,
      yStart: yStart,
      xEnd: xEnd,
      yEnd: yEnd
    },
  });
  if (res.statusCode !== 200) {
    return res.statusCode;
  } else {
    throw new Error(
      'Helper function requestErrorUserProfileUploadPhoto did not work'
    );
  }
}
