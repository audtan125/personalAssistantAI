import request from 'sync-request';
import { port, url } from '../../config.json';
import { dm, messageReturn, user } from '../../dataStore';
const SERVER_URL = `${url}:${port}`;

/**
 * Helper function that sends http request to /dm/create/v2 endpoint
 * Type guarded to ensure successful dm create return
 *
 * @param {string} token - string that allows users to stay in a session
 * @param {array} uIds - uIds contains the user(s) that this DM is directed to,
 * and will not include the creator.
 * An empty uIds list indicates the creator is the only member of the DM.
 *
 * @returns {dmId: number} - in all cases
 */
export function requestSuccessfulDmCreate(token: string, uIds: number[]
): {dmId: number} {
  const res = request('POST', SERVER_URL + '/dm/create/v2', {
    headers: {
      token: token,
    },
    json: {
      uIds: uIds,
    },
  });
  const jsonReturn = JSON.parse(res.getBody() as string);
  if (res.statusCode === 200) {
    return jsonReturn;
  } else {
    throw new Error(
      'Helper function requestSuccessfulDmCreate did not work'
    );
  }
}

/**
 * Helper function that sends http request to /dm/create/v2 endpoint
 * Type guarded to ensure error dm create return
 *
 * @param {string} token - string that allows users to stay in a session
 * @param {array} uIds - uIds contains the user(s) that this DM is directed to,
 * and will not include the creator.
 * An empty uIds list indicates the creator is the only member of the DM.
 *
 * @returns {number} http status code - in all cases
 */
export function requestErrorDmCreate(token: string, uIds: number[]
): number {
  const res = request('POST', SERVER_URL + '/dm/create/v2', {
    headers: {
      token: token,
    },
    json: {
      uIds: uIds,
    },
  });
  if (res.statusCode !== 200) {
    return res.statusCode;
  } else {
    throw new Error(
      'Helper function requestErrorDmCreate did not work'
    );
  }
}

/**
 * Helper function that sends http request to /dm/details/v2 endpoint
 * Type guarded to ensure successful dm details return
 *
 * @param {string} token - string that allows users to stay in a session
 * @param {array} dmId - unique identifier of a DM
 *
 * @returns {name: string, members: user[]} - in all cases
*/
export function requestSuccessfulDmDetails(token: string, dmId: number):
  { name: string, members: user[] } {
  const res = request('GET', SERVER_URL + '/dm/details/v2', {
    headers: {
      token: token,
    },
    qs: {
      dmId: dmId,
    },
  });
  const jsonReturn = JSON.parse(res.getBody() as string);
  if (res.statusCode === 200) {
    return jsonReturn;
  } else {
    throw new Error(
      'Helper function requestSuccessfulDmDetails did not work'
    );
  }
}

/**
 * Helper function that sends http request to /dm/details/v2 endpoint
 * Type guarded to ensure error dm details return
 *
 * @param {string} token - string that allows users to stay in a session
 * @param {array} dmId - unique identifier of a DM
 *
 * @returns {number} http status code - in all cases
*/
export function requestErrorDmDetails(token: string, dmId: number): number {
  const res = request('GET', SERVER_URL + '/dm/details/v2', {
    headers: {
      token: token,
    },
    qs: {
      dmId: dmId,
    },
  });

  if (res.statusCode !== 200) {
    return res.statusCode;
  } else {
    throw new Error(
      'Helper function requestErrorDmDetails did not work'
    );
  }
}

/**
 * Helper function that sends http request to /dm/list/v2 endpoint
 * Type guarded to ensure successful dm list return
 *
 * @param {string} token - string that allows users to stay in a session
 *
 * @returns {dms: dm[]} - in all cases
*/
export function requestSuccessfulDmList(token: string): { dms: dm[] } {
  const res = request('GET', SERVER_URL + '/dm/list/v2', {
    headers: {
      token: token,
    },
  });
  const jsonReturn = JSON.parse(res.getBody() as string);
  if (res.statusCode === 200) {
    return jsonReturn;
  } else {
    throw new Error(
      'Helper function requestSuccessfulDmList did not work'
    );
  }
}

/**
 * Helper function that sends http request to /dm/list/v2 endpoint
 * Type guarded to ensure error  dm list return
 *
 * @param {string} token - string that allows users to stay in a session
 *
 * @returns {number} http status code - in all cases
*/
export function requestErrorDmList(token: string): number {
  const res = request('GET', SERVER_URL + '/dm/list/v2', {
    headers: {
      token: token,
    },
  });

  if (res.statusCode !== 200) {
    return res.statusCode;
  } else {
    throw new Error(
      'Helper function requestErrorDmList did not work'
    );
  }
}

/**
 * Helper function that sends http request to /dm/remove/v2 endpoint
 * Type guarded to ensure successful dm remove return
 *
 * @param {string} token - string that allows users to stay in a session
 * @param {number} dmId - unique identifier of a DM.
 *
 * @returns {} - in all cases
*/
export function requestSuccessfulDmRemove(token: string, dmId: number):
  Record<string, never> {
  const res = request('DELETE', SERVER_URL + '/dm/remove/v2', {
    headers: {
      token: token,
    },
    qs: {
      dmId: dmId
    },
  });
  const jsonReturn = JSON.parse(res.getBody() as string);
  if (res.statusCode !== 200) {
    throw new Error(
      'Helper function requestSuccessfulDmRemove did not work'
    );
  } else {
    return jsonReturn;
  }
}

/**
 * Helper function that sends http request to /dm/remove/v2 endpoint
 * Type guarded to ensure error dm remove return
 *
 * @param {string} token - string that allows users to stay in a session
 * @param {number} dmId - unique identifier of a DM.
 *
 * @returns {error: string} - in all cases
*/
export function requestErrorDmRemove(token: string, dmId: number):
  number {
  const res = request('DELETE', SERVER_URL + '/dm/remove/v2', {
    headers: {
      token: token,
    },
    qs: {
      dmId: dmId
    },
  });

  if (res.statusCode !== 200) {
    return res.statusCode;
  } else {
    throw new Error(
      'Helper function requestErrorDmRemove did not work'
    );
  }
}

/**
 * Helper function that sends http request to /dm/leave/v2 endpoint
 * Type guarded to ensure successful dm leave return
 *
 * @param {string} token - string that allows users to stay in a session
 * @param {array} dmId - unique identifier of a DM
 *
 * @returns {} - in all cases
*/
export function requestSuccessfulDmLeave(token: string, dmId: number):
  Record<string, never> {
  const res = request('POST', SERVER_URL + '/dm/leave/v2', {
    headers: {
      token: token,
    },
    json: {
      dmId: dmId,
    },
  });
  const jsonReturn = JSON.parse(res.getBody() as string);
  if (res.statusCode !== 200) {
    throw new Error(
      'Helper function requestSuccessfulDmLeave did not work'
    );
  } else {
    return jsonReturn;
  }
}

/**
 * Helper function that sends http request to /dm/leave/v2 endpoint
 * Type guarded to ensure error dm leave return
 *
 * @param {string} token - string that allows users to stay in a session
 * @param {array} dmId - unique identifier of a DM
 *
 * @returns {number} http status code - in all cases
*/
export function requestErrorDmLeave(token: string, dmId: number): number {
  const res = request('POST', SERVER_URL + '/dm/leave/v2', {
    headers: {
      token: token,
    },
    json: {
      dmId: dmId,
    },
  });

  if (res.statusCode !== 200) {
    return res.statusCode;
  } else {
    throw new Error(
      'Helper function requestErrorDmLeave did not work'
    );
  }
}

/**
 * Helper function that sends http request to /dm/messages/v2 endpoint
 * Type-guarded to ensure output is successful return
 *
 * @param {string} token - string that allows users to stay in a session
 * @param {number} dmId - number that identifies the dm
 * @param {number} start - the starting number that the message page will load at
 *
 * @returns { messages: messageReturn[], start: number, end: number } - in all cases
 */
export function requestSuccessfulDmMessages(
  token: string, dmId: number, start: number
): { messages: messageReturn[], start: number, end: number } {
  const res = request('GET', SERVER_URL + '/dm/messages/v2', {
    headers: {
      token: token,
    },
    qs: {
      dmId: dmId,
      start: start,
    },
  });
  const jsonReturn = JSON.parse(res.getBody() as string);
  if (res.statusCode === 200) {
    return jsonReturn;
  } else {
    throw new Error(
      'Helper function requestSuccessfulDmMessages did not work'
    );
  }
}

/**
 * Helper function that sends http request to /dm/messages/v2 endpoint
 * Type-guarded to ensure return of error object
 *
 * @param {string} token - string that allows users to stay in a session
 * @param {number} dmId - number that identifies the dm
 * @param {number} start - the starting number that the message page will load at
 *
 * @returns {number} http status code - in all cases
 */
export function requestErrorDmMessages(
  token: string, dmId: number, start: number
): number {
  const res = request('GET', SERVER_URL + '/dm/messages/v2', {
    headers: {
      token: token,
    },
    qs: {
      dmId: dmId,
      start: start,
    },
  });

  if (res.statusCode !== 200) {
    return res.statusCode;
  } else {
    throw new Error(
      'Helper function requestErrorDmMessages did not work'
    );
  }
}
