var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ViewChild, ElementRef } from '@angular/core';
import { TwilioService } from '../../services/video.service';
import { CloudFunctionsService } from "../../services/cloud-functions.service";
let VideochatroomComponent = class VideochatroomComponent {
    constructor(twilioService, cloudService) {
        this.twilioService = twilioService;
        this.cloudService = cloudService;
        this.roomName = 'DailyStandup';
        this.username = 'test';
        this.twilioService.msgSubject.subscribe(r => {
            console.log('MessageSubject', this.message);
            this.message = r;
        });
        // this.twilioService.getToken('lala').then(t => this.accessToken = t.userToken);
    }
    ngOnInit() {
        this.twilioService.localVideo = this.localVideo;
        this.twilioService.remoteVideo = this.remoteVideo;
        console.log('LOADED');
    }
    log(message) {
        this.message = message;
    }
    disconnect() {
        // console.log(this.twilioService.roomObj);
        // if (this.twilioService.roomObj) {
        //   this.twilioService.roomObj.disconnect();
        //   this.twilioService.roomObj = null;
        // }
        // this.localVideo = null;
        //
        // console.log(this.twilioService.roomObj.track);
        this.twilioService.disconnect();
    }
    ngAfterViewInit() {
        console.group();
        console.log(this.accessToken);
        console.log(this.message);
        console.log(this.roomName);
        console.groupEnd();
    }
    connect() {
        console.log(this.accessToken);
        const storage = JSON.parse(localStorage.getItem('token') || '{}');
        const date = Date.now();
        if (!this.roomName || !this.username) {
            this.message = 'enter username and room name.';
            return;
        }
        // if (storage.token && storage.created_at + 3600000 > date) {
        //   this.accessToken = storage.token;
        //   this.twilioService.connectToRoom(this.accessToken, { name: this.roomName, audio: true, video: { width: 240 } });
        //   console.log('Key exist');
        //   return;
        // }
        // this.twilioService.getToken(this.username)
        //   .then( d => {
        //   console.log(d);
        //   debugger;
        //     this.accessToken = d.token;
        //     localStorage.setItem('token', JSON.stringify({
        //       token: this.accessToken,
        //       created_at: date
        //     }));
        //     this.twilioService.connectToRoom(this.accessToken, { name: this.roomName, audio: true, video: { width: 240 } });
        //   },
        //   error => this.log(JSON.stringify(error)));
        // ------- Temporary commented -------//
        // this.cloudService.getTwilioToken(this.username).then( e => {
        //
        //   console.log("Token: ", e);
        //   // @ts-ignore
        //   this.accessToken = e.token;
        // })
        // .then(() => {
        //   this.twilioService.connectToRoom(this.accessToken, { name: this.roomName, audio: true, video: { width: 240 }});
        // })
        //   .catch( e => console.log(e));
        this.twilioService.connectToRoom(this.accessToken, { name: this.roomName, audio: true, video: { width: 240 } });
    }
};
__decorate([
    ViewChild('localVideo', { static: true }),
    __metadata("design:type", ElementRef)
], VideochatroomComponent.prototype, "localVideo", void 0);
__decorate([
    ViewChild('remoteVideo', { static: true }),
    __metadata("design:type", ElementRef)
], VideochatroomComponent.prototype, "remoteVideo", void 0);
VideochatroomComponent = __decorate([
    Component({
        selector: 'app-video-chatroom',
        templateUrl: 'videochatroom.component.html',
        styleUrls: ['./videochatroom.component.scss']
    }),
    __metadata("design:paramtypes", [TwilioService,
        CloudFunctionsService])
], VideochatroomComponent);
export { VideochatroomComponent };
//# sourceMappingURL=videochatroom.component.js.map