var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { CloudFunctionsService } from './cloud-functions.service';
let AuthService = class AuthService {
    constructor(afAuth, router, cloudFunctions) {
        this.afAuth = afAuth;
        this.router = router;
        this.cloudFunctions = cloudFunctions;
    }
    getAuthUser() {
        return this.afAuth.authState;
    }
    createUserWithEmailAndPassword(account) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                /*
                Attempts to register a new user with Firebase.
                Firebase auth promises a user credential.
                If signup successful, attempts to set a custom claim on the user object to always identify them by type,
                either regular user or coach (business) user.
                Refreshes the user credential client side with the newly set custom claim.
                Returns the user credential (with new claim) as a login response.
                */
                const userCred = yield this.afAuth.auth.createUserWithEmailAndPassword(account.accountEmail, account.password);
                const res = yield this.cloudFunctions.createUserWithSetType(userCred.user.uid, account);
                if (res) {
                    // User type set successfully.
                    yield userCred.user.getIdToken(true);
                    return {
                        result: userCred
                    };
                }
                else {
                    // There was a problem adding the custom claim / user type.
                    return {
                        error: 'There was a problem setting up your Lifecoach account. Please contact hello@lifecoach.io'
                    };
                }
            }
            catch (err) {
                return {
                    error: err
                };
            }
        });
    }
    signInWithEmailAndPassword(account) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('Attempting login...');
                // Attemps to log a user in with Firebase.
                // Firebase auth promises a user credential, which we cast as a login response & return.
                return {
                    result: yield this.afAuth.auth.signInWithEmailAndPassword(account.accountEmail, account.password)
                };
            }
            catch (err) {
                console.error(err);
                return {
                    error: err
                };
            }
        });
    }
    updateAuthEmail(oldEmail, password, newEmail) {
        return __awaiter(this, void 0, void 0, function* () {
            // Attempts to update the user's auth email.
            // Classed as 'sensitive op' so re-authentication is required prior to calling.
            try {
                const res = yield this.afAuth.auth.signInWithEmailAndPassword(oldEmail, password);
                if (res) {
                    yield res.user.updateEmail(newEmail);
                    return {
                        result: 'success'
                    };
                }
            }
            catch (err) {
                return {
                    result: 'error',
                    msg: err.code
                };
            }
        });
    }
    updateAuthPassword(email, currentPassword, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            // Attempts to update the user's password.
            // Classed as 'sensitive op' so re-authentication is required prior to calling.
            try {
                const res = yield this.afAuth.auth.signInWithEmailAndPassword(email, currentPassword);
                if (res) {
                    yield res.user.updatePassword(newPassword);
                    return {
                        result: 'success'
                    };
                }
            }
            catch (err) {
                return {
                    result: 'error',
                    msg: err.code
                };
            }
        });
    }
    resetPassword(email) {
        return __awaiter(this, void 0, void 0, function* () {
            // Sends a password reset email to the user's given email address.
            // https://firebase.google.com/docs/auth/web/manage-users#send_a_password_reset_email
            try {
                yield this.afAuth.auth.sendPasswordResetEmail(email);
                return {
                    result: 'success'
                };
            }
            catch (err) {
                return {
                    result: 'error',
                    msg: err.code
                };
            }
        });
    }
    signOut() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.afAuth.auth.signOut();
                yield this.router.navigate(['/']);
            }
            catch (err) {
                console.error(err);
            }
        });
    }
    deleteAuthAccount(account) {
        return __awaiter(this, void 0, void 0, function* () {
            // Attempts to update delete a user's account.
            // Classed as 'sensitive op' so re-authentication is required prior to calling.
            try {
                const res = yield this.afAuth.auth.signInWithEmailAndPassword(account.accountEmail, account.password);
                if (res) {
                    yield this.afAuth.auth.currentUser.delete();
                    return {
                        result: 'success'
                    };
                }
            }
            catch (err) {
                return {
                    result: 'error',
                    msg: err.code
                };
            }
        });
    }
};
AuthService = __decorate([
    Injectable({
        providedIn: 'root'
    }),
    __metadata("design:paramtypes", [AngularFireAuth,
        Router,
        CloudFunctionsService])
], AuthService);
export { AuthService };
//# sourceMappingURL=auth.service.js.map