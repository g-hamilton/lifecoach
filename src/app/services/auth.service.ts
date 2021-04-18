import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';

import { CloudFunctionsService } from './cloud-functions.service';

import { FirebaseLoginResponse} from '../interfaces/firebase.login.response.interface';
import { UserAccount } from '../interfaces/user.account.interface';
import { AnalyticsService } from './analytics.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private cloudFunctions: CloudFunctionsService,
    private analyticsService: AnalyticsService
  ) { }

  getAuthUser() {
    return this.afAuth.authState as Observable<firebase.User>;
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
      this.analyticsService.signOut();
      await this.router.navigate(['/']);
    } catch (err) {
      console.error(err);
    }
  }

  async deleteAuthAccount(account: UserAccount) {
    // Attempts to update delete a user's account.
    try {
      await this.afAuth.auth.currentUser.delete();
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

  async sendSignInLinkToEmail(email: string, actionCodeSettings: firebase.auth.ActionCodeSettings) {
    try {
      await this.afAuth.auth.sendSignInLinkToEmail(email, actionCodeSettings);
      return true;
    } catch (err) {
      console.error(err.message);
      return err.message;
    }
  }

  isSignInWithEmailLink(url: string) {
    return this.afAuth.auth.isSignInWithEmailLink(url);
  }

  async signInWithEmailLink(email: string, url: string) {
    return this.afAuth.auth.signInWithEmailLink(email, url);
  }

  async createDbUser(account: UserAccount) {
    return this.cloudFunctions.createUserWithSetType(account);
  }

}
