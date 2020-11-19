// import { Component, OnInit, Inject, PLATFORM_ID, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AngularFirestore } from '@angular/fire/firestore';

import { AuthService } from '../../services/auth.service';
import { AnalyticsService } from '../../services/analytics.service';
import { DataService } from 'app/services/data.service';
import { PaginationService } from 'app/services/pagination.service';

import { ChatMessage } from 'app/interfaces/chat.message';
import { Subscription } from 'rxjs';



import {Component, OnInit, ViewChild, ElementRef, AfterViewInit} from '@angular/core';
import { Observable } from 'rxjs';
import { TwilioService } from '../../services/video.service';

import * as Video from 'twilio-video';
import {CloudFunctionsService} from "../../services/cloud-functions.service";
@Component({
  selector: 'app-video-chatroom',
  templateUrl: 'videochatroom.component.html',
  styleUrls: ['./videochatroom.component.scss']
})
export class VideochatroomComponent implements OnInit, AfterViewInit {

  message: string;
  accessToken: string;
  roomName = 'DailyStandup';
  username: string | 'test' = 'test';

  @ViewChild('localVideo', {static: true}) localVideo: ElementRef;
  @ViewChild('remoteVideo', {static: true}) remoteVideo: ElementRef;

  constructor(
    public twilioService: TwilioService,
    public cloudService: CloudFunctionsService
  ) {
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

  connect(): void {
    console.log(this.accessToken);
    const storage = JSON.parse(localStorage.getItem('token') || '{}');
    const date = Date.now();
    if (!this.roomName || !this.username) { this.message = 'enter username and room name.'; return; }
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

    this.twilioService.connectToRoom(this.accessToken,
      {name: this.roomName, audio: true, video: { width: 240 }});
  }

}
