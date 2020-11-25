// import { Component, OnInit, Inject, PLATFORM_ID, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs';


import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {TwilioService} from '../../services/video.service';
import {CloudFunctionsService} from '../../services/cloud-functions.service';

@Component({
  selector: 'app-video-chatroom',
  templateUrl: 'videochatroom.component.html',
  styleUrls: ['./videochatroom.component.scss']
})
export class VideochatroomComponent implements OnInit, AfterViewInit, OnDestroy {

  sessionId: string;
  userId: string;
  coachId: string;

  message: string;
  accessToken: string;
  roomName = 'DailyStandup';
  username: string;
  loading: boolean;

  private subscriptions: Subscription = new Subscription();

  @ViewChild('localVideo', {static: true}) localVideo: ElementRef;
  @ViewChild('remoteVideo', {static: true}) remoteVideo: ElementRef;

  constructor(
    public twilioService: TwilioService,
    public cloudService: CloudFunctionsService,
    private route: ActivatedRoute
  ) {
    this.twilioService.msgSubject.subscribe(r => {
      console.log('MessageSubject', this.message);

      this.message = r;
    });

    // this.twilioService.getToken('lala').then(t => this.accessToken = t.userToken);
  }


  ngOnInit() {
    this.loading = true;
    this.twilioService.localVideo = this.localVideo;
    this.twilioService.remoteVideo = this.remoteVideo;
    console.log('LOADED');
    // @ts-ignore
    this.fillIdsFromRoute(this.route.params.value.sessionId, this.route.params.value.userId);


    this.subscriptions.add(
      // this.authService.getAuthUser()
      //   .subscribe(user => {
      //     if (user) {
      //       console.log('USER OBJ:', user);
      //       this.uid = user.uid;
      //       console.log('ID is ', this.uid);
      //
      //
      //       this.subscriptions.add(
      //         this.dataService.getUserOrderedSessions(this.uid).subscribe(sessions => {
      //           if (sessions) {
      //             this.orderedSessions = sessions;
      //           }
      //         })
      //       );
      //     }
      //   })
        );


  }

  fillIdsFromRoute(sessionID: string, userId: string) {
    this.roomName = sessionID;
    this.username = userId;

    const sessionFinder = /_\w+/g;
    const coachIdFinder = /\w+_/g;

    this.userId = userId;
    this.sessionId = sessionID.match(sessionFinder)[0].substr(1);
    this.coachId = sessionID.match(coachIdFinder)[0];
    this.coachId = this.coachId.substr(0, this.coachId.length - 1);
    console.log('DONE. Now: ', this.userId, this.sessionId, this.coachId);
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

    // const storage = JSON.parse(localStorage.getItem('token') || '{}');
    // const date = Date.now();
    //
    // if (!this.roomName || !this.username) {
    //   this.message = 'enter username and room name.';
    //   return;
    // }
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
    console.log(Date.now());
    this.cloudService.getTwilioToken(this.username, this.roomName, Date.now(), Date.now())
      .then( e => {

      console.log('Token: ', e);
      // @ts-ignore
      this.accessToken = e.token;
      console.log(Date.now());

    })
    .then(() => {
      console.log('Nice connection, bruh');
      // this.twilioService.connectToRoom(this.accessToken, { name: this.roomName, audio: true, video: { width: 240 }});
    })
      .catch( e => console.log(e));

    // this.twilioService.connectToRoom(this.accessToken, {name: this.roomName, audio: true, video: {width: 240}});
  }

  ngOnDestroy() {
    this.twilioService.disconnect();
    this.subscriptions.unsubscribe();
  }
}
