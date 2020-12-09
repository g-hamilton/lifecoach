import {Component, Inject, Input, OnChanges, OnDestroy, OnInit, PLATFORM_ID} from '@angular/core';
import {DataService} from '../../services/data.service';
import {AuthService} from '../../services/auth.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-video-session-card',
  templateUrl: './video-session-card.component.html',
  styleUrls: ['./video-session-card.component.scss']
})
export class VideoSessionCardComponent implements OnInit, OnDestroy {
  @Input() sessionId: string;
  @Input() sessionStartTime: number;
  private subscriptions: Subscription = new Subscription();
  public coachProfile: any;

  isNew = false;
  isGoingNow = false;
  isSamePerson = false; // When user is coach for this session

  constructor(
    @Inject(PLATFORM_ID) public platformId: object,
    private dataService: DataService,
    private authService: AuthService ) {
  }

  ngOnInit() {
    console.log(this.sessionId);
    this.subscriptions.add(
      this.authService.getAuthUser().subscribe(user => {
        console.log(user.uid);
        this.dataService.getParticularOrderedSession(this.sessionId)
          .get()
          .toPromise()
          .then(session => {
            if (session.exists) {
              console.log(this.isSamePerson, user.uid, session.data().coachId);
              if ( session.data().coachId === user.uid ) {
                this.isSamePerson = true;
              }
              const nowTime = Date.now();
              if (nowTime - session.data().timeOfReserve  < 60_000 * 15) {
                this.isNew = true;
              }
              console.log('startTime', session.data().start.seconds * 1000);
              console.log('end', session.data().end.seconds * 1000);
              if (nowTime > session.data().start.seconds * 1000 && nowTime < session.data().end.seconds * 1000 ) {
                this.isGoingNow = true;
              }
              this.subscriptions.add(
                this.dataService.getPublicCoachProfile(session.data().coachId)
                  .subscribe(coach => {
                    console.log(coach);
                    this.coachProfile = coach;
                  })
              );
            } else {
              throw new Error();
            }
          })
          .catch(e => console.log('piymav'));
      })
    );

  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
