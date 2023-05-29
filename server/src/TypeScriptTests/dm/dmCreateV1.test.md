import { requestSuccessfulAuthRegister } from '../../Helpers/requests/requestAuthHelper';
import { requestSuccessfulDmCreate, requestErrorDmCreate } from '../../Helpers/requests/requestDmHelper';
// import { requestSuccessfulDmCreate, requestErrorDmCreate, requestSuccessfulDmDetails } from '../../Helpers/requests/requestDmHelper';
import { requestClear } from '../../Helpers/requests/requestOtherHelper';
const ERROR = 400;
const TOKEN_ERROR = 403;

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

describe('dm create', () => {
  describe('Successful Creation of DM', () => {
    test('only one user', () => {
      // Created first user
      const authRegisterReturn = requestSuccessfulAuthRegister(
        'firstuser@gmail.com', '123456', 'First', 'User'
      );
      const token = authRegisterReturn.token;
      // an empty uId array means that the only user in the dm is the creator
      const dmCreateReturn = requestSuccessfulDmCreate(token, []);
      expect(dmCreateReturn).toStrictEqual({ dmId: expect.any(Number) });
    });

    test('for two users', () => {
      // Created First User and Second User
      const authRegisterReturn = requestSuccessfulAuthRegister(
        'firstuser@gmail.com', '123456', 'First', 'User'
      );
      const authRegisterReturn2 = requestSuccessfulAuthRegister(
        'seconduser@gmail.com', '123456', 'Second', 'User'
      );
      // Obtaining tokens and uIds
      const token = authRegisterReturn.token;
      const authUserId2 = authRegisterReturn2.authUserId;
      // First User created a dm with both users
      const dmCreateReturn = requestSuccessfulDmCreate(token, [authUserId2]);
      expect(dmCreateReturn).toStrictEqual({ dmId: expect.any(Number) });
    });

    // test('dm Id is not duplicate for two dms created', () => {
    //   // Created First User and Second User
    //   const authRegisterReturn = requestSuccessfulAuthRegister(
    //     'firstuser@gmail.com', '123456', 'First', 'User'
    //   );
    //   const authRegisterReturn2 = requestSuccessfulAuthRegister(
    //     'seconduser@gmail.com', '123456', 'Second', 'User'
    //   );
    //   // First User created a dm with just themselves
    //   const token = authRegisterReturn.token;
    //   const dmCreateReturn = requestSuccessfulDmCreate(token, []);
    //   expect(dmCreateReturn).toStrictEqual({ dmId: expect.any(Number) });
    //   // Second User created a dm with just themselves
    //   const token2 = authRegisterReturn2.token;
    //   const dmCreateReturn2 = requestSuccessfulDmCreate(token2, []);
    //   expect(dmCreateReturn2).toStrictEqual({ dmId: expect.any(Number) });
    //   // Expect that the dm Ids of these two dms are not equal
    //   expect(dmCreateReturn2.dmId).not.toBe(dmCreateReturn.dmId);
    // });

    // describe('dms with the same name/users can be created', () => {
    //   // since dm names are auto generated from the user's handlstrings
    //   // two dm's with the same sets of users will have the same name
    //   test('dms both with the same one user', () => {
    //     // Only one user created
    //     const authRegisterReturn = requestSuccessfulAuthRegister(
    //       'firstuser@gmail.com', '123456', 'First', 'User'
    //     );
    //     const token = authRegisterReturn.token;
    //     // first dm contains the only user
    //     requestSuccessfulDmCreate(token, []);
    //     // Expect success when another dm is made that just contains the only user
    //     const dmCreateReturn2 = requestSuccessfulDmCreate(token, []);
    //     expect(dmCreateReturn2).toStrictEqual({ dmId: expect.any(Number) });
    //   });
    // });

    // describe('dm name is correct', () => {
    //   test('1 user in the dm', () => {
    //     // Name should include the creator
    //     const firstUser = requestSuccessfulAuthRegister(
    //       'firstuser@gmail.com', '123456', 'First', 'User'
    //     );
    //     const dmId = requestSuccessfulDmCreate(firstUser.token, []).dmId;
    //     const dmDetails = requestSuccessfulDmDetails(firstUser.token, dmId);
    //     expect(dmDetails.name).toStrictEqual('firstuser');
    //   });

    //   test('2 users with different names in the dm', () => {
    //     const firstUser = requestSuccessfulAuthRegister(
    //       'firstuser@gmail.com', '123456', 'First', 'User'
    //     );
    //     const secondUser = requestSuccessfulAuthRegister(
    //       'seconduser@gmail.com', '123456', 'Second', 'User'
    //     );
    //     const dmId = requestSuccessfulDmCreate(firstUser.token, [secondUser.authUserId]).dmId;
    //     const dmDetails = requestSuccessfulDmDetails(firstUser.token, dmId);
    //     expect(dmDetails.name).toStrictEqual('firstuser, seconduser');
    //   });
    // });
  });

  describe('Return error', () => {
    describe('token is invalid', () => {
      test('when no existing users', () => {
        // No users have been created yet so the below token and authUserId is made up
        const dmCreateReturn = requestErrorDmCreate('invalidToken', []);
        expect(dmCreateReturn).toStrictEqual(TOKEN_ERROR);
      });
      /*
      test('when one user exists', () => {
        // Token
        const dmCreateReturn = requestErrorDmCreate('invalidToken', [1]);
        expect(dmCreateReturn).toStrictEqual(TOKEN_ERROR);
      });
      */
    });

    describe('uId does not refer to a valid user', () => {
      /*
      test('when only the only uId passed in is invalid', () => {
        // First user created
        const authRegisterReturn = requestSuccessfulAuthRegister(
          'firstuser@gmail.com', '123456', 'First', 'User'
        );
        const authUserId = authRegisterReturn.authUserId;
        const token = authRegisterReturn.token;

        // token is valid, but uId is invalid
        // authUserId + 1 will be an invalid user since only one user exists
        const dmCreateReturn = requestErrorDmCreate(token, [authUserId + 1]);
        expect(dmCreateReturn).toStrictEqual(ERROR);
      });
      */

      test('when one uId is valid but one is invalid', () => {
        const authRegisterReturn = requestSuccessfulAuthRegister(
          'firstuser@gmail.com', '123456', 'First', 'User'
        );
        const authUserId = authRegisterReturn.authUserId;
        const token = authRegisterReturn.token;
        // Second user created
        const authRegisterReturn2 = requestSuccessfulAuthRegister(
          'seconduser@gmail.com', '123456', 'Second', 'User'
        );
        const authUserId2 = authRegisterReturn2.authUserId;

        // Since we have only created 2 users, and this loop iterates 5 times,
        // there are at least 3 and at most 5 iterations with invalid userIDs.
        for (let random = 1; random !== 6; random++) {
          // Expect error if index of current iteration is not a valid user
          if (random !== authUserId && random !== authUserId2) {
            // authUserId2 is valid but random will be invalid
            const dmCreateReturn = requestErrorDmCreate(token, [authUserId2, random]);
            expect(dmCreateReturn).toStrictEqual(ERROR);
          }
        }
      });
    });

    describe('there are duplicate uIds passed in', () => {
      test('when only the duplicate pair is passed in', () => {
        const authRegisterReturn = requestSuccessfulAuthRegister(
          'firstuser@gmail.com', '123456', 'First', 'User'
        );
        const token = authRegisterReturn.token;
        // Second user created
        const authRegisterReturn2 = requestSuccessfulAuthRegister(
          'seconduser@gmail.com', '123456', 'Second', 'User'
        );
        const authUserId2 = authRegisterReturn2.authUserId;
        // One pair of duplicate uIds
        const dmCreateReturn = requestErrorDmCreate(token, [authUserId2, authUserId2]);
        expect(dmCreateReturn).toStrictEqual(ERROR);
      });
      /*
      test('when one valid uId and a duplicate pair', () => {
        const authRegisterReturn = requestSuccessfulAuthRegister(
          'firstuser@gmail.com', '123456', 'First', 'User'
        );
        const authUserId = authRegisterReturn.authUserId;
        const token = authRegisterReturn.token;

        const authRegisterReturn2 = requestSuccessfulAuthRegister(
          'seconduser@gmail.com', '123456', 'Second', 'User'
        );
        const authUserId2 = authRegisterReturn2.authUserId;

        // Since we have only created 2 users, and this loop iterates 3 times,
        // there are is at least 1 invalid user Id
        let invalidUId = 1;
        for (let i = 1; i <= 3; i++) {
          // If user Id does not exist then set it as the value of invalidUId
          if (i !== authUserId && i !== authUserId2) {
            invalidUId = i;
            break;
          }
        }
        // authUserId2 is valid, but a duplicate pair of invalidUId is passed in
        const dmCreateReturn = requestErrorDmCreate(token, [authUserId2, invalidUId, invalidUId]);
        expect(dmCreateReturn).toStrictEqual(ERROR);
      });
      */
    });
  });
});
