import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class PartnerTrackingService {

  constructor(
    private route: ActivatedRoute
  ) { }

  checkAndSavePartnerTrackingCode() {
    // inspect the active route for a partner referral code query param
    // if found, save to localStorage with timestamp for cross section tracking
    this.route.queryParams.subscribe(qP => {
      if (qP.partner) { // We found a partner param (will be partner uid)
        const timeStampInSeconds = Math.round(new Date().getTime() / 1000); // unix timestamp in seconds

        console.log('partner tracking code found in route params:', qP.partner, 'timestamp:', timeStampInSeconds);

        localStorage.setItem('partner-tracking-uid', qP.partner); // save partner tracking id to local storage
        localStorage.setItem('partner-tracking-timestamp', timeStampInSeconds.toString()); // save timestamp to local storage
      }
    });
  }

}
