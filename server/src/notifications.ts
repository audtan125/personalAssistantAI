import { getData, notification, setData } from './dataStore';
import { isTokenInvalid } from './Helpers/tokenHelper';
import HttpError from 'http-errors';
import { getUserId } from './Helpers/getUserId';

/**
 * Returns the user's most recent 20 notifications, ordered from most recent to least recent.
 *
 * @param {string} token - unique identifier for user
 *
 * @returns {object} {notifications} - in all cases
 */
export function notificationsGetV1(token: string): { notifications: notification[]} {
  if (isTokenInvalid(token)) {
    throw HttpError(403, 'Invalid Token');
  }

  const data = getData();
  const uId = getUserId(token);
  // Find the notifications stored for this user
  const userNotifObj = data.notifications.find(userNotifObj => userNotifObj.uId === uId);
  // If this user has no notifications
  if (userNotifObj === undefined) {
    return { notifications: [] };
  }
  // Otherwise, only take the first 20 items in notifications
  // The last index of an array with 20 items will be 19. Slice will not include the end index.
  const mostRecentNotifs = userNotifObj.notifArray.slice(0, 20);
  // Replace the current data store with only the most recent 20 notifs
  userNotifObj.notifArray = mostRecentNotifs;
  setData(data);
  return {
    notifications: mostRecentNotifs
  };
}
