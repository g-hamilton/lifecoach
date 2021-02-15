import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class PartnerTrackingService {

  private maxDaysToTrack = 30; // how many days do we allow a tracking code to be valid for?

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

  checkForSavedPartnerTrackingCode() {
    // inspect localstorage for a saved partner tracking code and timestamp.
    const code = localStorage.getItem('partner-tracking-uid');
    const timestamp = localStorage.getItem('partner-tracking-timestamp'); // should give unix number in seconds as a string

    if (code && timestamp) {
      // code & timestamp found, check if timestamp is valid
      const now = Math.round(new Date().getTime() / 1000); // unix timestamp in seconds
      if ((Number(timestamp) + (this.maxDaysToTrack * 24 * 60 * 60)) >= now) {
        // timestamp is valid (within the max number of days to track)
        return code; // return the tracking code
      }
      // timestamp not valid, return null
      return null;
    }

    // no code or timestamp found, return null
    return null;
  }

}
