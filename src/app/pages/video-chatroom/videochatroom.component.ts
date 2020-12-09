import {ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs';


import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {TwilioService} from '../../services/video.service';
import {CloudFunctionsService} from '../../services/cloud-functions.service';
import {AuthService} from '../../services/auth.service';
import {DataService} from '../../services/data.service';
import {AlertService} from '../../services/alert.service';
import {ToastService} from '../../services/toast.service';

export interface Answer {
  sessionStatus: 'NOT_STARTED_YET' | 'IS_OVER' | 'IN_PROGRESS';
  timeLeft?: number;
}

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
  roomName: string;
  username: string;
  loading: boolean;
  isUserConnectedToSession = false;

  sessionObject: any;
  sessionUserType: 'HOST' | 'PARTICIPANT' | undefined;
  sessionHasStarted = false;

  timer: any;
  timeBeforeSession: string;

  sessionEndTimer: any;

  isMicActive = true;
  isVideoActive = true;
  private subscriptions: Subscription = new Subscription();

  @ViewChild('localVideo', {static: true}) localVideo: ElementRef;
  @ViewChild('remoteVideo', {static: true}) remoteVideo: ElementRef;

  constructor(
    private dataService: DataService,
    private authService: AuthService,
    public twilioService: TwilioService,
    public cloudService: CloudFunctionsService,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private alertService: AlertService
  ) {
    this.twilioService.msgSubject.subscribe(r => {
      console.log('MessageSubject', this.message);
      this.message = r;
    });
  }


  ngOnInit() {
    this.loading = true;
    this.twilioService.localVideo = this.localVideo;
    this.twilioService.remoteVideo = this.remoteVideo;
    console.log('LOADED');

    this.subscriptions.add(
      this.authService.getAuthUser()
        .subscribe(user => {
          if (user) {
            this.userId = user.uid;
            this.username = this.userId;
            console.log('User authenticated ', this.userId);
            console.log(this.route.params);
            // @ts-ignore
            this.roomName = this.route.params.value.sessionId;
            this.checkRoom(this.roomName)
              .then(() => {

                this.timer = setInterval(() => {
                  this.timerBeforeSession(this.sessionObject.start.seconds * 1000);
                }, 1000);

                this.sessionEndTimer = setInterval(() => {
                  this.sessionChecker(this.roomName);
                }, 60_000);

              })
              .catch(e => console.log(e));
          }
        }));

  }

  toggleMic() {
    this.isMicActive = !this.isMicActive;
    this.twilioService.toggleMicro();
  }

  toggleVideo() {
    this.isVideoActive = !this.isVideoActive;
    this.twilioService.toggleVideo();
  }
  sessionChecker(id: string) {
    this.cloudService.getInfoAboutCurrentVideoSession(id)
      .then((answer: Answer) => {
        console.log('about this room', answer);
        switch (answer.sessionStatus) {
          case 'IN_PROGRESS':
            console.log(`Сессия закончится через ${Math.floor(answer.timeLeft / (60_000))} минут`);
            if (Math.floor(answer.timeLeft / (60_000)) < 6) {
              // this.alertAboutSessionEnd(Math.floor(answer.timeLeft / (60_000)) < 6);
            }
            break;
          case 'IS_OVER':
            this.twilioService.abort();
            this.disconnect();
            try {
              clearInterval(this.sessionEndTimer);
              clearInterval(this.timer);
              console.log('intervals cleared');
            } catch (e) {
              console.log('error', e);
            }
            break;
          default:
            console.log('Not started yet');

        }
      });
  }

  timerBeforeSession(startSessionTime: number) {

    if (startSessionTime <= Date.now()) {
      this.timeBeforeSession = ` Session has started `;
      return;
    }

    this.timer = setInterval(() => {
      const endDate = new Date(startSessionTime);
      const now = new Date();
      // @ts-ignore
      const msLeft: any = endDate - now;
      if (msLeft <= 0) {
        clearInterval(this.timer);
        this.timeBeforeSession = ` Session has started `;
      } else {
        const res = new Date(msLeft);
        this.timeBeforeSession = `${res.getUTCDate() - 1 < 1 ? ' ' : res.getUTCDate() - 1 + 'day(s)'} ${res.getUTCHours() - 1 < 1 ? ' ' : res.getUTCHours() + ':'}
        ${res.getUTCMinutes()}:${res.getUTCSeconds() < 10 ? '0' + res.getUTCSeconds() : res.getUTCSeconds()}`;
      }
    }, 1000);

  }

  checkRoom(roomName: string) {
    return new Promise((resolve, reject) => {
      this.dataService.getParticularOrderedSession(roomName)
        .get().toPromise()
        .then(doc => {
          if (doc.exists) {
            this.sessionObject = doc.data();
            console.log(this.sessionObject);
            console.log(this.userId);
            if (this.sessionObject.coachId === this.userId) {
              this.sessionUserType = 'HOST';
            } else if (this.sessionObject.participants.includes(this.userId)) {
              this.sessionUserType = 'PARTICIPANT';
            } else {
              this.sessionUserType = undefined;
            }
            // console.log(this.sessionUserType);
            if (this.sessionUserType) {
              console.log(this.sessionUserType);
              this.loading = false;
            }
            resolve();
          } else {
            reject();
          }
        })
        .catch(error => {
          this.alertService.alert('warning-message-and-cancel')
          reject();
        });
    });
  }

  alertAboutSessionEnd( timeLeft: number ) {
    this.toastService.showToast(`You have ${timeLeft} minute(s) to session end`, 5000, 'warning', 'top', 'right');
  }

  log(message) {
    this.message = message;
  }

  disconnect() {
    this.twilioService.disconnect();
    this.sessionHasStarted = false;
    this.isMicActive = true;
    this.isVideoActive = true;
  }

  ngAfterViewInit() {
    console.group();
    console.log(this.accessToken);
    console.log(this.message);
    console.log(this.roomName);
    console.groupEnd();
  }

  connect(): void {
    if (this.loading) {
      this.alertService
        .alert('info-message',
          'Oops...',
          'Looks like this link is invalid or You have no rights to join this room.' +
          ' If there is no mistake - try to move to this page from Your VIDEO`s page')
        .then(() => {
          return;
        });
    } else {
      console.log(this.accessToken);
      const startOfEvent = new Date(this.sessionObject.start.seconds * 1000);
      console.group();
      console.log(`Начало ивента: ${new Date(startOfEvent.getTime())}`);
      console.log(`Конец ивента: ${new Date(this.sessionObject.end.seconds * 1000)}`);
      console.log(`Event duration: ${this.sessionObject.end.seconds * 1000 - this.sessionObject.start.seconds * 1000}`);
      console.groupEnd();
      this.cloudService.getTwilioToken(this.username, this.roomName, startOfEvent.getTime(),
        (this.sessionObject.end.seconds * 1000 - this.sessionObject.start.seconds * 1000))
        .then(e => {

          console.log('Token: ', e);
          // @ts-ignore
          this.accessToken = e.token;
          console.log(Date.now());

        })
        .then(() => {
          console.log('Nice connection, bruh');
          console.group('About room');
          console.log(this.roomName);
          console.log(this.accessToken);
          console.log(this.username);

          console.groupEnd();

          this.twilioService.connectToRoom(this.userLoaded, this.accessToken, {
            name: this.roomName,
            audio: true,
            video: {width: 640}
          });
        })
        .then(() => this.sessionHasStarted = true)
        .catch(e => {
          switch (e) {
            case 'IS_OVER':
              this.alertService
                .alert('warning-message', 'Too late', 'Unfortunately, Your session is over. But You can reserve one more :)');
              break;
            case 'NOT_TIME_YET':
              this.alertService
                .alert('auto-close', 'Your Session is not ready yet', `Your Session will start at ${startOfEvent.toLocaleTimeString()}. You will be able to connect a few minutes before the Session starts`)
              break;
            default:
              console.log('unexpected error');
              break;
          }
        });
    }

  }
  userLoaded() {
  }
  ngOnDestroy() {
    this.twilioService.disconnect();
    this.subscriptions.unsubscribe();
    try {
      clearInterval(this.sessionEndTimer);
      clearInterval(this.timer);
      console.log('intervals cleared');
    } catch (e) {
      console.log('error', e);
    }

  }
}
