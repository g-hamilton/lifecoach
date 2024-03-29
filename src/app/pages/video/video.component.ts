import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { CustomCalendarEvent } from 'app/interfaces/custom.calendar.event.interface';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss']
})
export class VideoComponent implements OnInit, OnDestroy {

  public coachingSessions: Array<any> = [];
  public orderedSessions: Array<any> = [];
  public onLoad = true;
  public uid: string;
  public userType: string;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private dataService: DataService,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.getUserData();
  }

  getUserData() {
    this.subscriptions.add(
      this.authService.getAuthUser().subscribe(user => {
        if (user) {
          this.uid = user.uid;
          this.subscriptions.add(
            this.dataService.getUserAccount(this.uid)
            .pipe(first())
            .subscribe( usr => {
              this.userType = usr.accountType;
              if (this.userType === 'regular') {
                this.getSessionsAsClient();
              } else if (this.userType === 'coach') {
                // this.getSessionsAsCoach(); // NOT currently used
              }
            })
          );
        }
      })
    );
  }

  getSessionsAsClient() {
    this.subscriptions.add(
      this.dataService.getUserOrderedSessions(this.uid)
      .pipe(
        map(i => this.filterSessionsByTodayAndSort(this.formTimeStampToDate(i))),
      )
      .subscribe(sessions => {
        if (sessions) {
          this.orderedSessions = sessions;
        }
      })
    );
  }

  getSessionsAsCoach() {
    this.subscriptions.add(
      this.dataService.getUserIsCoachSessions(this.uid)
      .pipe(
        map(i => this.filterSessionsByTodayAndSort(this.formTimeStampToDate(i)))
      )
      .subscribe(sessions => {
        if (sessions) {
          this.coachingSessions = sessions;
        }
      })
    );
  }

  filterSessionsByTodayAndSort(arr: CustomCalendarEvent[]) {
    console.log(arr);
    const nowTime = Date.now();
    const noCancelledSessions = arr.filter(i => !i.cancelled);
    return noCancelledSessions.filter( i => nowTime - i.end.getTime() < 0).sort((a, b) => a.start.getTime() - b.start.getTime());
  }

  formTimeStampToDate(arr: any) {
    console.log('formTimeStampToDate sessions:', arr);
    if (arr) {
      return arr.map(i => ({
        ...i,
        end: new Date(i.end.seconds * 1000),
        start: new Date(i.start.seconds * 1000)
      }));
    }
    return arr;
  }

  // redirectToSessionIdUrl(session: any) {
  // }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
