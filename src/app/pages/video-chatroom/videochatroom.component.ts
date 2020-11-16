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
@Component({
  selector: 'app-video-chatroom',
  templateUrl: 'videochatroom.component.html',
  styleUrls: ['./videochatroom.component.scss']
})
export class VideochatroomComponent implements OnInit, AfterViewInit {

  message: string;
  accessToken: string;
  roomName: string;
  username: string;

  @ViewChild('localVideo', {static: true}) localVideo: ElementRef;
  @ViewChild('remoteVideo', {static: true}) remoteVideo: ElementRef;

  constructor(public twilioService: TwilioService) {
    this.twilioService.msgSubject.subscribe(r => {
      this.message = r;
    });
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
    if (this.twilioService.roomObj) {
      this.twilioService.roomObj.disconnect();
      this.twilioService.roomObj = null;
    }
  }

  ngAfterViewInit() {
    console.group();
    console.log(this.accessToken);
    console.log(this.message);
    console.log(this.roomName);
    console.groupEnd();
  }

  connect(): void {
    const storage = JSON.parse(localStorage.getItem('token') || '{}');
    const date = Date.now();
    if (!this.roomName || !this.username) { this.message = 'enter username and room name.'; return; }
    if (storage.token && storage.created_at + 3600000 > date) {
      this.accessToken = storage.token;
      this.twilioService.connectToRoom(this.accessToken, { name: this.roomName, audio: true, video: { width: 240 } });
      console.log('Key exist');
      return;
    }
    // this.twilioService.getToken(this.username).subscribe(d => {
    //     this.accessToken = d.token;
    //     localStorage.setItem('token', JSON.stringify({
    //       token: this.accessToken,
    //       created_at: date
    //     }));
    //     this.twilioService.connectToRoom(this.accessToken, { name: this.roomName, audio: true, video: { width: 240 } });
    //   },
    //   error => this.log(JSON.stringify(error)));
    this.twilioService.connectToRoom(this.accessToken, { name: this.roomName, audio: true, video: { width: 240 }});

  }

}
