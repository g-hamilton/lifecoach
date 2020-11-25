import { Injectable, EventEmitter, ElementRef } from '@angular/core';
import { HttpClientModule, HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Observer } from 'rxjs';
import { connect, createLocalTracks, createLocalVideoTrack, Room } from 'twilio-video';
import * as test from 'twilio-video';
import {CloudFunctionsService} from './cloud-functions.service';
import DevExpress from 'devextreme/bundles/dx.all';
import dxColorBox = DevExpress.ui.dxColorBox;

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

  constructor(
    private http: HttpClient,
    private cloudFunctions: CloudFunctionsService
  ) {}

  connectToRoom(accessToken: string, options): void {
    connect(accessToken, {...options})
      .then(room => {
        this.roomObj = room;
        console.log('Successfully joined a Room: ', room);
        this.roomObj.localParticipant.tracks.forEach((track) => {
          // hide camera after 5 seconds
          console.log(track);
          // this.roomObj.localParticiant.publish(track);
          if (track.kind === 'video') {
            this.localVideo.nativeElement.appendChild(track.track.attach());
          }

          if (this.roomObj.participants.size > 0 ) {


            console.log('Tut bol`sche chem 0', this.roomObj);
            room.participants.forEach(participant => {
              participant.tracks.forEach(publication => {
                if (publication.track) {
                  // this.remoteVideo.nativeElement.appendChild(publication.track.attach());
                }
              });

              participant.on('trackSubscribed', track => {
                console.log(track);
                if (this.remoteVideo.nativeElement.children.length < 4) {
                  this.remoteVideo.nativeElement.appendChild(track.attach());
                }
                console.log(this.remoteVideo.nativeElement.children);
              });
            });

          }

          // setTimeout(() => {
          //
          //     console.log('ended');
          //     track.track.disable();
          //     track.track.stop();
          //     console.log(this.roomObj);
          //   }, 5000);

        });

        room.on('participantConnected', participant => {
          console.log('A remote Participant connected: ', participant);
          participant.videoTracks.forEach( publication => {
            if (publication.track) {
              this.remoteVideo.nativeElement.appendChild(publication.track.attach());
            }
          });

          participant.on('trackSubscribed', track => {
            this.remoteVideo.nativeElement.appendChild(track.attach());
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
  }
  disconnect(): void {
    this.roomObj.disconnect();
    this.remoteVideo.nativeElement.innerHTML = null;
    this.localVideo.nativeElement.innerHTML = null;
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

  // getToken(username): any { //  Observable<any>
  //   // return fetch(`https://getvideotoken-9623.twil.io/vide-token?identity=${username}`, {
  //   //   method: 'GET',
  //   //   mode: 'no-cors',
  //   //   credentials: 'same-origin',
  //   //   headers: {
  //   //     'Content-type': 'application/json',
  //   //   },
  //   // });
  //   console.log('Video Service prop', username);
  //   return
  //
  //
  //
  // }



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
