import request from 'sync-request';
import { port, url } from '../../config.json';
const SERVER_URL = `${url}:${port}`;

/**
 * Helper function that sends http request to /clear/v1 endpoint
 *
 * @returns {object} {}
 */
export function requestClear(): Record<string, never> {
  const res = request('DELETE', SERVER_URL + '/clear/v1', { json: {} });
  return JSON.parse(res.getBody() as string);
}
