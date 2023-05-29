// YOU SHOULD MODIFY THIS OBJECT BELOW
export interface user {
  uId: number,
  email: string,
  nameFirst: string,
  nameLast: string,
  handleStr: string,
  profileImgUrl: string
}

export interface tokenObject {
  uId: number,
  token: string
}

export interface channel {
  channelId: number,
  name: string
}

export interface dm {
  dmId: number,
  name: string
}

export interface password {
  uId: number,
  password: string
}

export interface channelDetails {
  name: string,
  isPublic: boolean,
  ownerMembers: user[],
  allMembers: user[],
}

// These objects include the channelId, which is not included
// when requesting the channelDetail endpoint
export interface channelDetailObjects {
  channelId: number,
  details: channelDetails
}

export interface react {
  reactId: number,
  uIds: number[],
}

export interface message {
  messageId: number,
  uId: number,
  message: string,
  timeSent: number,
  reacts: react[]
  isPinned: boolean
}

export interface reactReturn {
  reactId: number,
  uIds: number[],
  isThisUserReacted: boolean
}

export interface messageReturn {
  messageId: number,
  uId: number,
  message: string,
  timeSent: number,
  reacts: reactReturn[],
  isPinned: boolean
}

export interface channelMessagesObject {
  channelId: number,
  allMessageIds: number[],
}

// returned in dm/details/v1
export interface dmDetails {
  name: string,
  members: user[]
}

export interface dmDetailObjects {
  dmId: number,
  creatorId: number,
  details: dmDetails
}

export interface dmMessagesObject {
  dmId: number,
  allMessageIds: number[],
}

export interface standupObject {
  userHandle: string,
  standupMsg: string
}

export interface standupChannelObject {
  creatorId: number,
  channelId: number,
  isActive: boolean,
  timeFinish: number,
  standupDetails: standupObject[]
}

export interface resetPasswordObject {
  uId: number,
  resetCode: string
}

export interface notification {
  channelId: number,
  dmId: number,
  // Only stores the first 20 characters
  notificationMessage: string
}

export interface userNotifObject {
  uId: number,
  notifArray: notification[]
}

export interface channelsExistObj {numChannelsExist: number, timeStamp: number}
export interface dmsExistObj {numDmsExist: number, timeStamp: number}
export interface messagesExistObj {numMessagesExist: number, timeStamp: number}

export interface workspaceStats {
  channelsExist: channelsExistObj[],
  dmsExist: dmsExistObj[],
  messagesExist: messagesExistObj[],
  utilizationRate: number
}

// Will not store utilization rate, that will be calculated
// in the users stats function
export interface workspaceStatsStore {
  channelsExist: channelsExistObj[],
  dmsExist: dmsExistObj[],
  messagesExist: messagesExistObj[],
  usersWhoHaveJoinedAChannelOrDm: number[]
}

export interface channelsJoinedObj {numChannelsJoined: number, timeStamp: number}
export interface dmsJoinedObj {numDmsJoined: number, timeStamp: number}
export interface messagesSentObj {numMessagesSent: number, timeStamp: number}

export interface userStatsReturn {
  channelsJoined: channelsJoinedObj[],
  dmsJoined: dmsJoinedObj[],
  messagesSent: messagesSentObj[],
  involvementRate: number,
}

export interface userStatObj {
  uId: number,
  numChannelsJoined: number,
  channelsJoinedStats: channelsJoinedObj[],
  numDmsJoined: number,
  dmsJoinedStats: dmsJoinedObj[],
  numMessagesSent: number,
  messagesSentStats: messagesSentObj[],
}

export interface createPersonalAiReturn {
  personalAiToken: string,
  personalAiId: number,
  personalAiDmId: number
}

export interface personalAiStateObj {
  dmId: number,
  uId: number,
  token: string,
}

export interface Data {
  users: user[],
  tokens: tokenObject[],
  globalOwners: user[],
  channels: channel[],
  dms: dm[],
  passwords: password[],
  channelDetails: channelDetailObjects[],
  channelMessages: channelMessagesObject[],
  dmDetails: dmDetailObjects[],
  dmMessages: dmMessagesObject[],
  allMessages: message[],
  standups: standupChannelObject[],
  resetCodes: resetPasswordObject[],
  notifications: userNotifObject[],
  messageIdCounter: number,
  workspaceStats: workspaceStatsStore,
  userStats: userStatObj[],
  personalAiDmsState: personalAiStateObj[]
}

let data: Data = {
  users: [],
  tokens: [],
  globalOwners: [],
  channels: [],
  dms: [],
  passwords: [],
  channelDetails: [],
  channelMessages: [],
  dmDetails: [],
  dmMessages: [],
  allMessages: [],
  standups: [],
  resetCodes: [],
  notifications: [],
  messageIdCounter: 1,
  workspaceStats: {
    channelsExist: [],
    dmsExist: [],
    messagesExist: [],
    usersWhoHaveJoinedAChannelOrDm: []
  },
  userStats: [],
  personalAiDmsState: []
};

// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

/*
Example usage
    let store = getData()
    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

    names = store.names

    names.pop()
    names.push('Jake')

    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
    setData(store)
*/

// Use getData() to access the data
function getData(): Data {
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
// - Only needs to be used if you replace the data store entirely
// - Javascript uses pass-by-reference for objects... read more here: https://stackoverflow.com/questions/13104494/does-javascript-pass-by-reference
// Hint: this function might be useful to edit in iteration 2
function setData(newData: Data) {
  data = newData;
}

export { getData, setData };
