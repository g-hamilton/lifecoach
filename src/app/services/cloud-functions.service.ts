import { Injectable } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';

import { ToastService } from './toast.service';

import { CoachProfile } from '../interfaces/coach.profile.interface';
import { UserAccount } from '../interfaces/user.account.interface';
import { AdminCourseReviewRequest } from 'app/interfaces/adminCourseReviewRequest';
import { first } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CloudFunctionsService {

  constructor(
    private cloudFunctions: AngularFireFunctions,
    private toastService: ToastService
  ) {
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

  createUserWithSetType(uid: string, account: UserAccount): Promise<boolean> {
    /*
    Creates a new user in the DB.
    Sets a custom claim on a given user's auth object to assign custom roles/types/permissions
    */
    const email = account.accountEmail;
    const type = account.accountType;
    const firstName = account.firstName;
    const lastName = account.lastName;

    return new Promise(resolve => {
      const createDbUserWithType = this.cloudFunctions.httpsCallable('createDbUserWithType');
      const tempSub = createDbUserWithType({uid, email, type, firstName, lastName})
        .pipe(first())
        .subscribe(res => {
          if (!res.error) {
            resolve(true);
          } else {
            resolve(false);
          }
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
          resolve();
          tempSub.unsubscribe();
        });
    });
  }

  postNewMessage(senderUid: string, recipientUid: string | null, message: string, roomID: string | null) {
    // console.log(`Posting msg. Room ${roomID}, Sender: ${senderUid}.`);
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

  completeStripeConnection(uid: string, code: string) {
    return new Promise(resolve => {
      const complete = this.cloudFunctions.httpsCallable('completeStripeConnect');
      const tempSub = complete({
        uid,
        code
      })
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

  getStripePaymentIntent(courseId: string, clientCurrency: string, clientPrice: number, clientUid: string, referralCode: string) {
    return new Promise(resolve => {
      const intent = this.cloudFunctions.httpsCallable('stripeCreatePaymentIntent');
      const tempSub = intent({
        courseId,
        clientCurrency,
        clientPrice,
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

  requestRefund(refundRequest: any) {
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

  adminChangeUserType(userId: string, oldType: 'regular' | 'coach' | 'publisher' | 'provider' | 'admin', newType: 'regular' | 'coach' | 'publisher' | 'provider' | 'admin') {
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

  // Twilio
  getTwilioToken(uid: string) {
    return new Promise( resolve => {
          const res = this.cloudFunctions.httpsCallable('getTwilioToken');
          const tempSub = res(uid)
            .pipe(first())
            .subscribe(r => {
              resolve(r);
              tempSub.unsubscribe();
            });
      }
    );
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

}
