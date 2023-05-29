import request from 'sync-request';
import { port, url } from '../../config.json';
const SERVER_URL = `${url}:${port}`;

/**
 * Helper function that sends http request to /message/senddm/v2 endpoint
 * Type-guarded to ensure output is successful return
 *
 * @param {string} token - string that allows users to stay in a session
 * @param {array} dmId - unique identifier for dms
 * @param {string} message - string of the message being sent
 *
 * @returns {dmId: number} - in all cases
 */
export function requestSuccessfulSendDm(
  token: string,
  dmId: number,
  message: string
): { messageId: number } {
  const res = request('POST', SERVER_URL + '/message/senddm/v2', {
    headers: {
      token: token,
    },
    json: {
      dmId: dmId,
      message: message,
    },
  });
  const jsonReturn = JSON.parse(res.getBody() as string);
  if (res.statusCode === 200) {
    return jsonReturn;
  } else {
    throw new Error(
      'Helper function requestSuccessfulMessageSendDm did not work'
    );
  }
}

/**
 * Helper function that sends http request to /message/senddm/v2 endpoint
 * Type-guarded to ensure output is error return
 *
 * @param {string} token - string that allows users to stay in a session
 * @param {array} dmId - unique identifier for dms
 * @param {string} message - string of the message being sent
 *
 * @returns {number} http status code - in all cases
 */
export function requestErrorSendDm(
  token: string,
  dmId: number,
  message: string
): number {
  const res = request('POST', SERVER_URL + '/message/senddm/v2', {
    headers: {
      token: token,
    },
    json: {
      dmId: dmId,
      message: message,
    },
  });
  if (res.statusCode !== 200) {
    return res.statusCode;
  } else {
    throw new Error('Helper function requestErrorMessageSendDm did not work');
  }
}

/**
 * Helper function that sends http request to /message/send/v2 endpoint
 * Type-guarded to ensure output is successful return
 *
 * @param {string} token - string that allows users to stay in a session
 * @param {number} channelId - integer identifier for a channel
 * @param {string} message - string containing the message sent by the user
 *
 * @returns {messageId: number} - in all cases
 */
export function requestSuccessfulSendMessage(
  token: string,
  channelId: number,
  message: string
): { messageId: number } {
  const res = request('POST', SERVER_URL + '/message/send/v2', {
    headers: { token: token },
    json: {
      channelId: channelId,
      message: message,
    },
  });
  const jsonReturn = JSON.parse(res.getBody() as string);

  if (res.statusCode === 200) {
    return jsonReturn;
  } else {
    throw new Error(
      'Helper function requestSuccessfulSendMessage did not work'
    );
  }
}

/**
 * Helper function that sends http request to /message/send/v2 endpoint
 * Type-guarded to ensure output is error return
 *
 * @param {string} token - string that allows users to stay in a session
 * @param {number} channelId - integer identifier for a channel
 * @param {string} message - string containing the message sent by the user
 *
 * @returns {number} http status code - in all cases
 */
export function requestErrorSendMessage(
  token: string,
  channelId: number,
  message: string
): number {
  const res = request('POST', SERVER_URL + '/message/send/v2', {
    headers: { token: token },
    json: {
      channelId: channelId,
      message: message,
    },
  });
  if (res.statusCode !== 200) {
    return res.statusCode;
  } else {
    throw new Error('Helper function requestErrorSendMessage did not work');
  }
}

/**
 * Helper function that sends http request to /message/edit/v2 endpoint
 * Type-guarded to ensure output is successful
 *
 * @param {string} token - string that allows users to stay in a session
 * @param {number} messageId - integer identifier for a channel
 * @param {string} message - string containing the message sent by the user
 *
 * @returns {} - in all cases
 */
export function requestSuccessfulEditMessage(
  token: string,
  messageId: number,
  message: string
): Record<string, never> {
  const res = request('PUT', SERVER_URL + '/message/edit/v2', {
    headers: {
      token: token,
    },
    json: {
      messageId: messageId,
      message: message,
    },
  });
  const jsonReturn = JSON.parse(res.getBody() as string);

  if (res.statusCode === 200) {
    return jsonReturn;
  } else {
    throw new Error(
      'Helper function requestSuccessfulEditMessage did not work'
    );
  }
}

/**
 * Helper function that sends http request to /message/remove/v2 endpoint
 * Type-guarded to ensure output is successful return
 *
 * @param {string} token - string that allows users to stay in a session
 * @param {number} messageId - unique identifier of a message
 *
 * @returns {} - in all cases
 */
export function requestSuccessfulMessageRemove(
  token: string,
  messageId: number
): Record<string, never> {
  const res = request('DELETE', SERVER_URL + '/message/remove/v2', {
    headers: {
      token: token,
    },
    qs: {
      messageId: messageId,
    },
  });
  const jsonReturn = JSON.parse(res.getBody() as string);
  if (res.statusCode !== 200) {
    throw new Error(
      'Helper function requestSuccessfulMessageRemove did not work'
    );
  } else {
    return jsonReturn;
  }
}

/**
 * Helper function that sends http request to /message/edit/v2 endpoint
 * Type-guarded to ensure output is an error
 *
 * @param {string} token - string that allows users to stay in a session
 * @param {number} messageId - integer identifier for a channel
 * @param {string} message - string containing the message sent by the user
 *
 * @returns {number} http status code - in all cases
 */
export function requestErrorEditMessage(
  token: string,
  messageId: number,
  message: string
): number {
  const res = request('PUT', SERVER_URL + '/message/edit/v2', {
    headers: {
      token: token,
    },
    json: {
      messageId: messageId,
      message: message,
    },
  });

  if (res.statusCode !== 200) {
    return res.statusCode;
  } else {
    throw new Error('Helper function requestErrorEditMessage did not work');
  }
}

/**
 * Helper function that sends http request to /message/remove/v2 endpoint
 * Type-guarded to ensure output is error return
 *
 * @param {string} token - string that allows users to stay in a session
 * @param {number} messageId - unique identifier of a message
 *
 * @returns {number} http status code - in all cases
 */
export function requestErrorMessageRemove(
  token: string,
  messageId: number
): number {
  const res = request('DELETE', SERVER_URL + '/message/remove/v2', {
    headers: {
      token: token,
    },
    qs: {
      messageId: messageId,
    },
  });

  if (res.statusCode !== 200) {
    return res.statusCode;
  } else {
    throw new Error('Helper function requestErrorMessageRemove did not work');
  }
}

/**
 * Helper function that sends http request to /message/react/v1 endpoint
 * Type-guarded to ensure output is successful
 *
 * @param {string} token - string that allows users to stay in a session
 * @param {number} messageId - integer identifier for a channel
 * @param {number} reactId - integer identifier for a reaction
 *
 * @returns {} - in all cases
 */
export function requestSuccessfulMessageReact(
  token: string,
  messageId: number,
  reactId: number
): Record<string, never> {
  const res = request('POST', SERVER_URL + '/message/react/v1', {
    headers: {
      token: token,
    },
    json: {
      messageId: messageId,
      reactId: reactId,
    },
  });
  const jsonReturn = JSON.parse(res.getBody() as string);

  if (res.statusCode === 200) {
    return jsonReturn;
  } else {
    throw new Error(
      'Helper function requestSuccessfulMessageReact did not work'
    );
  }
}

/**
 * Helper function that sends http request to /message/react/v1 endpoint
 * Type-guarded to ensure output is error
 *
 * @param {string} token - string that allows users to stay in a session
 * @param {number} messageId - integer identifier for a channel
 * @param {number} reactId - integer identifier for a reaction
 *
 * @returns {number} - http status code in all cases
 */
export function requestErrorMessageReact(
  token: string,
  messageId: number,
  reactId: number
): number {
  const res = request('POST', SERVER_URL + '/message/react/v1', {
    headers: {
      token: token,
    },
    json: {
      messageId: messageId,
      reactId: reactId,
    },
  });

  if (res.statusCode !== 200) {
    return res.statusCode;
  } else {
    throw new Error('Helper function requestErrorMessageReact did not work');
  }
}

/**
 * Helper function that sends http request to message/pin/v1 endpoint
 * Type-guarded to ensure output is successful
 *
 * @param {string} token - string that allows users to stay in a session
 * @param {number} messageId - integer identifier for a channel
 *
 * @returns {} - in all cases *
 */
export function requestSuccessfulMessagePin(
  token: string,
  messageId: number
): Record<string, never> {
  const res = request('POST', SERVER_URL + '/message/pin/v1', {
    headers: {
      token: token,
    },
    json: {
      messageId: messageId,
    },
  });
  const jsonReturn = JSON.parse(res.getBody() as string);

  if (res.statusCode === 200) {
    return jsonReturn;
  } else {
    throw new Error('Helper function requestSuccessfulMessagePin did not work');
  }
}

/**
 * Helper function that sends http request to message/pin/v1 endpoint
 * Type-guarded to ensure output is error
 *
 * @param {string} token - string that allows users to stay in a session
 * @param {number} messageId - integer identifier for a channel
 *
 * @returns {number} - http status code in all cases
 */
export function requestErrorMessagePin(
  token: string,
  messageId: number
): number {
  const res = request('POST', SERVER_URL + '/message/pin/v1', {
    headers: {
      token: token,
    },
    json: {
      messageId: messageId,
    },
  });

  if (res.statusCode !== 200) {
    return res.statusCode;
  } else {
    throw new Error('Helper function requestErrorMessagePin did not work');
  }
}

/**
 * Helper function that sends http request to message/unpin/v1 endpoint
 * Type-guarded to ensure output is successful
 *
 * @param {string} token - string that allows users to stay in a session
 * @param {number} messageId - integer identifier for a channel
 *
 * @returns {} - in all cases
 */
export function requestSuccessfulMessageUnpin(
  token: string,
  messageId: number
): Record<string, never> {
  const res = request('POST', SERVER_URL + '/message/unpin/v1', {
    headers: {
      token: token,
    },
    json: {
      messageId: messageId,
    },
  });
  const jsonReturn = JSON.parse(res.getBody() as string);

  if (res.statusCode === 200) {
    return jsonReturn;
  } else {
    throw new Error('Helper function requestSuccessfulMessageUnpin did not work');
  }
}

/**
 * Helper function that sends http request to message/unpin/v1 endpoint
 * Type-guarded to ensure output is error
 *
 * @param {string} token - string that allows users to stay in a session
 * @param {number} messageId - integer identifier for a channel
 *
 * @returns {number} - http status code in all cases
 */
export function requestErrorMessageUnpin(
  token: string,
  messageId: number
): number {
  const res = request('POST', SERVER_URL + '/message/unpin/v1', {
    headers: {
      token: token,
    },
    json: {
      messageId: messageId,
    },
  });

  if (res.statusCode !== 200) {
    return res.statusCode;
  } else {
    throw new Error('Helper function requestErrorMessageUnpin did not work');
  }
}

/**
 * Helper function that sends http request to /message/sendlater/v1 endpoint
 * Type-guarded to ensure output is successful return
 *
 * @param {string} token - string that allows users to stay in a session
 * @param {number} channelId - integer identifier for a channel
 * @param {string} message - string containing the message sent by the user
 * @param {number} timeSent - number to specify the time for the message to send
 *
 * @returns {messageId: number} - in all cases
 */
export function requestSuccessfulSendMessageLater(
  token: string,
  channelId: number,
  message: string,
  timeSent: number
): { messageId: number } {
  const res = request('POST', SERVER_URL + '/message/sendlater/v1', {
    headers: { token: token },
    json: {
      channelId: channelId,
      message: message,
      timeSent: timeSent,
    },
  });
  const jsonReturn = JSON.parse(res.getBody() as string);

  if (res.statusCode === 200) {
    return jsonReturn;
  } else {
    throw new Error(
      'Helper function requestSuccessfulSendMessageLater did not work'
    );
  }
}
/**
 * Helper function that sends http request to /message/unreact/v1 endpoint
 * Type-guarded to ensure output is successful
 *
 * @param {string} token - string that allows users to stay in a session
 * @param {number} messageId - integer identifier for a channel
 * @param {number} reactId - integer identifier for a reaction
 *
 * @returns {} - in all cases
 */
export function requestSuccessfulMessageUnreact(
  token: string,
  messageId: number,
  reactId: number
): Record<string, never> {
  const res = request('POST', SERVER_URL + '/message/unreact/v1', {
    headers: {
      token: token,
    },
    json: {
      messageId: messageId,
      reactId: reactId,
    },
  });
  const jsonReturn = JSON.parse(res.getBody() as string);

  if (res.statusCode === 200) {
    return jsonReturn;
  } else {
    throw new Error(
      'Helper function requestSuccessfulMessageUnreact did not work'
    );
  }
}

/**
 * Helper function that sends http request to /message/sendlater/v1 endpoint
 * Type-guarded to ensure output is error return
 *
 * @param {string} token - string that allows users to stay in a session
 * @param {number} channelId - integer identifier for a channel
 * @param {string} message - string containing the message sent by the user
 * @param {number} timeSent - number to specify the time for the message to send
 *
 * @returns {number} - http status code in all cases
 */
export function requestErrorSendMessageLater(
  token: string,
  channelId: number,
  message: string,
  timeSent: number
): number {
  const res = request('POST', SERVER_URL + '/message/sendlater/v1', {
    headers: { token: token },
    json: {
      channelId: channelId,
      message: message,
      timeSent: timeSent,
    },
  });

  if (res.statusCode !== 200) {
    return res.statusCode;
  } else {
    throw new Error(
      'Helper function requestErrorSendMessageLater did not work'
    );
  }
}

/**
 * Helper function that sends http request to /message/unreact/v1 endpoint
 * Type-guarded to ensure output is error
 *
 * @param {string} token - string that allows users to stay in a session
 * @param {number} messageId - integer identifier for a channel
 * @param {number} reactId - integer identifier for a reaction
 *
 * @returns {number} - http status code in all cases
 */
export function requestErrorMessageUnreact(
  token: string,
  messageId: number,
  reactId: number
): number {
  const res = request('POST', SERVER_URL + '/message/unreact/v1', {
    headers: {
      token: token,
    },
    json: {
      messageId: messageId,
      reactId: reactId,
    },
  });

  if (res.statusCode !== 200) {
    return res.statusCode;
  } else {
    throw new Error('Helper function requestErrorMessageUnreact did not work');
  }
}

/**
 * Helper function that sends http request to /message/sendlaterdm/v1 endpoint
 * Type-guarded to ensure output is successful return
 *
 * @param {string} token - string that allows users to stay in a session
 * @param {number} dmId - integer identifier for a DM
 * @param {string} message - string containing the message sent by the user
 * @param {number} timeSent - number to specify the time for the message to send
 *
 * @returns {messageId: number} - in all cases
 */
export function requestSuccessfulSendDmMessageLater(
  token: string,
  dmId: number,
  message: string,
  timeSent: number
): { messageId: number } {
  const res = request('POST', SERVER_URL + '/message/sendlaterdm/v1', {
    headers: { token: token },
    json: {
      dmId: dmId,
      message: message,
      timeSent: timeSent,
    },
  });
  const jsonReturn = JSON.parse(res.getBody() as string);

  if (res.statusCode === 200) {
    return jsonReturn;
  } else {
    throw new Error(
      'Helper function requestSuccessfulSendDmMessageLater did not work'
    );
  }
}

/**
 * Helper function that sends http request to /message/sendlaterdm/v1 endpoint
 * Type-guarded to ensure output is error return
 *
 * @param {string} token - string that allows users to stay in a session
 * @param {number} dmId - integer identifier for a DM
 * @param {string} message - string containing the message sent by the user
 * @param {number} timeSent - number to specify the time for the message to send
 *
 * @returns {number} - http status code in all cases
 */
export function requestErrorSendDmMessageLater(
  token: string,
  dmId: number,
  message: string,
  timeSent: number
): number {
  const res = request('POST', SERVER_URL + '/message/sendlaterdm/v1', {
    headers: { token: token },
    json: {
      dmId: dmId,
      message: message,
      timeSent: timeSent,
    },
  });

  if (res.statusCode !== 200) {
    return res.statusCode;
  } else {
    throw new Error(
      'Helper function requestErrorSendDmMessageLater did not work'
    );
  }
}

/**
 * Helper function that sends http request to /message/share/v1 endpoint
 * Type-guarded to ensure output is successful
 *
 * @param {string} token - string to identify user session
 * @param {number} ogMessageId - unique number to identify original message
 * @param {string} message - string containing the optional message being sent (empty string by default)
 * @param {number} channelId - unique number to identify channel
 * @param {number} dmId - unique number to identify dm
 *
 * @returns { sharedMessageId: number } - in all cases
 */
export function requestSuccessfulMessageShare(
  token: string,
  ogMessageId: number,
  message: string,
  channelId: number,
  dmId: number
): { sharedMessageId: number } {
  const res = request('POST', SERVER_URL + '/message/share/v1', {
    headers: {
      token: token,
    },
    json: {
      ogMessageId: ogMessageId,
      message: message,
      channelId: channelId,
      dmId: dmId,
    },
  });
  const jsonReturn = JSON.parse(res.getBody() as string);

  if (res.statusCode === 200) {
    return jsonReturn;
  } else {
    throw new Error(
      'Helper function requestSuccessfulMessageShare did not work'
    );
  }
}

/**
 * Helper function that sends http request to /message/share/v1 endpoint
 * Type-guarded to ensure output error
 *
 * @param {string} token - string to identify user session
 * @param {number} ogMessageId - unique number to identify original message
 * @param {string} message - string containing the optional message being sent (empty string by default)
 * @param {number} channelId - unique number to identify channel
 * @param {number} dmId - unique number to identify dm
 *
 * @returns { number } - http status code - in all cases
 */
export function requestErrorMessageShare(
  token: string,
  ogMessageId: number,
  message: string,
  channelId: number,
  dmId: number
): number {
  const res = request('POST', SERVER_URL + '/message/share/v1', {
    headers: {
      token: token,
    },
    json: {
      ogMessageId: ogMessageId,
      message: message,
      channelId: channelId,
      dmId: dmId,
    },
  });

  if (res.statusCode !== 200) {
    return res.statusCode;
  } else {
    throw new Error(
      'Helper function requestErrorMessageShare did not work'
    );
  }
}
