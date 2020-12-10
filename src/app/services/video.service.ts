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

  constructor(
    private http: HttpClient,
    private cloudFunctions: CloudFunctionsService
  ) {
  }

  connectToRoom(userLoaded: any, accessToken: string, options): void {
    connect(accessToken, {...options})
      .then(room => {
        this.roomObj = room;
        console.log('Successfully joined a Room: ', this.roomObj);
        this.localVideo.nativeElement.innerHTML = null;
        this.roomObj.localParticipant.tracks.forEach((track) => {
          // hide camera after 5 seconds
          console.log(track);
          // this.roomObj.localParticiant.publish(track);
          if (track.kind === 'video') {
            const attachedElement = track.track.attach();
            if (attachedElement.tagName === 'VIDEO') {
              attachedElement.classList.add('col');
            }
            this.localVideo.nativeElement.appendChild(attachedElement);
          }

          if (this.roomObj.participants.size > 0) {


            console.log('Tut bol`sche chem 0', this.roomObj);


            room.participants.forEach(participant => {
              participant.tracks.forEach(publication => {
                if (publication.track) {
                  // this.remoteVideo.nativeElement.appendChild(publication.track.attach());
                }
              });
              this.remoteVideo.nativeElement.innerHTML = null;
              participant.on('trackSubscribed', track => {
                console.log(track);
                if (this.remoteVideo.nativeElement.children.length < 3) {
                  const attachedElement = track.attach();
                  attachedElement.classList.add('col-md-8');
                  this.remoteVideo.nativeElement.appendChild(attachedElement);
                }
                console.log(this.remoteVideo.nativeElement.children);
              });

              // room.on('tokenAboutToExpire', () => {
              //   // Implement fetchToken() to make a secure request to your backend to retrieve a refreshed access token.
              //   // Use an authentication mechanism to prevent token exposure to 3rd parties.
              //   console.log('Token is about to expire in 3 minutes');
              //   alert('Token is about to expire in 3 minutes');
              // });
              // participant.on('tokenAboutToExpire', () => {
              //   // Implement fetchToken() to make a secure request to your backend to retrieve a refreshed access token.
              //   // Use an authentication mechanism to prevent token exposure to 3rd parties.
              //   console.log('Token is about to expire in 3 minutes');
              //   alert('Token is about to expire in 3 minutes');
              // });
            });
          }
        });

        room.on('participantDisconnected', participant => {
          console.log(`${participant.identity} left the Room`);
          console.log(participant);
          participant.tracks.forEach((publication, value) => {
            console.log(publication, value);
          });
          console.log(participant);
          this.remoteVideo.nativeElement.innerHTML = null;
        });

        room.on('participantConnected', participant => {
          console.log('A remote Participant connected: ', participant);

          participant.videoTracks.forEach(publication => {
            if (publication.track) {
              const attachedElement = publication.track.attach();
              if (this.remoteVideo.nativeElement.children.length < 4) {
                console.log(attachedElement.classList)
                this.remoteVideo.nativeElement.appendChild(attachedElement);
              }
            }
          });
          this.remoteVideo.nativeElement.innerHTML = null;
          participant.on('trackSubscribed', track => {

            const attachedElement = track.attach();

            console.log(attachedElement.tagName);
            if (attachedElement.tagName === 'VIDEO') {
              attachedElement.classList.add('col-md-8');
            }
            this.remoteVideo.nativeElement.appendChild(attachedElement);
          });
        });
        // this.remoteVideo.nativeElement.appendChild(participant)

        // room.participants.forEach(participant => {
        //   participant.tracks.forEach(publication => {
        //     if (publication.track) {
        //       document.getElementById('remote-media-div').appendChild(publication.track.attach());
        //     }
        //   });
        //
        //   participant.on('trackSubscribed', track => {
        //     document.getElementById('remote-media-div').appendChild(track.attach());
        //   });
        // });
        //
        //
        // this.remoteVideo
      }, error => {
        alert('Unable to connect to Room: ' + error.message);
      });
    userLoaded = true;
  }

  abort() {
    // console.log('trying to abort');
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
    <h2 *ngIf="!this.isVideoLoading" class="my-1">Your interlocutor's video</h2>`;
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


  //
  // connectToRoom(accessToken: string, options): void {
  //   console.log(this.remoteVideo);
  //   connect(accessToken, {...options, })
  //     .then(room => {
  //       console.log('CONNECTED!', room);
  //
  //       this.roomObj = room;
  //
  //       console.log('Room object ', this.roomObj);
  //
  //       if (!this.previewing && options.video) {
  //       this.startLocalVideo();
  //       // this.previewing = true;
  //       }
  //
  //       room.participants.forEach(participant => {
  //       this.msgSubject.next(`Already in Room: ${participant.identity}`);
  //       console.log(`Already in Room: ${participant.identity}`);
  //       this.attachParticipantTracks(participant);
  //       });
  //
  //       room.on('participantConnected',  (participant) => {
  //         console.log(participant);
  //         participant.tracks.forEach(track => {
  //           console.log('participantConnected - track', track);
  //           if (track) {
  //             this.remoteVideo.nativeElement.appendChild(track.attach());
  //           }
  //         });
  //
  //         participant.on('trackAdded', track => {
  //           console.log('track added');
  //           if (track) {
  //             this.remoteVideo.nativeElement.appendChild(track.attach());
  //           }
  //           document.getElementById('remote-media-div').appendChild(track.attach());
  //         });
  //       });
  //
  //       room.on('participantDisconnected', (participant) => {
  //       this.msgSubject.next(`Participant ${participant.identity} left the room`);
  //       console.log(`Participant ${participant.identity} left the room`);
  //
  //       this.detachParticipantTracks(participant);
  //     });
  //
  //     // When a Participant adds a Track, attach it to the DOM.
  //       room.on('trackAdded', (track, participant) => {
  //       console.log(participant.identity + ' added track: ' + track.kind);
  //       this.attachTracks([track]);
  //     });
  //
  //     // When a Participant removes a Track, detach it from the DOM.
  //       room.on('trackRemoved', (track, participant) => {
  //       console.log(participant.identity + ' removed track: ' + track.kind);
  //       this.detachTracks([track]);
  //     });
  //
  //       room.once('disconnected',  i => {
  //       this.msgSubject.next('You left the Room:' + i.name);
  //       // this.localVideo.nativeElement.removeChild();
  //       i.localParticipant.tracks.forEach(track => {
  //         console.log('Trying to disconnect');
  //         console.log(track);
  //         const attachedElements = track.detach();
  //         attachedElements.forEach(element => element.remove());
  //       });
  //     });
  //   })
  //     .catch(e => console.log(e));
  // }
  //
  // attachParticipantTracks(participant): void {
  //   const tracks = Array.from(participant.tracks.values());
  //   console.log(participant);
  //   this.attachTracks([tracks]);
  // }
  //
  // attachTracks(tracks) {
  //   tracks.forEach(track => {
  //     this.remoteVideo.nativeElement.appendChild(track.attach());
  //   });
  // }
  //
  // startLocalVideo(): void {
  //   createLocalVideoTrack().then(track => {
  //     this.localVideo.nativeElement.appendChild(track.attach());
  //   });
  // }
  //
  // localPreview(): void {
  //   createLocalVideoTrack().then(track => {
  //     this.localVideo.nativeElement.appendChild(track.attach());
  //   });
  // }
  //
  // detachParticipantTracks(participant) {
  //   console.log('Tracks', participant);
  //   const tracks = Array.from(participant.tracks.values());
  //   this.detachTracks(tracks);
  // }
  //
  // detachTracks(tracks): void {
  //   console.log('Tracks', tracks);
  //   tracks.forEach( (track) => {
  //     track.detach().forEach( (detachedElement) => {
  //       detachedElement.remove();
  //     });
  //   });
  // }

}
