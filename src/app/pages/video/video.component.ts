import {Component, OnDestroy, OnInit} from '@angular/core';
import {DataService} from '../../services/data.service';
import {AuthService} from '../../services/auth.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss']
})
export class VideoComponent implements OnInit, OnDestroy {

  orderedSessions: Array<any> = [];
  user: any;
  onLoad = true;
  uid: string;


  private subscriptions: Subscription = new Subscription();

  constructor(
    private dataService: DataService,
    private authService: AuthService,
  ) {

  }

  ngOnInit(): void {
    console.log('Initialized');

    this.subscriptions.add(
      this.authService.getAuthUser().subscribe(user => {
        if (user) {
          console.log('USER OBJ:', user);
          this.uid = user.uid;
          console.log('ID is ', this.uid);


          this.subscriptions.add(
            this.dataService.getUserOrderedSessions(this.uid).subscribe(sessions => {
              if (sessions) {
                this.orderedSessions = sessions;
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


  redirectToSessionIdUrl(session: any) {
    console.log('Session', session);
  }
}
