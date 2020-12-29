import {Component, Inject, Input, OnChanges, OnDestroy, OnInit, PLATFORM_ID} from '@angular/core';
import {DataService} from '../../services/data.service';
import {AuthService} from '../../services/auth.service';
import {Subscription} from 'rxjs';
import { CustomCalendarEvent } from 'app/interfaces/custom.calendar.event.interface';
import { CoachProfile } from 'app/interfaces/coach.profile.interface';

@Component({
  selector: 'app-video-session-card',
  templateUrl: './video-session-card.component.html',
  styleUrls: ['./video-session-card.component.scss']
})
export class VideoSessionCardComponent implements OnInit, OnDestroy {

  @Input() session: CustomCalendarEvent;

  private subscriptions: Subscription = new Subscription();
  public coachProfile: CoachProfile;
  public isNew = false;
  public isGoingNow = false;
  public isSamePerson = false; // When user is coach for this session
  public loaded: boolean; // trigger view when all necessary data is loaded

  constructor(
    @Inject(PLATFORM_ID) public platformId: object,
    private dataService: DataService,
    private authService: AuthService ) {
  }

  ngOnInit() {
    console.log('Session: ', this.session);
    this.subscriptions.add(
      this.authService.getAuthUser().subscribe(user => {
        console.log(user.uid);
        this.dataService.getParticularOrderedSession(this.session.sessionId)
          .get()
          .toPromise()
          .then(session => {
            if (session.exists) {
              console.log('session data:', session.data());
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
                    this.loaded = true;
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
