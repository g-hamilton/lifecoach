import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {DataService} from '../../services/data.service';
import {AuthService} from '../../services/auth.service';
import {Subscription} from 'rxjs';
import {filter, first, flatMap, map} from 'rxjs/operators';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss']
})
export class VideoComponent implements OnInit, OnDestroy {

  coachingSessions: Array<any> = [];
  orderedSessions: Array<any> = [];
  user: any;
  onLoad = true;
  uid: string = undefined;
  userType: string = undefined;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private dataService: DataService,
    private authService: AuthService,
  ) {

  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.authService.getAuthUser().subscribe(user => {
        if (user) {
          this.uid = user.uid;

          this.subscriptions.add(
            this.dataService.getUserAccount(this.uid)
              .pipe(first())
              .subscribe( usr => this.userType = usr.accountType)
          );

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
      })
    );

  }

  filterSessionsByTodayAndSort(arr: any) {
    const nowTime = Date.now();
    return arr.filter( i => nowTime - i.end.getTime() < 0).sort((a, b) => a.start.getTime() - b.start.getTime());
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
