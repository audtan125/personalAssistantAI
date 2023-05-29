import { Data, getData, setData } from './dataStore';

/**
 * Get the current data and resets the internal
 * state of the data, then updates to dataStore.
 *
 * @returns {object} - returns an empty object
 */

export function clearV1(): Record<string, never> {
  const data = getData();

  const emptyData = {} as Data;
  for (const key in data) {
    if (key === 'workspaceStats') {
      emptyData[key] = {
        channelsExist: [],
        dmsExist: [],
        messagesExist: [],
        usersWhoHaveJoinedAChannelOrDm: []
      };
    } else if (typeof (data[key]) === 'object') {
      emptyData[key] = [];
    } else if (typeof (data[key]) === 'number') {
      emptyData[key] = 1;
    }
  }
  setData(emptyData);
  return {};
}
