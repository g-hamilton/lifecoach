import { Injectable } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';

import { ToastService } from './toast.service';

import { CoachProfile } from '../interfaces/coach.profile.interface';
import { UserAccount } from '../interfaces/user.account.interface';
import { AdminCourseReviewRequest } from 'app/interfaces/adminCourseReviewRequest';
import {first, take} from 'rxjs/operators';
import { StripePaymentIntentRequest } from 'app/interfaces/stripe.payment.intent.request';
import { RefundRequest } from 'app/interfaces/refund.request.interface';
import {Answer} from '../pages/video-chatroom/videochatroom.component';
import { AdminProgramReviewRequest } from 'app/interfaces/admin.program.review.interface';
import { CoachInvite } from 'app/interfaces/coach.invite.interface';
import { OrderCoachSessionRequest } from 'app/interfaces/order.coach.session.request.interface';
import { CancelCoachSessionRequest } from 'app/interfaces/cancel.coach.session.request.interface';
import {AdminServiceReviewRequest} from '../interfaces/admin.service.review.interface';
import {AngularFirestore} from '@angular/fire/firestore';
import {Observable} from 'rxjs';
import {CoachingCourse} from '../interfaces/course.interface';
import {AnalyticsService} from './analytics.service';

@Injectable({
  providedIn: 'root'
})
export class CloudFunctionsService {

  unique: any = [];
  nextPageToken: string;
  uniqueUsers: any = [];
  goNext: true | false = true;
  constructor(
    private cloudFunctions: AngularFireFunctions,
    private toastService: ToastService,
    private db: AngularFirestore,
    private analyticsService: AnalyticsService
  ) {
  }


  resizeProfileAvatars( data?: any) {
    // console.log('Token for next page', this.nextPageToken);
    const cfg: any = {
      autoPaginate: false,
      directory: `users/`,
      delimiter: `/`,
      prefix: `users/`,
      maxResults: 1,
      startOffset: `users/`
    };

    if (this.nextPageToken) {
      cfg.pageToken = this.nextPageToken;
      data.token = this.nextPageToken;
      // console.log('DATA TOKEN', data);
    }
    // console.log(cfg);
    return new Promise(resolve => {
      const trigger = this.cloudFunctions.httpsCallable('resizeProfileAvatars');
      const tempSub = trigger(JSON.stringify(cfg)) // options
        .pipe(first())
        .subscribe(res => {
          // console.log(res);
          if (this.nextPageToken && res.apiResponse) {
            this.uniqueUsers.push(res.apiResponse[0].split('/')[1]);
          }
          if (this.nextPageToken && !res.apiResponse) {
            console.log('count ended. Your users:', );
            this.goNext = false;
          }
          if (res.nxt) {
            this.nextPageToken = res.nxt.pageToken;
          } else {
            this.nextPageToken = '';
          }


          const files = res.result;
          // console.log(res.result);
          const filtered = files.filter( i => i.split('/')[1].length); // excluding directory and some files
          // const mapped = filtered.map( i => i.split('/')[1]);

          // console.log('Unique users', new Set(mapped));
          resolve(res);
          tempSub.unsubscribe();
        }, error => {
          console.log('Getting Error', error);
        });
    });
  }

resizeCourseImage(data) {
  return new Promise(resolve => {
    const trigger = this.cloudFunctions.httpsCallable('getCoursePhotos');
    const tempSub = trigger(data ? data : {}) // options
      .pipe(first())
      .subscribe(res => {
        console.log(res);
        resolve(res);
        tempSub.unsubscribe();
      }, error => {
        console.log('Getting Error', error);
      });
  });
}

  cloudSaveCoachProfile(profile: CoachProfile): Promise<boolean> {
    /*
    Saves a coach profile server-side.
    Server side handles dates.
    Returns a promise that resolves with a result on success or error.
    */
    return new Promise(resolve => {
      const saveProfile = this.cloudFunctions.httpsCallable('saveCoachProfile');
      const tempSub = saveProfile({profile})
        .pipe(first())
        .subscribe(res => {
          console.log(res);
          if (!res.error) {
            this.toastService.showToast(res.message, 5000, 'success');
            resolve(true);
          } else {
            this.toastService.showToast(res.message, 0, 'danger');
            resolve(false);
          }
          tempSub.unsubscribe();
        });
    });
  }

  createUserWithSetType(account: UserAccount) {
    /*
    Creates a new user in the DB.
    Sets a custom claim on a given user's auth object to assign custom roles/types/permissions
    */

    return new Promise(resolve => {
      const createDbUserWithType = this.cloudFunctions.httpsCallable('createDbUserWithType');
      const tempSub = createDbUserWithType(account)
        .pipe(first())
        .subscribe(res => {
          resolve(res);
          tempSub.unsubscribe();
        });
    });
  }

  updateUserEmailOnMailingList(accountType: string, oldEmail: string, newEmail: string) {
    /*
    Updates a user's email on the mailing list service.
    */
    const updateUserEmail = this.cloudFunctions.httpsCallable('updateMailingListUserEmail');
    const tempSub = updateUserEmail({accountType, oldEmail, newEmail})
      .pipe(first())
      .subscribe(res => {
        console.log(res);
        tempSub.unsubscribe();
      });
  }

  updateUserNameOnMailingList(accountType: string, email: string, firstName: string, lastName: string) {
    /*
    Updates a user's first and last name on the mailing list service.
    */
    const updateUserName = this.cloudFunctions.httpsCallable('updateMailingListUserName');
    const tempSub = updateUserName({accountType, email, firstName, lastName})
      .pipe(first())
      .subscribe(res => {
        console.log(res);
        tempSub.unsubscribe();
      });
  }

  deleteUserData(uid: string, account: UserAccount) {
    /*
      Using a cloud function with admin permission as the client SDK is limiting in terms
      of delete. Only admin access can delete collections & subcollections (inc 'virtual docs').
    */
    return new Promise(resolve => {
      const deleteUser = this.cloudFunctions.httpsCallable('recursiveDeleteUserData');
      const tempSub = deleteUser({
        uid,
        accountType: account.accountType,
        email: account.accountEmail
      })
        .pipe(first())
        .subscribe(res => {
          console.log(res);
          resolve(res);
          tempSub.unsubscribe();
        });
    });
  }

  postNewMessage(senderUid: string, recipientUid: string | null, message: string, roomID: string | null) {
    // console.log(`Posting msg. Room ${roomID}, Sender: ${senderUid}, recipient: ${recipientUid}, msg: ${message}.`);
    return new Promise(resolve => {
      const pnm = this.cloudFunctions.httpsCallable('postNewMessage');
      const tempSub = pnm({
        senderUid,
        recipientUid,
        roomID,
        message
      })
        .pipe(first())
        .subscribe(res => {
          resolve(res);
          tempSub.unsubscribe();
        });
    });
  }

  generateJWT(uid: string) {
    return new Promise(resolve => {
      const jwt = this.cloudFunctions.httpsCallable('generateJWT');
      const tempSub = jwt({
        uid
      })
        .pipe(first())
        .subscribe(res => {
          resolve(res);
          tempSub.unsubscribe();
        });
    });
  }

  generateShortUrl(uid: string, destination: string) {
    return new Promise(resolve => {
      const shortUrl = this.cloudFunctions.httpsCallable('generateCoachProfileShortUrl');
      const tempSub = shortUrl({
        uid,
        destination
      })
        .pipe(first())
        .subscribe(res => {
          resolve(res);
          tempSub.unsubscribe();
        });
    });
  }

  connectStripe(data) {
    return new Promise(resolve => {
      const trigger = this.cloudFunctions.httpsCallable('completeStripeConnect');
      const tempSub = trigger(data)
        .pipe(first())
        .subscribe(res => {
          resolve(res);
          tempSub.unsubscribe();
        });
    });
  }

  getStripeLoginLink(stripeUid: string) {
    return new Promise(resolve => {
      const login = this.cloudFunctions.httpsCallable('stripeCreateLoginLink');
      const tempSub = login({
        stripeUid
      })
        .pipe(first())
        .subscribe(res => {
          resolve(res);
          tempSub.unsubscribe();
        });
    });
  }

  getStripeAccountBalance(stripeUid: string) {
    return new Promise(resolve => {
      const balance = this.cloudFunctions.httpsCallable('stripeRetrieveBalance');
      const tempSub = balance({
        stripeUid
      })
        .pipe(first())
        .subscribe(res => {
          resolve(res);
          tempSub.unsubscribe();
        });
    });
  }

  getStripePaymentIntent(piRequest: StripePaymentIntentRequest) {
    return new Promise(resolve => {
      const intent = this.cloudFunctions.httpsCallable('stripeCreatePaymentIntent');
      const tempSub = intent(piRequest)
        .pipe(first())
        .subscribe(res => {
          resolve(res);
          tempSub.unsubscribe();
        });
    });
  }

  completeFreeCourseEnrollment(courseId: string, clientUid: string, referralCode: string) {
    return new Promise(resolve => {
      const enroll = this.cloudFunctions.httpsCallable('completeFreeCourseEnrollment');
      const tempSub = enroll({
        courseId,
        clientUid,
        referralCode
      })
        .pipe(first())
        .subscribe(res => {
          resolve(res);
          tempSub.unsubscribe();
        });
    });
  }

  updatePlatformRates() {
    return new Promise(resolve => {
      const rates = this.cloudFunctions.httpsCallable('manualUpdateRates');
      const tempSub = rates(null)
        .pipe(first())
        .subscribe(res => {
          resolve(res);
          tempSub.unsubscribe();
        });
    });
  }

  requestRefund(refundRequest: RefundRequest) {
    return new Promise(resolve => {
      const refund = this.cloudFunctions.httpsCallable('requestRefund');
      const tempSub = refund({
        refundRequest
      })
        .pipe(first())
        .subscribe(res => {
          resolve(res);
          tempSub.unsubscribe();
        });
    });
  }

  approveRefund(refundRequest: any) {
    return new Promise(resolve => {
      const approve = this.cloudFunctions.httpsCallable('approveRefund');
      const tempSub = approve({
        refundRequest
      })
        .pipe(first())
        .subscribe(res => {
          resolve(res);
          tempSub.unsubscribe();
        });
    });
  }

  adminApproveCourseReview(courseId: string, userId: string, reviewRequest: AdminCourseReviewRequest) {
    return new Promise(resolve => {
      const approve = this.cloudFunctions.httpsCallable('adminApproveCourseReview');
      const tempSub = approve({
        courseId,
        userId,
        reviewRequest
      })
        .pipe(first())
        .subscribe(res => {
          resolve(res);
          tempSub.unsubscribe();
        });
    });
  }

  adminRejectCourseReview(courseId: string, userId: string, reviewRequest: AdminCourseReviewRequest) {
    return new Promise(resolve => {
      const reject = this.cloudFunctions.httpsCallable('adminRejectCourseReview');
      const tempSub = reject({
        courseId,
        userId,
        reviewRequest
      })
        .pipe(first())
        .subscribe(res => {
          resolve(res);
          tempSub.unsubscribe();
        });
    });
  }

  adminChangeUserType(userId: string, oldType: 'regular' | 'coach' | 'partner' | 'provider' | 'admin', newType: 'regular' | 'coach' | 'partner' | 'provider' | 'admin') {
    return new Promise(resolve => {
      const changeType = this.cloudFunctions.httpsCallable('adminChangeUserType');
      const tempSub = changeType({
        userId,
        oldType,
        newType
      })
        .pipe(first())
        .subscribe(res => {
          resolve(res);
          tempSub.unsubscribe();
        });
    });
  }

  // creates a NEW admin user from scratch. Note: Requires a special admin password (set server side)
  adminCreateAdminUser(uid: string, email: string, firstName: string, lastName: string, adminPassword: string) {
    return new Promise(resolve => {
      const createAdmin = this.cloudFunctions.httpsCallable('createAdminUser');
      const tempSub = createAdmin({
        uid,
        email,
        firstName,
        lastName,
        adminPassword
      })
        .pipe(first())
        .subscribe(res => {
          resolve(res);
          tempSub.unsubscribe();
        });
    });
  }

  // Twilio
  getTwilioToken(uid: string, room: string, timeOfStart: number, duration: number) {
    console.log('Cloud Function Service prop', uid);
    console.log(timeOfStart, duration);
    console.group('getTwilioToken Function');
    console.log(`timeOfStart prop: ${new Date(timeOfStart)}`);
    console.log(`Duration prop: ${duration}`);
    console.log(`Date.now: ${new Date(Date.now())}`);
    console.log(`TTL: ${timeOfStart + duration - Date.now()}`);
    console.groupEnd();
    const nowTime = Date.now();
    const ttl = timeOfStart + duration - nowTime;
    if (ttl < 0) {
      return Promise.reject('IS_OVER');
    }
    if ( timeOfStart - nowTime > 60000 ) {
      return Promise.reject('NOT_TIME_YET');
    }
    console.log(ttl);
    return new Promise( resolve => {
        const res = this.cloudFunctions.httpsCallable('getTwilioToken');
        const tempSub = res({uid, room, ttl})
          .pipe(first())
          .subscribe(r => {
            resolve(r.json);
            console.log('Cloud Function Service', r.json);
            tempSub.unsubscribe();
          });
      }
    );
  }

  // Also twilio, for controlling video-session
  getInfoAboutCurrentVideoSession(sessionId: string): Promise<Answer> {
    return new Promise(resolve => {

      const trigger = this.cloudFunctions.httpsCallable('getInfoAboutCurrentVideoSession');

      const tempSub = trigger({ docId: sessionId})
        .pipe(first())
        .subscribe(res => {
          resolve(res);
          tempSub.unsubscribe();
        });
    });
  }

  // twilio, for aborting session
  abortVideoSession(roomID: string) {
    return new Promise(resolve => {

      const trigger = this.cloudFunctions.httpsCallable('abortVideoSession');

      const tempSub = trigger({ roomID })
        .pipe(first())
        .subscribe(res => {
          resolve(res);
          tempSub.unsubscribe();
        });
    });
  }

  adminApproveProgramReview(programId: string, userId: string, reviewRequest: AdminProgramReviewRequest) {
    return new Promise(resolve => {
      const approve = this.cloudFunctions.httpsCallable('adminApproveProgramReview');
      const tempSub = approve({
        programId,
        userId,
        reviewRequest
      })
        .pipe(first())
        .subscribe(res => {
          resolve(res);
          tempSub.unsubscribe();
        });
    });
  }

  adminRejectProgramReview(programId: string, userId: string, reviewRequest: AdminProgramReviewRequest) {
    return new Promise(resolve => {
      const reject = this.cloudFunctions.httpsCallable('adminRejectProgramReview');
      const tempSub = reject({
        programId,
        userId,
        reviewRequest
      })
        .pipe(first())
        .subscribe(res => {
          resolve(res);
          tempSub.unsubscribe();
        });
    });
  }

  adminApproveServiceReview(serviceId: string, userId: string, reviewRequest: AdminServiceReviewRequest) {
    return new Promise(resolve => {
      const approve = this.cloudFunctions.httpsCallable('adminApproveServiceReview');
      const tempSub = approve({
        serviceId,
        userId,
        reviewRequest
      })
        .pipe(first())
        .subscribe(res => {
          resolve(res);
          tempSub.unsubscribe();
        });
    });
  }

  adminRejectServiceReview(serviceId: string, userId: string, reviewRequest: AdminServiceReviewRequest) {
    return new Promise(resolve => {
      const reject = this.cloudFunctions.httpsCallable('adminRejectServiceReview');
      const tempSub = reject({
        serviceId,
        userId,
        reviewRequest
      })
        .pipe(first())
        .subscribe(res => {
          resolve(res);
          tempSub.unsubscribe();
        });
    });
  }

  sendCoachInvite(data: CoachInvite) {
    return new Promise(resolve => {
      const invite = this.cloudFunctions.httpsCallable('sendCoachInvite');
      const tempSub = invite(data)
        .pipe(first())
        .subscribe(res => {
          resolve(res);
          tempSub.unsubscribe();
        });
    });
  }

  orderCoachSession(data: OrderCoachSessionRequest) {
    return new Promise(resolve => {
      const order = this.cloudFunctions.httpsCallable('orderCoachSession');
      const tempSub = order(data)
        .pipe(first())
        .subscribe(res => {
          resolve(res);
          tempSub.unsubscribe();
        });
    });
  }

  cancelCoachSession(data: CancelCoachSessionRequest) {
    return new Promise(resolve => {
      const cancel = this.cloudFunctions.httpsCallable('cancelCoachSession');
      const tempSub = cancel(data)
        .pipe(first())
        .subscribe(res => {
          resolve(res);
          tempSub.unsubscribe();
        });
    });
  }

  coachMarkSessionComplete(data: any) {
    return new Promise(resolve => {
      const mark = this.cloudFunctions.httpsCallable('coachMarkSessionComplete');
      const tempSub = mark(data)
        .pipe(first())
        .subscribe(res => {
          resolve(res);
          tempSub.unsubscribe();
        });
    });
  }

  // *** DANGER AREA ***
  // Only call if you know what you're doing!!
  adminTriggerAllProfilesUpdateInSequence() {
    return new Promise(resolve => {
      const trigger = this.cloudFunctions.httpsCallable('updateAllProfilesInSequence');
      const tempSub = trigger({})
        .pipe(first())
        .subscribe(res => {
          resolve(res);
          tempSub.unsubscribe();
        });
    });
  }

  // Image services functions
  uploadProgramImage( data: any) {
    return new Promise((resolve, reject) => {
      const trigger = this.cloudFunctions.httpsCallable('uploadProgramImage');
      const tempSub = trigger(data)
        .pipe(first())
        .subscribe(res => {
          resolve(res);
          tempSub.unsubscribe();
        }, error => reject(error));
    });
  }

  uploadCourseImage( data: any) {
    return new Promise(resolve => {
      const trigger = this.cloudFunctions.httpsCallable('uploadCourseImage');
      const tempSub = trigger(data)
        .pipe(first())
        .subscribe(res => {
          console.log('Getting result: ', res);
          resolve(res);
          tempSub.unsubscribe();
        }, error => {

          console.log('Getting Error', error);
        });
    });
  }

  uploadServiceImage( data: any) {
    return new Promise((resolve, reject) => {
      const trigger = this.cloudFunctions.httpsCallable('uploadServiceImage');
      const tempSub = trigger(data)
        .pipe(first())
        .subscribe(res => {
          resolve(res);
          tempSub.unsubscribe();
        }, error => reject(error));
    });
  }

  uploadUserAvatar( data: any) {
    return new Promise(resolve => {
      const trigger = this.cloudFunctions.httpsCallable('uploadUserAvatar');
      const tempSub = trigger(data)
        .pipe(first())
        .subscribe(res => {
          console.log(res);
          resolve(res);
          tempSub.unsubscribe();
        }, error => {
          console.log('Getting Error', error);
        });
    });
  }

  async resizeProfileAvatarsManager(data) {
    console.log('----------------');
    console.log('STARTING PROCESS');
    console.log('----------------');
    console.log('Data', data);
    this.nextPageToken = data.token ? data.token : '';
    console.log('Started with token:', this.nextPageToken);
    this.uniqueUsers = [];
    this.unique = [];
    const reflect = p => p.then(v => ({v, status: 'fulfilled' }), e => ({e, status: 'rejected' }));
    try {

      // console.log('cloud - service');
      let photoUrls = [];
      let toDownload = [];
      let userProfilesWithID = [];
      this.goNext = true;
      let counter = 10;
      do {
        await this.resizeProfileAvatars(data);
        console.log('working');

        this.unique =  [...new Set(this.uniqueUsers)]; // Unique users

        // console.log('DONE WITH UNIQUE', this.unique);
        // @ts-ignore // TODO: don't know why, but getCoachProfile function return both coach and regular profiles;
        if (this.unique) {
          const profilePromises = this.unique.map( i => this.getCoachProfile(i).pipe(take(1)).toPromise());

          const uniqueProfiles = await Promise.all(profilePromises.map(reflect)); // This is realization os Promise.allSettled, because is natively not supported

          const coachProfiles = uniqueProfiles.map( ({v}, index) => ({data: v, profileUid: this.unique[index]}));

          const users = coachProfiles.filter( i => i.data === undefined && i.profileUid !== undefined);
          const userProfilesPromises = coachProfiles.filter( i => i.data === undefined && i.profileUid ).map( x => this.getRegularProfile(x.profileUid).pipe(take(1)).toPromise());
          const userProfiles = await Promise.all(userProfilesPromises);
          userProfilesWithID = userProfiles.map( (i, index) => ({data: i, profileUid: users[index].profileUid }));


          const usersAndCoaches = [...coachProfiles, ...userProfilesWithID].filter(i => i.data);

          // console.log(coachProfiles);
          // console.log(userProfilesWithID);
          // console.log(usersAndCoaches);
            // .filter(i => !i.data.photoPaths); // Profiles without 'paths' object
          // console.log('DONE WITH UNIQUE COACHES PROFILES without photo.paths', coachProfiles);

          /*
           check image url (photo = link?)
           if no - that mean user has no photo
           if yes - add to array.
           This array will be used as marker (where we should upload our photo urls)
          */
          toDownload = usersAndCoaches.filter( i => i.data.photo && !i.data.photoPaths);
          // console.log(toDownload);
          photoUrls = toDownload.map( i => i.data.photo);
          // if exist = try to download
          // console.log('', photoUrls);
          // console.log('before out');
          if ( counter === 0 && photoUrls.length === 0) {
            console.log('there is no profiles without paths object');
            return;
          }
          console.log(counter--);
        }
      } while ( this.goNext && counter > 0);

      console.log('This users will be updated: ', this.uniqueUsers);
      // console.table(photoUrls);
      // console.log(toDownload);
      console.log('Пытаюсь вернуть вот это', data.token);
      const imagePromises = photoUrls.map( i => (new Promise(resolve => {
        const trigger = this.cloudFunctions.httpsCallable('getUserPhoto');
        const tempSub = trigger({ url: i })
          .pipe(first())
          .subscribe(res => {
            resolve(res);
            tempSub.unsubscribe();
          }, error => {
            console.log(error);
          });
      })));
      const allPhotos = await Promise.all(imagePromises.map(reflect));

      console.log('GOT ALL PHOTOS');
      /*
        file().download() - return in unit8 array which should be converted to base64.
      */


      // Functions for converting

      // END of functions for converting


      // @ts-ignore
      const userImages = allPhotos.map( i => Object.values(i.v.file ? i.v.file : i.v.file )); // in binary
      const inBase64 = userImages.map( i => ('data:image/jpeg;base64,' + i));
      // console.log(userImages);

      // then reshape on different sizes and formats
      // upload to gcp bucket
      // get url back

      // @ts-ignore
      const promisesToUpload = toDownload.map( (i, index) => this.uploadUserAvatar({uid: i.profileUid, img: inBase64[index]}));
      const responsesWithUrls = await Promise.all(promisesToUpload);
      // write url to coach object
      console.log('UPLOADED IN DIF SIZES');
      const newProfileObjects = toDownload
        .map( (i, index) => ({...i.data,
          photoPaths: responsesWithUrls[index],
          // @ts-ignore
          photo: responsesWithUrls[index].original.fullSize || ''}));

      const userIDS = userProfilesWithID.map( i => i.profileUid);
      console.log('IDs of regular accs', userIDS);

      // @ts-ignore
      const updateUsersPromises = toDownload.map( (i, index) => {
        if (userIDS.includes(i.profileUid)) {
          return this.updateUserAccount(i.profileUid, newProfileObjects[index]);
        }
        return this.saveCoachProfile(i.profileUid, newProfileObjects[index]);
      });

      const response = await Promise.all(updateUsersPromises);
      console.log('FINALLY DONE');
      console.log('----------------');
      console.log('END OF PROCESS');
      console.log('----------------');
      return {response, token: data.token};

    } catch (e) {
      return {e};
    }

  }

  getCollectionDocIds(path: string) {
    return new Promise(resolve => {
      const trigger = this.cloudFunctions.httpsCallable('getCollectionDocIds');
      const tempSub = trigger(path)
        .pipe(first())
        .subscribe(res => {
          resolve(res);
          tempSub.unsubscribe();
        });
    });
  }


  // duplicate from 'data.service' to prevent circular dependency injection
  async saveCoachProfile(uid: string, profile: CoachProfile) {
    return this.db.collection(`users/${uid}/profile`)
      .doc(`profile${uid}`)
      .set(profile, {merge: true})
      .catch(err => console.error(err));
  }
  getCoachProfile(uid: string) {
    return this.db.collection(`users/${uid}/profile`)
      .doc(`profile${uid}`)
      .valueChanges() as Observable<CoachProfile>;
  }


  getRegularProfile(uid: string) {
    return this.db.collection(`users/${uid}/regularProfile`)
      .doc(`profile${uid}`)
      .valueChanges() as Observable<any>;
  }

  getPrivateCourse(userId: string, courseId: string) {
    // Returns a course document.
    return this.db.collection(`users/${userId}/courses`)
      .doc(courseId).get().pipe(take(1)).toPromise();
  }
 // token CiN1c2Vycy9LNzNwamNDaWV2Z1phaDhRczRLcUhMb2lHdkcyLw==
  async updateUserAccount(uid: string, partial: {}) {
    return this.db.collection(`users/${uid}/account`)
      .doc(`account${uid}`)
      .update(partial)
      .catch(err => console.error(err));
  }

  //
  async courseImagesManager(data) {
    this.nextPageToken = data.token ? data.token : '';
    try {
      console.log('------------------------------');

      const resp = await this.resizeCourseImage(data);
      console.log('Response', resp);
      console.log('А вот тут произойдет ресайз');
      // @ts-ignore
      const photoPromises = resp.info.map( i => (new Promise(resolve => {
        const trigger = this.cloudFunctions.httpsCallable('getCoursePhoto');
        const tempSub = trigger({ path: i.image })
          .pipe(first())
          .subscribe(res => {
            resolve(res);
            tempSub.unsubscribe();
          }, error => {
            console.log(error);
          });
      })));
      console.log('Starting loading photos...');
      const photos = await Promise.all(photoPromises);
      console.log('got all photos');
      console.log('Resize started');
      // @ts-ignore
      const uploadPromises = resp.info.map( (i: any, index) => this.uploadCourseImage({uid: i.coachId, img: 'data:image/jpeg;base64,' + photos[index].file}));

      const urls = await Promise.all(uploadPromises);
      console.log('uploadeed new photos');

      // @ts-ignore
      const oldCoursesPromises = resp.info.map(i => this.getPrivateCourse(i.coachId, i.courseId));
      const oldCoursesSnapshots = await Promise.all(oldCoursesPromises);
      console.log('Got old courses');
      const oldCourses = oldCoursesSnapshots.map((i: any) => i.data());

      // @ts-ignore
      const newCourses = oldCourses.map( (i: any, index: number ) => ({...i, image: urls[index].original.fullSize, imagePaths: urls[index]}));
      console.log('Made new courses');
      // @ts-ignore
      const uploadCoursesPromises = newCourses.map( (i: any, index: number) => this.savePrivateCourse(resp.info[index].coachId, newCourses[index]));

      const newCoursesUploaded = await Promise.all(uploadCoursesPromises);

      // await this.dataService.savePrivateCourse(this.course.sellerUid, saveCourse); this.course.sellerUid = i.coachId, saveCourse =
      console.log('Done', newCoursesUploaded);
      console.log('------------------------------');
      // @ts-ignore
      return {token: resp.token};
    } catch (e) {
      return {err: e.meessage};
    }
  }
  async savePrivateCourse(uid: string, course: CoachingCourse) {
    // track
    this.analyticsService.saveCourse();
    // Saves a user's course to a document with matching id
    console.log('SavePrivateCourse', course);
    return this.db.collection(`users/${uid}/courses`)
      .doc(course.courseId)
      .set(course, {merge: true})
      .catch(err => console.error(err));
  }

  createStripeCheckoutSession(data: any) {
    return new Promise(resolve => {
      const trigger = this.cloudFunctions.httpsCallable('createStripeCheckoutSession');
      const tempSub = trigger(data)
        .pipe(first())
        .subscribe(res => {
          resolve(res);
          tempSub.unsubscribe();
        });
    });
  }

  createStripePortalSession(data: any) {
    return new Promise(resolve => {
      const trigger = this.cloudFunctions.httpsCallable('createStripePortalSession');
      const tempSub = trigger(data)
        .pipe(first())
        .subscribe(res => {
          resolve(res);
          tempSub.unsubscribe();
        });
    });
  }

  requestAccountClosure(data: any) {
    return new Promise(resolve => {
      const trigger = this.cloudFunctions.httpsCallable('requestAccountClosure');
      const tempSub = trigger(data)
        .pipe(first())
        .subscribe(res => {
          resolve(res);
          tempSub.unsubscribe();
        });
    });
  }

  deleteStripeConnectedExpressAccount(data: any) {
    return new Promise(resolve => {
      const trigger = this.cloudFunctions.httpsCallable('adminDeleteStripeConnectedExpressAccount');
      const tempSub = trigger(data)
        .pipe(first())
        .subscribe(res => {
          resolve(res);
          tempSub.unsubscribe();
        });
    });
  }

  createStripeSubscriptionForUser(data: any) {
    return new Promise(resolve => {
      const trigger = this.cloudFunctions.httpsCallable('adminCreateStripeSubscriptionForUser');
      const tempSub = trigger(data)
        .pipe(first())
        .subscribe(res => {
          resolve(res);
          tempSub.unsubscribe();
        });
    });
  }

  getStripeAccountLink(data: any) {
    return new Promise(resolve => {
      const trigger = this.cloudFunctions.httpsCallable('stripeCreateAccountLink');
      const tempSub = trigger(data)
        .pipe(first())
        .subscribe(res => {
          resolve(res);
          tempSub.unsubscribe();
        });
    });
  }

  adminMassSubscribeCoachesToFlame(data: any) {
    return new Promise(resolve => {
      const trigger = this.cloudFunctions.httpsCallable('adminMassSubscribeCoachesToFlame');
      const tempSub = trigger(data)
        .pipe(first())
        .subscribe(res => {
          resolve(res);
          tempSub.unsubscribe();
        });
    });
  }

  adminMassDeleteStripeExpressAccounts(data: any) {
    return new Promise(resolve => {
      const trigger = this.cloudFunctions.httpsCallable('adminMassDeleteStripeExpressAccounts');
      const tempSub = trigger(data)
        .pipe(first())
        .subscribe(res => {
          resolve(res);
          tempSub.unsubscribe();
        });
    });
  }
}
