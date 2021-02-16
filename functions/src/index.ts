import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
const firebase_tools = require('firebase-tools');

const firebase = admin.initializeApp();
const db = admin.firestore();
const client = require('twilio')(functions.config().twilio.accountsid, functions.config().twilio.authtoken);
import * as sharp from 'sharp';

// ================================================================================
// =====                                                                     ======
// =====                        ENVIRONMENT CONFIG                           ======
// =====  https://firebase.google.com/docs/functions/config-env              ======
// =====  For storing environment variables                                  ======
// ================================================================================

// ================================================================================
// =====                     ANGULAR UNIVERSAL SSR                           ======
// ================================================================================

const universal = require(`${process.cwd()}/dist/server`).app;
export const ssr = functions.runWith({memory: '1GB', timeoutSeconds: 300}).https.onRequest(universal);

// ================================================================================
// =====                     MAKING EXTERNAL REQUESTS                        ======
// ================================================================================

import fetch from 'node-fetch'; // Using the Fetch API which supports promises

// ================================================================================
// =====                                                                     ======
// =====                           ALGOLIA CONFIG                            ======
// =====                                                                     ======
// =====  https://www.algolia.com                                            ======
// ================================================================================
// https://www.algolia.com/doc/guides/sending-and-managing-data/send-and-update-your-data/tutorials/firebase-algolia/

import * as algoliasearch from 'algoliasearch';
const algolia = algoliasearch(functions.config().algolia.appid, functions.config().algolia.adminkey);
// ================================================================================
// =====                   NOLT CLIENT FEEDBACK CONFIG                       ======
// ================================================================================

const jwt = require('jsonwebtoken');
const noltSsoSecretKey = functions.config().nolt.ssosecretkey;

// ================================================================================
// =====                          REBRANDLY CONFIG                           ======
// ===== https://developers.rebrandly.com/docs/get-started                   ======
// ================================================================================

const rebrandlyApiKey = functions.config().rebrandly.apikey;
const shortUrlEndpoint = 'https://api.rebrandly.com/v1/links'

// ================================================================================
// =====                           STRIPE CONFIG                             ======
// ================================================================================

// Set Stripe secret key. Remember to switch to live secret key in production!
// See Stripe keys here: https://dashboard.stripe.com/account/apikeys

import { Stripe } from 'stripe';
const config: Stripe.StripeConfig = { apiVersion: '2020-08-27', typescript: true }
const stripe = new Stripe(functions.config().stripe.prod.secretkey, config); // prod secret key
const stripeWebhookSecret = functions.config().stripe.prod.webhooksecret; // prod secret webhook key
const stripeWebhookConnectSecret = functions.config().stripe.prod.webhookconnectsecret // prod secret webhook key
const ecourseAppFeeDecimal = 0.3; // our std application fee percentage for ecourses, expressed as a decimal. eg 0.5 // 50%
const ecourseAppFeeReferralDecimal = 0.1; // our reduced ecourse app fee percentage expressed as a decimal.
const programAppFeeDecimal = 0.1;
const programAppFeeReferralDecimal = 0.025;
const serviceAppFeeDecimal = 0.1;
const serviceAppFeeReferralDecimal = 0.025;
// const partnerReferralDecimal = 0.5;

// ================================================================================
// =====                                                                     ======
// =====                         NODE MAILER CONFIG                          ======
// =====                                                                     ======
// =====  https://nodemailer.com/about/                                      ======
// ================================================================================

import * as nodemailer from 'nodemailer';
import * as smtpTransport from 'nodemailer-smtp-transport';
import * as Mail from 'nodemailer/lib/mailer';
const transporter = nodemailer.createTransport(smtpTransport({
  port: 465,
  host: 'mail.privateemail.com',
  auth: {
    user: 'donotreply@lifecoach.io',
    pass: functions.config().nodemailer.donotreply.password
  },
  secure: true
}));

// ================================================================================
// =====                    OPEN EXCHANGE RATES CONFIG                       ======
// ================================================================================

const openXBaseUrl = 'https://openexchangerates.org/api/';
const openXAppId = functions.config().openx.appid;

// ================================================================================
// =====                      NODE MAILER FUNCTIONS                          ======
// ================================================================================

function sendEmail(mailOptions: Mail.Options) {
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.error('Nodemailer error:', error);
    }
    console.log('Nodemailer message sent: ' + info.response);
  });
}

// ================================================================================
// =====                         COUNTRY FLAG EMOJI                          ======
// ================================================================================

const countryFlagEmoji = require('country-flag-emoji'); // https://github.com/risan/country-flag-emoji

// ================================================================================
// =====                                                                     ======
// =====                       MAILING LIST FUNCTIONS                        ======
// =====                                                                     ======
// =====  Node SDK: https://www.npmjs.com/package/mailchimp-api-v3           ======
// =====  API Doc: https://mailchimp.com/developer/reference/                ======
// =====  Using the crypto library to convert email strings into MD5 hashes" ======
// ================================================================================

const Mailchimp = require('mailchimp-api-v3');
const mailchimp = new Mailchimp(functions.config().mailchimp.appid);
const crypto = require('crypto');

const listIdCoach = 'e76f517709';
const listIdRegular = '69574927c8';
const listIdPartner = '7c802ca01f';
const listIdProvider = '512b33c527';

function getMcListId(userType: 'regular' | 'coach' | 'partner' | 'provider') {
  switch(userType) {
    case 'regular':
      return listIdRegular;
    case 'coach':
      return listIdCoach;
    case 'partner':
      return listIdPartner;
    case 'provider':
      return listIdProvider;
    default:
      return listIdRegular;
  }
}

function addUserToMailchimp(email: string, firstName: string, lastName: string, type: 'regular' | 'coach' | 'partner' | 'provider') {

  // Assign the correct Mailchimp list (audience) ID
  const listID = getMcListId(type);

  // Add user to Mailchimp (account type determines which list)
  mailchimp.post(`/lists/${listID}`, {
    members : [{
      email_address: email,
      status: 'subscribed',
      merge_fields: {
        'FNAME': firstName,
        'LNAME': lastName
      }
    }], "update_existing":true
  })
  .then((results: any) => {
    console.log('Successfully added new firebase user', email, 'to Mailchimp list', listID);
  })
  .catch((err: any) => {
    console.error(err);
  });
}

function patchMailchimpUserEmail(accountType: 'regular' | 'coach' | 'partner' | 'provider', oldEmail: string, newEmail: string) {

  // Which list is the member subscribed to?
  const listId = getMcListId(accountType);

  // Generate an MD5 hash from the lowercase email address
  const subscriberHash = crypto.createHash('md5').update(oldEmail.toLowerCase()).digest("hex");

  mailchimp.patch(`/lists/${listId}/members/${subscriberHash}`, {
    email_address: newEmail
  })
  .then((results: any) => {
    console.log('Successfully updated firebase user', newEmail, 'in Mailchimp list', listId);
  })
  .catch((err: any) => {
    console.error(err);
  });
}

function patchMailchimpUserName(accountType: 'regular' | 'coach' | 'partner' | 'provider', email: string, firstName: string, lastName: string) {
  // Which list is the member subscribed to?
  const listId = getMcListId(accountType);

  // Generate an MD5 hash from the lowercase email address
  const subscriberHash = crypto.createHash('md5').update(email.toLowerCase()).digest("hex");

  mailchimp.patch(`/lists/${listId}/members/${subscriberHash}`, {
    merge_fields: {
      'FNAME': firstName,
      'LNAME': lastName
    }
  })
  .then((results: any) => {
    console.log('Successfully updated firebase user', email, 'in Mailchimp list', listId);
  })
  .catch((err: any) => {
    console.error(err);
  });
}

function archiveMailchimpUser(accountType: 'regular' | 'coach' | 'partner' | 'provider', email: string) {
  // Which list is the member subscribed to?
  const listId = getMcListId(accountType);

  // Generate an MD5 hash from the lowercase email address
  const subscriberHash = crypto.createHash('md5').update(email.toLowerCase()).digest("hex");

  mailchimp.delete(`/lists/${listId}/members/${subscriberHash}`)
  .then((results: any) => {
    console.log('Successfully archived firebase user', email, 'in Mailchimp list', listId);
  })
  .catch((err: any) => {
    console.error(err);
  });
}

// function addSubscriberToWorkflowEmail(workFlowId: string, workFlowEmailId: string, email: string) {
//   // Adds a new subscriber to a workflow email (manually triggers an automated email)
//   // https://mailchimp.com/developer/reference/automation/automation-email/automation-email-queue/
//   // Workflow Id and workflow email ID can be seen in our Mailchimp account for the relevant automation.
//   mailchimp.post(`/automations/${workFlowId}/emails/${workFlowEmailId}/queue`, {
//     email_address: email
//   })
//   .then((results: any) => {
//     console.log(`Successfully triggered Mailchimp workflow ${workFlowId}, email ${workFlowEmailId} for ${email}`);
//   })
//   .catch((err: any) => {
//     console.log('Adding subscriber to workflow email issue:', err);
//   });
// }

async function logMailchimpEvent(uid: string, mailchimpEvent: any) {
  // https://mailchimp.com/developer/guides/create-custom-events/

  // Lookup user account
  const accountSnap = await db.collection(`users/${uid}/account`)
    .doc(`account${uid}`)
    .get();  // lookup account email

  if (accountSnap.exists) {
    const account = accountSnap.data() as any;
    if (account.accountType && account.accountEmail) {

      // Which list is the member subscribed to?
      const listId = getMcListId(account.accountType);

      // Generate an MD5 hash from the lowercase email address
      const subscriberHash = crypto.createHash('md5').update(account.accountEmail.toLowerCase()).digest("hex");

      // post the event
      mailchimp.post(`/lists/${listId}/members/${subscriberHash}/events`, {
        name: mailchimpEvent.name,
        properties: mailchimpEvent.properties
      })
      .then((results: any) => {
        console.log(`Successfully logged Mailchimp event ${mailchimpEvent.name} for ${account.accountEmail}`);
      })
      .catch((err: any) => {
        console.error(err);
      });
    }
  }

}

// Update Mailchimp with a user's new email address
exports.updateMailingListUserEmail = functions
.runWith({memory: '1GB', timeoutSeconds: 300})
.https
.onCall( async (data, context) => {
  // console.log(context.auth);

  // Reject any unauthorised user immediately.
  if (!context.auth) {
      return {error: 'You must be authorised!'}
  }

  // Attempt the update
  patchMailchimpUserEmail(data.accountType, data.oldEmail, data.newEmail);

  // Return regardless of success
  return {success: 'Attempted Mailchimp update - success unknown, check logs'};
});

// Update Mailchimp with a user's name
exports.updateMailingListUserName = functions
.runWith({memory: '1GB', timeoutSeconds: 300})
.https
.onCall( async (data, context) => {
  // console.log(context.auth);

  // Reject any unauthorised user immediately.
  if (!context.auth) {
      return {error: 'You must be authorised!'}
  }

  // Attempt the update
  patchMailchimpUserName(data.accountType, data.email, data.firstName, data.lastName);

  // Return regardless of success
  return {success: 'Attempted Mailchimp update - success unknown, check logs'};
});

// ================================================================================
// =====                                                                     ======
// =====                     USER / ACCOUNT FUNCTIONS                        ======
// =====                                                                     ======
// =====                                                                     ======
// ================================================================================

async function addCustomUserClaims(uid: string, claims: any) {
  /*
  Helper function to merge new custom auth claims
  Required as setting a custom claim object always overwrites an existing one
  If no existng custom claims object, this function will init one
  Note: Setting custom claims to null will delete all claims!
  */
  try {
    const user = await admin.auth().getUser(uid);
    const updatedClaims = user.customClaims || {} as any;

    for (const property in claims) {
      if (claims.hasOwnProperty(property)) {
        updatedClaims[property] = claims[property];
      }
    };
    console.log('Setting custom auth claims:', JSON.stringify(updatedClaims));
    await admin.auth().setCustomUserClaims(uid, updatedClaims);
    return {success: true};
  } catch (err) {
    console.error('Error setting custom claims!:', err);
    return {error: err}
  }
}

async function removeCustomUserClaims(uid: string, claims: any) {
  /*
  Helper function to remove custom auth claims
  Required as setting a custom claim object always overwrites an existing one
  */
  try {
    const user = await admin.auth().getUser(uid);
    const updatedClaims = user.customClaims

    if (updatedClaims) {
      for (const property in claims) {
        if (updatedClaims[property]) {
          updatedClaims[property] = null;
        }
      };
      console.log('Setting custom auth claims:', JSON.stringify(updatedClaims));
      await admin.auth().setCustomUserClaims(uid, updatedClaims);
    }

    return {success: true};

  } catch (err) {
    console.error('Error removing custom claims!:', err);
    return {error: err}
  }
}

async function createUserNode(uid: string, email: string, type: 'regular' | 'coach' | 'partner' | 'provider' | 'admin',
firstName: string | null, lastName: string | null) {

  // Initialise account data
  await db.collection(`users/${uid}/account`)
  .doc('account' + uid)
  .set({
    dateCreated: Math.round(new Date().getTime()/1000), // unix timestamp
    accountType: type,
    accountEmail: email,
    firstName,
    lastName
  })
  .catch(err => console.error(err));

  // Initialise default data

  const batch = db.batch(); // prepare to execute multiple ops atomically

  if (type === 'coach') { // Coach account

    // Default tasks
    const ref1 = db.collection(`users/${uid}/tasks-todo/`).doc('taskDefault001');
    batch.set(ref1, {
      id: 'taskDefault001',
      title: 'Complete your coach profile',
      description: 'Everything at Lifecoach starts with your public Coach profile. Start creating yours now.',
      action: 'profile'
    });

    const ref3 = db.collection(`users/${uid}/tasks-todo/`).doc('taskDefault004');
    batch.set(ref3, {
      id: 'taskDefault004',
      title: 'Enable your payout account',
      description: 'Enable your payout account now so you can charge for your products & services.',
      action: 'account'
    });

    const ref4 = db.collection(`users/${uid}/tasks-todo/`).doc('taskDefault003');
    batch.set(ref4, {
      id: 'taskDefault003',
      title: 'Add your products & services',
      description: `Promote your coaching services, take bookings, run live 1-to-1 video sessions & sell eCourses. We'll help every step of the way.`,
      action: 'coach-products-services'
    });

    return batch.commit() // execute batch ops
    .catch(err => console.error(err));

  } else if (type === 'regular') { // Regular account

    return db.collection(`users/${uid}/regularProfile`)
    .doc(`profile${uid}`)
    .set({ // init a regular type profile
      firstName,
      lastName,
      email
    })
    .catch(err => console.error(err));

  } else if (type === 'partner') { // partner account

    // Default tasks for partners
    const ref1 = db.collection(`users/${uid}/tasks-todo/`).doc('taskDefault004');
    batch.set(ref1, {
      id: 'taskDefault004',
      title: 'Enable your payout account',
      description: 'Head to Account > Payout Settings to enable your payout account so you can get paid.',
      action: 'account'
    });

    const ref2 = db.collection(`users/${uid}/tasks-todo/`).doc('taskDefault005');
    batch.set(ref2, {
      id: 'taskDefault005',
      title: 'Test your tracking link',
      description: 'Test your unique tracking link to ensure you can earn commission on all referrals to Lifecoach.',
      action: 'partner-link'
    });

    return batch.commit() // execute batch ops
    .catch(err => console.error(err));

  } else if (type === 'provider') { // provider account
    // any actions for providers?
    return;

  } else if (type === 'admin') { // Admin account
    // any actions for admins?
    return;
  }

}

exports.createDbUserWithType = functions
.runWith({memory: '1GB', timeoutSeconds: 300})
.https
.onCall( async (data, context) => {

  // Reject any unauthorised user immediately.
  if (!context.auth) {
      return {error: 'You must be authorised!'}
  }

  // Create the user node in the DB.
  await createUserNode(data.uid, data.email, data.type, data.firstName, data.lastName);
  console.log(`User node created successfully for ${data.type} account user ${data.uid}`);

  // Set custom claim on the user's auth object.
  const res = await addCustomUserClaims(data.uid, {
    [data.type]: true
  });
  console.log(`Custom auth claim ${data.type} set successfully`);

  addUserToMailchimp(data.email, data.firstName, data.lastName, data.type);

  // Return
  if (!res.error) {
      return {success: true};
  } else {
      return {error: res.error}
  }
});

exports.createAdminUser = functions
.runWith({memory: '1GB', timeoutSeconds: 300})
.https
.onCall( async (data, context) => {

  // Reject any unauthorised user immediately.
  if (!context.auth) {
      return {error: 'You must be authorised!'}
  }

  // Reject if special admin password not correct
  if (data.adminPassword !== '*starDustSpaceSh1p*') {
    return {error: 'Get lost'}
  }

  // Update the user's node in the DB.
  await createUserNode(data.uid, data.email, 'admin', data.firstName, data.lastName);
  // console.log(`User node created successfully updated for new Admin user ${data.uid}`);

  // Set custom admin claim on the user's auth object.
  const res = await addCustomUserClaims(data.uid, {
      admin: true
  });
  // console.log(`Custom Admin auth claim set successfully`);

  // Return
  if (!res.error) {
      return {success: true};
  } else {
      return {error: res.error}
  }
});

// Delete a user's own data (on account closure)
// Note: This delete is NOT an atomic operation and it's possible that it may fail after only deleting some documents.
// https://firebase.google.com/docs/firestore/solutions/delete-collections
exports.recursiveDeleteUserData = functions
.runWith({
  timeoutSeconds: 540,
  memory: '2GB'
})
.https.onCall(async (data, context) => {

  const userId = data.uid;
  const accountType = data.accountType;
  const userEmail = data.email;

  if (!context.auth || context.auth.token.uid !== userId) {
    return {error: 'You must be authorised!'}
  }

  const path = `users/${userId}`;
  console.log(`User ${context.auth.uid} has requested to delete path ${path}`);

  /*
    Cleanup DB.
    Run a recursive delete on the given document or collection path.
    The 'token' must be set in the functions config, and can be generated
    at the command line by running 'firebase login:ci'.
  */
  await firebase_tools.firestore.delete(path, {
    project: process.env.GCLOUD_PROJECT,
    recursive: true,
    yes: true,
    token: functions.config().fb.token
  });

  console.log(`DB cleanup complete for user ${context.auth.uid}. Commencing cleanup of Storage...`);

  // Cleanup Storage.
  // Note: Important! Do not delete course related content as we offer this for 'life' for all users
  // who have purchased course content from this user
  const bucket = firebase.storage().bucket();
  await bucket.deleteFiles({
    prefix: `users/${userId}/profilePics`
  });
  console.log(`Storage - profilePics deleted for user ${context.auth.uid}`);
  await bucket.deleteFiles({
    prefix: `users/${userId}/profileVideos`
  });
  console.log(`Storage - profileVideos deleted for user ${context.auth.uid}`);

  console.log(`Storage bucket cleanup complete for user ${context.auth.uid}. Commencing cleanup of mailing list...`);

  // Cleanup Mailing List.
  console.log(`Removing user ${userEmail} from Mailchimp...`);
  archiveMailchimpUser(accountType, userEmail);

  console.log(`Mailing list cleanup complete for user ${context.auth.uid}. Commencing cleanup of Algolia...`);

  // TODO - query Algolia for any draft courses, programs or services created by this user. Delete records if found.
  // use "sellerUid" as a facet value.
  // note: max facet results is 10 so if user has any more drafts, only 10 records will be returned.

  console.log(`User data deleted successfully!`);

  return {
    success: true // See note above on success
  };
});

exports.adminChangeUserType = functions
.runWith({memory: '1GB', timeoutSeconds: 300})
.https
.onCall( async (data, context) => {

  // Reject any non admin user immediately.
  if (!context.auth || !context.auth.token.admin) {
    return {error: 'Unauthorised!'}
  }

  try {
    // Set new custom claim on the user's auth object.
    await addCustomUserClaims(data.userId, {
      [data.newType]: true
    });

    // remove the old claim on the user's auth object
    await removeCustomUserClaims(data.userId, {
      [data.oldType]: null
    });

    // update the user's account node in the db
    await db.collection(`users/${data.userId}/account`)
    .doc('account' + data.userId)
    .set({
      accountType: data.newType
    }, { merge: true });

    // read account data to get account email
    const account = await db.collection(`users/${data.userId}/account`)
    .doc('account' + data.userId)
    .get();

    const acc = account.data() as any;

    // update mailing list
    archiveMailchimpUser(data.oldType, acc.accountEmail); // removes from old list
    addUserToMailchimp(acc.accountEmail, acc.firstName, acc.lastName, data.newType); // adds to new list

    return {success: true};

  } catch (err) {
    return {error: err}
  }
});

// ================================================================================
// =====                                                                     ======
// =====                        MESSAGING FUNCTIONS                          ======
// =====                                                                     ======
// =====                                                                     ======
// ================================================================================

function hashUids(uid1: string, uid2: string) {
  // Order uids lexicographically, ensuring we get the same hash no matter what order we pass uids in
  const uids = [uid1, uid2];
  uids.sort()
  const sortedJoinedString = uids[0] + uids[1];
  // Return the sorted uid string as a hash
  return crypto.createHash('md5').update(sortedJoinedString).digest('hex');
}

/*
  Post a message.
  Will create a new room when first message sent between 2 users.
  If first message, both user UIDs are required to generate a roomID (hash of 2 UIDs).
  If subsequent messages, only the sender UID and the existing roomID of the room being posted to are required.
*/
exports.postNewMessage = functions
.runWith({memory: '1GB', timeoutSeconds: 300})
.https
.onCall( async (data, context) => {
  const senderUid = data.senderUid;
  const recipientUid = data.recipientUid; // <-- NB: Only pass in on FIRST message (after that we post to room ID not user)
  const existingRoomId = data.roomID;
  const message = data.message;

  if (!context.auth) {
    return { error: 'You must be authorised to post a message!' }
  }

  if (!existingRoomId && (!senderUid || !message || !recipientUid) ) {
    return { error: 'Insufficient data to create room' }
  }

  if (existingRoomId && (!senderUid || !message) ) {
    return { error: 'Insufficient data to post message into existing room'}
  }

  const roomId = existingRoomId ? existingRoomId : hashUids(senderUid, recipientUid);
  const users = [senderUid, recipientUid];

  const timestampNow = Math.round(new Date().getTime() / 1000);

  try {

    const promises = [];

    // lookup the room to check if it already exists
    const existingRoom = await db.collection(`chatrooms`)
    .doc(roomId)
    .get();

    // if room does not exist, create it.
    if (!existingRoom.exists) {
      await db.collection(`chatrooms`)
      .doc(roomId)
      .set({ created: timestampNow }); // creates a real (not virtual) doc

      // save the person to the recipient's people (create if doesn't yet exist - it might)
      await db.collection(`users/${recipientUid}/people`)
      .doc(senderUid)
      .create({ created: timestampNow }); // creates a real (not virtual) doc

      // save the action to this person's history
      await db.collection(`users/${recipientUid}/people/${senderUid}/history`)
      .doc(timestampNow.toString())
      .set({
        action: 'sent_first_message',
        roomId
      });

      // save a record of the new lead to Algolia
      const index = algolia.initIndex('prod_LEADS');

      const recordToSend = {
        objectID: roomId,
        created: timestampNow,
        roomId,
        users,
        firstMessage: message
      };
      // Update Algolia.
      await index.saveObject(recordToSend);
    }

    // Post new message into room
    const postMsgPromise = db.collection(`chatrooms/${roomId}/messages`)
    .doc()
    .set({
      sent: Math.round(new Date().getTime() / 1000), // unix timestamp
      from: senderUid,
      msg: message
    });
    promises.push(postMsgPromise);

    // On first room creation, setup userRooms
    if (recipientUid) {
      for (const user of users) {
        if (user) {
          await db.collection(`userRooms/${user}/rooms`)
          .doc(roomId)
          .set({
            users: [senderUid, recipientUid], // so we can track which other users are in all rooms a user is in
            roomId // so we always have easy access to the room ID
          }, {merge: true});
        }
      }
    }

    const snap = await db.collection(`userRooms/${senderUid}/rooms`)
    .doc(roomId)
    .get(); // read all users in the sender's room as we may not have a recipient uid (if room already exists)

    const senderRoom = snap.data() as any;
      for (const user of senderRoom.users) { // for all users
        if (user) {

          // Update last active time stamp, sender & message for each user.
          const updatePromise = db.collection(`userRooms/${user}/rooms`)
          .doc(roomId)
          .set({
            lastActive:  Math.round(new Date().getTime()/1000), // so we can sort
            lastMsg: message, // so we can show last message
            lastSender: senderUid // so we can see who the last sender was
          }, {merge: true});
          promises.push(updatePromise);

          // update the people node for both users if the other user was the last to respond
          // this triggers the people subscription to update the client view as users respond to messages in real-time
          if (user !== senderUid) {
            const peoplePromise = db.collection(`users/${user}/people`)
            .doc(senderUid)
            .set({
              lastReplyReceived: timestampNow
            }, { merge: true }); // will update the time the other user last replied for both parties
            promises.push(peoplePromise);
          }

        }
      }

    // Set this room as the last active room for the sender only.
    const activeRoomPromise = db.collection('userRooms')
    .doc(senderUid)
    .set({
      lastActiveRoom: roomId // so we can load this room by default when coming from '/messages'
    }, {merge: true});
    promises.push(activeRoomPromise);

    // Execute all operations in parallel.
    await Promise.all(promises);

    // All done :)
    return { success: true }

  } catch (err) {
    console.error(err);
    return { error: err }
  }

});

// ================================================================================
// =====                           SSO FUNCTIONS                             ======
// ================================================================================

/*
  Attempts to generate a JSON Web Token containing user data in the payload.
  If successful, returns a JWT, else returns an error message.
*/
exports.generateJWT = functions
.runWith({memory: '1GB', timeoutSeconds: 300})
.https
.onCall( async (data, context) => {
  const uid = data.uid;

  try {
    // read user account data
    const accSnap = await db.collection(`users/${uid}/account`)
    .doc('account' + uid)
    .get();

    if (accSnap.exists) {
      const account = accSnap.data() as any;

      // prepare token payload
      const payload = {
        id: uid, // The ID that you use in your app for this user
        email: account.accountEmail, // The user's email address that Nolt should use for notifications
        name: account.firstName + ' ' + account.lastName, // The display name for this user
      } as any;

      const profileSnap = await db.collection(`users/${uid}/profile`)
      .doc('profile' + uid)
      .get();

      if (profileSnap.exists) {
        const profile = profileSnap.data() as any;
        payload.imageUrl = profile.photo; // Optional: The URL to the user's avatar picture
      }

      // success! return a JWT for this user
      console.log('JWT payload generated successfully:', payload);
      return { token: jwt.sign(payload, noltSsoSecretKey, { algorithm: 'HS256' }) }

    } else {
      return { error: 'Unable to retrieve user data' }
    }

  } catch (err) {
    console.error(err);
    return { error: err }
  }
});

// ================================================================================
// =====                       SHORT URL FUNCTIONS                           ======
// ================================================================================

/*
  Attempts to generate a short url using Rebrandly, for a coach user profile.
  If successful, returns ??, else returns an error message.
*/
exports.generateCoachProfileShortUrl = functions
.runWith({memory: '1GB', timeoutSeconds: 300})
.https
.onCall( async (data, context) => {

  const uid = data.uid;
  const destination = data.destination;

  try {

    // Prepare the request
    const linkRequest = {
      destination,
      domain: { fullName: 'link.lifecoach.io' }
      //, slashtag: "A_NEW_SLASHTAG"
      //, title: "Meet this coach"
    }

    const requestHeaders = {
      'Content-Type': 'application/json',
      'apikey': rebrandlyApiKey
    }

    const response = await fetch(shortUrlEndpoint, {
      headers: requestHeaders,
      method: 'POST',
      body: JSON.stringify(linkRequest)
    });

    if (response.status === 200) { // fetch success
      const link = await response.json();
      console.log(`Shortlink generated successfully! Long URL was ${link.destination}, short URL is ${link.shortUrl}`);

      // Save short Url to user profile
      await db.collection(`users/${uid}/profile`)
      .doc(`profile${uid}`)
      .set({
        shortUrl: link.shortUrl
      }, {merge: true});

      return { success: true }

    } else { // fetch error
      return { error: response.status }
    }

  } catch (err) {
    console.error(err);
    return { error: err }
  }
});

// ================================================================================
// =====                           STRIPE FUNCTIONS                          ======
// ================================================================================

/*
  Scheduled function to update platform currency rates.
  See: https://firebase.google.com/docs/functions/schedule-functions
  https://docs.openexchangerates.org/docs
*/
exports.scheduledFunctionUpdateRates = functions
  .runWith({memory: '1GB', timeoutSeconds: 300})
  .pubsub.schedule('every 60 mins')
  .timeZone('GMT')
  .onRun( async (context) => {
  console.log('This will be run every hour, starting at 00:00 AM GMT!');

  try {
    // request rates from Open Exchange Rates API with default USD as the base rate
    const response = await fetch(`${openXBaseUrl}latest.json?app_id=${openXAppId}`);

    if (response.status === 200) { // fetch success
      const oXRates = await response.json();
      console.log(`Open Exchange Rates fetched successfully!`);

      const rates = oXRates.rates;
      rates.timestamp = oXRates.timestamp;

      // Save rates to DB
      await db.collection(`currency`)
      .doc(`rates`)
      .set(rates);

      return null;

    } else { // fetch error
      const res = await response.json();
      throw new Error(`Fetch rates error! ${JSON.stringify(res)}`);
    }
  } catch (err) {
    console.error(err);
    return null;
  }
});

/*
  Manual function to update platform currency rates.
*/
exports.manualUpdateRates = functions
  .runWith({memory: '1GB', timeoutSeconds: 300})
  .https
  .onCall( async (context) => {

  try {
    // request rates from Open Exchange Rates API with default USD as the base rate
    const response = await fetch(`${openXBaseUrl}latest.json?app_id=${openXAppId}`);

    if (response.status === 200) { // fetch success
      const oXRates = await response.json();
      console.log(`Open Exchange Rates fetched successfully!`);

      const rates = oXRates.rates;
      rates.timestamp = oXRates.timestamp;

      // Save rates to DB
      await db.collection(`currency`)
      .doc(`rates`)
      .set(rates);

      return { success: true };

    } else { // fetch error
      const res = await response.json();
      throw new Error(`Fetch rates error! ${JSON.stringify(res)}`);
    }
  } catch (err) {
    console.error(err);
    return { error: err };
  }
});

/*
  Attempts to complete Stripe connected account setup.
*/
exports.completeStripeConnect = functions
.runWith({memory: '1GB', timeoutSeconds: 300})
.https
.onCall( async (data, context) => {

  const uid = data.uid;
  const code = data.code;

  try {

    // Call Stripe to convert an auth code into an access token to complete connect setup
    const res = await stripe.oauth.token({
      grant_type: 'authorization_code',
      code,
    });

    // success. 'res' now contains the user's Stripe ID
    console.log('Stripe OAuth token result:', JSON.stringify(res));

    if (res.stripe_user_id) { // success

      const promises = [];

      // Save the user's Stripe ID to the DB
      const promise1 = db.collection(`users/${uid}/account`)
      .doc(`account${uid}`)
      .set({
        stripeUid: res.stripe_user_id
      }, { merge: true });
      promises.push(promise1);

      // Immediately update the account to ensure correct data & settings
      const promise2 = stripe.accounts.update(res.stripe_user_id, {
        metadata: {
          lifecoachUID: uid // associate our UID to identify user from Stripe webhooks
        },
        settings: {
          payouts: {
            schedule: { // Update the Stripe account to ensure correct payout schedule
              delay_days: 28,
              interval: 'monthly',
              monthly_anchor: 31
            }
          }
        }
      });
      promises.push(promise2);

      await Promise.all(promises as any); // run concurrent ops

      return { stripeUid: res.stripe_user_id }
    } else { // error should be caught by catch
      return { error: 'No stripe user ID' }
    }

  } catch (err) {
    console.error(err);
    return { error: err }
  }
});

/*
  Attempts to generate a Stripe login link for a connected account.
*/
exports.stripeCreateLoginLink = functions
.runWith({memory: '1GB', timeoutSeconds: 300})
.https
.onCall( async (data, context) => {

  const stripeUid = data.stripeUid;

  try {

    const res = await stripe.accounts.createLoginLink(stripeUid);

    console.log('Stripe login link result:', JSON.stringify(res));

    return { stripeLoginUrl: res.url } // success

  } catch (err) {
    console.error(err);
    return { error: err }
  }
});

/*
  Attempts to retrieve a Stripe account balance.
*/
exports.stripeRetrieveBalance = functions
.runWith({memory: '1GB', timeoutSeconds: 300})
.https
.onCall( async (data, context) => {

  const stripeUid = data.stripeUid;

  try {

    const options: Stripe.RequestOptions = {
      stripeAccount: stripeUid
    };
    const res = await stripe.balance.retrieve(options);

    return { balance: res } // success

  } catch (err) {
    console.error(err);
    return { error: err }
  }
});

/*
  Attempts to generate a Stripe payment intent.
  See: https://stripe.com/docs/connect/destination-charges

  This function can be used to generate a payment intent for all supported Lifecoach products & services,
  so be careful to pass the correct saleItemType as an argument.
*/
exports.stripeCreatePaymentIntent = functions
.runWith({memory: '1GB', timeoutSeconds: 300})
.https
.onCall( async (data, context) => {

  const saleItemId: string = data.saleItemId;
  const saleItemType: 'ecourse' | 'fullProgram' | 'programSession' | 'coachingPackage' = data.saleItemType;
  const clientPrice: number = Number(data.salePrice);
  const clientCurrency: string = (data.currency as string).toUpperCase();
  const clientUid: string = data.buyerUid;
  const referralCode: string | null = data.referralCode;
  const partnerTrackingCode: string | null = data.partnerTrackingCode;
  const packageSessions: number | null = data.pricingSessions; // only if purchasing a coachingPackage.

  if (!saleItemId) { // ensure we have a valid sale item ID string
    return { error: 'No sale item ID! Valid sale item ID is required to proceed' }
  }

  if (!saleItemType) { // ensure we have a valid sale item ID string
    return { error: 'No sale item type! Valid sale item type is required to proceed' }
  }

  if (!clientCurrency) { // ensure we have a valid client currency
    return { error: 'No client currency! Valid client currency required to proceed' }
  }

  if (!clientPrice) { // ensure we have a valid client price to ensure the client knows what they will be charged
    return { error: 'No client price! Valid client price required to proceed' }
  }

  if (!clientUid) { // ensure we have a valid client user ID
    return { error: 'No client UID! Valid client user ID required to proceed' }
  }
  if (saleItemType === 'coachingPackage' && !packageSessions) { // ensure we have a number of sessions purchased if purchasing a coaching package
    return { error: 'No number of sessions purchased for the coaching package!' }
  }

  try {

    console.log(`Preparing Stripe payment intent. Retrieving item data for ${saleItemType}: ${saleItemId}`);

    // Get item data from the DB to avoid client side tampering..

    let lookupPath = '';
    if (saleItemType === 'ecourse') {
      lookupPath = `public-courses`;
    } else if (saleItemType === 'fullProgram' || saleItemType === 'programSession') {
      lookupPath = `public-programs`;
    } else if (saleItemType === 'coachingPackage') {
      lookupPath = `public-services`;
    }

    const itemSnapshot = await db.collection(lookupPath)
    .doc(saleItemId)
    .get();

    if (!itemSnapshot.exists) { // item must exist!
      return { error: `${saleItemType} with ID: ${saleItemId} does not exist or unable to retrieve item info!` }
    }

    const saleItem = itemSnapshot.data() as any;

    // as pricing variable data differs between ecourses, services and programs, make sure we get the correct server side price of the sale item
    let saleItemPrice = -1;
    if (saleItemType === 'ecourse') {
      saleItemPrice = saleItem.price;
    } else if (saleItemType === 'fullProgram') {
      saleItemPrice = saleItem.fullPrice;
    } else if (saleItemType === 'programSession') {
      saleItemPrice = saleItem.pricePerSession;
    } else if (saleItemType === 'coachingPackage' && packageSessions) {
      saleItemPrice = saleItem.pricing[packageSessions].price;
    }

    if (!saleItemPrice || !saleItem.currency || !saleItem.stripeId || !saleItem.sellerUid || !saleItem.title) { // valid item data must exist
      return { error: `Insufficient item data saved for ${saleItemType} with ID: ${saleItemId}. Unable to proceed.`}
    }

    // Calculate price to charge the client
    // Should always match the client UI price, but setting server side to avoid tampering

    let amount: number; // this will be the actual charge amount (in client's own presentment currency)
    const saleItemCurrency = (saleItem.currency as string).toUpperCase();

    console.log('Client currency:', clientCurrency, 'Sale item currency:', saleItemCurrency);

    if (clientCurrency === saleItemCurrency) { // no currency conversion required
      amount = Number(saleItemPrice);
      console.log('No conversion required. Amount:', amount);

    } else { // currency conversion required
      const ratesSnap = await db.collection('currency')
      .doc('rates')
      .get();

      const rates = ratesSnap.data() as any; // fetches a rates document

      if (!rates[saleItemCurrency] || !rates[clientCurrency]) {
        return { error: 'Rates missing! Cannot convert price' }
      }

      amount = Number((saleItemPrice / rates[saleItemCurrency.toUpperCase()]) * rates[clientCurrency.toUpperCase()]); // amount in client currency
      console.log('Conversion required. Amount:', amount);

      if (!Number.isInteger(amount)) { // if price is not an integer
        const rounded = (Math.floor(amount)) + .99; // round UP to .99
        amount = rounded;
        console.log('Amount is not an integer. Amount after rounding:', amount);
      }

    }

    // Check that the client's presentment price is exactly the same as the charge price
    console.log('Client price:', clientPrice, 'Sale item price:', amount);
    if (clientPrice !== amount) {
      return { error: 'Price mismatch. The price may have just been updated during your purchase. Please refresh the page and try again to ensure you see the most up to date price.' }
    }

    // From this point all price calculations must occur in lowest denominator & integers only (cents / pence etc. no decimals)
    amount = amount * 100;
    console.log('Amount in lowest denominator:', amount);

    // Calculate platform fee
    let feeDecimal = 0;

    // if the seller referred the sale...
    if (referralCode && referralCode === saleItem.sellerUid) {
      console.log('seller referral code detected');
      if (saleItemType === 'ecourse') {
        feeDecimal = ecourseAppFeeReferralDecimal;
      } else if (saleItemType === 'fullProgram' || saleItemType === 'programSession') {
        feeDecimal = programAppFeeReferralDecimal;
      } else if (saleItemType === 'coachingPackage') {
        feeDecimal = serviceAppFeeReferralDecimal;
      }
    } else {
      // the seller did not refer the sale
      console.log('no seller referral code detected');
      if (saleItemType === 'ecourse') {
        feeDecimal = ecourseAppFeeDecimal;
      } else if (saleItemType === 'fullProgram' || saleItemType === 'programSession') {
        feeDecimal = programAppFeeDecimal;
      } else if (saleItemType === 'coachingPackage') {
        feeDecimal = serviceAppFeeDecimal;
      }
    }

    // note: promotional partner referrals do not trigger split payment here. The platform takes the full platform fee and 
    // we pay promotional partners by splitting our platform fee through a seperate back end process.

    console.log('Platform fee calculated with multiplier:', feeDecimal);

    const appFee = Math.floor(amount * feeDecimal); // platform fee (always same currency as transaction) rounded DOWN to integer
    const netBalance = amount - appFee; // amount to send to connected account after platform fee (always same currency as transaction)

    console.log(`Preparing payment intent.. Price: ${amount}, Currency: ${clientCurrency}, App Fee: ${appFee}, Destination: ${saleItem.stripeId}`)

    // Create the payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      payment_method_types: ['card'],
      amount, // never set client side!
      currency: clientCurrency, // the client currency that the charge will be made in
      transfer_data: { // tells Stripe to create a 'destination' charge. See: https://stripe.com/docs/connect/destination-charges
        destination: saleItem.stripeId, // the connected account that should receive the funds.
        amount: netBalance, // tells Stripe to use the 'transfer_data[amount] flow (better for multi currency ops)

      },
      statement_descriptor_suffix: saleItemId, // note: max 20 chars. set by Stripe
      metadata: { // any additional data to save with the payment
        sale_item_type: saleItemType,
        sale_item_id: saleItemId,
        sale_item_title: saleItem.title,
        sale_item_image: saleItem.image,
        client_UID: clientUid,
        seller_UID: saleItem.sellerUid,
        payment_type: 'lifecoach.io WEB',
        seller_referred: referralCode ? 'true' : 'false', // note: string as cannot be a boolean here
        partner_referred: partnerTrackingCode ? partnerTrackingCode : 'false',
        // if purchasing a program numSessions will be the number of sessions in the program
        // if purchasing a coachingPackage (service), will be the number of sessions in the package
        num_sessions: saleItem.numSessions ? saleItem.numSessions : saleItemType === 'coachingPackage' ? packageSessions : null
      }
    });

    console.log('Stripe payment intent created:', JSON.stringify(paymentIntent));

    return { stripePaymentIntent: paymentIntent } // success

  } catch (err) {
    console.error(err);
    return { error: `Error: ${err}` }
  }
});

/*
  Stripe Account Webhook - Lifecoach Account ONLY.
  This webhook receives events from the Lifecoach account only. Configure via Stripe dashboard.
  https://stripe.com/docs/connect/webhooks
*/
exports.stripeWebhookEvent = functions
.runWith({memory: '1GB', timeoutSeconds: 300})
.https
  // @ts-ignore
.onRequest( async (request, response) => {
  const sig = request.headers["stripe-signature"] as string;

  let event;

  // Verify the request is authentic
  try {
    event = stripe.webhooks.constructEvent(request.rawBody, sig, stripeWebhookSecret)
  } catch (err) {
    console.log(`Stripe webhook auth failed: ${err.message}`);
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('Stripe webhook event:', event);

  // Handle the event
  // https://stripe.com/docs/api/events/types
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      // console.log(`PaymentIntent was successful! ${JSON.stringify(paymentIntent)}`);

      const clientUid = paymentIntent.metadata.client_UID;
      const saleItemId = paymentIntent.metadata.sale_item_id;
      const saleItemType = paymentIntent.metadata.sale_item_type;

      // Transform the successful payment intent to remove any sensitive data that we don't want to store ourselves
      const successfulPayment = {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        created: paymentIntent.created,
        metadata: paymentIntent.metadata,
        receiptEmail: paymentIntent.receipt_email,
        paymentMethod: paymentIntent.payment_method
      }

      try {
        const promises = [];

        // Save the successful payment to the purchaser's account for payment history
        const promise1 = db.collection(`users/${clientUid}/account/account${clientUid}/successful-payments/`)
        .doc(successfulPayment.id)
        .set(successfulPayment);
        promises.push(promise1);

        // Add the item ID of the purchased item to the user's auth token claims
        // so the user can access any content restricted by paywall.
        const promise2 = addCustomUserClaims(clientUid, { [saleItemId]: true }) as any;
        promises.push(promise2);

        // Record the appropriate purchase/enrollment for the client
        if (saleItemType === 'ecourse') {
          const promise3 = recordCourseEnrollmentForStudent(clientUid, saleItemId, paymentIntent.metadata.sale_item_title, paymentIntent.metadata.sale_item_image);
          promises.push(promise3);
        } else if (saleItemType === 'fullProgram' || saleItemType === 'programSession') {
          const promise3 = recordProgramEnrollmentForClient(saleItemType, clientUid, saleItemId, paymentIntent.metadata.sale_item_title, paymentIntent.metadata.sale_item_image);
          promises.push(promise3);
        } else if (saleItemType === 'coachingPackage') {
          const promise3 = recordServicePurchaseForClient(clientUid, saleItemId, paymentIntent.metadata.sale_item_title, paymentIntent.metadata.sale_item_image, paymentIntent.metadata.num_sessions);
          promises.push(promise3);
        }

        // Because we cannot split stripe connect payments 3 ways using our current setup, and because the stripe 
        // 'seperate charges & transfers' flow requires that our platform and any conected accounts must be in the same 
        // territory, (which limits us geographically in terms of promo partner network), if the sale was referred by 
        // a promotional partner, we need to track this ourselves and use a seperate process to record and pay our partners.
        if (paymentIntent.metadata.partner_referred && paymentIntent.metadata.partner_referred !== 'false') {
          const saleDate = new Date(paymentIntent.created * 1000);
          const saleMonth = saleDate.getMonth() + 1; // go from zero index to jan === 1
          const saleYear = saleDate.getFullYear();

          // flatten the data for easier lookups by platform and partners

          const promise4 = db.collection(`partner-referrals/${paymentIntent.metadata.partner_referred}/${saleMonth}-${saleYear}`)
          .doc(successfulPayment.id)
          .set(successfulPayment, {merge: true});
          promises.push(promise4);

          const promise5 = db.collection(`partner-referrals/${paymentIntent.metadata.partner_referred}/all`)
          .doc(successfulPayment.id)
          .set(successfulPayment, {merge: true});
          promises.push(promise5);

          const promise6 = db.collection(`partner-referrals/${saleMonth}-${saleYear}`)
          .doc(successfulPayment.id)
          .set(successfulPayment, {merge: true});
          promises.push(promise6);

          const promise7 = db.collection(`partner-referrals/all/referrals`)
          .doc(successfulPayment.id)
          .set(successfulPayment, {merge: true});
          promises.push(promise7);
        }

        return Promise.all(promises);

      } catch (err) {
        console.error(err)
      }
      break;
    case 'payment_intent.payment_failed':
      const paymentIntentFailed = event.data.object as Stripe.PaymentIntent;
      // console.log(`PaymentIntent failed! ${JSON.stringify(paymentIntentFailed)}`);

      const uidFP = paymentIntentFailed.metadata.client_UID;

      try {
        // Save the successful payment intent object to the user's account
        await db.collection(`users/${uidFP}/account/account${uidFP}/failed-payments`)
        .doc(paymentIntentFailed.id)
        .create(paymentIntentFailed);
      } catch (err) {
        console.error(err)
      }
      break;
    case 'transfer.created':
        const transfer = event.data.object as Stripe.Transfer;
        // console.log(`Transfer created: ${JSON.stringify(transfer)}`);

        try {
          // Lookup the original charge to retrieve necessary metadata from the original paymentIntent
          const originalCharge = await stripe.charges.retrieve(transfer.source_transaction as string);
          // console.log('Original Charge:', originalCharge);

          const originalSellerUid = originalCharge.metadata.seller_UID;
          const originalSaleItemId = originalCharge.metadata.sale_item_id;
          const originalSaleItemType = originalCharge.metadata.sale_item_type;
          const originalSaleItemTitle = originalCharge.metadata.sale_item_title;
          const originalSaleItemImage = originalCharge.metadata.sale_item_image;
          const originalClientUid = originalCharge.metadata.client_UID;
          const originalSellerReferred = originalCharge.metadata.seller_referred; // will be string 'true' | 'false'
          const originalNumSessions = originalCharge.metadata.num_sessions // if purchase related to program or coaching package, will be the number of sessions purchased

          // Check for required metadata on the original charge
          if (!originalSaleItemId) {
            console.error('Stripe webhook transfer.received missing charge metadata sale item ID');
            return;
          }
          if (!originalClientUid) {
            console.error('Stripe webhook transfer.received missing charge metadata client UID');
            return;
          }
          if (!originalSellerUid) {
            console.error('Stripe webhook transfer.received missing charge metadata seller UID');
            return;
          }

          // clone the original stripe transfer object and add a new key to track whether sale was seller referred
          const customTransferObj = JSON.parse(JSON.stringify(transfer));
          customTransferObj.seller_referred = originalSellerReferred === 'true' ? true : false;

          const promises = [];

          // if the transfer is related to an ecourse sale
          if (originalSaleItemType === 'ecourse') {
            const promise1 = recordCourseEnrollmentForCreator(originalSellerUid, originalSaleItemId, customTransferObj, originalClientUid);
            promises.push(promise1);

            const promise2 = updateCourseEnrollmentCounts(originalSellerUid, originalSaleItemId, customTransferObj, originalClientUid);
            promises.concat(await promise2)

          // if the transfer is related to a program sale (full program or single session purchase)
          } else if (originalSaleItemType === 'fullProgram' || originalSaleItemType === 'programSession') {
            const promise1 = recordProgramEnrollmentForCreator(originalSaleItemType, originalSellerUid, originalSaleItemId, customTransferObj, originalClientUid, originalSaleItemTitle, originalSaleItemImage, originalNumSessions);
            promises.push(promise1);

            const promise2 = updateProgramEnrollmentCounts(originalSellerUid, originalSaleItemId, customTransferObj, originalClientUid);
            promises.concat(await promise2)

          // if the transfer is related to a service sale
          } else if (originalSaleItemType === 'coachingPackage') {
            const promise1 = recordServicePurchaseForCreator(originalSellerUid, originalSaleItemId, customTransferObj, originalClientUid, originalSaleItemTitle, originalSaleItemImage, originalNumSessions);
            promises.push(promise1);

            const promise2 = updateServiceEnrollmentCounts(originalSellerUid, originalSaleItemId, customTransferObj, originalClientUid);
            promises.concat(await promise2)
          }

          await Promise.all(promises); // run concurrent ops

        } catch (err) {
          console.error(err);
        }
      break;
  }

  // Return a response to acknowledge receipt of the event
  return response.status(200).send({ received: true });

});

/*
  Stripe Connected Accounts Webhook.
  This webhook receives events from all connected accounts. Configure via Stripe dashboard.
  https://stripe.com/docs/connect/webhooks
*/
exports.stripeWebhookConnectedEvent = functions
.runWith({memory: '1GB', timeoutSeconds: 300})
.https
  // @ts-ignore
.onRequest( async (request, response) => {
  const sig = request.headers["stripe-signature"] as string;

  let event;

  // Verify the request is authentic
  try {
    event = stripe.webhooks.constructEvent(request.rawBody, sig, stripeWebhookConnectSecret)
  } catch (err) {
    console.log(`Stripe webhook auth failed: ${err.message}`);
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('Stripe connected webhook event:', event);

  // Handle the event
  // https://stripe.com/docs/api/events/types
  switch (event.type) {
    case 'account.updated':
      const account = event.data.object as Stripe.Account;
      if (account.requirements && account.requirements.currently_due) { // requirements are due now for this account
        if (account.metadata && account.metadata.lifecoachUID) { // ensure the stripe account can be linked to a lifecoach account
          await db.collection(`users/${account.metadata.lifecoachUID}/account`)
          .doc(`account${account.metadata.lifecoachUID}`)
          .set({ // save any verification requirements due now to the db for monitoring client side
            stripeRequirementsCurrentlyDue: account.requirements.currently_due
          }, { merge: true })
          .catch(err => console.error(err));
        }
      }
      break;
  }

  // Return a response to acknowledge receipt of the event
  return response.status(200).send({ received: true });

});

// ================================================================================
// =====                FREE COURSE ENROLLMENT (NON STRIPE)                  ======
// ================================================================================

/*
  Attempts to complete user enrollment in a free course.
  We can't use the same Stripe flow for free courses with a zero price so we're re-
  creating the post-payment flow normally carried out after Stripe webhook received.
*/
exports.completeFreeCourseEnrollment = functions
.runWith({memory: '1GB', timeoutSeconds: 300})
.https
.onCall( async (data, context) => {

  const courseId = data.courseId;
  const clientUid = data.clientUid;
  const referralCode = data.referralCode;

  try {

    console.log(`Enrolling user ${clientUid} in free course ${courseId}...`);

    // Retrieve the course
    const courseSnapshot = await db.collection(`public-courses`)
    .doc(courseId)
    .get();

    if (!courseSnapshot.exists) { // course must exist!
      return { error: `Course ID: ${courseId} does not exist or unable to retrieve course info!` }
    }

    const course = courseSnapshot.data() as any;

    // Check that this course has actually been marked free by the creator to avoid client side tampering
    if (course.pricingStrategy !== 'free') {
      return { error: `Course ${courseId} is not free.` }
    }

    // Course exists and is marked free by seller. Complete the enrollment...

    const promises = [];

    // Add the course ID of the purchased course to the user's auth token claims
    // so the user can access content normally restricted by the paywall.
    const promise1 = addCustomUserClaims(clientUid, { [courseId]: true }) as any;
    promises.push(promise1);

    const promise2 = recordCourseEnrollmentForStudent(clientUid, courseId, course.title, course.image);
    promises.push(promise2);

    // Create a free sale object and save to the seller account to record the zero price sale (enrollment)
    const freeEnrollmentObj = {
      id: `free_${Math.random().toString(36).substr(2, 9)}`, // generate semi-random id
      created: Math.round(new Date().getTime() / 1000), // inix timestamp
      seller_referred: (referralCode && referralCode === course.sellerUid) ? true : false, // did seller refer the 'sale'
      amount: 0, // record enrollment as a zero price sale
      currency: 'free' // important: use string 'free' and not null or undefined as we record all sales against a currency
    };

    const promise3 = recordCourseEnrollmentForCreator(course.sellerUid, courseId, freeEnrollmentObj, clientUid);
    promises.push(promise3);

    const promise4 = updateCourseEnrollmentCounts(course.sellerUid, courseId, freeEnrollmentObj, clientUid);
    promises.concat(await promise4)

    // Execute concurrent ops
    await Promise.all(promises);

    return { success: true }

  } catch (err) {
    console.error(err);
    return { error: err }
  }
});

// ================================================================================
// =====                      COURSE ENROLLMENT FUNCTIONS                    ======
// ================================================================================

async function recordCourseEnrollmentForCreator(sellerUid: string, courseId: string, obj: any, clientUid: string) {
  // Save either the custom transfer object (paid courses) or the free enrollment object
  // (free courses) to the seller account to record the enrollment

  const saleDate = new Date(obj.created * 1000);
  const saleMonth = saleDate.getMonth() + 1; // go from zero index to jan === 1
  const saleYear = saleDate.getFullYear();
  const timestampNow = Math.round(new Date().getTime() / 1000);

  await db.collection(`users/${sellerUid}/sales/${saleMonth}-${saleYear}/${courseId}`)
  .doc(obj.id)
  .create(obj);

  // save the person to the recipient's people (create if doesn't exist yet - it might)
  await db.collection(`users/${sellerUid}/people`)
  .doc(clientUid)
  .set({ lastUpdated: timestampNow }, { merge: true }) // creates a real (not virtual) doc
  .catch(err => console.log(err));

  // save the action to this person's history for the coach
  await db.collection(`users/${sellerUid}/people/${clientUid}/history`)
  .doc(timestampNow.toString())
  .set({ action: 'enrolled_in_self_study_course', courseId });

  // save the action to this user's history with the coach
  return db.collection(`users/${clientUid}/coaches/${sellerUid}/history`)
  .doc(timestampNow.toString())
  .set({ action: 'enrolled_in_self_study_course', courseId });
}

async function recordCourseEnrollmentForStudent(studentUid: string, courseId: string, courseTitle: string, courseImg: string) {

  // Add the course ID to the student's own purchased courses node.
  // We can monitor this with a client side subscription to notify the user of the completed purchase.

  await db.collection(`users/${studentUid}/purchased-courses`)
  .doc(courseId)
  .set({
    courseId: courseId
  }, { merge: true });

  // trigger a mailchimp event
  const event = {
    name: 'course_enrollment',
    properties: {
      course_id: courseId,
      course_title: courseTitle,
      course_image: courseImg
    }
  }
  return logMailchimpEvent(studentUid, event); // log event
}

async function updateCourseEnrollmentCounts(creatorUid: string, courseId:string, obj: any, clientUid: string) {
  // Accepts either a custom transfer object (paid courses) or a free course enrollment object (free courses)
  // Promises an array of Firebase write result promises

  const incrementCount = admin.firestore.FieldValue.increment(1);
  const incrementAmount = admin.firestore.FieldValue.increment(obj.amount);
  const incrementCurrency = obj.currency;
  const timestampNow = Math.round(new Date().getTime() / 1000);

  const promises = [];

  // Increment the total sales number & total lifetime sales amount for this course creator
  const promise1 = db.collection(`users/${creatorUid}/sales/total-lifetime-course-sales/courses`)
  .doc(courseId)
  .set({
    [incrementCurrency]: {
      lifetimeTotalSales: incrementCount,
      lifetimeTotalAmount: incrementAmount
    }
  }, { merge: true });
  promises.push(promise1);

  // update this client on the seller's enrollments by course node
  const promise2 = db.collection(`seller-enrollments-by-course/${creatorUid}/courses/${courseId}/enrolled`)
  .doc(clientUid)
  .set({
    timeOfLastEnrollment: timestampNow.toString(),
    clientUid
  }, { merge: true });
  promises.push(promise2);

  return promises;
}

// ================================================================================
// =====                     PROGRAM ENROLLMENT FUNCTIONS                    ======
// ================================================================================

async function recordProgramEnrollmentForCreator(enrollmentType: 'fullProgram' | 'programSession', sellerUid: string, programId: string, obj: any, clientUid: string, programTitle: string, programImg: string, numSessions: string) {
  // Save the custom transfer object to the seller account to record the enrollment

  const saleDate = new Date(obj.created * 1000);
  const saleMonth = saleDate.getMonth() + 1; // go from zero index to jan === 1
  const saleYear = saleDate.getFullYear();
  const timestampNow = Math.round(new Date().getTime() / 1000);

  let sessionsPurchased = 1; // default to one session purchased
  if (enrollmentType === 'fullProgram') {
    sessionsPurchased = Number(numSessions) // if user has purchased the whole program, update to number of sessions in the program
  }

  const promises = [];

  // send email

  if (enrollmentType === 'fullProgram') {
    const event = {
      name: 'coach_program_enrollment',
      properties: {
        program_id: programId,
        program_title: programTitle,
        program_image: programImg,
        client_url: `https://lifecoach.io/person-history/${clientUid}`
      }
    }
    const emailPromise = logMailchimpEvent(sellerUid, event); // log event
    promises.push(emailPromise);
  } else if (enrollmentType === 'programSession') {
    const event = {
      name: 'coach_program_session_enroll',
      properties: {
        program_id: programId,
        program_title: programTitle,
        program_image: programImg,
        client_url: `https://lifecoach.io/person-history/${clientUid}`
      }
    }
    const emailPromise = logMailchimpEvent(sellerUid, event); // log event
    promises.push(emailPromise);
  }

  await db.collection(`users/${sellerUid}/program-sales/${saleMonth}-${saleYear}/${programId}`)
  .doc(obj.id)
  .create(obj);

  // save the person to the recipient's people (create if doesn't exist yet - it might)
  await db.collection(`users/${sellerUid}/people`)
  .doc(clientUid)
  .set({ lastUpdated: timestampNow }, { merge: true }) // creates a real (not virtual) doc
  .catch(err => console.log(err));

  // update this person's session data (allows the coach to see how many paid sessions this person has purchased/remaining)
  let i = 0;
  while (i < sessionsPurchased) {
    await db.collection(`users/${sellerUid}/people/${clientUid}/sessions-purchased`)
    .doc()
    .create({
      sellerUid,
      clientUid,
      programId,
      saleDate,
      relatedStripeTransferId: obj.id
    });
    i++;
  }

  // save the action to this person's history for the coach
  await db.collection(`users/${sellerUid}/people/${clientUid}/history`)
  .doc(timestampNow.toString())
  .set({ action: enrollmentType === 'fullProgram' ? 'enrolled_in_full_program' : 'enrolled_in_program_session', programId });

  // save the action to this person's history with the coach
  return db.collection(`users/${clientUid}/coaches/${sellerUid}/history`)
  .doc(timestampNow.toString())
  .set({ action: enrollmentType === 'fullProgram' ? 'enrolled_in_full_program' : 'enrolled_in_program_session', programId });
}

async function recordProgramEnrollmentForClient(enrollmentType: 'fullProgram' | 'programSession', studentUid: string, programId: string, programTitle: string, programImg: string) {

  // Add the program ID to the client's own purchased programs node.
  // We can monitor this with a client side subscription to notify the user of the completed purchase.

  await db.collection(`users/${studentUid}/purchased-programs`)
  .doc(programId)
  .set({
    programId,
    enrollmentType
  }, { merge: true });

  // send email

  if (enrollmentType === 'fullProgram') {
    const event = {
      name: 'program_enrollment',
      properties: {
        program_id: programId,
        program_title: programTitle,
        program_image: programImg,
        landing_url: `https://lifecoach.io/my-programs/${programId}`
      }
    }
    return logMailchimpEvent(studentUid, event); // log event
  } else if (enrollmentType === 'programSession') {
    const event = {
      name: 'program_session_enrollment',
      properties: {
        program_id: programId,
        program_title: programTitle,
        program_image: programImg,
        landing_url: `https://lifecoach.io/my-programs/${programId}`
      }
    }
    return logMailchimpEvent(studentUid, event); // log event
  }
}

async function updateProgramEnrollmentCounts(creatorUid: string, programId:string, obj: any, clientUid: string) {
  // Accepts a custom transfer object
  // Promises an array of Firebase write result promises

  const incrementCount = admin.firestore.FieldValue.increment(1);
  const incrementAmount = admin.firestore.FieldValue.increment(obj.amount);
  const incrementCurrency = obj.currency;
  const timestampNow = Math.round(new Date().getTime() / 1000);

  const promises = [];

  // Increment the total sales number & total lifetime sales amount for this program creator
  const promise1 = db.collection(`users/${creatorUid}/program-sales/total-lifetime-program-sales/programs`)
  .doc(programId)
  .set({
    [incrementCurrency]: {
      lifetimeTotalSales: incrementCount,
      lifetimeTotalAmount: incrementAmount
    }
  }, { merge: true });
  promises.push(promise1);

  // update this client on the coach's enrollments (clients) by program node
  // allows us & coaches to see which (and how many) clients are enrolled on each program
  const promise2 = db.collection(`coach-enrollments-by-program/${creatorUid}/programs/${programId}/enrolled`)
  .doc(clientUid)
  .set({
    timeOfLastEnrollment: timestampNow.toString(),
    clientUid
  }, { merge: true });
  promises.push(promise2);

  return promises;
}

// ================================================================================
// =====                      SERVICE PURCHASE FUNCTIONS                     ======
// ================================================================================

async function recordServicePurchaseForCreator(sellerUid: string, serviceId: string, obj: any, clientUid: string, serviceTitle: string, serviceImg: string, numSessions: string) {
  // Save the custom transfer object to the seller account to record the enrollment

  const saleDate = new Date(obj.created * 1000);
  const saleMonth = saleDate.getMonth() + 1; // go from zero index to jan === 1
  const saleYear = saleDate.getFullYear();
  const timestampNow = Math.round(new Date().getTime() / 1000);

  const sessionsPurchased = Number(numSessions)

  const promises = [];

  // send email

  const event = {
    name: 'coach_service_purchase',
    properties: {
      service_id: serviceId,
      service_title: serviceTitle,
      service_image: serviceImg,
      num_sessions_purchased: numSessions,
      client_url: `https://lifecoach.io/person-history/${clientUid}`
    }
  }
  const emailPromise = logMailchimpEvent(sellerUid, event); // log event
  promises.push(emailPromise);

  await db.collection(`users/${sellerUid}/service-sales/${saleMonth}-${saleYear}/${serviceId}`)
  .doc(obj.id)
  .create(obj);

  // save the person to the recipient's people (create if doesn't exist yet - it might)
  await db.collection(`users/${sellerUid}/people`)
  .doc(clientUid)
  .set({ lastUpdated: timestampNow }, { merge: true }) // creates a real (not virtual) doc
  .catch(err => console.log(err));

  // update this person's session data (allows the coach to see how many paid sessions this person has purchased/remaining)
  let i = 0;
  while (i < sessionsPurchased) {
    await db.collection(`users/${sellerUid}/people/${clientUid}/sessions-purchased`)
    .doc()
    .create({
      sellerUid,
      clientUid,
      serviceId,
      saleDate,
      relatedStripeTransferId: obj.id
    });
    i++;
  }

  // save the action to this person's history for the coach
  await db.collection(`users/${sellerUid}/people/${clientUid}/history`)
  .doc(timestampNow.toString())
  .set({ action: 'service_purchase', serviceId, sessionsPurchased });

  // save the action to this person's history with the coach
  return db.collection(`users/${clientUid}/coaches/${sellerUid}/history`)
  .doc(timestampNow.toString())
  .set({ action: 'service_purchase', serviceId, sessionsPurchased });
}

async function recordServicePurchaseForClient(studentUid: string, serviceId: string, serviceTitle: string, serviceImg: string, sessionsPurchased: string) {

  // Add the service ID to the client's own purchased services node.
  // We can monitor this with a client side subscription to notify the user of the completed purchase.

  await db.collection(`users/${studentUid}/purchased-services`)
  .doc(serviceId)
  .set({
    serviceId,
  }, { merge: true });

  // send email

  const event = {
    name: 'service_enrollment',
    properties: {
      service_id: serviceId,
      service_title: serviceTitle,
      service_image: serviceImg,
      num_sessions_purchased: sessionsPurchased,
      landing_url: `https://lifecoach.io/my-services/${serviceId}`
    }
  }
  return logMailchimpEvent(studentUid, event); // log event
}

async function updateServiceEnrollmentCounts(creatorUid: string, serviceId:string, obj: any, clientUid: string) {
  // Accepts a custom transfer object
  // Promises an array of Firebase write result promises

  const incrementCount = admin.firestore.FieldValue.increment(1);
  const incrementAmount = admin.firestore.FieldValue.increment(obj.amount);
  const incrementCurrency = obj.currency;
  const timestampNow = Math.round(new Date().getTime() / 1000);

  const promises = [];

  // Increment the total sales number & total lifetime sales amount for this creator
  const promise1 = db.collection(`users/${creatorUid}/service-sales/total-lifetime-service-sales/services`)
  .doc(serviceId)
  .set({
    [incrementCurrency]: {
      lifetimeTotalSales: incrementCount,
      lifetimeTotalAmount: incrementAmount
    }
  }, { merge: true });
  promises.push(promise1);

  // update this client on the coach's enrollments (clients) by service node
  // allows us & coaches to see which (and how many) clients are enrolled on each service
  const promise2 = db.collection(`coach-enrollments-by-service/${creatorUid}/services/${serviceId}/enrolled`)
  .doc(clientUid)
  .set({
    timeOfLastEnrollment: timestampNow.toString(),
    clientUid
  }, { merge: true });
  promises.push(promise2);

  return promises;
}

// ================================================================================
// =====                              REFUNDS                                ======
// ================================================================================

/*
  Triggered when a user requests a refund on a purchased item.
  Note: Request data should contain the original Stripe payment intent object (includes meta data).
*/
exports.requestRefund = functions
.runWith({memory: '1GB', timeoutSeconds: 300})
.https
.onCall( async (data, context) => {

  // Reject any unauthorised user immediately.
  if (!context.auth) {
    return {error: 'Unauthorised!'}
  }

  const request = data.refundRequest;
  const uid = request.uid;
  const pI = request.paymentIntent as Stripe.PaymentIntent;
  const now = Math.round(new Date().getTime()/1000) // unix timestamp
  request.created = now;
  request.status = 'requested';

  try {
    const index = algolia.initIndex('prod_REFUNDS');

    // console.log(`Refund requested by user ${request.uid} for payment: ${JSON.stringify(pI)}`);

    const promises = [] as any[];

    // Create a refund request for admins to approve
    const promise1 = db.collection(`admin/refunds/requested`)
    .doc(pI.id)
    .set(request);
    promises.push(promise1);

    // Create a request in the requester's history
    const promise2 = db.collection(`users/${uid}/account/account${uid}/refunds`)
    .doc(pI.id)
    .set(request);
    promises.push(promise2);

    // Send the record to Algolia.
    request.objectID = pI.id;
    const promise3 = index.saveObject(request);
    promises.push(promise3);

    await Promise.all(promises);

    return { success: true } // success

  } catch (err) {
    console.error(err);
    return { error: err }
  }
});

/*
  Triggered when an admin user approves a refund request.
  Request data should contain the request object which contains the original Stripe payment intent object.
*/
exports.approveRefund = functions
.runWith({memory: '1GB', timeoutSeconds: 300})
.https
.onCall( async (data, context) => {

  // Reject any non admin user immediately.
  if (!context.auth || !context.auth.token.admin) {
    return {error: 'Unauthorised!'}
  }

  const request = data.refundRequest;
  const clientUid = request.uid;
  const pI = request.paymentIntent as Stripe.PaymentIntent;
  const sellerUid = pI.metadata.seller_UID;

  try {
    const index = algolia.initIndex('prod_REFUNDS');

    // Attempt the refund
    // https://stripe.com/docs/api/refunds/create
    const refund = await stripe.refunds.create({
      payment_intent: pI.id,
      metadata: pI.metadata,
      reason: 'requested_by_customer',
      reverse_transfer: true,
      expand: ['transfer_reversal']
    });

    // console.log('Refund:', refund);

    if (refund && refund.status === 'succeeded') {

      const promises = [] as any[];

      // Update request status
      request.status = "refunded";
      request.refund = refund;

      // Move admin request from requested to approved in db
      const promise1 = db.collection(`admin/refunds/requested`)
      .doc(pI.id)
      .delete();
      promises.push(promise1);

      const promise2 = db.collection(`admin/refunds/refunded`)
      .doc(pI.id)
      .set(request);
      promises.push(promise2);

      // Update refunded request in client's history
      const promise3 = db.collection(`users/${clientUid}/account/account${clientUid}/refunds`)
      .doc(pI.id)
      .set(request); // overwrite the original request with the newly updated request
      promises.push(promise3);

      // Update the seller's refund record
      const date = new Date(refund.created * 1000);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const promise4 = db.collection(`users/${sellerUid}/refunds/${month}-${year}/${pI.metadata.sale_item_id}`)
      .doc(refund.id)
      .set({
        refund_id: refund.id,
        reason: request.formData.reason,
        payment_intent: pI.id,
        transfer_reversal: refund.transfer_reversal
      });
      promises.push(promise4);

      // Update the sellers totals
      const decrementAmount = admin.firestore.FieldValue.increment(-(refund.transfer_reversal as any).amount);

      // If refunding an ecourse...
      if (pI.metadata.sale_item_type === 'ecourse') {
        const promise5 = db.collection(`users/${sellerUid}/sales/${month}-${year}/${pI.metadata.sale_item_id}`)
        .doc((refund.transfer_reversal as any).transfer)
        .set({
          amount_reversed: (refund.transfer_reversal as any).amount // update the amount reversed on the original transfer object
        }, { merge: true });
        promises.push(promise5);

        const promise6 = db.collection(`users/${sellerUid}/sales`)
        .doc('totals')
        .set({
          [pI.metadata.sale_item_id]: {
            [(refund.transfer_reversal as any).currency]: {
              lifetimeTotalAmount: decrementAmount // decrement lifetitme total sales by refunded amount
            }
          }
        }, { merge: true });
        promises.push(promise6);

      // If refunding a program or program session...
      } else if (pI.metadata.sale_item_type === 'fullProgram' || pI.metadata.sale_item_type === 'programSession') {
        const promise5 = db.collection(`users/${sellerUid}/program-sales/${month}-${year}/${pI.metadata.sale_item_id}`)
        .doc((refund.transfer_reversal as any).transfer)
        .set({
          amount_reversed: (refund.transfer_reversal as any).amount // update the amount reversed on the original transfer object
        }, { merge: true });
        promises.push(promise5);

        const promise6 = db.collection(`users/${sellerUid}/program-sales`)
        .doc('totals')
        .set({
          [pI.metadata.sale_item_id]: {
            [(refund.transfer_reversal as any).currency]: {
              lifetimeTotalAmount: decrementAmount // decrement lifetime total sales by refunded amount
            }
          }
        }, { merge: true });
        promises.push(promise6);

      // if refunding a service purchase
      } else if (pI.metadata.sale_item_type === 'service') {
        const promise5 = db.collection(`users/${sellerUid}/service-sales/${month}-${year}/${pI.metadata.sale_item_id}`)
        .doc((refund.transfer_reversal as any).transfer)
        .set({
          amount_reversed: (refund.transfer_reversal as any).amount // update the amount reversed on the original transfer object
        }, { merge: true });
        promises.push(promise5);

        const promise6 = db.collection(`users/${sellerUid}/service-sales`)
        .doc('totals')
        .set({
          [pI.metadata.sale_item_id]: {
            [(refund.transfer_reversal as any).currency]: {
              lifetimeTotalAmount: decrementAmount // decrement lifetime total sales by refunded amount
            }
          }
        }, { merge: true });
        promises.push(promise6);
      }

      // Update Algolia
      request.objectID = pI.id;
      const promise7 = index.saveObject(request); // overwrite the original object in Algolia
      promises.push(promise7);

      await Promise.all(promises); // run concurrent ops

      return { success: true } // success
    }

    return { error: 'Unable to complete refund' }

  } catch(err) {
    console.error(err);
    return { error: err }
  }
});

// ================================================================================
// =====                       ADMIN REVIEW FUNCTIONS                        ======
// ================================================================================

/*
  Attempts to approve a course in review.
*/
exports.adminApproveCourseReview = functions
.runWith({memory: '1GB', timeoutSeconds: 300})
.https
.onCall( async (data, context) => {

  const courseId = data.courseId;
  const userId = data.userId; // reviewer not seller!
  const reviewRequest = data.reviewRequest;
  const approvedDate = Math.round(new Date().getTime() / 1000); // unix timestamp

  // safety checks
  if (!courseId) {
    return { error: 'Cloud function adminApproveCourseReview error: missing course ID' }
  }
  if (!userId) {
    return { error: 'Cloud function adminApproveCourseReview error: missing user ID' }
  }
  if (!reviewRequest) {
    return { error: 'Cloud function adminApproveCourseReview error: missing review request' }
  }
  if (!reviewRequest.sellerUid) {
    return { error: 'Cloud function adminApproveCourseReview error: missing review request seller UID' }
  }

  try {

    // attempt to read course data
    const courseSnap = await db.collection(`users/${reviewRequest.sellerUid}/courses`)
    .doc(courseId)
    .get();

    if (!courseSnap.exists) {
      console.error('Cloud function onNewCourseReviewApproved error: Unable to read course.')
      return {error: 'Unable to read course data. Operation failed.'};
    }

    const course = courseSnap.data() as any;

    // create an approved course doc to ensure only admin approved courses get updated by creators
    // Important! Do this before writing to the user's private courses node to ensure correct
    // data gets copied to public & paywall protected areas on update of the private node.
    await db.collection(`approved-courses`)
    .doc(courseId)
    .create({
      courseId,
      approved: approvedDate,
      reviewerUid: userId
    });

    const batch = db.batch(); // prepare to execute multiple ops atomically

    // update user's private course node with updated course object
    const privateCourseCopy = JSON.parse(JSON.stringify(course));
    const privateReviewRequest = JSON.parse(JSON.stringify(reviewRequest));
    privateReviewRequest.status = 'approved';
    privateReviewRequest.approved = approvedDate;
    privateReviewRequest.reviewerUid = userId;
    privateCourseCopy.adminApproved = true;
    privateCourseCopy.reviewRequest = privateReviewRequest;
    privateCourseCopy.lastUpdated = approvedDate;
    const privateCourseRef = db.collection(`users/${reviewRequest.sellerUid}/courses`).doc(courseId);
    batch.set(privateCourseRef, privateCourseCopy, { merge: true });


    // delete review request from the admin collection
    const adminRef = db.collection(`admin/review-requests/courses`).doc(courseId);
    batch.delete(adminRef) // triggers onDelete monitor function to update count

    await batch.commit(); // execute batch ops. Any error should trigger catch.

    // add the course id to the seller's custom claims so they can access the course to view it as a student
    await addCustomUserClaims(course.sellerUid, { [courseId]: true });

    // delete the draft course record in Algolia
    const index = algolia.initIndex('prod_DRAFT_COURSES');
    await index.deleteObject(courseId);

    // trigger a mailchimp event to log course going live
    const event = {
      name: 'admin_approved_course',
      properties: {
        course_title: course.title,
        goto_url: `https://lifecoach.io/my-courses/${courseId}/content`
      }
    }
    await logMailchimpEvent(course.sellerUid, event); // log event

    return { success: true } // success if we got this far!

  } catch (err) {
    console.error(err);
    return { error: err }
  }
});

/*
  Attempts to reject a course in review.
*/
exports.adminRejectCourseReview = functions
.runWith({memory: '1GB', timeoutSeconds: 300})
.https
.onCall( async (data, context) => {

  const courseId = data.courseId;
  const userId = data.userId; // reviewer not seller!
  const reviewRequest = data.reviewRequest;
  const rejectedDate = Math.round(new Date().getTime() / 1000); // unix timestamp

  // safety checks
  if (!courseId) {
    return { error: 'Cloud function adminRejectCourseReview error: missing course ID' }
  }
  if (!userId) {
    return { error: 'Cloud function adminRejectCourseReview error: missing user ID' }
  }
  if (!reviewRequest) {
    return { error: 'Cloud function adminRejectCourseReview error: missing review request' }
  }
  if (!reviewRequest.sellerUid) {
    return { error: 'Cloud function adminRejectCourseReview error: missing review request seller UID' }
  }

  // update the review request object
  reviewRequest.status = 'rejected';
  reviewRequest.rejected = rejectedDate;
  reviewRequest.reviewerUid = userId;

  try {

    const batch = db.batch(); // prepare to execute multiple ops atomically

    // update user's private course node
    const privateRef = db.collection(`users/${reviewRequest.sellerUid}/courses`).doc(courseId);
    batch.set(privateRef, { reviewRequest }, { merge: true });

    // delete review request from the admin collection (user must make alterations and re-submit for review)
    const adminRef = db.collection(`admin/review-requests/courses`).doc(courseId);
    batch.delete(adminRef) // triggers onDelete monitor function to update count

    await batch.commit(); // execute batch ops. Any error should trigger catch.

    // attempt to read course data
    const courseSnap = await db.collection(`users/${reviewRequest.sellerUid}/courses`)
    .doc(courseId)
    .get();

    // log mailchimnp event
    const course = courseSnap.data() as any;
    const event = {
      name: 'admin_rejected_course',
      properties: {
        course_title: course.title,
        reject_reason: reviewRequest.rejectData.reason,
        goto_url: `https://lifecoach.io/my-courses/${courseId}/content`
      }
    }
    await logMailchimpEvent(reviewRequest.sellerUid, event); // log event

    return { success: true } // success

  } catch (err) {
    console.error(err);
    return { error: err }
  }
});

/*
  Attempts to approve a coaching program in review.
*/
exports.adminApproveProgramReview = functions
.runWith({memory: '1GB', timeoutSeconds: 300})
.https
.onCall( async (data, context) => {

  const programId = data.programId;
  const userId = data.userId; // reviewer not seller!
  const reviewRequest = data.reviewRequest;
  const approvedDate = Math.round(new Date().getTime() / 1000); // unix timestamp

  // safety checks
  if (!programId) {
    return { error: 'Cloud function adminApproveProgramReview error: missing program ID' }
  }
  if (!userId) {
    return { error: 'Cloud function adminApproveProgramReview error: missing user ID' }
  }
  if (!reviewRequest) {
    return { error: 'Cloud function adminApproveProgramReview error: missing review request' }
  }
  if (!reviewRequest.sellerUid) {
    return { error: 'Cloud function adminApproveProgramReview error: missing review request seller UID' }
  }

  try {

    // attempt to read program data
    const programSnap = await db.collection(`users/${reviewRequest.sellerUid}/programs`)
    .doc(programId)
    .get();

    if (!programSnap.exists) {
      console.error('Cloud function onNewProgramReviewApproved error: Unable to read program.')
      return {error: 'Unable to read program data. Operation failed.'};
    }

    const program = programSnap.data() as any;

    // create an approved program doc to ensure only admin approved programs get updated by creators
    // Important! Do this before writing to the user's private programs node to ensure correct
    // data gets copied to public & paywall protected areas on update of the private node.
    await db.collection(`approved-programs`)
    .doc(programId)
    .create({
      programId,
      approved: approvedDate,
      reviewerUid: userId
    });

    const batch = db.batch(); // prepare to execute multiple ops atomically

    // update user's private programs node with updated program object
    const privateProgramCopy = JSON.parse(JSON.stringify(program));
    const privateReviewRequest = JSON.parse(JSON.stringify(reviewRequest));
    privateReviewRequest.status = 'approved';
    privateReviewRequest.approved = approvedDate;
    privateReviewRequest.reviewerUid = userId;
    privateProgramCopy.adminApproved = true;
    privateProgramCopy.reviewRequest = privateReviewRequest;
    privateProgramCopy.lastUpdated = approvedDate;
    const privateProgramRef = db.collection(`users/${reviewRequest.sellerUid}/programs`).doc(programId);
    batch.set(privateProgramRef, privateProgramCopy, { merge: true });


    // delete review request from the admin collection
    const adminRef = db.collection(`admin/review-requests/programs`).doc(programId);
    batch.delete(adminRef) // triggers onDelete monitor function to update count

    await batch.commit(); // execute batch ops. Any error should trigger catch.

    // add the program id to the seller's custom claims so they can access the program
    await addCustomUserClaims(program.sellerUid, { [programId]: true });

    // delete the draft program record in Algolia
    const index = algolia.initIndex('prod_DRAFT_PROGRAMS');
    await index.deleteObject(programId);

    // trigger a mailchimp event to log program going live
    const event = {
      name: 'admin_approved_program',
      properties: {
        program_title: program.title,
        goto_url: `https://lifecoach.io/my-programs/${programId}/content`
      }
    }
    await logMailchimpEvent(program.sellerUid, event); // log event

    return { success: true } // success if we got this far!

  } catch (err) {
    console.error(err);
    return { error: err }
  }
});

/*
  Attempts to reject a coaching program in review.
*/
exports.adminRejectProgramReview = functions
.runWith({memory: '1GB', timeoutSeconds: 300})
.https
.onCall( async (data, context) => {

  const programId = data.programId;
  const userId = data.userId; // reviewer not seller!
  const reviewRequest = data.reviewRequest;
  const rejectedDate = Math.round(new Date().getTime() / 1000); // unix timestamp

  // safety checks
  if (!programId) {
    return { error: 'Cloud function adminRejectProgramReview error: missing program ID' }
  }
  if (!userId) {
    return { error: 'Cloud function adminRejectProgramReview error: missing user ID' }
  }
  if (!reviewRequest) {
    return { error: 'Cloud function adminRejectProgramReview error: missing review request' }
  }
  if (!reviewRequest.sellerUid) {
    return { error: 'Cloud function adminRejectProgramReview error: missing review request seller UID' }
  }

  // update the review request object
  reviewRequest.status = 'rejected';
  reviewRequest.rejected = rejectedDate;
  reviewRequest.reviewerUid = userId;

  try {

    const batch = db.batch(); // prepare to execute multiple ops atomically

    // update user's private program node
    const privateRef = db.collection(`users/${reviewRequest.sellerUid}/programs`).doc(programId);
    batch.set(privateRef, { reviewRequest }, { merge: true });

    // delete review request from the admin collection (user must make alterations and re-submit for review)
    const adminRef = db.collection(`admin/review-requests/programs`).doc(programId);
    batch.delete(adminRef) // triggers onDelete monitor function to update count

    await batch.commit(); // execute batch ops. Any error should trigger catch.

    // attempt to read program data
    const programSnap = await db.collection(`users/${reviewRequest.sellerUid}/programs`)
    .doc(programId)
    .get();

    // log mailchimp event
    const program = programSnap.data() as any;
    const event = {
      name: 'admin_rejected_program',
      properties: {
        program_title: program.title,
        reject_reason: reviewRequest.rejectData.reason,
        goto_url: `https://lifecoach.io/my-programs/${programId}/content`
      }
    }
    await logMailchimpEvent(reviewRequest.sellerUid, event); // log event

    return { success: true } // success

  } catch (err) {
    console.error(err);
    return { error: err }
  }
});

/*
  Attempts to approve a coaching service in review.
*/
exports.adminApproveServiceReview = functions
.runWith({memory: '1GB', timeoutSeconds: 300})
.https
.onCall( async (data, context) => {

  const serviceId = data.serviceId;
  const userId = data.userId; // reviewer not seller!
  const reviewRequest = data.reviewRequest;
  const approvedDate = Math.round(new Date().getTime() / 1000); // unix timestamp in seconds

  // safety checks
  if (!serviceId) {
    return { error: 'Cloud function adminApproveServiceReview error: missing service ID' }
  }
  if (!userId) {
    return { error: 'Cloud function adminApproveServiceReview error: missing user ID' }
  }
  if (!reviewRequest) {
    return { error: 'Cloud function adminApproveServiceReview error: missing review request' }
  }
  if (!reviewRequest.sellerUid) {
    return { error: 'Cloud function adminApproveServiceReview error: missing review request seller UID' }
  }

  try {

    // attempt to read service data
    const serviceSnap = await db.collection(`users/${reviewRequest.sellerUid}/services`)
    .doc(serviceId)
    .get();

    if (!serviceSnap.exists) {
      console.error('Cloud function onNewProgramReviewApproved error: Unable to read service.')
      return {error: 'Unable to read service data. Operation failed.'};
    }

    const service = serviceSnap.data() as any;

    // create an approved service doc to ensure only admin approved services get updated by creators
    // Important! Do this before writing to the user's private services node to ensure correct
    // data gets copied to public & paywall protected areas on update of the private node.
    await db.collection(`approved-services`)
    .doc(serviceId)
    .create({
      serviceId,
      approved: approvedDate,
      reviewerUid: userId
    });

    const batch = db.batch(); // prepare to execute multiple ops atomically

    // update user's private services node with updated service object
    const privateServiceCopy = JSON.parse(JSON.stringify(service));
    const privateReviewRequest = JSON.parse(JSON.stringify(reviewRequest));
    privateReviewRequest.status = 'approved';
    privateReviewRequest.approved = approvedDate;
    privateReviewRequest.reviewerUid = userId;
    privateServiceCopy.adminApproved = true;
    privateServiceCopy.reviewRequest = privateReviewRequest;
    privateServiceCopy.lastUpdated = approvedDate;
    const privateServiceRef = db.collection(`users/${reviewRequest.sellerUid}/services`).doc(serviceId);
    batch.set(privateServiceRef, privateServiceCopy, { merge: true });


    // delete review request from the admin collection
    const adminRef = db.collection(`admin/review-requests/services`).doc(serviceId);
    batch.delete(adminRef) // triggers onDelete monitor function to update count

    await batch.commit(); // execute batch ops. Any error should trigger catch.

    // add the service id to the seller's custom claims so they can access the service
    await addCustomUserClaims(service.sellerUid, { [serviceId]: true });

    // delete the draft service record in Algolia
    const index = algolia.initIndex('prod_DRAFT_SERVICES');
    await index.deleteObject(serviceId);

    // trigger a mailchimp event to log service going live
    const event = {
      name: 'admin_approved_service',
      properties: {
        service_title: service.title,
        goto_url: `https://lifecoach.io/my-services/${serviceId}/content`
      }
    }
    await logMailchimpEvent(service.sellerUid, event); // log event

    return { success: true } // success if we got this far!

  } catch (err) {
    console.error(err);
    return { error: err }
  }
});

/*
  Attempts to reject a coaching service in review.
*/
exports.adminRejectServiceReview = functions
.runWith({memory: '1GB', timeoutSeconds: 300})
.https
.onCall( async (data, context) => {

  const serviceId = data.serviceId;
  const userId = data.userId; // reviewer not seller!
  const reviewRequest = data.reviewRequest;
  const rejectedDate = Math.round(new Date().getTime() / 1000); // unix timestamp in seconds

  // safety checks
  if (!serviceId) {
    return { error: 'Cloud function adminRejectServiceReview error: missing service ID' }
  }
  if (!userId) {
    return { error: 'Cloud function adminRejectServiceReview error: missing user ID' }
  }
  if (!reviewRequest) {
    return { error: 'Cloud function adminRejectServiceReview error: missing review request' }
  }
  if (!reviewRequest.sellerUid) {
    return { error: 'Cloud function adminRejectServiceReview error: missing review request seller UID' }
  }

  // update the review request object
  reviewRequest.status = 'rejected';
  reviewRequest.rejected = rejectedDate;
  reviewRequest.reviewerUid = userId;

  try {

    const batch = db.batch(); // prepare to execute multiple ops atomically

    // update user's private services node
    const privateRef = db.collection(`users/${reviewRequest.sellerUid}/services`).doc(serviceId);
    batch.set(privateRef, { reviewRequest }, { merge: true });

    // delete review request from the admin collection (user must make alterations and re-submit for review)
    const adminRef = db.collection(`admin/review-requests/services`).doc(serviceId);
    batch.delete(adminRef) // triggers onDelete monitor function to update count

    await batch.commit(); // execute batch ops. Any error should trigger catch.

    // attempt to read service data
    const serviceSnap = await db.collection(`users/${reviewRequest.sellerUid}/services`)
    .doc(serviceId)
    .get();

    // log mailchimp event
    const service = serviceSnap.data() as any;
    const event = {
      name: 'admin_rejected_service',
      properties: {
        service_title: service.title,
        reject_reason: reviewRequest.rejectData.reason,
        goto_url: `https://lifecoach.io/my-services/${serviceId}/content`
      }
    }
    await logMailchimpEvent(reviewRequest.sellerUid, event); // log event

    return { success: true } // success

  } catch (err) {
    console.error(err);
    return { error: err }
  }
});

// ================================================================================
// =====                            COACH INVITES                            ======
// ================================================================================

/*
  Allows coaches to invite people in their CRM to sign up for their products & services.
  The data object will be a 'CoachInvite'
*/
exports.sendCoachInvite = functions
.runWith({memory: '1GB', timeoutSeconds: 300})
.https
.onCall( async (data, context) => {

  // Reject any unauthorised user immediately.
  if (!context.auth) {
    return {error: 'Unauthorised!'}
  }

  const now = Math.round(new Date().getTime()/1000) // unix timestamp

  const baseUrl = `https://lifecoach.io`
  let landingUrl = baseUrl;
  if (data.type === 'program') {
    landingUrl = `${baseUrl}/program/${data.item.programId}`;
  } else if (data.type === 'ecourse') {
    landingUrl = `${baseUrl}/course/${data.item.courseId}`;
  } else if (data.type === 'service') {
    landingUrl = `${baseUrl}/service/${data.item.serviceId}`;
  }

  try {

    // trigger the email
    const event = {
      name: 'coach_invited_user',
      properties: {
        coach_uid: data.item.sellerUid,
        coach_name: data.item.coachName,
        coach_photo: data.item.coachPhoto,
        item_type: data.type,
        item_title: data.item.title,
        item_subtitle: data.item.subtitle,
        item_image: data.item.image,
        landing_url: landingUrl,
        coach_url: `https://lifecoach.io/coach/${data.item.sellerUid}`,
        message: data.message
      }
    };
    await logMailchimpEvent(data.invitee.id, event);

    // record the crm event in the coach's history
    await db.collection(`users/${data.item.sellerUid}/people/${data.invitee.id}/history`)
    .doc(now.toString())
    .set({ action: event.name, event });

    // record in coach's invites sent node
    await db.collection(`users/${data.item.sellerUid}/sent-invites/${data.invitee.id}/by-date`)
    .doc(now.toString())
    .set(event);

    // record in invitees invites received node
    await db.collection(`users/${data.invitee.id}/received-invites/${data.item.sellerUid}/by-date`)
    .doc(now.toString())
    .set(event);

    // success
    return { success: true } // success

  } catch (err) {
    console.error(err);
    return { error: err }
  }
});

// ================================================================================
// =====                         COACHING SESSIONS                           ======
// ================================================================================

/*
  Allows regular users to book/order coaching / discovery sessions with coaches.
*/

exports.orderCoachSession = functions
.runWith({memory: '1GB', timeoutSeconds: 300})
.https
.onCall( async (data, context) => {

  // Reject any unathorised user immediately.
  if (!context.auth) {
    return {error: 'Unauthorised!'}
  }

  const coachId = data.coachId; // the user id of the coach
  const event = data.event; // is a type CustomCalendarEvent
  const uid = data.uid; // the user id of the person booking
  const userName = data.userName; // the username of the person booking
  const userPhoto = data.userPhoto; // the avatar url of the person booking
  const sessionId = data.event.id; // use the event id to create the session id
  const dateNow = Date.now();

  const promises = []; // an array of promises to execute

  const batch = db.batch(); // prepare to execute multiple ops atomically

  try {

    console.group('ORDERING COACH SESSION');

    // update the event on the coach calendar
    const coachEventSnap = await db.collection(`users/${coachId}/calendar`)
      .where('id', '==', event.id)
      .get() // lookup the original event on the coach calendar

    if (coachEventSnap.empty) { // original event does not exist
      return {error: 'Cannot find original calendar event'}; // abort
    }

    const queryDocSnap = coachEventSnap.docs[0]; // capture the query document snapshot
    const coachEventRef = queryDocSnap.ref; // capture the reference to the document
    // const originalEvent = queryDocSnap.data(); // capture the original event object

    batch.set(coachEventRef, { // update the document by merging new data into the event object
      ordered: true,
      orderedById: uid,
      client: uid,
      orderedByName: userName,
      orderedByPhoto: userPhoto,
      cssClass: 'ordered',
      sessionId,
    }, { merge: true });

    // create the ordered session for the person booking using the session id as the document id //
    const orderedSessionRef = db.collection(`users/${uid}/ordered-sessions`).doc(sessionId);
    batch.set(orderedSessionRef, {
      start: event.start,
      end: event.end,
      sessionId,
      type: event.type
    });

    // create the session in the all sessions node using the session id as the doc id
    const allSessionsRef = db.collection(`ordered-sessions/all/sessions`).doc(sessionId);
    batch.set(allSessionsRef, {
      coachId,
      timeOfReserve: dateNow,
      participants: [coachId, uid],
      originalEvent: event,
      start: event.start,
      end: event.end,
      testField: 'testField'
    }, { merge: true });

    // record the crm event in the coach's history
    const coachCrmRef = db.collection(`users/${coachId}/people/${uid}/history`).doc((Math.round(dateNow / 1000)).toString());
    batch.set(coachCrmRef, { action: 'booked_session', event });

    // create an event in the client's history with the coach
    const clientHistoryRef = db.collection(`users/${uid}/coaches/${coachId}/history`).doc((Math.round(dateNow / 1000)).toString());
    batch.set(clientHistoryRef, { action: 'booked_session', event });

    await batch.commit(); // execute batch ops. Any error should trigger catch.

    // send emails

    // trigger a mailchimp event to send an email to the person booking
    const coachProfileSnap = await db.collection(`public-coaches`)
    .doc(coachId)
    .get();  // lookup coach data for the email
    const coachProfile = coachProfileSnap.data();

    const bookerMailEvent = {
      name: 'booked_coach_session',
      properties: {
        type: event.type,
        start: new Date(event.start.seconds * 1000).toUTCString(),
        end: new Date(event.end.seconds * 1000).toUTCString(),
        coach_name: `${coachProfile ? coachProfile.firstName : 'Lifecoach'} ${coachProfile ? coachProfile.lastName : 'Coach'}`,
        coach_photo: `${coachProfile ? coachProfile.photo : 'https://eu.ui-avatars.com/api/?name=lifecoach+coach&background=00f2c3&color=fff&rounded=true&bold=true'}`,
        landing_url: `https://lifecoach.io/my-sessions/${sessionId}`
      }
    }
    const mailBookerPromise = logMailchimpEvent(uid, bookerMailEvent); // log event
    promises.push(mailBookerPromise); // add the promise to the promises array

    // trigger a mailchimp event to send an email to the coach
    const coachMailEvent = {
      name: 'session_booked',
      properties: {
        type: event.type,
        start: new Date(event.start.seconds * 1000).toUTCString(),
        end: new Date(event.end.seconds * 1000).toUTCString(),
        user_name: userName,
        user_photo: userPhoto,
        landing_url: `https://lifecoach.io/my-sessions/${sessionId}`
      }
    }
    const mailCoachPromise = logMailchimpEvent(coachId, coachMailEvent); // log event
    promises.push(mailCoachPromise); // add the promise to the promises array

    await Promise.all(promises); // execute all promises

    return {success: true};

  } catch (err) {
    console.error(err);
    return {error: err}
  }
});

/*
  Allows coaches or regular users to cancel sessions.
*/

exports.cancelCoachSession = functions
.runWith({memory: '1GB', timeoutSeconds: 300})
.https
.onCall( async (data, context) => {

  // Reject any unathorised user immediately.
  if (!context.auth) {
    return {error: 'Unauthorised!'}
  }

  const eventId = data.eventId; // is a type CustomCalendarEvent
  const cancelledById = data.cancelledById; // who cancelled the session?
  const now = Math.round(new Date().getTime() / 1000) // unix timestamp

  const promises = []; // an array of promises to execute

  const batch = db.batch(); // prepare to execute multiple ops atomically

  try {

    console.group('CANCELLING COACH SESSION');

    // lookup the event data in all events to get the coach ID
    const eventSnap = await db.collection(`ordered-sessions/all/sessions`)
      .doc(eventId)
      .get() // lookup the event

    if (!eventSnap.exists) { // doc does not exist
      return {error: 'Cannot find event in all events'}; // abort
    }

    const eventInAllEvents = eventSnap.data();

    if (!eventInAllEvents) {
      return {error: 'Event in all events document data is missing'}; // abort
    }

    const coachId = eventInAllEvents.coachId;

    // update the event on the coach calendar
    const coachEventSnap = await db.collection(`users/${coachId}/calendar`)
      .where('id', '==', eventId)
      .get() // lookup the original event on the coach calendar

    if (coachEventSnap.empty) { // original event does not exist
      return {error: 'Cannot find original calendar event'}; // abort
    }

    const queryDocSnap = coachEventSnap.docs[0]; // capture the query document snapshot
    const coachEventRef = queryDocSnap.ref; // capture the reference to the document
    const coachCalEvent = queryDocSnap.data(); // capture the original event object

    batch.set(coachEventRef, { // update the document by merging new data into the event object
      cancelled: true,
      cancelledById,
      cancelledTime: now,
      cssClass: 'cancelled'
    }, { merge: true });

    // update the ordered session for the regular user
    const orderedSessionRef = db.collection(`users/${coachCalEvent.orderedById}/ordered-sessions`).doc(coachCalEvent.sessionId);
    batch.set(orderedSessionRef, {
      cancelled: true,
      cancelledById,
      cancelledTime: now
    }, { merge: true });

    // update the session in the all sessions node
    const allSessionsRef = db.collection(`ordered-sessions/all/sessions`).doc(coachCalEvent.sessionId);
    batch.set(allSessionsRef, {
      cancelled: true,
      cancelledById,
      cancelledTime: now
    }, { merge: true });

    // record the crm event in the coach's history
    const coachCrmRef = db.collection(`users/${coachId}/people/${coachCalEvent.orderedById}/history`).doc(now.toString());
    batch.set(coachCrmRef, { action: 'cancelled_session', event: coachCalEvent, cancelledById });

    // create an event in the client's history with the coach
    const clientHistoryRef = db.collection(`users/${coachCalEvent.orderedById}/coaches/${coachId}/history`).doc(now.toString());
    batch.set(clientHistoryRef, { action: 'cancelled_session', event: coachCalEvent, cancelledById });

    await batch.commit(); // execute batch ops. Any error should trigger catch.

    // send emails

    // if the coach cancelled the session
    if (cancelledById === coachId) {
      // trigger a mailchimp event to send to the regular user
      const coachProfileSnap = await db.collection(`public-coaches`)
      .doc(coachId)
      .get();  // lookup coach data for the email
      const coachProfile = coachProfileSnap.data();

      const bookerMailEvent = {
        name: 'coach_cancelled_your_session',
        properties: {
          type: coachCalEvent.type,
          start: new Date(coachCalEvent.start.seconds * 1000).toUTCString(),
          end: new Date(coachCalEvent.end.seconds * 1000).toUTCString(),
          coach_name: `${coachProfile ? coachProfile.firstName : 'Lifecoach'} ${coachProfile ? coachProfile.lastName : 'Coach'}`,
          coach_photo: `${coachProfile ? coachProfile.photo : 'https://eu.ui-avatars.com/api/?name=lifecoach+coach&background=00f2c3&color=fff&rounded=true&bold=true'}`,
          landing_url: `https://lifecoach.io/my-sessions/${coachCalEvent.sessionId}`,
          coach_profile_url: `https://lifecoach.io/coach/${coachId}`
        }
      }
      const mailBookerPromise = logMailchimpEvent(coachCalEvent.orderedById, bookerMailEvent); // log event
      promises.push(mailBookerPromise); // add the promise to the promises array

      // trigger a mailchimp event to send an email to the coach
      const coachMailEvent = {
        name: 'coach_cancelled_own_session',
        properties: {
          type: coachCalEvent.type,
          start: new Date(coachCalEvent.start.seconds * 1000).toUTCString(),
          end: new Date(coachCalEvent.end.seconds * 1000).toUTCString(),
          user_name: coachCalEvent.orderedByName,
          user_photo: coachCalEvent.orderedByPhoto,
          landing_url: `https://lifecoach.io/my-sessions/${coachCalEvent.sessionId}`
        }
      }
      const mailCoachPromise = logMailchimpEvent(coachId, coachMailEvent); // log event
      promises.push(mailCoachPromise); // add the promise to the promises array

    } else if (cancelledById !== coachId) { // if the regular user cancelled the session

      // trigger a mailchimp event to send to the regular user
      const coachProfileSnap = await db.collection(`public-coaches`)
      .doc(coachId)
      .get();  // lookup coach data for the email
      const coachProfile = coachProfileSnap.data();

      const bookerMailEvent = {
        name: 'you_cancelled_coach_session',
        properties: {
          type: coachCalEvent.type,
          start: new Date(coachCalEvent.start.seconds * 1000).toUTCString(),
          end: new Date(coachCalEvent.end.seconds * 1000).toUTCString(),
          coach_name: `${coachProfile ? coachProfile.firstName : 'Lifecoach'} ${coachProfile ? coachProfile.lastName : 'Coach'}`,
          coach_photo: `${coachProfile ? coachProfile.photo : 'https://eu.ui-avatars.com/api/?name=lifecoach+coach&background=00f2c3&color=fff&rounded=true&bold=true'}`,
          landing_url: `https://lifecoach.io/my-sessions/${coachCalEvent.sessionId}`,
          coach_profile_url: `https://lifecoach.io/coach/${coachId}`
        }
      }
      const mailBookerPromise = logMailchimpEvent(coachCalEvent.orderedById, bookerMailEvent); // log event
      promises.push(mailBookerPromise); // add the promise to the promises array

      // trigger a mailchimp event to send an email to the coach
      const coachMailEvent = {
        name: 'user_cancelled_your_session',
        properties: {
          type: coachCalEvent.type,
          start: new Date(coachCalEvent.start.seconds * 1000).toUTCString(),
          end: new Date(coachCalEvent.end.seconds * 1000).toUTCString(),
          user_name: coachCalEvent.orderedByName,
          user_photo: coachCalEvent.orderedByPhoto,
          landing_url: `https://lifecoach.io/my-sessions/${coachCalEvent.sessionId}`
        }
      }
      const mailCoachPromise = logMailchimpEvent(coachId, coachMailEvent); // log event
      promises.push(mailCoachPromise); // add the promise to the promises array
    }

    await Promise.all(promises); // execute all promises

    return {success: true};

  } catch (err) {
    console.error(err);
    return {error: err}
  }
});

/*
  Allows coaches to mark coaching sessions complete.
  Regular users purchase sessions so it's important that coaches only mark sessions complete
  when they are happy the user has received the full value of their purchased session.
*/
exports.coachMarkSessionComplete = functions
.runWith({memory: '1GB', timeoutSeconds: 300})
.https
.onCall( async (data, context) => {

  // Reject any unauthorised user immediately.
  if (!context.auth) {
    return {error: 'Unauthorised!'}
  }

  const coachUid = data.coachId;
  const clientUid = data.clientId;
  const programId = data.programId; // will be 'discovery' or program id string
  const sessionId = data.sessionId;
  const now = Math.round(new Date().getTime() / 1000) // unix timestamp

  const batch = db.batch(); // prepare to execute multiple ops atomically

  try {

    console.group('MARKING SESSION COMPLETE');

    // update the coach's calendar event
    const eventSnap = await db.collection(`users/${coachUid}/calendar`)
    .where('id', '==', sessionId)
    .limit(1)
    .get();

    if (eventSnap.empty) { // there are no documents in this collection
      return {error: 'Cannot find the matching calendar event document'}; // abort
    }

    const eventDocSnap = eventSnap.docs[0]; // document snapshot
    const event = eventDocSnap.data(); // document data

    batch.update(eventDocSnap.ref, {
      cssClass: 'complete',
      complete: true,
      completedTime: now
    });

    // create a history event in the coach CRM
    const historyRef = db.collection(`users/${coachUid}/people/${clientUid}/history`).doc(now.toString());
    batch.set(historyRef, { action: 'completed_session', programId, sessionId });

    // create an event in the client's history with the coach
    const clientHistoryRef = db.collection(`users/${clientUid}/coaches/${coachUid}/history`).doc(now.toString());
    batch.set(clientHistoryRef, { action: 'completed_session', programId, sessionId });

    // if marking a program session complete we need to deduct a paid session
    if (event.type === 'session') {
      // get a single document from this client's purchased sessions (for the given program)
      const sessionSnap = await db.collection(`users/${coachUid}/people/${clientUid}/sessions-purchased`)
      .where('programId', '==', programId)
      .limit(1)
      .get();

      if (sessionSnap.empty) { // there are no documents in this collection
        return {error: 'Cannot find a purchased session document'}; // abort
      }

      const sessionDocSnap = sessionSnap.docs[0]; // document snapshot
      const sessionDoc = sessionDocSnap.data(); // document data

      // update the session doc with time completed and linked calendar event (session) ID
      sessionDoc.completedTime = now;
      sessionDoc.linkedCalEventId = sessionId

      // copy the document into this client's completed sessions collection
      const completeRef = db.collection(`users/${coachUid}/people/${clientUid}/sessions-complete`).doc() // id does not matter
      batch.create(completeRef, sessionDoc);

      // delete the document from the purchased sessions collection
      batch.delete(sessionDocSnap.ref);
    }

    await batch.commit(); // execute batch ops. Any error should trigger catch.

    // success
    return { success: true } // success

  } catch (err) {
    console.error(err);
    return { error: err }
  }
});

exports.getTwilioToken = functions
  .runWith({memory: '1GB', timeoutSeconds: 300})
  .https
  .onCall(async (data: any, context?) => {

    const timeOfStart = data.timeOfStart;
    const currentTime = Date.now();
    const uid = data.uid;
    const room = data.room;
    const duration = data.duration;
    if ( (currentTime - timeOfStart > 60000 )|| ((timeOfStart + duration) < currentTime) ) {
      return {error: 'session can`t be started or it has already been ended'}
    }

    try {

      const res = await fetch(`https://getvideotoken-9623.twil.io/vide-token?uid=${uid}&room=${room}&timeOfStart${timeOfStart}&duration=${duration}`);

      const json = await res.json()
      // @ts-ignore
      return {json} // success

    } catch (err) {
      console.error(err);
      return {error: err}
    }

});

exports.getInfoAboutCurrentVideoSession = functions
  .runWith({memory: '1GB', timeoutSeconds: 300})
  .https
  .onCall(async (data: any, context?) => {

    try {
      const docSnapshot = await db.collection(`/ordered-sessions/all/sessions`)
        .doc(data.docId)
        .get();

      const sessionObject = docSnapshot.exists ? docSnapshot.data() : undefined;

      if (sessionObject) {

        if (sessionObject.start.seconds * 1000 > Date.now()) {
          return {sessionStatus: 'NOT_STARTED_YET'};
        }
        if (sessionObject.end.seconds * 1000 < Date.now()) {
          return {sessionStatus: 'IS_OVER'};
        }
        return {sessionStatus: 'IN_PROGRESS', timeLeft: sessionObject.end.seconds * 1000 - Date.now()};
      } else {
        return {sessionStatus: 'SESSION_NOT_FOUND'};
      }
    } catch (err) {
      console.error(err);
      return {error: err}
    }

});

exports.abortVideoSession = functions
  .runWith({memory: '1GB', timeoutSeconds: 300})
  .https
  .onCall(async (data: any, context?) => {
    try {
      await client.video.rooms(data.roomID)
        .update({status: 'completed'})
      return {success: true};
    } catch (err) {
      console.error(err);
      return {error: err}
    }
});

// ================================================================================
// =====                                                                     ======
// =====                       LISTENER FUNCTIONS                            ======
// =====                                                                     ======
// =====  https://firebase.google.com/docs/functions/firestore-events        ======
// ================================================================================

/*
  Monitor every coach type user's profile node.
  When updated, if set to 'isPublic', sync with public profiles node.
  Note: Regular type users use a different path to their profiles. This one is only for coaches!
*/
exports.onWriteUserProfileNode = functions
.runWith({memory: '1GB', timeoutSeconds: 300})
.firestore
.document('users/{uid}/profile/{profileId}')
.onWrite(async (change, context) => {

  const profile = change.after.data() as any;
  const userId = context.params.uid;
  const profileID = context.params.profileId;

  if (!change.before.exists) {
    // This is a new record (first time creation)

    // only trigger email if real profile created and not just an admin mass update function.
    // real profile will have a 'dateCreated' property. Mass update only has 'adminMassUpdated' property.
    if (profile.dateCreated) {
      // trigger a mailchimp event
      const event = {
        name: 'coach_profile_created',
        properties: {
          is_public: profile.isPublic
        }
      }
      await logMailchimpEvent(userId, event); // log event
    }

  }
  if (profile) {
    // Record has been updated
    console.log('Profile data exists. Updating profile...');

    // *** TEMP TEMP TEMP ***

    const profileCopy = JSON.parse(JSON.stringify(profile));

    const spec = specialities();

    // check data structure and replace speciality data with object structure

    // current structure (string)
    if (typeof profile.speciality1 === 'string') {
      const index = spec.findIndex(i => i.id === profile.speciality1);
      if (index !== -1) {
        profileCopy.speciality1 = spec[index]; // set as object
      }
    }

    // oldest structure (array)
    if (profile.speciality1 && profile.speciality1.length && profile.speciality1.length === 1) {
      profileCopy.speciality1 = profile.speciality1[0]; // set as object
    }

    // desired structure (object)
    if (profile.speciality1 && profile.speciality1.itemName) {
      // do nothing, we want this!
    }

    // check data structure and replace country data with object structure

    // current structure (string)
    if (typeof profile.country === 'string') {
      profileCopy.country = countryFlagEmoji.get(profile.country); // set as object
    }

    // oldest structure (array)
    if (profile.country && profile.country.length && profile.country.length === 1) {
      profileCopy.country = profile.country[0]; // set as object
    }

    // desired structure (object)
    if (profile.country && profile.country.name) {
      // do nothing, we want this!
    }

    // save the profile copy only if both original profile speciality 1 and country are not objects
    if ((profile.speciality1 && !profile.speciality1.itemName) || (profile.country && !profile.country.name)) {
      console.log('updating new data types for user:', userId);
      return db.collection(`users/${userId}/profile`)
      .doc(profileID)
      .set(profileCopy, {merge: true});
    }

    // ***********************

    if (profile.isPublic) {
      // Profile is set to public. Sync with public node.
      console.log('User profile is marked public. Syncing with public data...')
      return db.collection(`public-coaches`)
      .doc(userId)
      .set(profile, {merge: true})
      .catch(err => console.error(err));
    } else {
      // Profile is set to private. Remove copy from public node.
      // console.log('User profile is marked private.')
      const p1 = db.collection('public-coaches')
      .doc(userId)
      .get()
      // @ts-ignore
      .then( docSnapshot => {
        if (docSnapshot.exists) {
          // Doc does exist. Delete it.
          return db.collection(`public-coaches`)
          .doc(userId)
          .delete()
          .catch(err => console.error(err));
        }
        return null;
      })
      // @ts-ignore
      .catch( err => console.error(err));

      return Promise.all([p1]);
    }
  } else {
    // Record has been deleted. Delete copy from public node.
    console.log('User profile has been deleted. Removing from public display...')
    const p1 = db.collection('public-coaches')
    .doc(userId)
    .get()
    .then(docSnapshot => {
      if (docSnapshot.exists) {
        // Doc does exist. Delete it.
        return db.collection(`public-coaches`)
        .doc(userId)
        .delete()
        .catch(err => console.error(err));
      }
      return;
    })
    .catch(err => console.error(err));

    return Promise.all([p1]);
  }
});

/*
  Monitor the public coaches node.
  Sync with Algolia DB.
*/
exports.onWritePublicCoachesNode = functions
.runWith({memory: '1GB', timeoutSeconds: 300})
.firestore
.document(`/public-coaches/{docId}`)
.onWrite((change, context) => {
  const index = algolia.initIndex('prod_COACHES');
  const docId = context.params.docId;
  // console.log('Public coaches node changed. Updating Algolia record...');
  const profile: any = change.after.data() as any;
  // Record Removed.
  if (!profile) {
    return index.deleteObject(docId);
  }
  // Record added/updated.
  const recordToSend = {
    objectID: docId,
    dateCreated: profile.dateCreated, // NB: Must be a unix timestamp
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
    phone: profile.phone,
    photo: profile.photo,
    city: profile.city,
    country: profile.country,
    speciality1: profile.speciality1,
    qualBa: profile.qualBa,
    qualBsc: profile.qualBsc,
    qualBcomm: profile.qualBcomm,
    qualMa: profile.qualMa,
    qualMs: profile.qualMs,
    qualMba: profile.qualMba,
    qualMapp: profile.qualMapp,
    qualPhd: profile.qualPhd,
    qualAcc: profile.qualAcc,
    qualPcc: profile.qualPcc,
    qualMcc: profile.qualMcc,
    qualOther: profile.qualOther,
    qualEia: profile.qualEia,
    qualEqa: profile.qualEqa,
    qualEsia: profile.qualEsia,
    qualEsqa: profile.qualEsqa,
    qualIsmcp: profile.qualIsmcp,
    qualApecs: profile.qualApecs,
    qualEcas: profile.qualEcas,
    qualCas: profile.qualCas,
    qualCsa: profile.qualCsa,
    qualSa: profile.qualSa,
    proSummary: profile.proSummary,
    goalTags: profile.goalTags,
    profileVideo: profile.selectedProfileVideo,
    photoPaths: profile.photoPaths ? profile.photoPaths : undefined
  };
  // Update Algolia.
  return index.saveObject(recordToSend);
});

/*
  Monitor the (all) users account node.
  Sync with Algolia DB.
*/
exports.onWriteUserAccountNode = functions
.runWith({memory: '1GB', timeoutSeconds: 300})
.firestore
.document(`/users/{userId}/account/{docID}`)
.onWrite((change, context) => {
  const index = algolia.initIndex('prod_USERS');
  const docId = context.params.userId;
  // console.log('Users node changed. Updating Algolia record...');
  const account: any = change.after.data() as any;
  // Record Removed.
  if (!account) {
    return index.deleteObject(docId);
  }
  // Record added/updated.
  const recordToSend = {
    objectID: docId,
    accountEmail: account.accountEmail,
    accountType: account.accountType,
    dateCreated: account.dateCreated,
    firstName: account.firstName,
    lastName: account.lastName,
    userID: docId
  };
  // Update Algolia.
  return index.saveObject(recordToSend);
});

/*
  Monitor all user to user chat messages.
  Sync with Algolia DB.
*/
exports.onPostNewChatMessage = functions
.runWith({memory: '1GB', timeoutSeconds: 300})
.firestore
.document(`/chatrooms/{roomId}/messages/{msgId}`)
.onWrite((change, context) => {
  const index = algolia.initIndex('prod_MESSAGES');
  const roomId = context.params.roomId;
  const msgId = context.params.msgId;
  const msg: any = change.after.data() as any;
  // Record Removed.
  if (!msg) {
    return index.deleteObject(msgId);
  }
  // Record added/updated.
  const recordToSend = {
    objectID: msgId,
    roomId,
    sent: msg.sent,
    from: msg.from,
    message: msg.msg,
  };
  // Update Algolia.
  return index.saveObject(recordToSend);
});

/*
  Monitor all user's own chat room nodes.
*/
exports.onUpdateUserChatRoom = functions
.runWith({memory: '1GB', timeoutSeconds: 300})
.firestore
.document(`userRooms/{userId}/rooms/{roomId}`)
.onUpdate((change, context) => {
  const userId = context.params.userId;
  const roomId = context.params.roomId;
  const before = change.before.data() as any;
  const after = change.after.data() as any;
  const wait = 10; // integer in seconds (unix)

  if (after) { // only run if room exists
    if (before.lastActive !== after.lastActive) { // only run when new message received in room
      /*
      Give the user time to read the message. If the last active message time is greater than
      the last read time after the wait period, consider the message unread. Note: read time
      s set when the user receives the new msg in their client view of the feed, so the wait
      allows for the read time to be updated in the room before it is checked.
      */
      setTimeout( async () => {
        // we have to read again to get the latest data after a possible lastRead update.
        const roomSnap = await db.collection(`userRooms/${userId}/rooms`)
        .doc(roomId)
        .get();

        if (roomSnap.exists) {
          const room = roomSnap.data() as any;
          if ( !room.lastRead || (room.lastActive > room.lastRead) ) { // msg is unread
            console.log(`Sending an unread message email notification now! User ${userId}, room ${roomId}`);

            // Read the user's account email
            const accountSnap = await db.collection(`users/${userId}/account`)
            .doc(`account${userId}`)
            .get();

            if (accountSnap.exists) {
              const account = accountSnap.data() as any;

              // Prepare the email options
              const emailOptions: Mail.Options = {
                from: 'donotreply@lifecoach.io',
                to: account.accountEmail,
                subject: 'You have a new message',
                text: `You have a new message: ${room.lastMsg}.
                Please visit your Lifecoach message centre to reply.`,
                html: `
                <body>
                  <p>
                    You have a new message:
                  </p>
                  <p>
                    "${room.lastMsg}"
                  </p>
                  <p>
                    Visit your <strong><a href="https://lifecoach.io/messages/rooms${roomId}">Lifecoach message centre</a></strong> to reply.
                  </p>
                  <p>
                    Please do not respond to this email. This email is automatically generated and replies to this address are not monitored.
                    If you require assistance with your Lifecoach account please visit our <a href="https://lifecoach.freshdesk.com/support/home">
                    support center</a> or email hello@lifecoach.io
                  </p>
                </body>
                `
              }

              // Send the email
              sendEmail(emailOptions);
            }
          }
        }
      }, wait);

    }
  }
  return null;
});

/*
  Monitor new user's library videos & increment count when new assets added.
*/
exports.onPostNewCourseLibraryItem = functions
.runWith({memory: '1GB', timeoutSeconds: 300})
.firestore
.document(`users/{userId}/courseLibrary/{docId}`)
.onCreate((snap, context) => {
  const uid = context.params.userId;
  const increment = admin.firestore.FieldValue.increment(1);
  return db.collection(`users/${uid}/courseLibrary/totals/items`)
  .doc('itemTotals')
  .set({
    totalItems: increment
  }, { merge: true })
  .catch(err => console.error(err));
});

/*
  Monitor new admin courses in review (review requests).
*/
exports.onNewAdminCourseReviewRequest = functions
.runWith({memory: '1GB', timeoutSeconds: 300})
.firestore
.document(`admin/review-requests/courses/{courseId}`)
.onCreate( async (snap, context) => {

  const reviewRequest = snap.data() as any

  const increment = admin.firestore.FieldValue.increment(1);

  db.collection(`admin`)
  .doc('totalCoursesInReview')
  .set({
    totalRecords: increment
  }, { merge: true })
  .catch(err => console.error(err));

  // attempt to read course data
  if (reviewRequest) {
    const courseSnap = await db.collection(`users/${reviewRequest.sellerUid}/courses`)
    .doc(reviewRequest.courseId)
    .get();

    const course = courseSnap.data() as any;

    if (course) {
      // record a mailchimp event
      const event = {
        name: 'course_submitted_for_review',
        properties: {
          course_title: course.title,
        }
      }
      return logMailchimpEvent(course.sellerUid, event); // log event
    }

  }

});

/*
  Monitor deleted admin courses in review (review requests).
*/
exports.onDeleteAdminCourseReviewRequest = functions
.runWith({memory: '1GB', timeoutSeconds: 300})
.firestore
.document(`admin/review-requests/courses/{courseId}`)
.onDelete((snap, context) => {
  const decrement = admin.firestore.FieldValue.increment(-1);
  return db.collection(`admin`)
  .doc('totalCoursesInReview')
  .set({
    totalRecords: decrement
  }, { merge: true })
  .catch(err => console.error(err));
});

/*
  Monitor public courses node.
  Sync with Algolia DB.
*/
exports.onWritePublicCourses = functions
.runWith({memory: '1GB', timeoutSeconds: 300})
.firestore
.document(`/public-courses/{courseId}`)
.onWrite((change, context) => {
  const index = algolia.initIndex('prod_COURSES');
  const courseId = context.params.courseId;
  const course = change.after.data() as any;
  // Record Removed.
  if (!course) {
    return index.deleteObject(courseId);
  }
  // Record added/updated.
  const recordToSend = {
    objectID: courseId,
    title: course.title,
    subtitle: course.subtitle,
    category: course.category,
    language: course.language,
    level: course.level,
    subject: course.subject,
    pricingStrategy: course.pricingStrategy,
    price: course.price,
    currency: course.currency,
    image: course.image,
    promoVideo: course.promoVideo,
    coachName: course.coachName,
    coachPhoto: course.coachPhoto,
    approved: course.approved,
    includeInCoachingForCoaches: course.includeInCoachingForCoaches,
    imagePaths: course.imagePaths ? course.imagePaths : null
  };
  // Update Algolia.
  return index.saveObject(recordToSend);
});

/*
  Monitor users' private courses node.
  If course is admin approved, sync with public courses.
*/
exports.onWritePrivateUserCourse = functions
.runWith({memory: '1GB', timeoutSeconds: 300})
.firestore
.document(`/users/{userId}/courses/{courseId}`)
.onWrite( async (change, context) => {
  const courseId = context.params.courseId;
  const course = change.after.data() as any;
  const courseBefore = change.before.data() as any;

  // Record created
  if (course && !courseBefore) {
    // sync with Algolia draft course index
    const index = algolia.initIndex('prod_DRAFT_COURSES');
    const recordToSend = {
      objectID: courseId,
      sellerUid: course.sellerUid,
      title: course.title,
      sellerName: course.coachName ? course.coachName : ''
    }
    await index.saveObject(recordToSend);

    // record a mailchimp event
    const event = {
      name: 'new_course_created',
      properties: {
        course_title: course.title,
      }
    }
    await logMailchimpEvent(course.sellerUid, event); // log event
  }

  // Record Removed.
  if (!course) {
    // remove course from sale but leave course data behind the paywall as users have paid for it
    // and shouldn't lose access.
    await db.collection('public-courses')
    .doc(courseId)
    .delete()
    .catch(err => console.error(err));

    // if review request still waiting, delete it
    await db.collection('admin/review-requests/courses')
    .doc(courseId)
    .delete();

    // delete the draft course record in Algolia (if it exists)
    const index = algolia.initIndex('prod_DRAFT_COURSES');
    return index.deleteObject(courseId);
  }

  // Record added/updated.
  if (!course.adminApproved) { // check if admin approved
    return;
  }

  const adminSnap = await db.collection(`approved-courses`)
  .doc(courseId)
  .get();

  if (!adminSnap.exists) { // double check if admin approved (this doc can't be tampered with client side)
    return;
  }

  // map course lectures into public lectures by removing paywall protected data
  const publicLectures = course.lectures.map((item: any) => {
    const container = {} as any;

    container.id = item.id;
    container.title = item.title;
    container.type = item.type;
    if (item.preview) {
      container.preview = item.preview;
    }
    if (item.video) {
      container.video = {
        duration: item.video.duration ? item.video.duration : 0,
        downloadURL: item.preview ? item.video.downloadURL : null // important! Only add the download URL if preview is true
      }
    }

    return container;
  })

  try {
    // Sync with public-courses.
    const batch = db.batch(); // prepare to execute multiple ops atomically

    // copy non-paywall protected course data in public courses node (to allow browse & purchase)
    const publicData = {
      courseId,
      approved: course.reviewRequest.approved ? course.reviewRequest.approved : null,
      pricingStrategy: course.pricingStrategy,
      currency: course.currency ? course.currency : null,
      price: course.price ? course.price : null,
      sellerUid: course.sellerUid,
      coachName: course.coachName,
      coachPhoto: course.coachPhoto,
      stripeId: course.stripeId ? course.stripeId : null,
      title: course.title,
      subtitle: course.subtitle,
      description: course.description,
      language: course.language,
      category: course.category,
      level: course.level,
      subject: course.subject,
      image: course.image,
      promoVideo: course.promoVideo,
      lastUpdated: course.lastUpdated,
      learningPoints: course.learningPoints,
      requirements: course.requirements,
      sections: course.sections,
      lectures: publicLectures, // Caution! Don't add lecture data here without removing paywall protected content!
      includeInCoachingForCoaches: course.includeInCoachingForCoaches ? course.includeInCoachingForCoaches : null,
      imagePaths: course.imagePaths ? course.imagePaths : null
    };
    const publicRef = db.collection(`public-courses`).doc(courseId);
    batch.set(publicRef, publicData, { merge: true });

    // copy course object as is into paywall protected node (will be available when purchased!)
    const lockedRef = db.collection(`locked-course-content`).doc(courseId);
    batch.set(lockedRef, course, { merge: true });

    return batch.commit(); // execute batch ops. Any error should trigger catch.
  } catch (err) {
    console.error(err);
    return;
  }

});

/*
  Monitor course user reviews.
*/
exports.onWriteCourseReview = functions
.runWith({memory: '1GB', timeoutSeconds: 300})
.firestore
.document(`course-reviews/{reviewId}`)
.onWrite( async (change, context) => {

  const index = algolia.initIndex('prod_COURSE_REVIEWS');
  const reviewId = context.params.reviewId;
  const before = change.before.data() as any;
  const review = change.after.data() as any;

  // Record Removed.

  if (!review) {

    // decrement total review count
    if (before) {
      const decrementCount = admin.firestore.FieldValue.increment(-1);
      await db.collection(`public-courses`)
      .doc(review.courseId)
      .set({ [`total${getRatingAsText(before.starValue)}StarReviews`]: decrementCount }, { merge: true })
      .catch(err => console.error(err));
    }

    // sync with Algolia
    return index.deleteObject(reviewId);
  }

  // Record added/updated

  // if rating has been updated, decrement the old value before incrementing the new value
  if (before && before.starValue && review && review.starValue && (before.starValue !== review.starValue)) {
    const decrementCount = admin.firestore.FieldValue.increment(-1);
    await db.collection(`public-courses`)
    .doc(review.courseId)
    .set({ [`total${getRatingAsText(before.starValue)}StarReviews`]: decrementCount }, { merge: true })
    .catch(err => console.error(err));
  }

  // increment total review count to allow cheaper lookups
  const incrementCount = admin.firestore.FieldValue.increment(1);
  await db.collection(`public-courses`)
  .doc(review.courseId)
  .set({ [`total${getRatingAsText(review.starValue)}StarReviews`]: incrementCount }, { merge: true })
  .catch(err => console.error(err));

  // sync with Algolia
  const recordToSend = {
    objectID: reviewId,
    courseId: review.courseId,
    lastUpdated: review.lastUpdated,
    reviewerUid: review.reviewerUid,
    reviewerFirstName: review.reviewerFirstName,
    reviewerLastName: review.reviewerLastName,
    reviewerPhoto: review.reviewerPhoto ? review.reviewerPhoto : null,
    sellerUid: review.sellerUid,
    starValue: review.starValue,
    summary: review.summary ? review.summary : null,
    summaryExists: review.summary ? true : false,
  };
  // Update Algolia.
  return index.saveObject(recordToSend);
});

function getRatingAsText(rating: number) {
  switch (rating) {
    case 5:
      return 'Five';
    case 4.5:
      return 'FourPointFive';
    case 4:
      return 'Four';
    case 3.5:
      return 'ThreePointFive';
    case 3:
      return 'Three';
    case 2.5:
      return 'TwoPointFive';
    case 2:
      return 'Two';
    case 1.5:
      return 'OnePointFive';
    case 1:
      return 'One';
    case 0.5:
      return 'ZeroPointFive';
    default:
      return 'Zero';
  }
}

/*
  Monitor newly created public course questions.
  Sync with Algolia.
*/
exports.onCreateCoursePublicQuestion = functions
.runWith({memory: '1GB', timeoutSeconds: 300})
.firestore
.document(`public-course-questions/{questionId}`)
.onCreate( async (snap, context) => {
  const index = algolia.initIndex('prod_COURSE_QUESTIONS');
  const questionId = context.params.questionId;
  const question = snap.data() as any;

  // Record added/updated.
  const recordToSend = {
    objectID: questionId,
    type: question.type,
    title: question.title,
    askerUid: question.askerUid,
    askerFirstName: question.askerFirstName,
    askerLastName: question.askerLastName,
    courseId: question.courseId,
    courseSellerId: question.courseSellerId,
    lectureId: question.lectureId,
    created: question.created,
    askerPhoto: question.askerPhoto,
    detail: question.detail,
    replies: question.replies ? question.replies : null
  };

  // Update Algolia.
  await index.saveObject(recordToSend);

  // Increment question count on course
  const incrementCount = admin.firestore.FieldValue.increment(1);
  return db.collection(`locked-course-content`)
  .doc(question.courseId)
  .set({ questions: incrementCount }, { merge: true })
  .catch(err => console.error(err));
});

/*
  Monitor newly deleted public course questions.
  Sync with Algolia.
*/
exports.onDeleteCoursePublicQuestion = functions
.runWith({memory: '1GB', timeoutSeconds: 300})
.firestore
.document(`public-course-questions/{questionId}`)
.onDelete( async (snap, context) => {
  const index = algolia.initIndex('prod_COURSE_QUESTIONS');
  const questionId = context.params.questionId;
  const question = snap.data() as any;

  // Update Algolia
  await index.deleteObject(questionId);

  // Deccrement question count on course
  const decrement = admin.firestore.FieldValue.increment(-1);
  return db.collection(`locked-course-content`)
  .doc(question.courseId)
  .set({ questions: decrement }, { merge: true })
  .catch(err => console.error(err));
});

/*
  Monitor newly created course question replies.
  Sync with Algolia.
*/
exports.onCreateCoursePublicQuestionReply = functions
.runWith({memory: '1GB', timeoutSeconds: 300})
.firestore
.document(`public-course-questions/{questionId}/replies/{replyId}`)
.onCreate( async (snap, context) => {
  const index = algolia.initIndex('prod_COURSE_REPLIES');
  const questionId = context.params.questionId;
  const replyId = context.params.replyId;
  const reply = snap.data() as any;

  // Record added/updated.
  const recordToSend = {
    objectID: replyId,
    replierUid: reply.replierUid,
    replierFirstName: reply.replierFirstName,
    replierLastName: reply.replierLastName,
    questionId,
    created: reply.created,
    replierPhoto: reply.replierPhoto,
    detail: reply.detail
  };

  // Update Algolia.
  await index.saveObject(recordToSend);

  // Increment replies count on original question
  const incrementCount = admin.firestore.FieldValue.increment(1);
  return db.collection(`public-course-questions`)
  .doc(questionId)
  .set({ replies: incrementCount }, { merge: true })
  .catch(err => console.error(err));
});

/*
  Monitor deleted course question replies.
  Sync with Algolia.
*/
exports.onDeleteCoursePublicQuestionReply = functions
.runWith({memory: '1GB', timeoutSeconds: 300})
.firestore
.document(`public-course-questions/{questionId}/replies/{replyId}`)
.onDelete( async (snap, context) => {
  const index = algolia.initIndex('prod_COURSE_REPLIES');
  const questionId = context.params.questionId;
  const replyId = context.params.replyId;

  // Update Algolia.
  await index.deleteObject(replyId);

  // Deccrement replies count on original question
  const decrement = admin.firestore.FieldValue.increment(-1);
  return db.collection(`public-course-questions`)
  .doc(questionId)
  .set({ replies: decrement }, { merge: true })
  .catch(err => console.error(err));
});

/*
  Monitor newly created course question upvotes.
  Update count on course.
*/
exports.onCreateCoursePublicQuestionUpvote = functions
.runWith({memory: '1GB', timeoutSeconds: 300})
.firestore
.document(`public-course-questions/{questionId}/upvotes/{userId}`)
.onCreate( async (snap, context) => {
  const questionId = context.params.questionId;

  // Increment upvotes count on original question
  const incrementCount = admin.firestore.FieldValue.increment(1);
  return db.collection(`public-course-questions`)
  .doc(questionId)
  .set({ upVotes: incrementCount }, { merge: true })
  .catch(err => console.error(err));
});

/*
  Monitor newly created course question reply upvotes.
  Update count on course question reply.
*/
exports.onCreateCoursePublicQuestionReplyUpvote = functions
.runWith({memory: '1GB', timeoutSeconds: 300})
.firestore
.document(`public-course-questions/{questionId}/replies/{replyId}/upvotes/{userId}`)
.onCreate( async (snap, context) => {
  const questionId = context.params.questionId;
  const replyId = context.params.replyId;

  // Increment upvotes count on question reply
  const incrementCount = admin.firestore.FieldValue.increment(1);
  return db.collection(`public-course-questions/${questionId}/replies`)
  .doc(replyId)
  .set({ upVotes: incrementCount }, { merge: true })
  .catch(err => console.error(err));
});

/*
  Monitor newly created people.
*/
exports.onNewCrmPersonCreate = functions
.runWith({memory: '1GB', timeoutSeconds: 300})
.firestore
.document(`users/{uid}/people/{personUid}`)
.onCreate( async (snap, context) => {
  const userId = context.params.uid;
  const personId = context.params.personUid;
  const timestampNow = Math.round(new Date().getTime() / 1000);

  // set a created time on the new person object
  return db.collection(`users/${userId}/people`)
  .doc(personId)
  .set({ created: timestampNow }, { merge: true })
  .catch(err => console.error(err));
});

/*
  Monitor new admin programs in review (review requests).
*/
exports.onNewAdminProgramReviewRequest = functions
.runWith({memory: '1GB', timeoutSeconds: 300})
.firestore
.document(`admin/review-requests/programs/{programId}`)
.onCreate( async (snap, context) => {

  const reviewRequest = snap.data() as any

  const increment = admin.firestore.FieldValue.increment(1);

  db.collection(`admin`)
  .doc('totalProgramsInReview')
  .set({
    totalRecords: increment
  }, { merge: true })
  .catch(err => console.error(err));

  // attempt to read program data
  if (reviewRequest) {
    const programSnap = await db.collection(`users/${reviewRequest.sellerUid}/programs`)
    .doc(reviewRequest.programId)
    .get();

    const program = programSnap.data() as any;

    if (program) {
      // record a mailchimp event
      const event = {
        name: 'program_submitted_for_review',
        properties: {
          program_title: program.title,
        }
      }
      return logMailchimpEvent(program.sellerUid, event); // log event
    }

  }

});

/*
  Monitor deleted admin programs in review (review requests).
*/
exports.onDeleteAdminProgramReviewRequest = functions
.runWith({memory: '1GB', timeoutSeconds: 300})
.firestore
.document(`admin/review-requests/programs/{programId}`)
.onDelete((snap, context) => {
  const decrement = admin.firestore.FieldValue.increment(-1);
  return db.collection(`admin`)
  .doc('totalProgramsInReview')
  .set({
    totalRecords: decrement
  }, { merge: true })
  .catch(err => console.error(err));
});

/*
  Monitor public programs node.
  Sync with Algolia DB.
*/
exports.onWritePublicPrograms = functions
.runWith({memory: '1GB', timeoutSeconds: 300})
.firestore
.document(`/public-programs/{programId}`)
.onWrite((change, context) => {
  const index = algolia.initIndex('prod_PROGRAMS');
  const programId = context.params.programId;
  const program = change.after.data() as any;
  // Record Removed.
  if (!program) {
    return index.deleteObject(programId);
  }
  // Record added/updated.
  const recordToSend = {
    objectID: programId,
    title: program.title,
    subtitle: program.subtitle,
    category: program.category,
    language: program.language,
    level: program.level,
    subject: program.subject,
    pricingStrategy: program.pricingStrategy,
    fullPrice: program.fullPrice,
    pricePerSession: program.pricePerSession,
    currency: program.currency,
    duration: program.duration,
    numSessions: program.numSessions,
    image: program.image,
    promoVideo: program.promoVideo,
    coachName: program.coachName,
    coachPhoto: program.coachPhoto,
    approved: program.approved,
    imagePaths: program.imagePaths
  };
  // Update Algolia.
  return index.saveObject(recordToSend);
});

/*
  Monitor users' private programs node.
  If program is admin approved, sync with public programs.
*/
exports.onWritePrivateUserProgram = functions
.runWith({memory: '1GB', timeoutSeconds: 300})
.firestore
.document(`/users/{userId}/programs/{programId}`)
.onWrite( async (change, context) => {
  const programId = context.params.programId;
  const program = change.after.data() as any;
  const programBefore = change.before.data() as any;

  // Record created
  if (program && !programBefore) {
    // sync with Algolia draft programs index
    const index = algolia.initIndex('prod_DRAFT_PROGRAMS');
    const recordToSend = {
      objectID: programId,
      sellerUid: program.sellerUid,
      title: program.title,
      coachName: program.coachName ? program.coachName : ''
    }
    await index.saveObject(recordToSend);

    // record a mailchimp event
    const event = {
      name: 'new_program_created',
      properties: {
        program_title: program.title,
      }
    }
    await logMailchimpEvent(program.sellerUid, event); // log event
  }

  // Record Removed.
  if (!program) {
    // remove program from sale but leave program data behind the paywall as users have paid for it
    // and shouldn't lose access.
    await db.collection('public-programs')
    .doc(programId)
    .delete()
    .catch(err => console.error(err));

    // if review request still waiting, delete it
    await db.collection('admin/review-requests/programs')
    .doc(programId)
    .delete();

    // delete the draft program record in Algolia (if it exists)
    const index = algolia.initIndex('prod_DRAFT_PROGRAMS');
    return index.deleteObject(programId);
  }

  // Record added/updated.
  if (!program.adminApproved) { // check if admin approved
    return;
  }

  const adminSnap = await db.collection(`approved-programs`)
  .doc(programId)
  .get();

  if (!adminSnap.exists) { // double check if admin approved (this doc can't be tampered with client side)
    return;
  }

  // optional: remove any paywall protected data now. (NOT currently used)

  try {
    // Sync with public-programs.
    const batch = db.batch(); // prepare to execute multiple ops atomically

    // copy non-paywall protected program data in public programs node (to allow browse & purchase)
    const publicData = {
      programId,
      approved: program.reviewRequest.approved ? program.reviewRequest.approved : null,
      numSessions: program.numSessions ? program.numSessions : null,
      duration: program.duration ? program.duration : null,
      pricingStrategy: program.pricingStrategy,
      currency: program.currency ? program.currency : null,
      fullPrice: program.fullPrice ? program.fullPrice : null,
      pricePerSession: program.pricePerSession ? program.pricePerSession : null,
      sellerUid: program.sellerUid,
      coachName: program.coachName,
      coachPhoto: program.coachPhoto,
      stripeId: program.stripeId ? program.stripeId : null,
      title: program.title,
      subtitle: program.subtitle,
      description: program.description,
      language: program.language,
      category: program.category,
      subject: program.subject,
      image: program.image,
      promoVideo: program.promoVideo ? program.promoVideo : null,
      lastUpdated: program.lastUpdated,
      learningPoints: program.learningPoints ? program.learningPoints : null,
      requirements: program.requirements ? program.requirements : null,
      targets: program.targets ? program.targets : null,
      // this field will replaced image field in future
      imagePaths: program.imagePaths ? program.imagePaths : null
    };
    const publicRef = db.collection(`public-programs`).doc(programId);
    batch.set(publicRef, publicData, { merge: true });

    // copy program object as is into paywall protected node (will be available when purchased!)
    const lockedRef = db.collection(`locked-program-content`).doc(programId);
    batch.set(lockedRef, program, { merge: true });

    return batch.commit(); // execute batch ops. Any error should trigger catch.
  } catch (err) {
    console.error(err);
    return;
  }

});

/*
  Monitor program user reviews.
*/
exports.onWriteProgramReview = functions
.runWith({memory: '1GB', timeoutSeconds: 300})
.firestore
.document(`program-reviews/{reviewId}`)
.onWrite( async (change, context) => {

  const index = algolia.initIndex('prod_PROGRAM_REVIEWS');
  const reviewId = context.params.reviewId;
  const before = change.before.data() as any;
  const review = change.after.data() as any;

  // Record Removed.

  if (!review) {

    // decrement total review count
    if (before) {
      const decrementCount = admin.firestore.FieldValue.increment(-1);
      await db.collection(`public-programs`)
      .doc(review.programId)
      .set({ [`total${getRatingAsText(before.starValue)}StarReviews`]: decrementCount }, { merge: true })
      .catch(err => console.error(err));
    }

    // sync with Algolia
    return index.deleteObject(reviewId);
  }

  // Record added/updated

  // if rating has been updated, decrement the old value before incrementing the new value
  if (before && before.starValue && review && review.starValue && (before.starValue !== review.starValue)) {
    const decrementCount = admin.firestore.FieldValue.increment(-1);
    await db.collection(`public-programs`)
    .doc(review.programId)
    .set({ [`total${getRatingAsText(before.starValue)}StarReviews`]: decrementCount }, { merge: true })
    .catch(err => console.error(err));
  }

  // increment total review count to allow cheaper lookups
  const incrementCount = admin.firestore.FieldValue.increment(1);
  await db.collection(`public-programs`)
  .doc(review.programId)
  .set({ [`total${getRatingAsText(review.starValue)}StarReviews`]: incrementCount }, { merge: true })
  .catch(err => console.error(err));

  // sync with Algolia
  const recordToSend = {
    objectID: reviewId,
    programId: review.programId,
    lastUpdated: review.lastUpdated,
    reviewerUid: review.reviewerUid,
    reviewerFirstName: review.reviewerFirstName,
    reviewerLastName: review.reviewerLastName,
    reviewerPhoto: review.reviewerPhoto ? review.reviewerPhoto : null,
    sellerUid: review.sellerUid,
    starValue: review.starValue,
    summary: review.summary ? review.summary : null,
    summaryExists: review.summary ? true : false,
  };
  // Update Algolia.
  return index.saveObject(recordToSend);
});

/*
  Monitor new admin servicess in review (review requests).
*/
exports.onNewAdminServiceReviewRequest = functions
.runWith({memory: '1GB', timeoutSeconds: 300})
.firestore
.document(`admin/review-requests/services/{serviceId}`)
.onCreate( async (snap, context) => {

  const reviewRequest = snap.data() as any

  const increment = admin.firestore.FieldValue.increment(1);

  db.collection(`admin`)
  .doc('totalServicesInReview')
  .set({
    totalRecords: increment
  }, { merge: true })
  .catch(err => console.error(err));

  // attempt to read service data
  if (reviewRequest) {
    const serviceSnap = await db.collection(`users/${reviewRequest.sellerUid}/services`)
    .doc(reviewRequest.serviceId)
    .get();

    const service = serviceSnap.data() as any;

    if (service) {
      // record a mailchimp event
      const event = {
        name: 'service_submitted_for_review',
        properties: {
          service_title: service.title,
        }
      }
      return logMailchimpEvent(service.sellerUid, event); // log event
    }

  }

});

/*
  Monitor deleted admin services in review (review requests).
*/
exports.onDeleteAdminServiceReviewRequest = functions
.runWith({memory: '1GB', timeoutSeconds: 300})
.firestore
.document(`admin/review-requests/services/{serviceId}`)
.onDelete((snap, context) => {
  const decrement = admin.firestore.FieldValue.increment(-1);
  return db.collection(`admin`)
  .doc('totalServicesInReview')
  .set({
    totalRecords: decrement
  }, { merge: true })
  .catch(err => console.error(err));
});

/*
  Monitor public services node.
  Sync with Algolia DB.
*/
exports.onWritePublicServices = functions
.runWith({memory: '1GB', timeoutSeconds: 300})
.firestore
.document(`/public-services/{serviceId}`)
.onWrite((change, context) => {
  const index = algolia.initIndex('prod_SERVICES');
  const serviceId = context.params.serviceId;
  const service = change.after.data() as any;
  // Record Removed.
  if (!service) {
    return index.deleteObject(serviceId);
  }
  // Record added/updated.
  const recordToSend = {
    objectID: serviceId,
    title: service.title,
    subtitle: service.subtitle,
    category: service.category,
    language: service.language,
    subject: service.subject,
    pricing: service.pricing,
    currency: service.currency,
    image: service.image,
    promoVideo: service.promoVideo,
    coachName: service.coachName,
    coachPhoto: service.coachPhoto,
    approved: service.approved,
    imagePaths: service.imagePaths
  };
  // Update Algolia.
  return index.saveObject(recordToSend);
});

/*
  Monitor users' private services node.
  If service is admin approved, sync with public services.
*/
exports.onWritePrivateUserService = functions
.runWith({memory: '1GB', timeoutSeconds: 300})
.firestore
.document(`/users/{userId}/services/{serviceId}`)
.onWrite( async (change, context) => {
  const serviceId = context.params.serviceId;
  const service = change.after.data() as any;
  const serviceBefore = change.before.data() as any;

  // Record created
  if (service && !serviceBefore) {
    // sync with Algolia draft services index
    const index = algolia.initIndex('prod_DRAFT_SERVICES');
    const recordToSend = {
      objectID: serviceId,
      sellerUid: service.sellerUid,
      title: service.title,
      coachName: service.coachName ? service.coachName : ''
    }
    await index.saveObject(recordToSend);

    // record a mailchimp event
    const event = {
      name: 'new_service_created',
      properties: {
        service_title: service.title,
      }
    }
    await logMailchimpEvent(service.sellerUid, event); // log event
  }

  // Record Removed.
  if (!service) {
    // remove service from sale but leave service data behind the paywall as users have paid for it
    // and shouldn't lose access.
    await db.collection('public-services')
    .doc(serviceId)
    .delete()
    .catch(err => console.error(err));

    // if review request still waiting, delete it
    await db.collection('admin/review-requests/services')
    .doc(serviceId)
    .delete();

    // delete the draft service record in Algolia (if it exists)
    const index = algolia.initIndex('prod_DRAFT_SERVICES');
    return index.deleteObject(serviceId);
  }

  // Record added/updated.
  if (!service.adminApproved) { // check if admin approved
    return;
  }

  const adminSnap = await db.collection(`approved-services`)
  .doc(serviceId)
  .get();

  if (!adminSnap.exists) { // double check if admin approved (this doc can't be tampered with client side)
    return;
  }

  // optional: remove any paywall protected data now. (NOT currently used)

  try {
    // Sync with public-services.
    const batch = db.batch(); // prepare to execute multiple ops atomically

    // copy non-paywall protected service data in public services node (to allow browse & purchase)
    const publicData = {
      serviceId,
      approved: service.reviewRequest.approved ? service.reviewRequest.approved : null,
      currency: service.currency ? service.currency : null,
      pricing: service.pricing ? service.pricing : null,
      sellerUid: service.sellerUid,
      coachName: service.coachName,
      coachPhoto: service.coachPhoto,
      stripeId: service.stripeId ? service.stripeId : null,
      title: service.title,
      subtitle: service.subtitle,
      description: service.description,
      language: service.language,
      category: service.category,
      subject: service.subject,
      image: service.image,
      promoVideo: service.promoVideo ? service.promoVideo : null,
      lastUpdated: service.lastUpdated,
      learningPoints: service.learningPoints ? service.learningPoints : null,
      requirements: service.requirements ? service.requirements : null,
      targets: service.targets ? service.targets : null,
      // this field will replaced image field in future
      imagePaths: service.imagePaths ? service.imagePaths : null
    };
    const publicRef = db.collection(`public-services`).doc(serviceId);
    batch.set(publicRef, publicData, { merge: true });

    // copy service object as is into paywall protected node (will be available when purchased!)
    const lockedRef = db.collection(`locked-service-content`).doc(serviceId);
    batch.set(lockedRef, service, { merge: true });

    return batch.commit(); // execute batch ops. Any error should trigger catch.
  } catch (err) {
    console.error(err);
    return;
  }

});

/*
  Monitor service user reviews.
*/
exports.onWriteServiceReview = functions
.runWith({memory: '1GB', timeoutSeconds: 300})
.firestore
.document(`service-reviews/{reviewId}`)
.onWrite( async (change, context) => {

  const index = algolia.initIndex('prod_SERVICE_REVIEWS');
  const reviewId = context.params.reviewId;
  const before = change.before.data() as any;
  const review = change.after.data() as any;

  // Record Removed.

  if (!review) {

    // decrement total review count
    if (before) {
      const decrementCount = admin.firestore.FieldValue.increment(-1);
      await db.collection(`public-services`)
      .doc(review.serviceId)
      .set({ [`total${getRatingAsText(before.starValue)}StarReviews`]: decrementCount }, { merge: true })
      .catch(err => console.error(err));
    }

    // sync with Algolia
    return index.deleteObject(reviewId);
  }

  // Record added/updated

  // if rating has been updated, decrement the old value before incrementing the new value
  if (before && before.starValue && review && review.starValue && (before.starValue !== review.starValue)) {
    const decrementCount = admin.firestore.FieldValue.increment(-1);
    await db.collection(`public-services`)
    .doc(review.serviceId)
    .set({ [`total${getRatingAsText(before.starValue)}StarReviews`]: decrementCount }, { merge: true })
    .catch(err => console.error(err));
  }

  // increment total review count to allow cheaper lookups
  const incrementCount = admin.firestore.FieldValue.increment(1);
  await db.collection(`public-services`)
  .doc(review.serviceId)
  .set({ [`total${getRatingAsText(review.starValue)}StarReviews`]: incrementCount }, { merge: true })
  .catch(err => console.error(err));

  // sync with Algolia
  const recordToSend = {
    objectID: reviewId,
    serviceId: review.serviceId,
    lastUpdated: review.lastUpdated,
    reviewerUid: review.reviewerUid,
    reviewerFirstName: review.reviewerFirstName,
    reviewerLastName: review.reviewerLastName,
    reviewerPhoto: review.reviewerPhoto ? review.reviewerPhoto : null,
    sellerUid: review.sellerUid,
    starValue: review.starValue,
    summary: review.summary ? review.summary : null,
    summaryExists: review.summary ? true : false,
  };
  // Update Algolia.
  return index.saveObject(recordToSend);
});

/*
  Monitor user calendars.
*/
exports.onWriteUserCalendar = functions
.runWith({memory: '1GB', timeoutSeconds: 300})
.firestore
.document(`users/{uid}/calendar/{eventId}`)
.onWrite(async (change, context) => {

  const coachId = context.params.uid; // note only coach users have a calendar so uid will always be a coach
  const event = change.after.data() as any; // will be a CustomCalendarEvent
  const eventBefore = change.before.data() as any; // will not exist on first create
  const batch = db.batch(); // prepare to execute multiple ops atomically
  const promises = [];
  const dateNow = Date.now();

  // Record Removed.
  if (!event) {
    // do anything?
  }
  // Record created
  if (!eventBefore) {
    if (event.type === 'session') { // coach has scheduled a coaching session with a client

      // create the session in the all sessions node using the session id as the doc id
      const allSessionsRef = db.collection(`ordered-sessions/all/sessions`).doc(event.id);
      batch.set(allSessionsRef, {
        coachId,
        timeOfReserve: dateNow,
        participants: [coachId, event.client],
        originalEvent: event,
        start: event.start,
        end: event.end,
        testField: 'testField'
      }, { merge: true });

      // create the session for the client using the session id as the document id
      const clientSessionRef = db.collection(`users/${event.client}/ordered-sessions`).doc(event.id);
      batch.set(clientSessionRef, {
        start: event.start,
        end: event.end,
        sessionId: event.id,
        type: event.type
      });

      // record the crm event in the coach's history
      const coachCrmRef = db.collection(`users/${coachId}/people/${event.client}/history`).doc((Math.round(dateNow / 1000)).toString());
      batch.set(coachCrmRef, { action: 'coach_created_session', event });

      // create an event in the client's history with the coach
      const clientHistoryRef = db.collection(`users/${event.client}/coaches/${coachId}/history`).doc((Math.round(dateNow / 1000)).toString());
      batch.set(clientHistoryRef, { action: 'coach_created_session', event });

      await batch.commit(); // execute batch ops. Any error should trigger catch.

      // send email

      const coachProfileSnap = await db.collection(`public-coaches`)
      .doc(coachId)
      .get();  // lookup coach data for the email
      const coachProfile = coachProfileSnap.data();

      if (!coachProfile) {
        console.error('onWriteUserCalendar: Coach profile data missing');
        return;
      }

      const programSnap = await db.collection(`public-programs`)
      .doc(event.program)
      .get();  // lookup public program data
      const program = programSnap.data();

      if (!program) {
        console.error('onWriteUserCalendar: Program data missing');
        return;
      }

      const coachMailEvent = { // send email to the coach
        name: 'coach_scheduled_client_session',
        properties: {
          start: event.start.toDate().toUTCString(),
          client_name: event.orderedByName,
          program_title: program.title,
          program_image: program.image,
          session_landing_url: `https://lifecoach.io/my-sessions/${event.id}`
        }
      }
      promises.push(logMailchimpEvent(coachId, coachMailEvent));

      const UserMailEvent = { // send email to the regular user
        name: 'coach_scheduled_your_session',
        properties: {
          start: event.start.toDate().toUTCString(),
          coach_name: `${coachProfile ? coachProfile.firstName : 'Lifecoach'} ${coachProfile ? coachProfile.lastName : 'Coach'}`,
          coach_photo: `${coachProfile ? coachProfile.photo : 'https://eu.ui-avatars.com/api/?name=lifecoach+coach&background=00f2c3&color=fff&rounded=true&bold=true'}`,
          program_title: program.title,
          program_image: program.image,
          session_landing_url: `https://lifecoach.io/my-sessions/${event.id}`
        }
      }
      promises.push(logMailchimpEvent(event.client, UserMailEvent));
    }
  }
  await Promise.all(promises);
  // done
  return;
});

// ================================================================================
// =====                                                                     ======
// =====                         ADMIN SPECIAL OPS                           ======
// =====                                                                     ======
// =====  Use with extreme caution - always backup DB first!                 ======
// ================================================================================

exports.updateAllProfilesInSequence = functions
.runWith({memory: '1GB', timeoutSeconds: 300})
.https
.onCall( async (data, context) => {
  try {

    // If user is not an authorised admin reject immediately.
    if (!context.auth || context.auth.token.admin !== true) {
      return {error: 'Unauthorised!'}
    }

    const now = Math.round(new Date().getTime() / 1000);

    // we have to query algolia as our users collection are all VIRTUAL docs and invisilbe to snapshots!
    const searchIndex = 'prod_USERS';
    const index = algolia.initIndex(searchIndex);
    const algoliaRes = await index.browse(''); // use browse not search to get all records
    console.log(`Updating ${algoliaRes.hits.length} user profiles...`);
    //console.log('Example profile sanity check:', algoliaRes.hits[400]);

    const promises = [] as any;

    algoliaRes.hits.forEach((hit, i) => {
      const record = hit as any;
      const userId = record.objectID;
      console.log(`Admin mass profile update. Processing record: ${i} for user: ${userId}`);
      const prom = db.collection(`users/${userId}/profile`)
      .doc(`profile${userId}`)
      .set({ adminMassUpdated: now }, { merge: true });

      promises.push(prom);
    });

    console.log(promises.length);

    await Promise.all(promises);

    return {
      success: true,
      message: `Success! All updates in progress...`
    }
  }
  catch(err) {
    console.error(err);
    return {error: err};
  }
});

exports.getTwilioToken = functions
  .runWith({memory: '1GB', timeoutSeconds: 300})
  .https
  .onCall(async (data: any, context?) => {

    const timeOfStart = data.timeOfStart;
    const currentTime = Date.now();
    const uid = data.uid;
    const room = data.room;
    const duration = data.duration;
    if ((currentTime - timeOfStart > 60000) || ((timeOfStart + duration) < currentTime)) {
      return {error: 'session can`t be started or it has already been ended'}
    }

    try {

      const res = await fetch(`https://getvideotoken-9623.twil.io/vide-token?uid=${uid}&room=${room}&timeOfStart${timeOfStart}&duration=${duration}`);

      const json = await res.json()
      // @ts-ignore
      return {json} // success

    } catch (err) {
      console.error(err);
      return {error: err}
    }

  });

exports.getInfoAboutCurrentVideoSession = functions
  .runWith({memory: '1GB', timeoutSeconds: 300})
  .https
  .onCall(async (data: any, context?) => {

    try {
      const docSnapshot = await db.collection(`/ordered-sessions/all/sessions`)
        .doc(data.docId)
        .get();

      const sessionObject = docSnapshot.exists ? docSnapshot.data() : undefined;

      if (sessionObject) {

        if (sessionObject.start.seconds * 1000 > Date.now()) {
          return {sessionStatus: 'NOT_STARTED_YET'};
        }
        if (sessionObject.end.seconds * 1000 < Date.now()) {
          return {sessionStatus: 'IS_OVER'};
        }
        return {sessionStatus: 'IN_PROGRESS', timeLeft: sessionObject.end.seconds * 1000 - Date.now()};
      } else {
        return {sessionStatus: 'SESSION_NOT_FOUND'};
      }
    } catch (err) {
      console.error(err);
      return {error: err}
    }

  });

exports.abortVideoSession = functions
  .runWith({memory: '1GB', timeoutSeconds: 300})
  .https
  .onCall(async (data: any, context?) => {
    try {
      await client.video.rooms(data.roomID)
        .update({status: 'completed'})
      return {success: true};
    } catch (err) {
      console.error(err);
      return {error: err}
    }
  });


// Image srvices
exports.uploadCourseImage = functions
  .runWith({memory: '1GB', timeoutSeconds: 300})
  .https
  .onCall(async (data: any, context?) => { // uid: string, img: string
    try{
      const uploadingPromises = [];

      const bucketName = functions.config().bucket.name;
      const generateRandomImgID = () => Math.random().toString(36).substr(2, 9);
      const imgId = generateRandomImgID(); // imgId in cloud storage
      const path = `users/${data.uid}/coursePics/${imgId}`; // test jpg but we can save it as original

      const base64Text = data.img.split(';base64,').pop();
      const imageBuffer = Buffer.from(base64Text, 'base64'); // original image buffer
      const contentType = data.img.split(';base64,')[0].split(':')[1];


      const resizedBuffer = await sharp(imageBuffer).resize(991,null).toBuffer(); // Getting resizing image
      const webpBuffer = await sharp(imageBuffer).toFormat('webp').toBuffer(); // webp image
      const resizedWebpBuffer = await sharp(resizedBuffer).toFormat('webp').toBuffer(); // resized webp image

      // original sizes
      const u1 = admin.storage(firebase).bucket(bucketName) // uploading promise #1
        .file(path+'.webp').
        save(webpBuffer,{ public: true,
          gzip: true,
          predefinedAcl:'publicRead',
          metadata: {
            contentType: 'image/webp',
            cacheControl: 'public, max-age=31536000',
          }
        });

      const u2 = admin.storage(firebase).bucket(bucketName) // uploading promise #2
        .file(path+'.jpg').
        save(imageBuffer, {
          public: true,
          gzip: true,
          predefinedAcl:'publicRead',
          metadata: {
            contentType,
            cacheControl: 'public, max-age=31536000',
          }
        });

      // resized
      const u3 = admin.storage(firebase).bucket(bucketName) // resized uploading promise #3
        .file(path+'_991.webp').
        save(resizedWebpBuffer,{ public: true,
          gzip: true,
          predefinedAcl:'publicRead',
          metadata: {
            contentType: 'image/webp',
            cacheControl: 'public, max-age=31536000',
          }
        });

      const u4 = admin.storage(firebase).bucket(bucketName) // resized uploading promise #4
        .file(path+'_991.jpg').
        save(resizedBuffer, {
          public: true,
          gzip: true,
          predefinedAcl:'publicRead',
          metadata: {
            contentType,
            cacheControl: 'public, max-age=31536000',
          }
        });

      uploadingPromises.push(u1, u2, u3, u4);
      await Promise.all(uploadingPromises);

      const resp = admin.storage(firebase).bucket(bucketName).file(path+'.jpg').makePublic();
      const webResp = admin.storage(firebase).bucket(bucketName).file(path+'.webp').makePublic();
      const resizedResp = admin.storage(firebase).bucket(bucketName).file(path+'_991.jpg').makePublic();
      const resizedWebResp = admin.storage(firebase).bucket(bucketName).file(path+'_991.webp').makePublic();

      const makePublicPromises:Array<any> = [];
      makePublicPromises.push(resp, resizedResp, webResp, resizedWebResp);
      const response = await Promise.all(makePublicPromises)

      const url = `https://storage.googleapis.com/${bucketName}/${await response[0][0].object}`;
      const resizedUrl = `https://storage.googleapis.com/${bucketName}/${await response[1][0].object}`;
      const webpUrl = `https://storage.googleapis.com/${bucketName}/${await response[2][0].object}`;
      const resizedWebpUrl = `https://storage.googleapis.com/${bucketName}/${await response[3][0].object}`;

      const result = {
        original: {
          991: await resizedUrl,
          fullSize: await url
        },
        webp: {
          991: await resizedWebpUrl,
          fullSize: await webpUrl
        }
      };
      return result;
    } catch (e) {
      functions.logger.log('this url was broken', data.uid);
      functions.logger.log('this img was broken', data.img)
      return {err: e.message};
    }
  });
//UserAvatarImagePaths

exports.uploadUserAvatar = functions
  .runWith({memory: '1GB', timeoutSeconds: 300})
  .https
  .onCall(async (data: any, context?)=> {
    const bucketName = functions.config().bucket.name;
    const generateRandomImgID = () => Math.random().toString(36).substr(2, 9);
    const imgId = generateRandomImgID(); // imgId in cloud storage
    const path = `users/${data.uid}/profilePics/${imgId}`; // test jpg but we can save it as original

    const base64Text = data.img.split(';base64,').pop();
    const imageBuffer = Buffer.from(base64Text, 'base64'); // original image buffer
    const contentType = data.img.split(';base64,')[0].split(':')[1];

    try{
      const webpBuffer = await sharp(imageBuffer).toFormat('webp').toBuffer(); // webp image
      // xs = 124px s = 248px m = 372px l = 496px || full. Getting resizing image w - webp

      const xs = sharp(imageBuffer).resize(124,null).toBuffer();
      const s = sharp(imageBuffer).resize(248,null).toBuffer();
      const m = sharp(imageBuffer).resize(372,null).toBuffer();
      const l = sharp(imageBuffer).resize(496,null).toBuffer();

      const xsw = sharp(webpBuffer).resize(124,null).toBuffer();
      const sw = sharp(webpBuffer).resize(248,null).toBuffer();
      const mw = sharp(webpBuffer).resize(372,null).toBuffer();
      const lw = sharp(webpBuffer).resize(496,null).toBuffer();

      const resizingPromises = [];
      resizingPromises.push(xs, s, m , l, xsw, sw, mw , lw);

      const resized = await Promise.all(resizingPromises); // all Buffers! of images resized.

      //configs for webp && original
      const webpConfig:any =  {
        'public': true,
        gzip: true,
        predefinedAcl:'publicRead',
        metadata: {
        contentType: 'image/webp',
          cacheControl: 'public, max-age=31536000',
      }};
      const originalConfig:any ={
        public: true,
        gzip: true,
        predefinedAcl:'publicRead',
        metadata: {
          contentType,
          cacheControl: 'public, max-age=31536000',
        }}

      //Uploading promises
      const uw1 = admin.storage(firebase).bucket(bucketName).file(path+'.webp').save(webpBuffer, webpConfig);
      const uw2 = admin.storage(firebase).bucket(bucketName).file(path+'xs.webp').save(await resized[4], webpConfig);
      const uw3 = admin.storage(firebase).bucket(bucketName).file(path+'s.webp').save(await resized[5], webpConfig);
      const uw4 = admin.storage(firebase).bucket(bucketName).file(path+'m.webp').save(await resized[6], webpConfig);
      const uw5 = admin.storage(firebase).bucket(bucketName).file(path+'l.webp').save(await resized[7], webpConfig);

      const u1 = admin.storage(firebase).bucket(bucketName).file(path+'.jpg').save(imageBuffer, originalConfig);
      const u2 = admin.storage(firebase).bucket(bucketName).file(path+'xs.jpg').save(await resized[0], originalConfig);
      const u3 = admin.storage(firebase).bucket(bucketName).file(path+'s.jpg').save(await resized[1], originalConfig);
      const u4 = admin.storage(firebase).bucket(bucketName).file(path+'m.jpg').save(await resized[2], originalConfig);
      const u5 = admin.storage(firebase).bucket(bucketName).file(path+'l.jpg').save(await resized[3], originalConfig);

      const uploadingPromises = [];
      uploadingPromises.push(u1, u2, u3, u4, u5, uw1, uw2, uw3, uw4, uw5);
      await Promise.all(uploadingPromises);

      const makePublicPromises:Array<any> = [];
      const sizes = ['xs', 's', 'm', 'l', ''];
      for(let i=0; i<5; i++) {
        makePublicPromises.push(admin.storage(firebase).bucket(bucketName).file(path+sizes[i]+'.jpg').makePublic())
      }
      for(let i=0; i<5; i++) {
        makePublicPromises.push(admin.storage(firebase).bucket(bucketName).file(path+sizes[i]+'.webp').makePublic())
      }
      const response = await Promise.all(makePublicPromises);

      const urls = response.map( i => `https://storage.googleapis.com/${bucketName}/${i[0].object}`);

      const result = {
        original: {
          124: urls[0],
          248: urls[1],
          372: urls[2],
          496: urls[3],
          fullSize: urls[4],
        },
        webp: {
          124: urls[5],
          248: urls[6],
          372: urls[7],
          496: urls[8],
          fullSize: urls[9],
        }};
      return result;
    }catch (e) {
      return {err: e.message};
    }
  });

//programUploadingService
exports.uploadProgramImage = functions
  .runWith({memory: '1GB', timeoutSeconds: 300})
  .https
  .onCall(async (data: any, context?) => { // uid: string, img: string

    const bucketName = functions.config().bucket.name;
    const generateRandomImgID = () => Math.random().toString(36).substr(2, 9);
    const imgId = generateRandomImgID(); // imgId in cloud storage
    const path = `users/${data.uid}/programImages/${imgId}`; // test jpg but we can save it as original

    const base64Text = data.img.split(';base64,').pop();
    const imageBuffer = Buffer.from(base64Text, 'base64'); // original image buffer
    const contentType = data.img.split(';base64,')[0].split(':')[1];

    try{
      const webpBuffer = await sharp(imageBuffer).toFormat('webp').toBuffer(); // webp image
      // xs = 124px s = 248px m = 372px l = 496px || full. Getting resizing image w - webp

      const xs = sharp(imageBuffer).resize(575,null).toBuffer();
      const s = sharp(imageBuffer).resize(768,null).toBuffer();
      const m = sharp(imageBuffer).resize(991,null).toBuffer();
      const l = sharp(imageBuffer).resize(1200,null).toBuffer();

      const xsw = sharp(webpBuffer).resize(575,null).toBuffer();
      const sw = sharp(webpBuffer).resize(768,null).toBuffer();
      const mw = sharp(webpBuffer).resize(991,null).toBuffer();
      const lw = sharp(webpBuffer).resize(1200,null).toBuffer();

      const resizingPromises = [];
      resizingPromises.push(xs, s, m , l, xsw, sw, mw , lw);

      const resized = await Promise.all(resizingPromises); // all Buffers! of images resized.

      //configs for webp && original
      const webpConfig:any =  {
        'public': true,
        gzip: true,
        predefinedAcl:'publicRead',
        metadata: {
          contentType: 'image/webp',
          cacheControl: 'public, max-age=31536000',
        }};
      const originalConfig:any ={
        public: true,
        gzip: true,
        predefinedAcl:'publicRead',
        metadata: {
          contentType,
          cacheControl: 'public, max-age=31536000',
        }}

      //Uploading promises
      const uw1 = admin.storage(firebase).bucket(bucketName).file(path+'.webp').save(webpBuffer, webpConfig);
      const uw2 = admin.storage(firebase).bucket(bucketName).file(path+'xs.webp').save(await resized[4], webpConfig);
      const uw3 = admin.storage(firebase).bucket(bucketName).file(path+'s.webp').save(await resized[5], webpConfig);
      const uw4 = admin.storage(firebase).bucket(bucketName).file(path+'m.webp').save(await resized[6], webpConfig);
      const uw5 = admin.storage(firebase).bucket(bucketName).file(path+'l.webp').save(await resized[7], webpConfig);

      const u1 = admin.storage(firebase).bucket(bucketName).file(path+'.jpg').save(imageBuffer, originalConfig);
      const u2 = admin.storage(firebase).bucket(bucketName).file(path+'xs.jpg').save(await resized[0], originalConfig);
      const u3 = admin.storage(firebase).bucket(bucketName).file(path+'s.jpg').save(await resized[1], originalConfig);
      const u4 = admin.storage(firebase).bucket(bucketName).file(path+'m.jpg').save(await resized[2], originalConfig);
      const u5 = admin.storage(firebase).bucket(bucketName).file(path+'l.jpg').save(await resized[3], originalConfig);

      const uploadingPromises = [];
      uploadingPromises.push(u1, u2, u3, u4, u5, uw1, uw2, uw3, uw4, uw5);
      await Promise.all(uploadingPromises);

      const makePublicPromises:Array<any> = [];
      const sizes = ['xs', 's', 'm', 'l', ''];
      for(let i=0; i<5; i++) {
        makePublicPromises.push(admin.storage(firebase).bucket(bucketName).file(path+sizes[i]+'.jpg').makePublic())
      }
      for(let i=0; i<5; i++) {
        makePublicPromises.push(admin.storage(firebase).bucket(bucketName).file(path+sizes[i]+'.webp').makePublic())
      }
      const response = await Promise.all(makePublicPromises);

      const urls = response.map( i => `https://storage.googleapis.com/${bucketName}/${i[0].object}`);

      const result = {
        original: {
          575: urls[0],
          768: urls[1],
          991: urls[2],
          1200: urls[3],
          fullSize: urls[4],
        },
        webp: {
          575: urls[5],
          768: urls[6],
          991: urls[7],
          1200: urls[8],
          fullSize: urls[9],
        }};
      return result;
    } catch (e) {
      return {err: e.message};
    }
  });

// service image uploading service
exports.uploadServiceImage = functions
  .runWith({memory: '1GB', timeoutSeconds: 300})
  .https
  .onCall(async (data: any, context?) => { // uid: string, img: string

    const bucketName = functions.config().bucket.name;
    const generateRandomImgID = () => Math.random().toString(36).substr(2, 9);
    const imgId = generateRandomImgID(); // imgId in cloud storage
    const path = `users/${data.uid}/serviceImages/${imgId}`; // test jpg but we can save it as original

    const base64Text = data.img.split(';base64,').pop();
    const imageBuffer = Buffer.from(base64Text, 'base64'); // original image buffer
    const contentType = data.img.split(';base64,')[0].split(':')[1];

    try{
      const webpBuffer = await sharp(imageBuffer).toFormat('webp').toBuffer(); // webp image
      // xs = 124px s = 248px m = 372px l = 496px || full. Getting resizing image w - webp

      const xs = sharp(imageBuffer).resize(575,null).toBuffer();
      const s = sharp(imageBuffer).resize(768,null).toBuffer();
      const m = sharp(imageBuffer).resize(991,null).toBuffer();
      const l = sharp(imageBuffer).resize(1200,null).toBuffer();

      const xsw = sharp(webpBuffer).resize(575,null).toBuffer();
      const sw = sharp(webpBuffer).resize(768,null).toBuffer();
      const mw = sharp(webpBuffer).resize(991,null).toBuffer();
      const lw = sharp(webpBuffer).resize(1200,null).toBuffer();

      const resizingPromises = [];
      resizingPromises.push(xs, s, m , l, xsw, sw, mw , lw);

      const resized = await Promise.all(resizingPromises); // all Buffers! of images resized.

      //configs for webp && original
      const webpConfig:any =  {
        'public': true,
        gzip: true,
        predefinedAcl:'publicRead',
        metadata: {
          contentType: 'image/webp',
          cacheControl: 'public, max-age=31536000',
        }};
      const originalConfig:any ={
        public: true,
        gzip: true,
        predefinedAcl:'publicRead',
        metadata: {
          contentType,
          cacheControl: 'public, max-age=31536000',
        }}

      //Uploading promises
      const uw1 = admin.storage(firebase).bucket(bucketName).file(path+'.webp').save(webpBuffer, webpConfig);
      const uw2 = admin.storage(firebase).bucket(bucketName).file(path+'xs.webp').save(await resized[4], webpConfig);
      const uw3 = admin.storage(firebase).bucket(bucketName).file(path+'s.webp').save(await resized[5], webpConfig);
      const uw4 = admin.storage(firebase).bucket(bucketName).file(path+'m.webp').save(await resized[6], webpConfig);
      const uw5 = admin.storage(firebase).bucket(bucketName).file(path+'l.webp').save(await resized[7], webpConfig);

      const u1 = admin.storage(firebase).bucket(bucketName).file(path+'.jpg').save(imageBuffer, originalConfig);
      const u2 = admin.storage(firebase).bucket(bucketName).file(path+'xs.jpg').save(await resized[0], originalConfig);
      const u3 = admin.storage(firebase).bucket(bucketName).file(path+'s.jpg').save(await resized[1], originalConfig);
      const u4 = admin.storage(firebase).bucket(bucketName).file(path+'m.jpg').save(await resized[2], originalConfig);
      const u5 = admin.storage(firebase).bucket(bucketName).file(path+'l.jpg').save(await resized[3], originalConfig);

      const uploadingPromises = [];
      uploadingPromises.push(u1, u2, u3, u4, u5, uw1, uw2, uw3, uw4, uw5);
      await Promise.all(uploadingPromises);

      const makePublicPromises:Array<any> = [];
      const sizes = ['xs', 's', 'm', 'l', ''];
      for(let i=0; i<5; i++) {
        makePublicPromises.push(admin.storage(firebase).bucket(bucketName).file(path+sizes[i]+'.jpg').makePublic())
      }
      for(let i=0; i<5; i++) {
        makePublicPromises.push(admin.storage(firebase).bucket(bucketName).file(path+sizes[i]+'.webp').makePublic())
      }
      const response = await Promise.all(makePublicPromises);

      const urls = response.map( i => `https://storage.googleapis.com/${bucketName}/${i[0].object}`);

      const result = {
        original: {
          575: urls[0],
          768: urls[1],
          991: urls[2],
          1200: urls[3],
          fullSize: urls[4],
        },
        webp: {
          575: urls[5],
          768: urls[6],
          991: urls[7],
          1200: urls[8],
          fullSize: urls[9],
        }};
      return result;
    } catch (e) {
      return {err: e.message};
    }
  });

//admin resizing function
exports.resizeProfileAvatars = functions
  .runWith({memory: '1GB', timeoutSeconds: 300})
  .https
  .onCall(async (data?: any, context?) => { // uid: string, img: string
  try {
    const cfg = JSON.parse(data);
    const bucketName = functions.config().bucket.name;

    const [files, nextQuery, apiResponse] = await admin.storage(firebase).bucket(bucketName).getFiles(cfg);

    return {
      result: files? files.map(i => i.name) : undefined,
      nxt: nextQuery,
      apiResponse: apiResponse ? apiResponse.prefixes : 'none'
    }

  } catch (e) {

    return {err: e.message};
  }
});

exports.getCollectionDocIds = functions
  .runWith({memory: '1GB', timeoutSeconds: 300})
  .https
  .onCall(async (path: string, context?) => {

    // function to get all of the document IDs in a collection
    // provide a path to a COLLECTION as a string
    // returns an object contianing an array of collection document ids

    const docs = await db.collection(path).listDocuments();
    const docIds = docs.map(doc => doc.id);
    return { docs: docIds };
  });

exports.getUserPhoto = functions
  .runWith({memory: '1GB', timeoutSeconds: 300})
  .https
  .onCall( async ({url}, context?) => {
    try {
      const bucketName = functions.config().bucket.name;
      const start = url.lastIndexOf(`/`) + 1;
      const end = url.lastIndexOf(`?`);
      const path = url.slice(start, end).replace(/%2F/g,'/');
      const [file] = await admin.storage(firebase).bucket(bucketName).file(path).download();


      const base64abc = [
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
        'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
        'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '/'
      ];
      function bytesToBase64(bytes:any) {
        let result = '';
        let i;
        const l = bytes.length;
        for (i = 2; i < l; i += 3) {
          result += base64abc[bytes[i - 2] >> 2];
          result += base64abc[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
          result += base64abc[((bytes[i - 1] & 0x0F) << 2) | (bytes[i] >> 6)];
          result += base64abc[bytes[i] & 0x3F];
        }
        if (i === l + 1) { // 1 octet yet to write
          result += base64abc[bytes[i - 2] >> 2];
          result += base64abc[(bytes[i - 2] & 0x03) << 4];
          result += '==';
        }
        if (i === l) { // 2 octets yet to write
          result += base64abc[bytes[i - 2] >> 2];
          result += base64abc[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
          result += base64abc[(bytes[i - 1] & 0x0F) << 2];
          result += '=';
        }
        return result;
      }

      return {file:bytesToBase64(file)};
    } catch (e) {
      console.log(e);
      return { err: e.message }
    }
  });


exports.getCoursePhotos = functions
  .runWith({memory: '1GB', timeoutSeconds: 300})
  .https
  .onCall( async (data?: any, context?) =>{
  try{
      functions.logger.log(data);
      let snapshot: any;
      if (data.token) {
        snapshot = await db.collection('public-courses')
          .orderBy('courseId')
          .startAfter(data.token)
          .limit(5).get();
      }  else {
        snapshot = await db.collection('public-courses').limit(5).get();
      }
    // const lastDocument = snapshot.docs[snapshot.docs.length-1];
    const coursesArray = snapshot.docs.map( (doc:any) => doc.data());

    // https://firebasestorage.googleapis.com/v0/b/lifecoach-6ab28.appspot.com/
    // o/users%2F14DrtN48vBXuqRlmhRJGCekp71w1%2FcoursePics%2Flhlnqvpdy?alt=media&token=0451fdea-76ad-4db9-9b2b-75d2faefb9ec

    const getCoachID = (url:string) => {
      functions.logger.log('URL in function', url);

      const suburl = url.match(/users\%2F(.*)\%2FcoursePics/gi);
      if (suburl !== null) {
        return suburl[0].split('%2F')[1];
      }else{
        // @ts-ignore
        return url.match(/users\/(.*)\/coursePics/gi)[0].split('/')[1];
      }
    }
    const getImagePath = (url:string) => {

      const imagePath = url.match(/users\%2F(.*)\%2FcoursePics\%2F(.*)\?/gi);
      if( imagePath !== null) {
        functions.logger.log('readyurl', imagePath[0].split('?')[0].replace(/%2F/g,'/'))
        return imagePath[0].split('?')[0].replace(/%2F/g,'/');
      } else {
        // @ts-ignore
        functions.logger.log('readyurl', url.match(/users\/(.*)\/coursePics\/(.*)/gi)[0])
        // @ts-ignore
        return url.match(/users\/(.*)\/coursePics\/(.*)/gi)[0];
      }
    }
    const info = coursesArray.map((course:any) =>
      ({courseId: course.courseId,
        image: getImagePath(course.image),
        coachId: getCoachID(course.image)}));


    functions.logger.log(coursesArray);
    functions.logger.log(coursesArray[coursesArray.length - 1]);
    // const coursesObject = snapshot.docs.reduce(function (acc:{[key: string]: any}, doc, i) {
    //   acc[doc.id] = doc.data();
    //   return acc;
    // }, {});
    info.forEach( (i:any, index:number) =>{
      if(i.image.lenth<3){
        functions.logger.log(i);
      }
      functions.logger.log(`Item number ${index} is ${i.image.length ? 'not': ''} empty`);
    })
    return {
      info,
      token: coursesArray[coursesArray.length - 1].courseId
    };


  } catch (e) {
    return {err: e.message};
  }
  })

exports.getCoursePhoto = functions
  .runWith({memory: '1GB', timeoutSeconds: 300})
  .https
  .onCall( async (data?:any, context?) => {
    try {
      const bucketName = functions.config().bucket.name;

      const path = data.path ? data.path : '';
      const [file] = await admin.storage(firebase).bucket(bucketName).file(path).download();


      const base64abc = [
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
        'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
        'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '/'
      ];
      function bytesToBase64(bytes:any) {
        let result = '';
        let i;
        const l = bytes.length;
        for (i = 2; i < l; i += 3) {
          result += base64abc[bytes[i - 2] >> 2];
          result += base64abc[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
          result += base64abc[((bytes[i - 1] & 0x0F) << 2) | (bytes[i] >> 6)];
          result += base64abc[bytes[i] & 0x3F];
        }
        if (i === l + 1) { // 1 octet yet to write
          result += base64abc[bytes[i - 2] >> 2];
          result += base64abc[(bytes[i - 2] & 0x03) << 4];
          result += '==';
        }
        if (i === l) { // 2 octets yet to write
          result += base64abc[bytes[i - 2] >> 2];
          result += base64abc[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
          result += base64abc[(bytes[i - 1] & 0x0F) << 2];
          result += '=';
        }
        return result;
      }

      return {file:bytesToBase64(file)};
    } catch (e) {
      console.log(e);
      return { err: e.message }
    }
  });

// Image services - end

// *** TEMP TEMP TEMP ***
function specialities() {
  return [
    {id: '001', itemName: 'Business & Career'},
    {id: '002', itemName: 'Health, Fitness & Wellness'},
    {id: '003', itemName: 'Relationship'},
    {id: '004', itemName: 'Money & Financial'},
    {id: '005', itemName: 'Family'},
    {id: '006', itemName: 'Religion & Faith'},
    {id: '007', itemName: 'Retirement'},
    {id: '008', itemName: 'Transformation & Mindset'},
    {id: '009', itemName: 'Relocation'},
    {id: '010', itemName: 'Academic'},
    {id: '011', itemName: 'Holistic'},
    {id: '012', itemName: 'Productivity & Personal Organisation'}
  ];
}
