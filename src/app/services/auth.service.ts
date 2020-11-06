import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';

import { CloudFunctionsService } from './cloud-functions.service';

import { FirebaseLoginResponse} from '../interfaces/firebase.login.response.interface';
import { UserAccount } from '../interfaces/user.account.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private cloudFunctions: CloudFunctionsService
  ) { }

  getAuthUser() {
    return this.afAuth.authState as Observable<firebase.User>;
  }

  async createUserWithEmailAndPassword(account: UserAccount) {
    try {
      /*
      Attempts to register a new user with Firebase.
      Firebase auth promises a user credential.
      If signup successful, attempts to set a custom claim on the user object to always identify them by type,
      either regular user or coach (business) user.
      Refreshes the user credential client side with the newly set custom claim.
      Returns the user credential (with new claim) as a login response.
      */
      const userCred = await this.afAuth.auth.createUserWithEmailAndPassword(account.accountEmail, account.password);
      const res = await this.cloudFunctions.createUserWithSetType(userCred.user.uid, account);
      if (res) {
        // User type set successfully.
        await userCred.user.getIdToken(true);
        return {
          result: userCred
        } as FirebaseLoginResponse;
      } else {
        // There was a problem adding the custom claim / user type.
        return {
          error: 'There was a problem setting up your Lifecoach account. Please contact hello@lifecoach.io'
        } as FirebaseLoginResponse;
      }
    } catch (err) {
      return {
        error: err
      } as FirebaseLoginResponse;
    }
  }

  async signInWithEmailAndPassword(account: UserAccount) {
    try {
      console.log('Attempting login...');
      // Attemps to log a user in with Firebase.
      // Firebase auth promises a user credential, which we cast as a login response & return.
      return {
        result: await this.afAuth.auth.signInWithEmailAndPassword(account.accountEmail, account.password)
      } as FirebaseLoginResponse;
    } catch (err) {
      console.error(err);
      return {
        error: err
      } as FirebaseLoginResponse;
    }
  }

  async updateAuthEmail(oldEmail: string, password: string, newEmail: string) {
    // Attempts to update the user's auth email.
    // Classed as 'sensitive op' so re-authentication is required prior to calling.
    try {
      const res: firebase.auth.UserCredential = await this.afAuth.auth.signInWithEmailAndPassword(oldEmail, password);
      if (res) {
        await res.user.updateEmail(newEmail);
        return {
          result: 'success'
        };
      }
    } catch (err) {
      return {
        result: 'error',
        msg: err.code
      };
    }
  }

  async updateAuthPassword(email: string, currentPassword: string, newPassword: string) {
    // Attempts to update the user's password.
    // Classed as 'sensitive op' so re-authentication is required prior to calling.
    try {
      const res: firebase.auth.UserCredential = await this.afAuth.auth.signInWithEmailAndPassword(email, currentPassword);
      if (res) {
        await res.user.updatePassword(newPassword);
        return {
          result: 'success'
        };
      }
    } catch (err) {
      return {
        result: 'error',
        msg: err.code
      };
    }
  }

  async resetPassword(email: string) {
    // Sends a password reset email to the user's given email address.
    // https://firebase.google.com/docs/auth/web/manage-users#send_a_password_reset_email
    try {
      await this.afAuth.auth.sendPasswordResetEmail(email);
      return {
        result: 'success'
      };
    } catch (err) {
      return {
        result: 'error',
        msg: err.code
      };
    }
  }

  async signOut() {
    try {
      await this.afAuth.auth.signOut();
      await this.router.navigate(['/']);
    } catch (err) {
      console.error(err);
    }
  }

  async deleteAuthAccount(account: UserAccount) {
    // Attempts to update delete a user's account.
    // Classed as 'sensitive op' so re-authentication is required prior to calling.
    try {
      const res: firebase.auth.UserCredential = await this.afAuth.auth.signInWithEmailAndPassword(account.accountEmail, account.password);
      if (res) {
        await this.afAuth.auth.currentUser.delete();
        return {
          result: 'success'
        };
      }
    } catch (err) {
      return {
        result: 'error',
        msg: err.code
      };
    }
  }

}
