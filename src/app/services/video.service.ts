import {ElementRef, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject} from 'rxjs';
import {connect, Room} from 'twilio-video';
import {CloudFunctionsService} from './cloud-functions.service';

@Injectable({
  providedIn: 'root'
})
export class TwilioService {

  remoteVideo: ElementRef;
  localVideo: ElementRef;
  previewing: boolean;
  msgSubject = new BehaviorSubject('');
  roomObj: Room;
  localTracks: any;
  localVideoTrackToRemove: any;
  isVideoEnabled = true;
  isAudioEnabled = true;
  photos: any | undefined = undefined;

  constructor(
    private http: HttpClient,
    private cloudFunctions: CloudFunctionsService
  ) {
  }

  connectToRoom(photos: any, accessToken: string, options): void {
    console.log(photos);
    this.photos = photos;
    connect(accessToken, {...options})
      .then(room => {
        this.roomObj = room;
        console.log('Successfully joined a Room: ', this.roomObj);
        this.localVideo.nativeElement.innerHTML = null;
        this.roomObj.localParticipant.tracks.forEach((track) => {
          console.log(track);
          // this.roomObj.localParticiant.publish(track);
          if (track.kind === 'video') {
            // @ts-ignore
            const attachedElement = track.track.attach();
            if (attachedElement.tagName === 'VIDEO') {
              attachedElement.classList.add('col');
              attachedElement.style.transform = 'scaleX(-1)'; // for mirroring user's video
            }
            this.localVideo.nativeElement.appendChild(attachedElement);
            console.log(this.localVideo.nativeElement.children);
          }

          if (this.roomObj.participants.size > 0) {

            console.log('There is more than 0 users in this room', this.roomObj);
            room.participants.forEach(participant => {
              this.remoteVideo.nativeElement.innerHTML = null;
              participant.tracks.forEach(publication => {

                // if (publication.isSubscribed) {
                //   this.handleTrackEnabled(publication.track);
                // }
                // if (!publication.isSubscribed) {
                //   this.handleTrackDisabled(publication.track);
                // }
                // publication.on('subscribed', this.handleTrackEnabled);
                // publication.on('subscribed', this.handleTrackDisabled);
              });

              participant.on('trackSubscribed', track => {
                track.on('enabled', this.enableTrack.bind(this));
                track.on('disabled', this.disableTrack.bind(this));
                // @ts-ignore
                if (!Array.from(this.remoteVideo.nativeElement.children).find( i => i.nodeName === track.kind.toUpperCase())) {
                  // @ts-ignore
                  const attachedElement = track.attach();
                  attachedElement.classList.add('col-md-8');
                  this.remoteVideo.nativeElement.appendChild(attachedElement);
                }
              });
            });
          }
        });

        room.on('participantDisconnected', participant => {
          participant.tracks.forEach((publication, value) => {
            // console.log(publication, value);
          });
          this.remoteVideo.nativeElement.innerHTML = `<h1>Your interlocutor left the room</h1>`;
        });

        room.on('participantConnected', participant => {
          participant.videoTracks.forEach(publication => {
            if (publication.track) {
              const attachedElement = publication.track.attach();
              if (this.remoteVideo.nativeElement.children.length < 4) {
              this.remoteVideo.nativeElement.appendChild(attachedElement);
              }
            }
          });
          this.remoteVideo.nativeElement.innerHTML = null;
          participant.on('trackSubscribed', track => {
            track.on('enabled', this.enableTrack.bind(this));
            track.on('disabled', this.disableTrack.bind(this));
            // @ts-ignore
            const attachedElement = track.attach();
            if (attachedElement.tagName === 'VIDEO') {
              attachedElement.classList.add('col-md-8');
            }
            this.remoteVideo.nativeElement.appendChild(attachedElement);
          });
        });

      }, error => {
        alert('Unable to connect to Room: ' + error.message);
      });

  }

  enableTrack(track) {
    if (track.kind === 'audio') { // audio IS UNMUTED
      console.log('AUDIO IS UNMUTED');
      this.remoteVideo.nativeElement.removeChild(this.remoteVideo.nativeElement.querySelector('#micro_icon'));
    } else {
      console.log('VIDEO IS UNMUTED'); // video IS UNMUTED
      this.remoteVideo.nativeElement.removeChild(this.remoteVideo.nativeElement.querySelector('#user_icon'));
    }
  }

  disableTrack(track) {
    console.log(this.photos);
    if (track.kind === 'audio') {
      console.log('AUDIO IS MUTED'); // audio IS MUTED
      const styles = {
        position: 'absolute',
        bottom: '5px',
        zIndex: '5',
        paddingTop: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: `#1e1e2f`,
        border: '1px solid rgba(0, 0, 0, 0)',
        color: 'red',
        borderRadius: '50px',
        width: '50px',
        height: '50px',
        fontSize: '1.5em',
        textAlign: 'center'
      };
      const el = document.createElement('div');
      Object.assign(el.style, styles);
      el.id = 'micro_icon';
      const icon = document.createElement('i');
      icon.classList.add('fas', 'fa-microphone-slash', 'micro_off');
      el.appendChild(icon);

      this.remoteVideo.nativeElement.appendChild(el);
    } else {
      console.log(this.photos);
      const styles = {
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        backgroundColor: '#27293d',
        borderRadius: '5px',
      };
      const photoStyles = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        zIndex: '3',
        paddingTop: '10px',
        transform: 'translate(-50%,-50%)',
        backgroundColor: `#27293d`,
        color: 'red',
        borderRadius: '100px',
        width: '100px',
        height: '100px',
        fontSize: '1.5em',
        textAlign: 'center',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundImage: `url(${this.photos.paths ? this.photos.paths.original['248'] : this.photos.url})`
      };
      const el = document.createElement('div');
      Object.assign(el.style, styles);
      el.id = 'user_icon';
      const photo = document.createElement('div');
      Object.assign(photo.style, photoStyles);
      el.appendChild(photo);
      this.remoteVideo.nativeElement.appendChild(el);
    }
  }

  abort() {
    if (this.roomObj) {
      this.cloudFunctions.abortVideoSession(this.roomObj.sid).then(answer => console.log(answer));
    } else {
      console.log('Комната и так отключена');
    }
    this.isVideoEnabled = true;
    this.isAudioEnabled = true;
  }



  toggleMicro() {
    if (this.isAudioEnabled) {
      this.roomObj.localParticipant.audioTracks.forEach((publication) => {
        publication.track.disable();
      });
      this.isAudioEnabled = !this.isAudioEnabled;
      return;
    }
    this.roomObj.localParticipant.audioTracks.forEach((publication) => {
      publication.track.enable();
    });
    this.isAudioEnabled = !this.isAudioEnabled;
  }
  toggleVideo() {
    if (this.isVideoEnabled) {
      this.roomObj.localParticipant.videoTracks.forEach((publication) => {
        publication.track.disable();
      });
      this.isVideoEnabled = !this.isVideoEnabled;
      return;
    }
    this.roomObj.localParticipant.videoTracks.forEach((publication) => {
      publication.track.enable();
    });
    this.isVideoEnabled = !this.isVideoEnabled;
  }

  disconnect(): void {
    if (this.roomObj) {
      this.roomObj.disconnect();
    }
    this.remoteVideo.nativeElement.innerHTML = `<div *ngIf="this.isVideoLoading" class="loader"></div>
    <h2 *ngIf="!this.isVideoLoading" class="my-1">Client video</h2>`;
    this.localVideo.nativeElement.innerHTML = `<div *ngIf="this.isVideoLoading" class="loader"></div>
    <h2 *ngIf="!this.isVideoLoading" class="my-1">Your video</h2>`    ;
    this.isVideoEnabled = true;
    this.isAudioEnabled = true;
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

}
