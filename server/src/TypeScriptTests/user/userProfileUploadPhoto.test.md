import { requestSuccessfulUserProfileUploadPhoto, requestErrorUserProfileUploadPhoto, requestSuccessfulUserProfile } from '../../Helpers/requests/requestUserHelper';
import { requestSuccessfulAuthRegister } from '../../Helpers/requests/requestAuthHelper';
import { requestClear } from '../../Helpers/requests/requestOtherHelper';
import * as fsExtra from 'fs-extra';
import { requestSuccessfulChannelsCreate } from '../../Helpers/requests/requestChannelsHelper';
import { requestSuccessfulDmCreate, requestSuccessfulDmDetails } from '../../Helpers/requests/requestDmHelper';
import { requestSuccessfulChannelDetails } from '../../Helpers/requests/requestChannelHelper';
import { port, url } from '../../config.json';

const ERROR = 400;
const AUTH_ERROR = 403;

let globalOwner : {token: string, authUserId: number};
beforeEach(() => {
  requestClear();
  fsExtra.emptyDirSync('public/profilePics');
  globalOwner = requestSuccessfulAuthRegister('testeremail@gmail.com', '123456', 'test', 'email');
});

afterAll(() => {
  requestClear();
  fsExtra.emptyDirSync('public/profilePics');
});

describe('Successful cases', () => {
  test('valid inputs', () => {
    expect(requestSuccessfulUserProfileUploadPhoto(
      globalOwner.token,
      'http://www.cabq.gov/artsculture/biopark/news/10-cool-facts-about-penguins/@@images/1a36b305-412d-405e-a38b-0947ce6709ba.jpeg',
      200, 0, 600, 400)).toStrictEqual({});
  });
});

describe('Error cases', () => {
  test('Invalid url', () => {
    // Can be tested on this as per this forum post: https://edstem.org/au/courses/10930/discussion/1297868
    // imgUrl returns 404 status as image is not found
    expect(requestErrorUserProfileUploadPhoto(
      globalOwner.token,
      'http://www.pakainfo.com/not-found-image-url.jpg',
      0, 0, 10, 10)).toEqual(ERROR);
  });

  test('Invalid token', () => {
    expect(requestErrorUserProfileUploadPhoto(
      globalOwner.token + 'A',
      'http://www.pakainfo.com/wp-content/uploads/2021/09/dummy-user-image-url.jpg',
      0, 0, 10, 10)).toEqual(AUTH_ERROR);
  });

  describe('are not within the dimensions of the image at the URL', () => {
    test('Negative dimensions', () => {
      expect(requestErrorUserProfileUploadPhoto(
        globalOwner.token,
        'http://www.pakainfo.com/wp-content/uploads/2021/09/dummy-user-image-url.jpg',
        -1, 0, 10, 10)).toEqual(ERROR);
      // expect(requestErrorUserProfileUploadPhoto(
      //   globalOwner.token,
      //   'http://www.pakainfo.com/wp-content/uploads/2021/09/dummy-user-image-url.jpg',
      //   0, -1, 10, 10)).toEqual(ERROR);
      // expect(requestErrorUserProfileUploadPhoto(
      //   globalOwner.token,
      //   'http://www.pakainfo.com/wp-content/uploads/2021/09/dummy-user-image-url.jpg',
      //   0, 0, -1, 10)).toEqual(ERROR);
      // expect(requestErrorUserProfileUploadPhoto(
      //   globalOwner.token,
      //   'http://www.pakainfo.com/wp-content/uploads/2021/09/dummy-user-image-url.jpg',
      //   0, 0, 10, -1)).toEqual(ERROR);
    });

    test('coordinates are all 0', () => {
      // confirmed this behaviour on forums
      expect(requestErrorUserProfileUploadPhoto(
        globalOwner.token,
        'http://www.pakainfo.com/wp-content/uploads/2021/09/dummy-user-image-url.jpg',
        0, 0, 0, 0)).toEqual(ERROR);
    });

    test('end coordinates are larger than image', () => {
      // this image is 640 x 427
      expect(requestErrorUserProfileUploadPhoto(
        globalOwner.token,
        'http://www.pakainfo.com/wp-content/uploads/2021/09/dummy-user-image-url.jpg',
        0, 0, 700, 10)).toEqual(ERROR);
      // expect(requestErrorUserProfileUploadPhoto(
      //   globalOwner.token,
      //   'http://www.pakainfo.com/wp-content/uploads/2021/09/dummy-user-image-url.jpg',
      //   0, 0, 10, 500)).toEqual(ERROR);
    });

    test('start coordinates larger than end coordinates', () => {
      expect(requestErrorUserProfileUploadPhoto(
        globalOwner.token,
        'http://www.pakainfo.com/wp-content/uploads/2021/09/dummy-user-image-url.jpg',
        10, 0, 1, 1)).toEqual(ERROR);
      // expect(requestErrorUserProfileUploadPhoto(
      //   globalOwner.token,
      //   'http://www.pakainfo.com/wp-content/uploads/2021/09/dummy-user-image-url.jpg',
      //   0, 10, 1, 1)).toEqual(ERROR);
    });
  });

  test('image uploaded is not a jpg', () => {
    expect(requestErrorUserProfileUploadPhoto(
      globalOwner.token,
      'http://www.maths.usyd.edu.au/u/UG/JM/MATH1901/r/PDF/cheat-sheet.pdf',
      0, 0, 10, 10)).toEqual(ERROR);
    // expect(requestErrorUserProfileUploadPhoto(
    //   globalOwner.token,
    //   'http://upload.wikimedia.org/wikipedia/commons/e/e9/Felis_silvestris_silvestris_small_gradual_decrease_of_quality.png',
    //   0, 0, 10, 10)).toEqual(ERROR);
  });
});

// ///////////////////////// WHITEBOX TEST ///////////////////////////////// //

test('every occurrence of the image in the data object is updated', () => {
  const channelId = requestSuccessfulChannelsCreate(globalOwner.token, 'Ch', true).channelId;
  const dmId = requestSuccessfulDmCreate(globalOwner.token, []).dmId;
  expect(requestSuccessfulUserProfileUploadPhoto(
    globalOwner.token,
    'http://www.cabq.gov/artsculture/biopark/news/10-cool-facts-about-penguins/@@images/1a36b305-412d-405e-a38b-0947ce6709ba.jpeg',
    200, 0, 600, 400)).toStrictEqual({});

  // check dm details and channel details.
  const profile = requestSuccessfulUserProfile(globalOwner.token, globalOwner.authUserId);
  const channelMembers = requestSuccessfulChannelDetails(globalOwner.token, channelId).allMembers;
  const dmMembers = requestSuccessfulDmDetails(globalOwner.token, dmId).members;
  const SERVER_URL = `${url}:${port}`;
  const imgUrl = SERVER_URL + `/profilePics/${globalOwner.authUserId}-cropped.jpg`;
  expect(profile.user.profileImgUrl).toStrictEqual(imgUrl);
  expect(channelMembers[0].profileImgUrl).toStrictEqual(imgUrl);
  expect(dmMembers[0].profileImgUrl).toStrictEqual(imgUrl);
});
