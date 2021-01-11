import {ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs';


import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {TwilioService} from '../../services/video.service';
import {CloudFunctionsService} from '../../services/cloud-functions.service';
import {AuthService} from '../../services/auth.service';
import {DataService} from '../../services/data.service';
import {AlertService} from '../../services/alert.service';
import {ToastService} from '../../services/toast.service';
import {connect, createLocalTracks} from 'twilio-video';

import { BsModalService, BsModalRef, ModalOptions } from 'ngx-bootstrap/modal';
import { CoachInviteComponent } from 'app/components/coach-invite/coach-invite.component';
import { CustomCalendarEvent } from 'app/interfaces/custom.calendar.event.interface';
import {first, take} from 'rxjs/operators';
import { CRMPerson } from 'app/interfaces/crm.person.interface';
import { CrmPeopleService } from 'app/services/crm-people.service';
import { SessionManagerComponent } from 'app/components/session-manager/session-manager.component';
import {UserAvatarImagePaths} from "../../interfaces/image-path.interface";

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

  public bsModalRef: BsModalRef;

  sessionId: string;
  userId: string;
  coachId: string;
  private clientId: string; // the uid of the regular user
  public calendarEvent: CustomCalendarEvent; // the original calendar event object
  private calendarEventId: string; // the db id of the original calendar event doc in this coach's calendar
  public crmPerson: CRMPerson;

  message: string;
  accessToken: string;
  roomName: string;
  username: string;
  loading: boolean;
  isUserConnectedToSession = false;
  isVideoLoading = false;
  modalVideoElementRef: any;

  sessionObject: any;
  sessionUserType: 'HOST' | 'PARTICIPANT' | undefined;
  sessionHasStarted = false;

  timer: any;
  timeBeforeSession: string;

  sessionEndTimer: any;

  isMicActive = true;
  isVideoActive = true;

  localVideoStream: any;
  private subscriptions: Subscription = new Subscription();

  photoUrl: string | undefined = undefined;
  photoPaths: UserAvatarImagePaths | undefined = undefined;

  @ViewChild('localVideo', {static: true}) localVideo: ElementRef;
  @ViewChild('remoteVideo', {static: true}) remoteVideo: ElementRef;

  constructor(
    private dataService: DataService,
    private authService: AuthService,
    public videoService: TwilioService,
    public cloudService: CloudFunctionsService,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private alertService: AlertService,
    private modalService: BsModalService,
    private crmPeopleService: CrmPeopleService,
  ) {
    this.videoService.msgSubject.subscribe(r => {
      console.log('MessageSubject', this.message);
      this.message = r;
    });
  }


  ngOnInit() {
    this.loading = true;
    this.videoService.localVideo = this.localVideo;
    this.videoService.remoteVideo = this.remoteVideo;
    console.log('LOADED');

    this.subscriptions.add(
      this.authService.getAuthUser()
        .subscribe(user => {
          if (user) {
            this.userId = user.uid;
            this.username = this.userId;
            console.log(user);
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

                this.loadCalendarEvent();

              })
              .then(() => {
                const iId = this.sessionObject.participants.find( i => i !== this.userId); // interlocutor id
                this.subscriptions.add(
                  this.dataService.getPublicCoachProfile(iId).subscribe(profile => {
                    if (profile) { // user is a Coach
                      if (profile.photoPaths) {
                        this.photoPaths = profile.photoPaths;
                      } else {
                        this.photoUrl = profile.photo ? profile.photo :
                          `https://eu.ui-avatars.com/api/?name=${profile.firstName}+${profile.lastName}`;
                      }
                      console.log(this.photoPaths, this.photoUrl);
                    } else { // user is Regular
                      this.subscriptions.add(
                        this.dataService.getRegularProfile(iId).subscribe(regProfile => {
                          if (regProfile) {
                            if (regProfile.photoPaths) {
                              this.photoPaths = regProfile.photoPaths;
                            } else {
                              this.photoUrl = regProfile.photo ? regProfile.photo :
                                `https://eu.ui-avatars.com/api/?name=${regProfile.firstName}+${regProfile.lastName}`;
                            }
                            console.log(this.photoPaths, this.photoUrl);
                          }
                        })
                      );
                    }
                  })
                );
              })
              .catch(e => console.log(e));
          }
        }));

  }

  toggleMic() {
    this.isMicActive = !this.isMicActive;
    this.videoService.toggleMicro();
  }

  toggleVideo() {
    this.isVideoActive = !this.isVideoActive;
    this.videoService.toggleVideo();
  }

  markSessionComplete() {
    const programId = this.calendarEvent.type === 'discovery' ? 'discovery' : this.calendarEvent.program;

    // we can send data to the modal & open in a another component via a service
    // https://valor-software.com/ngx-bootstrap/#/modals#service-component
    const config: ModalOptions = {
      initialState: {
        coachId: this.userId,
        clientId: this.crmPerson.id,
        programId,
        sessionId: this.calendarEvent.id
      }
    };
    this.bsModalRef = this.modalService.show(SessionManagerComponent, config);
  }

  sendResource() {
    this.alertService.alert('info-message', 'Coming Soon!', `We're still working on this feature.`);
  }

  openInviteModal(type: 'ecourse' | 'program') {
    // we can send data to the modal & open in a another component via a service
    // https://valor-software.com/ngx-bootstrap/#/modals#service-component
    const config: ModalOptions = {
      initialState: {
        type,
        invitee: this.crmPerson
      }
    };
    this.bsModalRef = this.modalService.show(CoachInviteComponent, config);
  }

  sessionChecker(id: string) {
    this.cloudService.getInfoAboutCurrentVideoSession(id)
      .then((answer: Answer) => {
        console.log('about this room', answer);
        switch (answer.sessionStatus) {
          case 'IN_PROGRESS':
            console.log(`Сессия закончится через ${Math.floor(answer.timeLeft / (60_000))} минут`);
            if (Math.floor(answer.timeLeft / (60_000)) < 6) {
              this.alertAboutSessionEnd(Math.floor(answer.timeLeft / (60_000)));
            }
            break;
          case 'IS_OVER':
            this.videoService.abort();
            this.disconnect();
            try {
              clearInterval(this.sessionEndTimer);
              clearInterval(this.timer);
              console.log('intervals cleared');
            } catch (e) {
              console.log('error', e);
            }
            break;
          case 'NOT_STARTED_YET':
            console.log('session is not started yet');
            break;
          default:
            console.log('dont  know');

        }
      });
  }

  timerBeforeSession(startSessionTime: number) {

    if (startSessionTime <= Date.now()) {
      this.timeBeforeSession = `Session has started`;
      return;
    }

    this.timer = setInterval(() => {
      const endDate = new Date(startSessionTime);
      const now = new Date();
      // @ts-ignore
      const msLeft: any = endDate - now;
      if (msLeft <= 0) {
        clearInterval(this.timer);
        this.timeBeforeSession = `Session has started`;
      } else {
        const res = new Date(msLeft);
        this.timeBeforeSession = `${res.getUTCDate() - 1 < 1 ? ' ' : res.getUTCDate() - 1 + 'day(s)'} ${res.getUTCHours() - 1 < 1 ? ' ' : res.getUTCHours() + ':'}
        ${res.getUTCMinutes()}:${res.getUTCSeconds() < 10 ? '0' + res.getUTCSeconds() : res.getUTCSeconds()}`;
      }
    }, 1000);

  }

  checkRoom(roomName: string) {
    return new Promise<void>((resolve, reject) => {
      this.dataService.getParticularOrderedSession(roomName)
        .get().toPromise()
        .then(doc => {
          if (doc.exists) {
            this.sessionObject = doc.data();
            console.log(this.sessionObject);
            console.log(this.userId);
            if (this.sessionObject.coachId === this.userId) {
              this.sessionUserType = 'HOST'; // or we can say 'Coach' of this session
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
            // capture the original calendar event id (which will be a timestamp number) and save it here as a string
            this.calendarEventId = String(this.sessionObject.start.seconds * 1000);
            resolve();
          } else {
            reject();
          }
        })
        .catch(error => {
          this.alertService.alert('warning-message-and-cancel');
          reject();
        });
    });
  }

  loadCalendarEvent() {
    this.subscriptions.add(
      this.dataService.getUserCalendarEventById(this.userId, this.calendarEventId)
      .pipe(take(1))
      .subscribe(event => {
        if (event) {
          this.calendarEvent = event;
          if (event.client) { // events should contain a client id
            this.clientId = event.client;
          } else if (event.orderedById) { // some older sessions don't have a client id but do have ordered by
            this.clientId = event.orderedById;
          }
          this.loadCrmPerson();
        }
        console.log('Calendar event loaded:', this.calendarEvent);
      })
    );
  }

  loadCrmPerson() {
    this.subscriptions.add(
      this.crmPeopleService.getUserPerson(this.userId, this.clientId)
      .subscribe(async person => {
        if (person) {
          const filledPerson = await this.crmPeopleService.getFilledPerson(this.userId, person, this.clientId);
          this.crmPerson = filledPerson;
        }
        console.log('CRM person loaded', this.crmPerson);
      })
    );
  }

  alertAboutSessionEnd( timeLeft: number ) {
    this.toastService.showToast(`You have ${timeLeft} minute(s) to session end`, 5000, 'warning', 'top', 'right');
  }

  log(message) {
    this.message = message;
  }

  disconnect() {
    this.videoService.disconnect();
    this.isVideoLoading = false;
    this.sessionHasStarted = false;
    this.isMicActive = true;
    this.isVideoActive = true;
  }

  ngAfterViewInit() {
  }

  newConnect(): void {
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
      const startOfEvent = new Date(this.sessionObject.start.seconds * 1000);
      this.cloudService.getTwilioToken(this.username, this.roomName, startOfEvent.getTime(),
        (this.sessionObject.end.seconds * 1000 - this.sessionObject.start.seconds * 1000))
        .then(e => {

          console.log('Token: ', e);
          // @ts-ignore
          this.accessToken = e.token;
          console.log(Date.now());
          this.alertService
            .alert('warning-message-and-confirmation', 'Check before session starts',
              'You can check Your camera and microphone before Session starts', 'Continue', 'Cancel connection',
              null, null, null, null,
              `<video autoplay width="320" height="240" id ='videoPreview' style="transform: scaleX(-1)"></video>`, this.modalWasOpened.bind(this), this.modalWasClosed.bind(this))
            .then( alertResult => {
              console.log('There will be connect', alertResult);
              // @ts-ignore
              if (!alertResult.action) { // if user cancelled
                throw new Error();
              }
              this.isVideoLoading = true;
            }).then(() => {
              this.videoService.connectToRoom({paths: this.photoPaths, url: this.photoUrl}, this.accessToken, {
              name: this.roomName,
              audio: true,
              video: {width: 640}
            });
              this.sessionHasStarted = true;
              console.log('should be loader');

            }).catch( er => console.log( er.message ));

        }).catch( error => {
        switch (error) {
          case 'IS_OVER':
            this.alertService
              .alert('warning-message', 'Too late', 'Unfortunately, Your session is over. But You can reserve one more :)');
            break;
          case 'NOT_TIME_YET':
            console.log('session didnt not start');
            this.alertService
              .alert('info-message', 'Your Session is not ready yet', `Your Session will start at ${startOfEvent.toLocaleTimeString()}. You will be able to connect a few minutes before the Session starts`);
            break;
          default:
            console.log('unexpected error', error);
            break;
        }
      });
    }

  }

  modalWasOpened( element: any) {
    console.log(element);
    this.modalVideoElementRef =  element.querySelector('#videoPreview');
    navigator.mediaDevices.getUserMedia({video: true, audio: true})
      .then( vid => {
        console.log(vid);
        this.modalVideoElementRef.srcObject = vid;
        this.localVideoStream = vid;
      })
      .catch(console.log);
  }

  modalWasClosed( element: any) {
    console.log(this.localVideoStream.getTracks());
    this.localVideoStream.getTracks().forEach(track => {
      console.log('stopped', track);
      track.stop();
      this.localVideoStream.removeTrack(track);
    }

    );
    // this.modalVideoElementRef.srcObject = null;
    // this.localVideoStream.stop();
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

          this.videoService.connectToRoom({paths: this.photoPaths, url: this.photoUrl}, this.accessToken, {
            name: this.roomName,
            audio: true,
            video: {width: 640}
          });
        })
        .then(() => this.sessionHasStarted = true)
        .catch(e => {
          console.log(e);
          switch (e) {
            case 'IS_OVER':
              this.alertService
                .alert('warning-message', 'Too late', 'Unfortunately, Your session is over. But You can reserve one more :)');
              break;
            case 'NOT_TIME_YET':
              this.alertService
                .alert('auto-close', 'Your Session is not ready yet', `Your Session will start at ${startOfEvent.toLocaleTimeString()}. You will be able to connect a few minutes before the Session starts`);
              break;
            default:
              throw new Error(e);
              break;
          }
        });
    }

  }

  ngOnDestroy() {
    this.videoService.disconnect();
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
