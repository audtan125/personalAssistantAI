```javascript

const data = {
  users: [
    {
      uId: 1,
      email: 'spongebob1@gmail.com',
      nameFirst: 'Sponge',
      nameLast: 'Bob',
      handleStr: 'spongebob',
    },
  ],

  tokens: [
    {
      uId: 1,
      // example uuid generated
      token: '1968236d-1ffa-4725-af98-dd6fa8001c34',
    }
  ],

  globalOwners: [
    {
      uId: 1,
      email: 'spongebob1@gmail.com',
      nameFirst: 'Sponge',
      nameLast: 'Bob',
      handleStr: 'spongebob',
    },
  ],
  
  channels: [
    {
      channelId: 1,
      name: 'Our Channel',
    }
  ],

  dms: [
    {
      dmId: 1,
      name: 'firstname, secondname',
    }
  ],

  passwords: [
    {
      uId: 1,
      password: '123456'
    },
  ],

  channelDetails: [
    {
      channelId: 1,

      // below is the object that will be returned for 
      // channelDetails
      details: {
        name: 'A chat for sponges',
        isPublic: true,
        ownerMembers: [
          {
            uId: 1,
            email: 'spongebob1@gmail.com',
            nameFirst: 'Sponge',
            nameLast: 'Bob',
            handleStr: 'spongebob',
          },
        ],
        allMembers: [
          {
            uId: 1,
            email: 'spongebob1@gmail.com',
            nameFirst: 'Sponge',
            nameLast: 'Bob',
            handleStr: 'spongebob',
          },
        ],
      },
    }
  ],

  channelMessages: [
    {
      channelId: 1,

      // 'end' will be updated to reflect the total number of messages
      // inside the messages array
      allmessages: {
        messages: [
        {
          messageId: 1,
          uId: 1,
          message: 'Who lives in a pineapple under the sea?',
          timeSent: 1582426790,
        },
      ],
      start: 0,
      end: 50,
      },
    },
  ],

  dmDetails: [
    {
      dmId: 1,
      creatorId: 1,
      // below is the object that will be returned for 
      // dmDetails
      details: {
        name: 'firstname, secondname',
        Members: [
          {
            uId: 1,
            email: 'firstname@gmail.com',
            nameFirst: 'First',
            nameLast: 'Name',
            handleStr: 'firstname',
          },
          {
            uId: 1,
            email: 'secondname@gmail.com',
            nameFirst: 'Second',
            nameLast: 'Name',
            handleStr: 'secondname',
          },
        ],
      },
    }
  ],

  dmMessages: [
    {
      dmId: 1,

      // 'end' will be updated to reflect the total number of messages
      // inside the messages array
      allmessages: {
        messages: [
        {
          messageId: 1,
          uId: 1,
          message: 'Who lives in a pineapple under the sea?',
          timeSent: 1582426790,
        },
      ],
      start: 0,
      end: 50,
      },
    },
  ],
}

```

[Optional] short description:
Arrays in the data store
users
tokens
globalOwners
channels
dms
passwords
channelDetails
channelMessages
dmDetails
dmMessages

