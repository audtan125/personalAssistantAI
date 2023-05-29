import express, { json, Request, Response } from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import fs from 'fs';
import {
  authLoginV1, authRegisterV1, authLogoutV1, authPasswordResetRequestV1, authPasswordResetResetV1, getHashOf
} from './auth';
import { saveToFile } from './save';
import { clearV1 } from './other';
import { getData, setData } from './dataStore';
import { userProfileV1, usersAllV1, userSetNameV1, userSetEmailV1, userSetHandleV1, userProfileUploadPhotoV1 } from './users';
import { dmCreateV1, dmDetailsV1, dmListV1, dmMessagesV1, dmLeaveV1, dmRemoveV1 } from './dm';
import {
  messageSendDm, messageSendV1, messageRemoveV1, messageEditV1, messageReactV1, messagePinV1, messageUnpinV1,
  messageUnreactV1, messageSendLaterV1, messageSendLaterDmV1, messageShareV1
} from './message';
import { channelsCreateV1, channelsListV1, channelsListAllV1 } from './channels';
import {
  channelAddOwnerV1, channelDetailsV1, channelInviteV1, channelJoinV1,
  channelLeaveV1, channelMessagesV1, channelRemoveOwnerV1,
} from './channel';
import { standupStartV1, standupActiveV1, standupSendV1 } from './standup';
import errorHandler from 'middleware-http-errors';
import { adminUserRemoveV1 } from './admin';
import { notificationsGetV1 } from './notifications';
import { searchV1 } from './search';
import { adminUserPermissionChangeV1 } from './admin';
import { usersStatsV1, userStatsV1 } from './it4Files/userStats';
import { createPersonalAi } from './it4Files/personalAssistant';

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
// for logging errors (print to terminal)
app.use(morgan('dev'));

app.use(express.static('public'));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

// Example get request
app.get('/echo', (req: Request, res: Response, next) => {
  const data = req.query.echo as string;
  return res.json(echo(data));
});

app.get('/search/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const queryStr = req.query.queryStr as string;
  res.json(searchV1(getHashOf(token), queryStr));
});

app.post('/auth/register/v3', (req: Request, res: Response) => {
  const { email, password, nameFirst, nameLast } = req.body;
  res.json(authRegisterV1(email, password, nameFirst, nameLast));
  // Saves the new user & token in the our data variable to the file
  // dataFile.json
  saveToFile();
});

app.post('/auth/login/v3', (req: Request, res: Response) => {
  const { email, password } = req.body;
  res.json(authLoginV1(email, password));
  // Allows the new token to persist if server stops
  saveToFile();
});

app.post('/auth/logout/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  res.json(authLogoutV1(getHashOf(token)));
  saveToFile();
});

app.post('/auth/passwordreset/request/v1', (req: Request, res: Response) => {
  const { email } = req.body;
  res.json(authPasswordResetRequestV1(email));
  saveToFile();
});

app.post('/auth/passwordreset/reset/v1', (req: Request, res: Response) => {
  const { resetCode, newPassword } = req.body;
  res.json(authPasswordResetResetV1(resetCode, newPassword));
  saveToFile();
});

app.post('/dm/create/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const { uIds } = req.body;
  res.json(dmCreateV1(getHashOf(token), uIds));
  saveToFile();
});

app.get('/dm/details/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const dmId = req.query.dmId as string;
  res.json(dmDetailsV1(getHashOf(token), parseInt(dmId)));
});

app.get('/dm/list/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  res.json(dmListV1(getHashOf(token)));
});

app.delete('/dm/remove/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const dmId = req.query.dmId as string;
  res.json(dmRemoveV1(getHashOf(token), parseInt(dmId)));
  saveToFile();
});

app.post('/message/unpin/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const { messageId } = req.body;
  res.json(messageUnpinV1(getHashOf(token), messageId));
  saveToFile();
});

app.post('/dm/leave/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const { dmId } = req.body;
  res.json(dmLeaveV1(getHashOf(token), dmId));
  saveToFile();
});

app.get('/dm/messages/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const dmId: number = parseInt(req.query.dmId as string);
  const start: number = parseInt(req.query.start as string);
  res.json(dmMessagesV1(getHashOf(token), dmId, start));
});

app.post('/message/senddm/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const { dmId, message } = req.body;
  res.json(messageSendDm(getHashOf(token), dmId, message));
  saveToFile();
});

app.post('/message/send/v2', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  const { channelId, message } = req.body;
  res.json(messageSendV1(getHashOf(token), channelId, message));
  saveToFile();
});

app.put('/message/edit/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const { messageId, message } = req.body;
  res.json(messageEditV1(getHashOf(token), messageId, message));
  saveToFile();
});

app.delete('/message/remove/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const messageId: number = parseInt(req.query.messageId as string);
  res.json(messageRemoveV1(getHashOf(token), messageId));
  saveToFile();
});

app.post('/message/pin/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const { messageId } = req.body;
  res.json(messagePinV1(getHashOf(token), messageId));
  saveToFile();
});

app.post('/message/sendlater/v1', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  const { channelId, message, timeSent } = req.body;
  res.json(messageSendLaterV1(getHashOf(token), channelId, message, timeSent));
  saveToFile();
});
app.post('/message/unreact/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const { messageId, reactId } = req.body;
  res.json(messageUnreactV1(getHashOf(token), messageId, reactId));
  saveToFile();
});

app.post('/message/sendlaterdm/v1', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  const { dmId, message, timeSent } = req.body;
  res.json(messageSendLaterDmV1(getHashOf(token), dmId, message, timeSent));
  saveToFile();
});

app.post('/message/react/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const { messageId, reactId } = req.body;
  res.json(messageReactV1(getHashOf(token), messageId, reactId));
  saveToFile();
});

app.post('/message/share/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const { ogMessageId, message, channelId, dmId } = req.body;
  res.json(messageShareV1(getHashOf(token), ogMessageId, message, channelId, dmId));
  saveToFile();
});

app.post('/channels/create/v3', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  const { name, isPublic } = req.body;
  res.json(channelsCreateV1(getHashOf(token), name, isPublic));
  saveToFile();
});

app.get('/channels/list/v3', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  res.json(channelsListV1(getHashOf(token)));
});

app.get('/channels/listall/v3', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  res.json(channelsListAllV1(getHashOf(token)));
});

app.delete('/clear/v1', (req: Request, res: Response) => {
  clearV1();
  const data = getData();

  // Reset our dataFile.json to the new data
  fs.writeFileSync('src/dataFile.json', JSON.stringify(data), { flag: 'w' });
  res.json({});
  saveToFile();
});

app.get('/user/profile/v3', (req: Request, res: Response) => {
  const token = req.header('token');
  const uId = req.query.uId as string;
  res.json(userProfileV1(getHashOf(token), parseInt(uId)));
});

app.get('/users/all/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  res.json(usersAllV1(getHashOf(token)));
});

app.get('/channel/details/v3', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  const channelId = req.query.channelId as string;
  res.json(channelDetailsV1(getHashOf(token), parseInt(channelId)));
});

app.get('/channel/messages/v3', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  const channelId = req.query.channelId as string;
  const start = req.query.start as string;
  res.json(channelMessagesV1(getHashOf(token), parseInt(channelId), parseInt(start)));
});

app.post('/channel/invite/v3', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  const { channelId, uId } = req.body;
  res.json(channelInviteV1(getHashOf(token), channelId, uId));
  saveToFile();
});

app.post('/channel/join/v3', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  const { channelId } = req.body;
  res.json(channelJoinV1(getHashOf(token), channelId));
  saveToFile();
});

app.post('/channel/addowner/v2', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  const { channelId, uId } = req.body;
  res.json(channelAddOwnerV1(getHashOf(token), channelId, uId));
  saveToFile();
});

app.post('/channel/removeowner/v2', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  const { channelId, uId } = req.body;
  res.json(channelRemoveOwnerV1(getHashOf(token), channelId, uId));
  saveToFile();
});

app.post('/channel/leave/v2', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  const { channelId } = req.body;
  res.json(channelLeaveV1(getHashOf(token), channelId));
  saveToFile();
});

app.put('/user/profile/setname/v2', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  const { nameFirst, nameLast } = req.body;
  res.json(userSetNameV1(getHashOf(token), nameFirst, nameLast));
  saveToFile();
});

app.put('/user/profile/setemail/v2', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  const { email } = req.body;
  res.json(userSetEmailV1(getHashOf(token), email));
  saveToFile();
});

app.put('/user/profile/sethandle/v2', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  const { handleStr } = req.body;
  res.json(userSetHandleV1(getHashOf(token), handleStr));
  saveToFile();
});

// New iteration 3 functions

app.get('/notifications/get/v1', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  res.json(notificationsGetV1(getHashOf(token)));
});

app.post('/standup/start/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const { channelId, length } = req.body;
  res.json(standupStartV1(getHashOf(token), channelId, length));
  saveToFile();
});

app.get('/standup/active/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const channelId = req.query.channelId as string;
  res.json(standupActiveV1(getHashOf(token), parseInt(channelId)));
});

app.post('/standup/send/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const { channelId, message } = req.body;
  res.json(standupSendV1(getHashOf(token), channelId, message));
  saveToFile();
});

app.delete('/admin/user/remove/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const uId = parseInt(req.query.uId as string);
  res.json(adminUserRemoveV1(getHashOf(token), uId));
  saveToFile();
});

app.post('/admin/userpermission/change/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const { uId, permissionId } = req.body;
  res.json(adminUserPermissionChangeV1(getHashOf(token), parseInt(uId), parseInt(permissionId)));
  saveToFile();
});

app.post('/user/profile/uploadphoto/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const { imgUrl, xStart, yStart, xEnd, yEnd } = req.body;
  res.json(userProfileUploadPhotoV1(getHashOf(token), imgUrl, xStart, yStart, xEnd, yEnd));
  saveToFile();
});

// Iteration 4 functions

app.get('/users/stats/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  res.json(usersStatsV1(getHashOf(token)));
});

app.get('/user/stats/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  res.json(userStatsV1(getHashOf(token)));
});

app.post('/create/personal/assistant', (req: Request, res: Response) => {
  const token = req.header('token');
  res.json(createPersonalAi(getHashOf(token)));
  saveToFile();
});

// the first thing that the server does when it starts is to retrieve data
// from the file and update our data in dataStore to contain it
const fileData = fs.readFileSync('src/dataFile.json', { flag: 'r' });
// If file is not empty
if (String(fileData)) {
  setData(JSON.parse(String(fileData)));
}
// Keep this BENEATH route definitions
// handles errors nicely
app.use(errorHandler());

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
