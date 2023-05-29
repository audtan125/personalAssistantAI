import request from 'sync-request';
import { port, url } from '../../config.json';
import { channelDetails, messageReturn } from '../../dataStore';
const SERVER_URL = `${url}:${port}`;

/**
 * Helper function that sends a http request to
 * the /channel/details/v3 endpoint
 * Type guarded to ensure successful channelDetails return
 *
 * @param {string} token - unique identifier for an active session.
 * @param {number} channelId - unique identifier for a channel.
 *
 * @returns {channelDetails} - in all cases
 */
export function requestSuccessfulChannelDetails(token: string, channelId: number): channelDetails {
  const res = request('GET', SERVER_URL + '/channel/details/v3',
    {
      headers: {
        token: token
      },
      qs: {
        channelId: channelId
      }
    }
  );
  const jsonReturn = JSON.parse(res.getBody() as string);

  if (res.statusCode === 200) {
    return jsonReturn;
  } else {
    throw new Error(
      'Helper function requestSuccessfulChannelDetails did not work'
    );
  }
}

/**
 * Helper function that sends a http request to
 * the /channel/details/v3 endpoint
 * Type guarded to ensure error channelDetails return
 *
 * @param {string} token - unique identifier for an active session.
 * @param {number} channelId - unique identifier for a channel.
 *
 * @returns {number} error status code - in all cases
 */
export function requestErrorChannelDetails(token: string, channelId: number): number {
  const res = request('GET', SERVER_URL + '/channel/details/v3',
    {
      headers: {
        token: token
      },
      qs: {
        channelId: channelId
      }
    }
  );

  if (res.statusCode !== 200) {
    return res.statusCode;
  } else {
    throw new Error(
      'Helper function requestErrorChannelDetails did not work'
    );
  }
}

/**
 * Helper function that sends a http request to
 * the /channel/invite/v3 endpoint
 * Type guarded to ensure successful channel invite return
 *
 * @param {string} token - unique identifier for an active session.
 * @param {number} channelId - unique identifier for a channel.
 * @param {number} uId - unique identifier for the user to be invited.
 *
 * @returns {object} {} - in all cases
 */
export function requestSuccessfulChannelInvite(token: string, channelId: number, uId: number
): Record<string, never> {
  const res = request('POST', SERVER_URL + '/channel/invite/v3',
    {
      headers: {
        token: token
      },
      json: {
        channelId: channelId,
        uId: uId
      }
    }
  );
  const jsonReturn = JSON.parse(res.getBody() as string);

  if (res.statusCode === 200) {
    return jsonReturn;
  } else {
    throw new Error(
      'Helper function requestSuccessfulChannelInvite did not work'
    );
  }
}

/**
 * Helper function that sends a http request to
 * the /channel/invite/v3 endpoint
 * Type guarded to ensure error channel invite return
 *
 * @param {string} token - unique identifier for an active session.
 * @param {number} channelId - unique identifier for a channel.
 * @param {number} uId - unique identifier for the user to be invited.
 *
 * @returns {number} error status code - in all cases
 */
export function requestErrorChannelInvite(token: string, channelId: number, uId: number
): number {
  const res = request('POST', SERVER_URL + '/channel/invite/v3',
    {
      headers: {
        token: token
      },
      json: {
        channelId: channelId,
        uId: uId
      }
    }
  );

  if (res.statusCode !== 200) {
    return res.statusCode;
  } else {
    throw new Error(
      'Helper function requestErrorChannelInvite did not work'
    );
  }
}

/**
 * Helper function that sends a http request to
 * the /channel/join/v3 endpoint
 * Type guarded to ensure successful channel join return
 *
 * @param {string} token - unique identifier for an active session.
 * @param {number} channelId - unique identifier for a channel.
 *
 * @returns {object} {} - in all cases
 */
export function requestSuccessfulChannelJoin(token: string, channelId: number
): Record<string, never> {
  const res = request('POST', SERVER_URL + '/channel/join/v3',
    {
      headers: {
        token: token
      },
      json: {
        channelId: channelId
      }
    }
  );
  const jsonReturn = JSON.parse(res.getBody() as string);

  if (res.statusCode === 200) {
    return jsonReturn;
  } else {
    throw new Error(
      'Helper function requestSuccessfulChannelJoin did not work'
    );
  }
}

/**
 * Helper function that sends a http request to
 * the /channel/join/v3 endpoint
 * Type guarded to ensure error channel join return
 *
 * @param {string} token - unique identifier for an active session.
 * @param {number} channelId - unique identifier for a channel.
 *
 * @returns {number} error status code - in all cases
 */
export function requestErrorChannelJoin(token: string, channelId: number): number {
  const res = request('POST', SERVER_URL + '/channel/join/v3',
    {
      headers: {
        token: token
      },
      json: {
        channelId: channelId
      }
    }
  );

  if (res.statusCode !== 200) {
    return res.statusCode;
  } else {
    throw new Error(
      'Helper function requestErrorChannelJoin did not work'
    );
  }
}

/**
 * Helper function that sends a http request to
 * the /channel/messages/v3 endpoint
 * Type guarded to ensure successful channelMessages return
 *
 * @param {string} token - unique identifier for an active session.
 * @param {number} channelId - unique identifier for a channel.
 * @param {number} start - the index for the first element in the page.
 *
 * @returns {object} { messageReturn[], start, end } - in all cases
 */
export function requestSuccessfulChannelMessages(token: string, channelId: number, start: number
): { messages: messageReturn[], start: number, end: number } {
  const res = request('GET', SERVER_URL + '/channel/messages/v3',
    {
      headers: {
        token: token
      },
      qs: {
        channelId: channelId,
        start: start
      }
    }
  );
  const jsonReturn = JSON.parse(res.getBody() as string);

  if (res.statusCode === 200) {
    return jsonReturn;
  } else {
    throw new Error(
      'Helper function requestSuccessfulChannelMessages did not work'
    );
  }
}

/**
 * Helper function that sends a http request to
 * the /channel/messages/v3 endpoint
 * Type guarded to ensure error channelMessages return
 *
 * @param {string} token - unique identifier for an active session.
 * @param {number} channelId - unique identifier for a channel.
 * @param {number} start - the index for the first element in the page.
 *
 * @returns {number} error status code - in all cases
 */
export function requestErrorChannelMessages(token: string, channelId: number, start: number
): number {
  const res = request('GET', SERVER_URL + '/channel/messages/v3',
    {
      headers: {
        token: token
      },
      qs: {
        channelId: channelId,
        start: start
      }
    }
  );

  if (res.statusCode !== 200) {
    return res.statusCode;
  } else {
    throw new Error(
      'Helper function requestErrorChannelMessages did not work'
    );
  }
}

/**
 * Helper function that sends a http request to
 * the /channel/addowner/v2 endpoint
 * Type guarded to ensure successful channel addowner return
 *
 * @param {string} token - unique identifier for an active session.
 * @param {number} channelId - unique identifier for a channel.
 * @param {number} uId - unique identifier for the user to be made an owner.
 *
 * @returns {object} {} - in all cases
 */
export function requestSuccessfulChannelAddOwner(token: string, channelId: number, uId: number
): Record<string, never> {
  const res = request('POST', SERVER_URL + '/channel/addowner/v2',
    {
      headers: {
        token: token
      },
      json: {
        channelId: channelId,
        uId: uId
      }
    }
  );
  const jsonReturn = JSON.parse(res.getBody() as string);

  if (res.statusCode === 200) {
    return jsonReturn;
  } else {
    throw new Error(
      'Helper function requestSuccessfulChannelAddOwner did not work'
    );
  }
}

/**
 * Helper function that sends a http request to
 * the /channel/addowner/v2 endpoint
 * Type guarded to ensure error channel addowner return
 *
 * @param {string} token - unique identifier for an active session.
 * @param {number} channelId - unique identifier for a channel.
 * @param {number} uId - unique identifier for the user to be made an owner.
 *
 * @returns {number} error status code - in all cases
 */
export function requestErrorChannelAddOwner(token: string, channelId: number, uId: number
): number {
  const res = request('POST', SERVER_URL + '/channel/addowner/v2',
    {
      headers: {
        token: token
      },
      json: {
        channelId: channelId,
        uId: uId
      }
    }
  );

  if (res.statusCode !== 200) {
    return res.statusCode;
  } else {
    throw new Error(
      'Helper function requestErrorChannelAddOwner did not work'
    );
  }
}

/**
 * Helper function that sends a http request to
 * the /channel/removeowner/v2 endpoint
 * Type guarded to ensure successful channel removeowner return
 *
 * @param {string} token - unique identifier for an active session.
 * @param {number} channelId - unique identifier for a channel.
 * @param {number} uId - unique identifier for the user to be made an owner.
 *
 * @returns {object} {} - in all cases
 */
export function requestSuccessfulChannelRemoveOwner(token: string, channelId: number, uId: number
): Record<string, never> {
  const res = request('POST', SERVER_URL + '/channel/removeowner/v2',
    {
      headers: {
        token: token
      },
      json: {
        channelId: channelId,
        uId: uId
      }
    }
  );
  const jsonReturn = JSON.parse(res.getBody() as string);

  if (res.statusCode === 200) {
    return jsonReturn;
  } else {
    throw new Error(
      'Helper function requestSuccessfulChannelRemoveOwner did not work'
    );
  }
}

/**
 * Helper function that sends a http request to
 * the /channel/removeowner/v2 endpoint
 * Type guarded to ensure error channel removeowner return
 *
 * @param {string} token - unique identifier for an active session.
 * @param {number} channelId - unique identifier for a channel.
 * @param {number} uId - unique identifier for the user to be made an owner.
 *
 * @returns {number} error status code - in all cases
 */
export function requestErrorChannelRemoveOwner(token: string, channelId: number, uId: number
): number {
  const res = request('POST', SERVER_URL + '/channel/removeowner/v2',
    {
      headers: {
        token: token
      },
      json: {
        channelId: channelId,
        uId: uId
      }
    }
  );

  if (res.statusCode !== 200) {
    return res.statusCode;
  } else {
    throw new Error(
      'Helper function requestErrorChannelRemoveOwner did not work'
    );
  }
}

/**
 * Helper function that sends a http request to
 * the /channel/leave/v2 endpoint
 * Type guarded to ensure successful channel leave return
 *
 * @param {string} token - unique identifier for an active session.
 * @param {number} channelId - unique identifier for a channel.
 *
 * @returns {object} {} - in all cases
 */
export function requestSuccessfulChannelLeave(token: string, channelId: number
): Record<string, never> {
  const res = request('POST', SERVER_URL + '/channel/leave/v2',
    {
      headers: {
        token: token
      },
      json: {
        channelId: channelId
      }
    }
  );
  const jsonReturn = JSON.parse(res.getBody() as string);

  if (res.statusCode === 200) {
    return jsonReturn;
  } else {
    throw new Error(
      'Helper function requestSuccessfulChannelLeave did not work'
    );
  }
}

/**
 * Helper function that sends a http request to
 * the /channel/leave/v2 endpoint
 * Type guarded to ensure error channel leave return
 *
 * @param {string} token - unique identifier for an active session.
 * @param {number} channelId - unique identifier for a channel.
 *
 * @returns {number} error status code - in all cases
 */
export function requestErrorChannelLeave(token: string, channelId: number): number {
  const res = request('POST', SERVER_URL + '/channel/leave/v2',
    {
      headers: {
        token: token
      },
      json: {
        channelId: channelId,
      }
    }
  );

  if (res.statusCode !== 200) {
    return res.statusCode;
  } else {
    throw new Error(
      'Helper function requestErrorChannelLeave did not work'
    );
  }
}
