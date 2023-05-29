import request from 'sync-request';
import { port, url } from '../../config.json';
const SERVER_URL = `${url}:${port}`;

/**
 * Helper function that sends a http request to
 * the /auth/register/v3 endpoint
 * Type guarded to ensure successful auth register return
 *
 * @param {string} email - A string which identifies the user.
 * @param {string} password - A string which is used to identify and
 *                            authenticate for the user's account.
 * @param {string} nameFirst - The first name of the user.
 * @param {string} nameLast - The last name of the user.
 *
 * @returns {token: string, authUserId: number} - in all cases
 */
export function requestSuccessfulAuthRegister(
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string
): {token: string, authUserId: number} {
  const res = request('POST', SERVER_URL + '/auth/register/v3', {
    json: {
      email: email,
      password: password,
      nameFirst: nameFirst,
      nameLast: nameLast,
    },
  });

  const jsonReturn = JSON.parse(res.getBody() as string);

  if (res.statusCode === 200) {
    return jsonReturn;
  } else {
    throw new Error(
      'Helper function requestSuccessfulAuthRegister did not work'
    );
  }
}

/**
 * Helper function that sends a http request to
 * the /auth/register/v3 endpoint
 * Parameters already filled out for more compact tests
 *
 * @returns {token: string, authUserId: number} - in all cases
 */
export function requestFirstUserAuthRegister(): {token: string, authUserId: number} {
  return requestSuccessfulAuthRegister(
    'firstuser@gmail.com', '123456', 'First', 'User'
  );
}

/**
 * Helper function that sends a http request to
 * the /auth/register/v3 endpoint
 * Parameters already filled out for more compact tests
 *
 * @returns {token: string, authUserId: number} - in all cases
 */
export function requestSecondUserAuthRegister(): {token: string, authUserId: number} {
  return requestSuccessfulAuthRegister(
    'seconduser@gmail.com', '123456', 'Second', 'User'
  );
}

/**
 * Helper function that sends a http request to
 * the /auth/register/v3 endpoint
 * Parameters already filled out for more compact tests
 *
 * @returns {token: string, authUserId: number} - in all cases
 */
export function requestThirdUserAuthRegister(): {token: string, authUserId: number} {
  return requestSuccessfulAuthRegister(
    'thirduser@gmail.com', '123456', 'Third', 'User'
  );
}

/**
 * Helper function that sends a http request to
 * the /auth/register/v3 endpoint
 * Type guarded to ensure error auth register return
 *
 * @param {string} email - A string which identifies the user.
 * @param {string} password - A string which is used to identify and
 *                            authenticate for the user's account.
 * @param {string} nameFirst - The first name of the user.
 * @param {string} nameLast - The last name of the user.
 *
 * @returns {number} http status code - in all cases
 */
export function requestErrorAuthRegister(
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string
): number {
  const res = request('POST', SERVER_URL + '/auth/register/v3', {
    json: {
      email: email,
      password: password,
      nameFirst: nameFirst,
      nameLast: nameLast,
    },
  });

  if (res.statusCode !== 200) {
    return res.statusCode;
  } else {
    throw new Error(
      'Helper function requestErrorAuthRegister did not work'
    );
  }
}

/**
 * Helper function that sends a http request to
 * the /auth/login/v3 endpoint
 * Type guarded to ensure successful auth login return
 *
 * @param {string} email - A string which identifies the user.
 * @param {string} password - A string which is used to identify and
 *                            authenticate for the user's account.
 *
 * @returns {token: string, authUserId: number} - in all cases
 */
export function requestSuccessfulAuthLogin(email: string, password: string):
  {token: string, authUserId: number} {
  const res = request('POST', SERVER_URL + '/auth/login/v3', {
    json: {
      email: email,
      password: password,
    },
  });

  const jsonReturn = JSON.parse(res.getBody() as string);

  if (res.statusCode === 200) {
    return jsonReturn;
  } else {
    throw new Error(
      'Helper function requestSuccessfulAuthLogin did not work'
    );
  }
}

/**
 * Helper function that sends a http request to
 * the /auth/login/v3 endpoint
 * Type guarded to ensure error auth login return
 *
 * @param {string} email - A string which identifies the user.
 * @param {string} password - A string which is used to identify and
 *                            authenticate for the user's account.
 *
 * @returns {number} http status code - in all cases
 */
export function requestErrorAuthLogin(email: string, password: string):
  number {
  const res = request('POST', SERVER_URL + '/auth/login/v3', {
    json: {
      email: email,
      password: password,
    },
  });

  if (res.statusCode !== 200) {
    return res.statusCode;
  } else {
    throw new Error(
      'Helper function requestErrorAuthLogin did not work'
    );
  }
}

/**
 * Helper function that sends a http request to
 * the /auth/logout/v2 endpoint
 * Type guarded to ensure successful auth logout return
 *
 * @param {string} token - A string used to validate an instance of login or
 *                         registration.
 *
 * @returns {} - In all cases
 */
export function requestSuccessfulAuthLogout(token: string):
  Record<string, never> {
  const res = request('POST', SERVER_URL + '/auth/logout/v2', {
    headers: {
      token: token
    }
  });

  const jsonReturn = JSON.parse(res.getBody() as string);
  if (res.statusCode === 200) {
    return jsonReturn;
  } else {
    throw new Error(
      'Helper function requestSuccessfulAuthLogout did not work'
    );
  }
}

/**
 * Helper function that sends a http request to
 * the /auth/logout/v2 endpoint
 * Type guarded to ensure error auth logout return
 *
 * @param {string} token - A string used to validate an instance of login or
 *                         registration.
 *
 * @returns {number} http status code - in all cases
 */
export function requestErrorAuthLogout(token: string): number {
  const res = request('POST', SERVER_URL + '/auth/logout/v2', {
    headers: {
      token: token
    }
  });

  if (res.statusCode !== 200) {
    return res.statusCode;
  } else {
    throw new Error(
      'Helper function requestErrorAuthLogout did not work'
    );
  }
}

/**
 * Helper function that sends a http request to
 * the /auth/passwordreset/request/v1 endpoint
 * Type guarded to ensure successful auth password reset request return
 *
 * @param {string} email - A string which identifies the user.
 *
 * @returns {} - In all cases
 */
export function requestSuccessfulAuthPasswordResetRequest(email: string): Record<string, never> {
  const res = request('POST', SERVER_URL + '/auth/passwordreset/request/v1', {
    json: {
      email: email
    }
  });

  const jsonReturn = JSON.parse(res.getBody() as string);
  if (res.statusCode === 200) {
    return jsonReturn;
  } else {
    throw new Error(
      'Helper function requestSuccessfulAuthPasswordResetRequest did not work'
    );
  }
}

/**
 * Helper function that sends a http request to
 * the /auth/passwordreset/request/v1 endpoint
 * Type guarded to ensure error auth password reset request return
 *
 * @param {string} email - A string which identifies the user.
 *
 * @returns {number} http status code - in all cases
 */
export function requestErrorAuthPasswordResetRequest(email: string): number {
  const res = request('POST', SERVER_URL + '/auth/passwordreset/request/v1', {
    json: {
      email: email
    }
  });

  if (res.statusCode !== 200) {
    return res.statusCode;
  } else {
    throw new Error(
      'Helper function requestErrorAuthPasswordResetRequest did not work'
    );
  }
}

/**
 * Helper function that sends a http request to
 * the /auth/passwordreset/reset/v1 endpoint
 * Type guarded to ensure successful auth password reset return
 *
 * @param {string} resetCode - A string used to verify the user.
 * @param {string} newPassword - A string representing the new password.
 *
 * @returns {} - In all cases
 */
export function requestSuccessfulAuthPasswordResetReset(resetCode: string, newPassword: string
): Record<string, never> {
  const res = request('POST', SERVER_URL + '/auth/passwordreset/reset/v1', {
    json: {
      resetCode: resetCode,
      newPassword: newPassword
    }
  });

  const jsonReturn = JSON.parse(res.getBody() as string);
  if (res.statusCode === 200) {
    return jsonReturn;
  } else {
    throw new Error(
      'Helper function requestSuccessfulAuthPasswordResetReset did not work'
    );
  }
}

/**
 * Helper function that sends a http request to
 * the /auth/passwordreset/reset/v1 endpoint
 * Type guarded to ensure error auth password reset return
 *
 * @param {string} resetCode - A string used to verify the user.
 * @param {string} newPassword - A string representing the new password.
 *
 * @returns {number} http status code - in all cases
 */
export function requestErrorAuthPasswordResetReset(resetCode: string, newPassword: string
): number {
  const res = request('POST', SERVER_URL + '/auth/passwordreset/reset/v1', {
    json: {
      resetCode: resetCode,
      newPassword: newPassword
    }
  });

  if (res.statusCode !== 200) {
    return res.statusCode;
  } else {
    throw new Error(
      'Helper function requestErrorAuthPasswordResetReset did not work'
    );
  }
}
