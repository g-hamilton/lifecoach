import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {DataService} from '../../services/data.service';
import {AuthService} from '../../services/auth.service';
import {Subscription} from 'rxjs';
import {filter, flatMap, map} from 'rxjs/operators';

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


  private subscriptions: Subscription = new Subscription();

  constructor(
    private dataService: DataService,
    private authService: AuthService,
  ) {

  }

  ngOnInit(): void {
    console.log('Initialized');
    console.log(this.authService.getAuthUser());
    this.subscriptions.add(
      this.authService.getAuthUser().subscribe(user => {
        if (user) {
          console.log('USER OBJ:', user);
          this.uid = user.uid;
          console.log('ID is ', this.uid);


          this.subscriptions.add(
            this.dataService.getUserOrderedSessions(this.uid)
              .pipe(
                map(i => this.filterSessionsByTodayAndSort(this.formTimeStampToDate(i))),
              )
              .subscribe(sessions => {
                if (sessions) {
                  console.log('sessions incoming in that way', sessions);
                  this.orderedSessions = sessions;
                  for (const session of this.orderedSessions) {
                    console.log(session);
                  }
                }
              })
          );

          this.subscriptions.add(
            this.dataService.getUserIsCoachSession(this.uid)
              .pipe(
                map(i => this.filterSessionsByTodayAndSort(this.formTimeStampToDate(i)))
              ).subscribe(sessions => {
                    if (sessions) {
                      this.coachingSessions = sessions;
                    }
                  })
              );
        }
      })
    );


  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  filterSessionsByTodayAndSort(arr: any) {
    const nowTime = Date.now();
    return arr.filter( i => nowTime - i.end.getTime() < 0).sort((a,b) => a.start.getTime() - b.start.getTime());
  }

  formTimeStampToDate(arr: any) {
    console.log(arr);
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
}
