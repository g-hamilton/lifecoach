var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';
import { ToastService } from './toast.service';
import { first } from 'rxjs/operators';
let CloudFunctionsService = class CloudFunctionsService {
    constructor(cloudFunctions, toastService) {
        this.cloudFunctions = cloudFunctions;
        this.toastService = toastService;
    }
    cloudSaveCoachProfile(profile) {
        /*
        Saves a coach profile server-side.
        Server side handles dates.
        Returns a promise that resolves with a result on success or error.
        */
        return new Promise(resolve => {
            const saveProfile = this.cloudFunctions.httpsCallable('saveCoachProfile');
            const tempSub = saveProfile({ profile })
                .pipe(first())
                .subscribe(res => {
                console.log(res);
                if (!res.error) {
                    this.toastService.showToast(res.message, 5000, 'success');
                    resolve(true);
                }
                else {
                    this.toastService.showToast(res.message, 0, 'danger');
                    resolve(false);
                }
                tempSub.unsubscribe();
            });
        });
    }
    createUserWithSetType(uid, account) {
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
            const tempSub = createDbUserWithType({ uid, email, type, firstName, lastName })
                .pipe(first())
                .subscribe(res => {
                if (!res.error) {
                    resolve(true);
                }
                else {
                    resolve(false);
                }
                tempSub.unsubscribe();
            });
        });
    }
    updateUserEmailOnMailingList(accountType, oldEmail, newEmail) {
        /*
        Updates a user's email on the mailing list service.
        */
        const updateUserEmail = this.cloudFunctions.httpsCallable('updateMailingListUserEmail');
        const tempSub = updateUserEmail({ accountType, oldEmail, newEmail })
            .pipe(first())
            .subscribe(res => {
            console.log(res);
            tempSub.unsubscribe();
        });
    }
    updateUserNameOnMailingList(accountType, email, firstName, lastName) {
        /*
        Updates a user's first and last name on the mailing list service.
        */
        const updateUserName = this.cloudFunctions.httpsCallable('updateMailingListUserName');
        const tempSub = updateUserName({ accountType, email, firstName, lastName })
            .pipe(first())
            .subscribe(res => {
            console.log(res);
            tempSub.unsubscribe();
        });
    }
    deleteUserData(uid, account) {
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
    postNewMessage(senderUid, recipientUid, message, roomID) {
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
    generateJWT(uid) {
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
    generateShortUrl(uid, destination) {
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
    completeStripeConnection(uid, code) {
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
    getStripeLoginLink(stripeUid) {
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
    getStripeAccountBalance(stripeUid) {
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
    getStripePaymentIntent(courseId, clientCurrency, clientPrice, clientUid, referralCode) {
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
    completeFreeCourseEnrollment(courseId, clientUid, referralCode) {
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
    requestRefund(refundRequest) {
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
    approveRefund(refundRequest) {
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
    adminApproveCourseReview(courseId, userId, reviewRequest) {
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
    adminRejectCourseReview(courseId, userId, reviewRequest) {
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
    adminChangeUserType(userId, oldType, newType) {
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
    getTwilioToken(uid) {
        console.log('Cloud Function Service prop', uid);
        return new Promise(resolve => {
            const res = this.cloudFunctions.httpsCallable('getTwilioToken');
            console.log('Cloud Function Service', res);
            const tempSub = res(uid)
                .pipe(first())
                .subscribe(r => {
                resolve(r.json);
                console.log('Cloud Function Service', r.json);
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
};
CloudFunctionsService = __decorate([
    Injectable({
        providedIn: 'root'
    }),
    __metadata("design:paramtypes", [AngularFireFunctions,
        ToastService])
], CloudFunctionsService);
export { CloudFunctionsService };
//# sourceMappingURL=cloud-functions.service.js.map