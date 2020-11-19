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
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { connect } from 'twilio-video';
import { CloudFunctionsService } from './cloud-functions.service';
let TwilioService = class TwilioService {
    constructor(http, cloudFunctions) {
        this.http = http;
        this.cloudFunctions = cloudFunctions;
        this.msgSubject = new BehaviorSubject('');
    }
    connectToRoom(accessToken, options) {
        connect();
    }
    disconnect() {
        // console.log(this.roomObj.localParticipant);
        // console.log(this.roomObj.localParticipant.tracks.values());
        //
        //  this.roomObj.disconnect();
        // const tracks = this.roomObj.localParticipant.tracks.values();
        //  for (const track of tracks) {
        //    console.log(track);
        //    if (track.kind === 'video') {
        //      track.track.stop();
        //    }
        //    track.track.detach().forEach(mediaElement => mediaElement.remove());
        //    this.roomObj.localParticipant.unpublishTrack(track.track);
        //
        //  }
        //  // this.localVideo.nativeElement.innerHTML = null;
        //  console.log(this.localTracks);
        //  this.localTracks.forEach(track => {
        //    console.log(track.mediaStreamTrack.stop());
        //    // track.remove();
        //  });
        //  this.localVideoTrackToRemove.detach();
        //  // this.localVideo.nativeElement = ();
    }
};
TwilioService = __decorate([
    Injectable({
        providedIn: 'root'
    }),
    __metadata("design:paramtypes", [HttpClient,
        CloudFunctionsService])
], TwilioService);
export { TwilioService };
//# sourceMappingURL=video.service.js.map