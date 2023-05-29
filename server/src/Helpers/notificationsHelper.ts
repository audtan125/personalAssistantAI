import { getData, setData, notification } from '../dataStore';

/**
 * Stores the notification (of any type) in the object belonging to the user who
 * sent the message
 *
 * @param {number} notifReceiverUId - unique identifier for user who will receive the notification
 * @param {notification} notif - the notification of the reaction
 *
 * @returns void - in all cases
 */
export function storeNotif(notifReceiverUId: number, notif: notification) {
  const data = getData();
  const userNotifObj = data.notifications.find(userNotifObj => userNotifObj.uId === notifReceiverUId);
  // If this user does not have any notifications yet
  if (userNotifObj === undefined) {
    data.notifications.unshift({ uId: notifReceiverUId, notifArray: [notif] });
  } else {
    // notifications should be most recent first
    userNotifObj.notifArray.unshift(notif);
  }
  setData(data);
}
